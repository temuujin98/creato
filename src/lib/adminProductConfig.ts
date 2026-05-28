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
  public_option_id: string | null;
  display_name: string | null;
  primary_provider: "gemini" | "openai";
  primary_model: string;
  fallback_provider: "gemini" | "openai" | null;
  fallback_model: string | null;
  output_size: string | null;
  output_count: number;
  retry_limit: number;
  cleanup_enabled: boolean;
  estimated_cost_mnt: number | null;
  credit_cost_override: number | null;
  is_active: boolean;
  is_default: boolean;
  created_at: string;
  updated_at: string;
};

export type UpsertModelConfigInput = {
  id?: string;
  productId: string;
  publicOptionId?: string;
  displayName?: string;
  primaryProvider: "gemini" | "openai";
  primaryModel: string;
  fallbackProvider?: "gemini" | "openai" | null;
  fallbackModel?: string;
  outputSize?: string;
  outputCount: number;
  retryLimit: number;
  cleanupEnabled: boolean;
  estimatedCostMnt?: number | null;
  creditCostOverride?: number | null;
  isActive: boolean;
  isDefault: boolean;
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
      "id,product_id,public_option_id,display_name,primary_provider,primary_model,fallback_provider,fallback_model,output_size,output_count,retry_limit,cleanup_enabled,estimated_cost_mnt,credit_cost_override,is_active,is_default,created_at,updated_at",
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
  const selectColumns =
    "id,product_id,public_option_id,display_name,primary_provider,primary_model,fallback_provider,fallback_model,output_size,output_count,retry_limit,cleanup_enabled,estimated_cost_mnt,credit_cost_override,is_active,is_default,created_at,updated_at";

  const { data: defaultConfig, error: defaultError } = await client
    .from("model_configs")
    .select(selectColumns)
    .eq("product_id", productId)
    .eq("is_active", true)
    .eq("is_default", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (defaultError) {
    throw new Error(defaultError.message);
  }

  if (defaultConfig) {
    return defaultConfig as ModelConfig;
  }

  const { data, error } = await client
    .from("model_configs")
    .select(selectColumns)
    .eq("product_id", productId)
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data as ModelConfig | null;
}

export async function upsertModelConfig(input: UpsertModelConfigInput) {
  const client = requireSupabase();

  if (input.isDefault) {
    const { error } = await client
      .from("model_configs")
      .update({ is_default: false })
      .eq("product_id", input.productId);

    if (error) {
      throw new Error(error.message);
    }
  }

  const payload = {
    cleanup_enabled: input.cleanupEnabled,
    credit_cost_override: input.creditCostOverride ?? null,
    display_name: normalizeOptionalText(input.displayName),
    estimated_cost_mnt: input.estimatedCostMnt ?? null,
    fallback_model: normalizeOptionalText(input.fallbackModel),
    fallback_provider: input.fallbackProvider ?? null,
    is_active: input.isActive,
    is_default: input.isDefault,
    output_count: input.outputCount,
    output_size: normalizeOptionalText(input.outputSize),
    primary_model: input.primaryModel.trim(),
    primary_provider: input.primaryProvider,
    product_id: input.productId,
    public_option_id: normalizeOptionalText(input.publicOptionId),
    retry_limit: input.retryLimit,
  };

  const query = input.id
    ? client.from("model_configs").update(payload).eq("id", input.id).select(
        "id,product_id,public_option_id,display_name,primary_provider,primary_model,fallback_provider,fallback_model,output_size,output_count,retry_limit,cleanup_enabled,estimated_cost_mnt,credit_cost_override,is_active,is_default,created_at,updated_at",
      )
    : client.from("model_configs").insert(payload).select(
        "id,product_id,public_option_id,display_name,primary_provider,primary_model,fallback_provider,fallback_model,output_size,output_count,retry_limit,cleanup_enabled,estimated_cost_mnt,credit_cost_override,is_active,is_default,created_at,updated_at",
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
    .update({ is_default: false })
    .eq("product_id", productId);

  if (resetError) {
    throw new Error(resetError.message);
  }

  const { error: activateError } = await client
    .from("model_configs")
    .update({ is_active: true, is_default: true })
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
