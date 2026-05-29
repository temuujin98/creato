import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { mapProviderError } from "./providers/errors.ts";
import { getProviderAdapter } from "./providers/providerFactory.ts";
import type { NormalizedProviderError, ProviderName } from "./providers/types.ts";
import { loadImageInputs } from "./storage/imageInputs.ts";
import { storeGeneratedOutputs } from "./storage/outputStorage.ts";

type GenerationRecord = {
  created_at: string;
  credit_cost: number;
  error_code: string | null;
  id: string;
  metadata: Record<string, unknown> | null;
  model: string | null;
  product_id: string;
  provider: string | null;
  retry_count: number;
  status: string;
  updated_at: string;
  user_id: string;
};

type ProductRecord = {
  category_id: string;
  credit_cost: number;
  enable_options: boolean;
  id: string;
  max_images: number;
  min_images: number;
  requires_image: boolean;
  slug: string;
  status: string;
};

type ProductTranslation = {
  locale: string;
  name: string;
  short_description: string;
};

type GenerationInputRecord = {
  created_at: string;
  id: string;
  input_type: string;
  metadata: Record<string, unknown> | null;
  option_key: string | null;
  option_value: string | null;
  storage_path: string | null;
};

type PromptVersionRecord = {
  artifact_cleanup_prompt: string | null;
  base_prompt: string;
  id: string;
  negative_prompt: string | null;
  prompt_suffix: string | null;
  quality_prompt: string | null;
  version: number;
};

type ModelConfigRecord = {
  cleanup_enabled: boolean;
  credit_cost_override: number | null;
  display_name: string | null;
  estimated_cost_mnt: number | null;
  fallback_model: string | null;
  fallback_provider: string | null;
  id: string;
  is_default: boolean;
  output_count: number;
  output_size: string | null;
  primary_model: string;
  primary_provider: ProviderName;
  public_option_id: string | null;
  retry_limit: number;
};

type PromptDraft = {
  negativeText: string | null;
  text: string;
};

const corsHeaders = {
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Origin": "*",
  "Content-Type": "application/json",
};

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const allowedStatuses = new Set(["queued", "processing", "credit_reserved"]);
const publicOptionIdPattern = /^[a-z0-9][a-z0-9_-]{0,63}$/;
const terminalStatusMessages: Record<string, string> = {
  canceled: "Generation was canceled.",
  completed: "Generation is already completed.",
  credit_refunded: "Generation credits were already refunded.",
  credit_spent: "Generation credits were already spent.",
  created: "Generation must be queued before processing.",
  failed: "Generation has failed.",
};

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    headers: corsHeaders,
    status,
  });
}

function getBearerToken(authorization: string | null) {
  if (!authorization?.startsWith("Bearer ")) {
    return null;
  }

  return authorization.slice("Bearer ".length).trim();
}

async function isAdmin(serviceClient: ReturnType<typeof createClient>, userId: string) {
  const { data, error } = await serviceClient
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    return false;
  }

  return data?.role === "admin" || data?.role === "super_admin";
}

async function updateGeneration(
  serviceClient: ReturnType<typeof createClient>,
  generationId: string,
  values: Record<string, unknown>,
) {
  const { error } = await serviceClient
    .from("generations")
    .update(values)
    .eq("id", generationId);

  if (error) {
    throw new Error(error.message);
  }
}

async function refundReservedCredits(
  serviceClient: ReturnType<typeof createClient>,
  generation: GenerationRecord,
  reason: string,
) {
  const { error } = await serviceClient.rpc("refund_reserved_credits", {
    p_amount: generation.credit_cost,
    p_idempotency_key: `refund:${generation.id}`,
    p_reason: reason,
    p_user_id: generation.user_id,
  });

  if (error) {
    throw new Error(error.message);
  }
}

async function spendReservedCredits(
  serviceClient: ReturnType<typeof createClient>,
  generation: GenerationRecord,
) {
  const { error } = await serviceClient.rpc("spend_reserved_credits", {
    p_amount: generation.credit_cost,
    p_generation_id: generation.id,
    p_idempotency_key: `spend:${generation.id}`,
    p_reason: "AI generation completed",
    p_user_id: generation.user_id,
  });

  if (error) {
    throw new Error(error.message);
  }
}

