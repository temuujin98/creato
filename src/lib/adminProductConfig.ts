import { supabase, supabaseConfigError } from "./supabase";

export type PromptVersion = {
  id: string;
  product_id: string;
  version: number;
  base_prompt: string;
  negative_prompt: string | null;
  prompt_suffix: string | null;
  quality_prompt: string | null;
  artifact_cleanup_prompt: string | null;
  internal_note: string | null;
  is_active: boolean;
  created_at: string;
};

export type CreatePromptVersionInput = {
  productId: string;
  version: number;
  basePrompt: string;
  negativePrompt?: string;
  promptSuffix?: string;
  qualityPrompt?: string;
  artifactCleanupPrompt?: string;
  internalNote?: string;
};

export type ModelConfig = {
  id: string;
  product_id: string;
  primary_provider: "gemini" | "openai";
  primary_model: string;
  fallback_provider: "gemini" | "openai" | null;
  fallback_model: string | null;
  output_size: string | null;
  output_count: number;
  retry_limit: number;
  cleanup_enabled: boolean;
  estimated_cost_mnt: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type UpsertModelConfigInput = {
  id?: string;
  productId: string;
  primaryProvider: "gemini" | "openai";
  primaryModel: string;
  fallbackProvider?: "gemini" | "openai" | null;
  fallbackModel?: string;
  outputSize?: string;
  outputCount: number;
  retryLimit: number;
  cleanupEnabled: boolean;
  estimatedCostMnt?: number | null;
};

export type ProductConfigReadiness = {
  hasDbProductId: boolean;
  hasActivePromptVersion: boolean;
  hasActiveModelConfig: boolean;
};

function requireSupabase() {
  if (!supabase) {
    throw new Error(supabaseConfigError ?? "Supabase is not configured.");
  }

  return supabase;
}

function normalizeOptionalText(value?: string) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export async function listPromptVersions(productId: string) {
  const client = requireSupabase();
  const { data, error } = await client
    .from("prompt_versions")
    .select(
      "id,product_id,version,base_prompt,negative_prompt,prompt_suffix,quality_prompt,artifact_cleanup_prompt,internal_note,is_active,created_at",
    )
    .eq("product_id", productId)
    .order("version", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as PromptVersion[];
}

export async function createPromptVersion(input: CreatePromptVersionInput) {
  const client = requireSupabase();
  const { data, error } = await client
    .from("prompt_versions")
    .insert({
      artifact_cleanup_prompt: normalizeOptionalText(input.artifactCleanupPrompt),
      base_prompt: input.basePrompt.trim(),
      internal_note: normalizeOptionalText(input.internalNote),
      negative_prompt: normalizeOptionalText(input.negativePrompt),
      product_id: input.productId,
      prompt_suffix: normalizeOptionalText(input.promptSuffix),
      quality_prompt: normalizeOptionalText(input.qualityPrompt),
      version: input.version,
    })
    .select(
      "id,product_id,version,base_prompt,negative_prompt,prompt_suffix,quality_prompt,artifact_cleanup_prompt,internal_note,is_active,created_at",
    )
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as PromptVersion;
}

export async function setActivePromptVersion(productId: string, promptVersionId: string) {
  const client = requireSupabase();

  const { error: resetError } = await client
    .from("prompt_versions")
    .update({ is_active: false })
    .eq("product_id", productId);

  if (resetError) {
    throw new Error(resetError.message);
  }

  const { error: activateError } = await client
    .from("prompt_versions")
    .update({ is_active: true })
    .eq("product_id", productId)
    .eq("id", promptVersionId);

  if (activateError) {
    throw new Error(activateError.message);
  }
}

export async function listModelConfigs(productId: string) {
  const client = requireSupabase();
  const { data, error } = await client
    .from("model_configs")
    .select(
      "id,product_id,primary_provider,primary_model,fallback_provider,fallback_model,output_size,output_count,retry_limit,cleanup_enabled,estimated_cost_mnt,is_active,created_at,updated_at",
    )
    .eq("product_id", productId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as ModelConfig[];
}

export async function getActiveModelConfig(productId: string) {
  const client = requireSupabase();
  const { data, error } = await client
    .from("model_configs")
    .select(
      "id,product_id,primary_provider,primary_model,fallback_provider,fallback_model,output_size,output_count,retry_limit,cleanup_enabled,estimated_cost_mnt,is_active,created_at,updated_at",
    )
    .eq("product_id", productId)
    .eq("is_active", true)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data as ModelConfig | null;
}

export async function upsertModelConfig(input: UpsertModelConfigInput) {
  const client = requireSupabase();
  const payload = {
    cleanup_enabled: input.cleanupEnabled,
    estimated_cost_mnt: input.estimatedCostMnt ?? null,
    fallback_model: normalizeOptionalText(input.fallbackModel),
    fallback_provider: input.fallbackProvider ?? null,
    output_count: input.outputCount,
    output_size: normalizeOptionalText(input.outputSize),
    primary_model: input.primaryModel.trim(),
    primary_provider: input.primaryProvider,
    product_id: input.productId,
    retry_limit: input.retryLimit,
  };

  const query = input.id
    ? client.from("model_configs").update(payload).eq("id", input.id).select(
        "id,product_id,primary_provider,primary_model,fallback_provider,fallback_model,output_size,output_count,retry_limit,cleanup_enabled,estimated_cost_mnt,is_active,created_at,updated_at",
      )
    : client.from("model_configs").insert(payload).select(
        "id,product_id,primary_provider,primary_model,fallback_provider,fallback_model,output_size,output_count,retry_limit,cleanup_enabled,estimated_cost_mnt,is_active,created_at,updated_at",
      );

  const { data, error } = await query.single();

  if (error) {
    throw new Error(error.message);
  }

  return data as ModelConfig;
}

export async function setActiveModelConfig(productId: string, modelConfigId: string) {
  const client = requireSupabase();

  const { error: resetError } = await client
    .from("model_configs")
    .update({ is_active: false })
    .eq("product_id", productId);

  if (resetError) {
    throw new Error(resetError.message);
  }

  const { error: activateError } = await client
    .from("model_configs")
    .update({ is_active: true })
    .eq("product_id", productId)
    .eq("id", modelConfigId);

  if (activateError) {
    throw new Error(activateError.message);
  }
}

export async function getProductConfigReadiness(productId?: string): Promise<ProductConfigReadiness> {
  if (!productId) {
    return {
      hasActiveModelConfig: false,
      hasActivePromptVersion: false,
      hasDbProductId: false,
    };
  }

  const [promptVersions, activeModelConfig] = await Promise.all([
    listPromptVersions(productId),
    getActiveModelConfig(productId),
  ]);

  return {
    hasActiveModelConfig: Boolean(activeModelConfig),
    hasActivePromptVersion: promptVersions.some((version) => version.is_active),
    hasDbProductId: true,
  };
}