async function failGenerationAndRefund(input: {
  code: string;
  generation: GenerationRecord;
  message: string;
  metadata?: Record<string, unknown>;
  responseStatus?: number;
  serviceClient: ReturnType<typeof createClient>;
}) {
  console.log("generation_failed", {
    code: input.code,
    generationId: input.generation.id,
    productId: input.generation.product_id,
    status: input.generation.status,
  });

  await updateGeneration(input.serviceClient, input.generation.id, {
    error_code: input.code,
    error_message: input.message,
    metadata: {
      ...(input.generation.metadata ?? {}),
      ...(input.metadata ?? {}),
      failedAt: new Date().toISOString(),
    },
    status: "failed",
  });

  try {
    await refundReservedCredits(input.serviceClient, input.generation, input.message);
  } catch {
    await updateGeneration(input.serviceClient, input.generation.id, {
      metadata: {
        ...(input.generation.metadata ?? {}),
        ...(input.metadata ?? {}),
        failedAt: new Date().toISOString(),
        wallet_refund_failed: true,
      },
    });

    return jsonResponse(
      {
        error: "wallet_refund_failed",
        message: "Generation failed and refund requires admin recovery.",
        ok: false,
      },
      500,
    );
  }

  return jsonResponse(
    {
      error: input.code,
      message: input.message,
      ok: false,
    },
    input.responseStatus ?? 500,
  );
}

async function disableRealAiAndRefund(input: {
  generation: GenerationRecord;
  serviceClient: ReturnType<typeof createClient>;
}) {
  console.log("generation_failed", {
    code: "real_ai_disabled",
    generationId: input.generation.id,
    productId: input.generation.product_id,
    status: input.generation.status,
  });

  const message = "Real AI generation is disabled for cost safety.";

  await updateGeneration(input.serviceClient, input.generation.id, {
    error_code: "real_ai_disabled",
    error_message: message,
    metadata: {
      ...(input.generation.metadata ?? {}),
      costSafetyMode: true,
      failedAt: new Date().toISOString(),
    },
    status: "failed",
  });

  try {
    await refundReservedCredits(input.serviceClient, input.generation, message);
  } catch {
    await updateGeneration(input.serviceClient, input.generation.id, {
      metadata: {
        ...(input.generation.metadata ?? {}),
        costSafetyMode: true,
        failedAt: new Date().toISOString(),
        wallet_refund_failed: true,
      },
    });

    return jsonResponse(
      {
        error: "wallet_refund_failed",
        message: "Real AI is disabled, but refund requires admin recovery.",
        ok: false,
        status: "real_ai_disabled",
      },
      500,
    );
  }

  return jsonResponse({
    dryRun: true,
    generationId: input.generation.id,
    message,
    ok: false,
    status: "real_ai_disabled",
  });
}

function normalizeOptionInputs(inputs: GenerationInputRecord[]) {
  return inputs
    .filter((input) => input.input_type === "option" && input.option_key)
    .map((input) => ({
      key: input.option_key as string,
      value: input.option_value ?? "",
    }));
}

function normalizeUploadInputs(inputs: GenerationInputRecord[]) {
  return inputs
    .filter((input) => input.input_type === "upload" && input.storage_path)
    .map((input) => ({
      fileName:
        typeof input.metadata?.fileName === "string" ? input.metadata.fileName : undefined,
      mimeType:
        typeof input.metadata?.mimeType === "string" ? input.metadata.mimeType : undefined,
      storagePath: input.storage_path as string,
    }));
}

function getSelectedModelOptionId(inputs: GenerationInputRecord[]) {
  const value = inputs.find(
    (input) =>
      input.input_type === "option" && input.option_key === "model_option",
  )?.option_value;
  const selected = value?.trim();

  return selected || null;
}

function compilePrompt(input: {
  optionInputs: Array<{ key: string; value: string }>;
  promptVersion: PromptVersionRecord;
  uploadInputs: Array<{ storagePath: string }>;
}): PromptDraft {
  const optionSummary = input.optionInputs
    .map((option) => `${option.key}=${option.value}`)
    .join("; ");

  const parts = [
    input.promptVersion.base_prompt,
    optionSummary ? `User options: ${optionSummary}` : null,
    input.uploadInputs.length > 0 ? `Input image count: ${input.uploadInputs.length}` : null,
    input.promptVersion.prompt_suffix,
    input.promptVersion.quality_prompt,
    input.promptVersion.artifact_cleanup_prompt,
  ].filter(Boolean);

  return {
    negativeText: input.promptVersion.negative_prompt,
    text: parts.join("\n\n"),
  };
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return jsonResponse({ error: "method_not_allowed", ok: false }, 405);
  }

  const token = getBearerToken(request.headers.get("Authorization"));
  if (!token) {
    return jsonResponse({ error: "authorization_required", ok: false }, 401);
  }

  let body: { dryRun?: unknown; generationId?: unknown };

  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: "invalid_json", ok: false }, 400);
  }

  if (typeof body.generationId !== "string" || !uuidPattern.test(body.generationId)) {
    return jsonResponse({ error: "invalid_generation_id", ok: false }, 400);
  }

  const realAiEnabled = Deno.env.get("ENABLE_REAL_AI_GENERATION") === "true";
  const dryRun = body.dryRun === true || !realAiEnabled;

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !serviceRoleKey) {
    return jsonResponse(
      {
        error: "server_configuration_missing",
        message: "Server configuration is missing.",
        ok: false,
      },
      500,
    );
  }

  const serviceClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const { data: authData, error: authError } = await serviceClient.auth.getUser(token);

  if (authError || !authData.user) {
    return jsonResponse({ error: "invalid_authorization", ok: false }, 401);
  }

  const { data: generation, error: generationError } = await serviceClient
    .from("generations")
    .select(
      "id,user_id,product_id,status,credit_cost,error_code,provider,model,retry_count,metadata,created_at,updated_at",
    )
    .eq("id", body.generationId)
    .maybeSingle<GenerationRecord>();

  if (generationError) {
    console.error("generation lookup failed", generationError.message);
    return jsonResponse({ error: "generation_lookup_failed", ok: false }, 500);
  }

  if (!generation) {
    return jsonResponse({ error: "generation_not_found", ok: false }, 404);
  }

  console.log("generation_loaded", {
    generationId: generation.id,
    productId: generation.product_id,
    status: generation.status,
  });

  const ownsGeneration = generation.user_id === authData.user.id;
  const admin = ownsGeneration ? false : await isAdmin(serviceClient, authData.user.id);

  if (!ownsGeneration && !admin) {
    return jsonResponse({ error: "forbidden", ok: false }, 403);
  }

  if (generation.status === "completed" || generation.status === "credit_spent") {
    console.log("generation_state_checked", {
      generationId: generation.id,
      productId: generation.product_id,
      result: "already_completed",
      status: generation.status,
    });
    return jsonResponse({
      generationId: generation.id,
      ok: true,
      status: "completed",
    });
  }

  if (!allowedStatuses.has(generation.status)) {
    console.log("generation_state_checked", {
      errorCode: generation.error_code,
      generationId: generation.id,
      productId: generation.product_id,
      result: "terminal_state_rejected",
      status: generation.status,
    });
    return jsonResponse(
      {
        error: "invalid_generation_state",
        errorCode: generation.error_code ?? undefined,
        message:
          terminalStatusMessages[generation.status] ??
          "Generation status is not allowed for processing.",
        ok: false,
        status: generation.status,
      },
      409,
    );
  }

  console.log("generation_state_checked", {
    generationId: generation.id,
    productId: generation.product_id,
    result: "allowed",
    status: generation.status,
  });

  const { data: product, error: productError } = await serviceClient
    .from("products")
    .select("id,slug,credit_cost,status,requires_image,min_images,max_images,enable_options,category_id")
    .eq("id", generation.product_id)
    .maybeSingle<ProductRecord>();

  if (productError) {
    console.error("product lookup failed", productError.message);
    return jsonResponse({ error: "product_lookup_failed", ok: false }, 500);
  }

  if (!product) {
    return jsonResponse({ error: "product_not_found", ok: false }, 404);
  }

  if (product.status !== "active") {
    return jsonResponse(
      {
        error: "product_not_active",
        message: "Preset is not active.",
        ok: false,
      },
      409,
    );
  }

  const { data: translations, error: translationsError } = await serviceClient
    .from("product_translations")
    .select("locale,name,short_description")
    .eq("product_id", product.id)
    .in("locale", ["mn", "en"]);

  if (translationsError) {
    console.error("product translations lookup failed", translationsError.message);
    return jsonResponse({ error: "product_translation_lookup_failed", ok: false }, 500);
  }

  const { data: inputs, error: inputsError } = await serviceClient
    .from("generation_inputs")
    .select("id,input_type,storage_path,option_key,option_value,metadata,created_at")
    .eq("generation_id", generation.id);

  if (inputsError) {
    console.error("generation input lookup failed", inputsError.message);
    return jsonResponse({ error: "generation_inputs_lookup_failed", ok: false }, 500);
  }

  const safeInputs = (inputs ?? []) as GenerationInputRecord[];
  const uploadCount = safeInputs.filter(
    (input) => input.input_type === "upload" && Boolean(input.storage_path),
  ).length;
  const optionCount = safeInputs.filter((input) => input.input_type === "option").length;

  if (product.requires_image && uploadCount < product.min_images) {
    return jsonResponse(
      {
        error: "insufficient_upload_inputs",
        message: "Generation does not have enough uploaded images.",
        ok: false,
      },
      409,
    );
  }

  if (product.max_images > 0 && uploadCount > product.max_images) {
    return jsonResponse(
      {
        error: "validation_error",
        message: "Generation has too many uploaded images.",
        ok: false,
      },
      409,
    );
  }

  const preferredTranslation =
    ((translations ?? []) as ProductTranslation[]).find(
      (translation) => translation.locale === "mn",
    ) ?? ((translations ?? []) as ProductTranslation[])[0];

  const { data: promptVersions, error: promptVersionError } = await serviceClient
    .from("prompt_versions")
    .select(
      "id,version,base_prompt,negative_prompt,prompt_suffix,quality_prompt,artifact_cleanup_prompt",
    )
    .eq("product_id", generation.product_id)
    .eq("is_active", true)
    .order("version", { ascending: false })
    .limit(2);

  if (promptVersionError) {
    console.error("prompt version lookup failed", promptVersionError.message);
    return jsonResponse({ error: "prompt_version_lookup_failed", ok: false }, 500);
  }

  const safePromptVersions = (promptVersions ?? []) as PromptVersionRecord[];

  if (safePromptVersions.length === 0) {
    return jsonResponse(
      {
        error: "active_prompt_version_missing",
        message: "Active prompt version is missing.",
        ok: false,
      },
      409,
    );
  }

  if (safePromptVersions.length > 1) {
    console.error("multiple active prompt versions found", {
      productId: generation.product_id,
    });
  }

  const promptVersion = safePromptVersions[0];
  const optionInputs = normalizeOptionInputs(safeInputs);
  const uploadInputs = normalizeUploadInputs(safeInputs);
  const selectedModelOptionId = getSelectedModelOptionId(safeInputs);

  if (
    selectedModelOptionId &&
    !publicOptionIdPattern.test(selectedModelOptionId)
  ) {
    return await failGenerationAndRefund({
      code: "model_option_not_configured",
      generation,
      message: "Selected model option is not configured.",
      metadata: {
        selectedModelOptionId,
      },
      responseStatus: 409,
      serviceClient,
    });
  }

  const modelConfigSelect =
    "id,primary_provider,primary_model,fallback_provider,fallback_model,output_size,output_count,retry_limit,cleanup_enabled,estimated_cost_mnt,public_option_id,display_name,is_default,credit_cost_override";

  let modelConfig: ModelConfigRecord | null = null;

  if (selectedModelOptionId) {
    const { data, error } = await serviceClient
      .from("model_configs")
      .select(modelConfigSelect)
      .eq("product_id", generation.product_id)
      .eq("public_option_id", selectedModelOptionId)
      .eq("is_active", true)
      .maybeSingle<ModelConfigRecord>();

    if (error) {
      console.error("model option config lookup failed", error.message);
      return jsonResponse({ error: "model_config_lookup_failed", ok: false }, 500);
    }

    modelConfig = data;

    if (!modelConfig) {
      return await failGenerationAndRefund({
        code: "model_option_not_configured",
        generation,
        message: "Selected model option is not configured.",
        metadata: {
          selectedModelOptionId,
        },
        responseStatus: 409,
        serviceClient,
      });
    }
  } else {
    const { data: defaultConfig, error: defaultConfigError } = await serviceClient
      .from("model_configs")
      .select(modelConfigSelect)
      .eq("product_id", generation.product_id)
      .eq("is_active", true)
      .eq("is_default", true)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle<ModelConfigRecord>();

    if (defaultConfigError) {
      console.error("default model config lookup failed", defaultConfigError.message);
      return jsonResponse({ error: "model_config_lookup_failed", ok: false }, 500);
    }

    modelConfig = defaultConfig;

    if (!modelConfig) {
      const { data: fallbackConfig, error: fallbackConfigError } = await serviceClient
        .from("model_configs")
        .select(modelConfigSelect)
        .eq("product_id", generation.product_id)
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle<ModelConfigRecord>();

      if (fallbackConfigError) {
        console.error("fallback model config lookup failed", fallbackConfigError.message);
        return jsonResponse({ error: "model_config_lookup_failed", ok: false }, 500);
      }

      modelConfig = fallbackConfig;
    }
  }

  if (!modelConfig) {
    return jsonResponse(
      {
        error: "active_model_config_missing",
        message: "Active model config is missing.",
        ok: false,
      },
      409,
    );
  }

  const expectedCreditCost =
    modelConfig.credit_cost_override ?? product.credit_cost;

  if (generation.credit_cost !== expectedCreditCost) {
    return await failGenerationAndRefund({
      code: "credit_cost_mismatch",
      generation,
      message: "Generation credit cost does not match the selected model option.",
      metadata: {
        expectedCreditCost,
        selectedModelOptionId,
      },
      responseStatus: 409,
      serviceClient,
    });
  }

  let promptDraft: PromptDraft;

  try {
    promptDraft = compilePrompt({
      optionInputs,
      promptVersion,
      uploadInputs,
    });
  } catch {
    return jsonResponse(
      {
        error: "prompt_compile_failed",
        message: "Prompt compile failed.",
        ok: false,
      },
      409,
    );
  }

  if (!promptDraft.text.trim()) {
    return jsonResponse(
      {
        error: "prompt_compile_failed",
        message: "Prompt compile failed.",
        ok: false,
      },
      409,
    );
  }

  if (!realAiEnabled) {
    return await disableRealAiAndRefund({
      generation,
      serviceClient,
    });
  }

  let adapter;

  try {
    adapter = getProviderAdapter(modelConfig.primary_provider, { dryRun });
  } catch (error) {
    const mappedError = mapProviderError(error, modelConfig.primary_provider);
    return await failGenerationAndRefund({
      code: mappedError.code,
      generation,
      message: mappedError.message,
      metadata: {
        provider: modelConfig.primary_provider,
      },
      serviceClient,
    });
  }

  if (!dryRun && generation.status !== "processing") {
    await updateGeneration(serviceClient, generation.id, {
      started_at: new Date().toISOString(),
      status: "processing",
    });
  }

  let providerInputImages = uploadInputs;

  if (!dryRun) {
    try {
      providerInputImages = await loadImageInputs(serviceClient, uploadInputs);
    } catch {
      return await failGenerationAndRefund({
        code: "storage_input_missing",
        generation,
        message: "Generation input image is missing or unsupported.",
        serviceClient,
      });
    }
  }

  console.log("gemini_call_started", {
    generationId: generation.id,
    model: modelConfig.primary_model,
    outputCount: modelConfig.output_count,
    productId: product.id,
    provider: modelConfig.primary_provider,
  });

  const providerResult = await adapter.generateImage({
    inputImages: providerInputImages,
    metadata: {
      generationId: generation.id,
      productId: product.id,
    },
    model: modelConfig.primary_model,
    negativePrompt: promptDraft.negativeText ?? undefined,
    outputCount: modelConfig.output_count,
    outputSize: modelConfig.output_size,
    prompt: promptDraft.text,
    provider: modelConfig.primary_provider,
  });

  if (!providerResult.ok) {
    const mappedError: NormalizedProviderError = mapProviderError(
      providerResult,
      modelConfig.primary_provider,
    );

    if (!dryRun) {
      return await failGenerationAndRefund({
        code: mappedError.code,
        generation,
        message: mappedError.message,
        metadata: {
          provider: modelConfig.primary_provider,
          retryable: mappedError.retryable,
        },
        serviceClient,
      });
    }

    return jsonResponse(
      {
        error: mappedError.code,
        message: mappedError.message,
        ok: false,
      },
      mappedError.retryable ? 500 : 409,
    );
  }

  console.log("gemini_call_succeeded", {
    generationId: generation.id,
    model: providerResult.model,
    outputCount: providerResult.outputs.length,
    provider: providerResult.provider,
  });

  if (dryRun) {
    return jsonResponse({
      generation: {
        creditCost: generation.credit_cost,
        id: generation.id,
        retryCount: generation.retry_count,
        status: generation.status,
      },
      inputs: {
        optionCount,
        uploadCount,
      },
      message:
        "Provider adapter scaffold is ready. Dry-run mode did not call an AI provider.",
      next: "real_provider_adapter",
      ok: false,
      preset: {
        id: product.id,
        name: preferredTranslation?.name ?? product.slug,
        slug: product.slug,
      },
      provider: {
        dryRun: true,
        outputCountRequested: modelConfig.output_count,
        ready: true,
      },
      status: "provider_adapter_scaffold_ready",
    });
  }

  let outputCount = 0;

  console.log("storage_upload_started", {
    generationId: generation.id,
    outputCount: providerResult.outputs.length,
    provider: providerResult.provider,
  });

  try {
    const storedOutputs = await storeGeneratedOutputs(serviceClient, {
      generationId: generation.id,
      model: providerResult.model,
      outputs: providerResult.outputs,
      provider: providerResult.provider,
      userId: generation.user_id,
    });
    outputCount = storedOutputs.length;
    console.log("storage_upload_succeeded", {
      generationId: generation.id,
      outputCount,
    });
  } catch {
    return await failGenerationAndRefund({
      code: "output_storage_failed",
      generation,
      message: "Generated output could not be stored.",
      metadata: {
        provider: providerResult.provider,
      },
      serviceClient,
    });
  }

  await updateGeneration(serviceClient, generation.id, {
    completed_at: new Date().toISOString(),
    metadata: {
      ...(generation.metadata ?? {}),
      outputCount,
      provider: providerResult.provider,
    },
    model: providerResult.model,
    provider: providerResult.provider,
    status: "completed",
  });

  try {
    await spendReservedCredits(serviceClient, generation);
    console.log("credit_spent", {
      amount: generation.credit_cost,
      generationId: generation.id,
    });
  } catch {
    await updateGeneration(serviceClient, generation.id, {
      metadata: {
        ...(generation.metadata ?? {}),
        outputCount,
        provider: providerResult.provider,
        wallet_spend_failed: true,
      },
    });

    return jsonResponse(
      {
        generationId: generation.id,
        message: "Generation completed, but wallet spend requires admin recovery.",
        ok: false,
        outputCount,
        status: "wallet_spend_failed",
      },
      500,
    );
  }

  console.log("generation_completed", {
    generationId: generation.id,
    outputCount,
    provider: providerResult.provider,
  });

  return jsonResponse({
    generationId: generation.id,
    ok: true,
    outputCount,
    status: "completed",
  });
});
