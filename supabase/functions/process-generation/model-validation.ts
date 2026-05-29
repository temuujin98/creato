/**
 * model-validation.ts
 *
 * Server-side validation of the selected AI model against:
 *   - product_allowed_models  (per-product availability)
 *   - ai_model_registry       (global catalog, Phase 26)
 *
 * Must run inside the Edge Function using the service-role client.
 * Never trust client-supplied provider/model strings without this validation.
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import type { ProviderName } from "./providers/types.ts";

// ─── Row types (DB columns only — no secrets) ─────────────────────────────────

export type AiModelRegistryRecord = {
  default_output_count: number;
  default_output_size: string | null;
  id: string;
  is_active: boolean;
  model_key: string;
  modality: string;
  provider: string;
  status: string;
};

export type ProductAllowedModelRecord = {
  credit_cost_override: number | null;
  id: string;
  is_active: boolean;
  is_default: boolean;
  model_config_id: string;
};

// ─── Result types ─────────────────────────────────────────────────────────────

export type RegistryModelResolution = {
  effectiveCreditCost: number;
  effectiveModelKey: string;
  effectiveProvider: ProviderName;
  allowedRelation: ProductAllowedModelRecord;
  ok: true;
  registryModel: AiModelRegistryRecord;
};

export type RegistryModelError = {
  errorCode: string;
  ok: false;
  safeMessage: string;
};

// ─── Constants ────────────────────────────────────────────────────────────────

/** Modalities that support image generation. */
const SUPPORTED_MODALITIES = new Set(["image", "multimodal"]);

/** Statuses that allow the model to be used. */
const ACTIVE_STATUSES = new Set(["active", "testing"]);

/** Providers that have an implemented adapter. */
const IMPLEMENTED_PROVIDERS = new Set<ProviderName>(["gemini", "openai"]);

// ─── Main validators ──────────────────────────────────────────────────────────

/**
 * Validate that a specific model_config_id (from ai_model_registry) is allowed
 * for the given product and currently active.
 *
 * Returns either a resolved model (ok: true) or a typed error (ok: false).
 * Errors use safe codes that can be mapped to user-facing messages.
 */
export async function validateRegistryModel(
  serviceClient: ReturnType<typeof createClient>,
  productId: string,
  modelConfigId: string,
  productCreditCost: number,
): Promise<RegistryModelResolution | RegistryModelError> {
  // 1. Check product_allowed_models
  const { data: relation, error: relError } = await serviceClient
    .from("product_allowed_models")
    .select("id,model_config_id,is_default,is_active,credit_cost_override")
    .eq("product_id", productId)
    .eq("model_config_id", modelConfigId)
    .maybeSingle<ProductAllowedModelRecord>();

  if (relError) {
    console.error("model_allowed_lookup_failed", relError.message);
    return { ok: false, errorCode: "model_validation_failed", safeMessage: "Model validation failed." };
  }

  if (!relation) {
    return {
      ok: false,
      errorCode: "model_not_allowed",
      safeMessage: "Selected model is not allowed for this product.",
    };
  }

  if (!relation.is_active) {
    return {
      ok: false,
      errorCode: "model_not_allowed",
      safeMessage: "Selected model is disabled for this product.",
    };
  }

  // 2. Check ai_model_registry
  const { data: registry, error: regError } = await serviceClient
    .from("ai_model_registry")
    .select("id,provider,model_key,modality,status,is_active,default_output_count,default_output_size")
    .eq("id", modelConfigId)
    .maybeSingle<AiModelRegistryRecord>();

  if (regError) {
    console.error("model_registry_lookup_failed", regError.message);
    return { ok: false, errorCode: "model_validation_failed", safeMessage: "Model validation failed." };
  }

  if (!registry) {
    return {
      ok: false,
      errorCode: "model_not_configured",
      safeMessage: "No AI model is configured for this product.",
    };
  }

  if (!registry.is_active) {
    return {
      ok: false,
      errorCode: "model_inactive",
      safeMessage: "Selected model is globally inactive.",
    };
  }

  if (!ACTIVE_STATUSES.has(registry.status)) {
    return {
      ok: false,
      errorCode: "model_inactive",
      safeMessage: "Selected model is not available.",
    };
  }

  // 3. Verify modality is image-compatible
  if (!SUPPORTED_MODALITIES.has(registry.modality)) {
    return {
      ok: false,
      errorCode: "unsupported_model_modality",
      safeMessage: `Model type '${registry.modality}' is not supported for image generation.`,
    };
  }

  // 4. Verify provider is implemented
  const provider = registry.provider as ProviderName;
  if (!IMPLEMENTED_PROVIDERS.has(provider)) {
    return {
      ok: false,
      errorCode: "provider_not_configured",
      safeMessage: "Provider is not configured for image generation.",
    };
  }

  return {
    ok: true,
    registryModel: registry,
    allowedRelation: relation,
    effectiveProvider: provider,
    effectiveModelKey: registry.model_key,
    effectiveCreditCost: relation.credit_cost_override ?? productCreditCost,
  };
}

/**
 * Resolve the default active allowed model for a product.
 * Used as fallback when no model_config_id was explicitly provided.
 * Returns null if no valid default exists (caller should fall through to legacy path).
 */
export async function resolveDefaultRegistryModel(
  serviceClient: ReturnType<typeof createClient>,
  productId: string,
  productCreditCost: number,
): Promise<RegistryModelResolution | null> {
  const { data: relation, error: relError } = await serviceClient
    .from("product_allowed_models")
    .select("id,model_config_id,is_default,is_active,credit_cost_override")
    .eq("product_id", productId)
    .eq("is_active", true)
    .eq("is_default", true)
    .maybeSingle<ProductAllowedModelRecord>();

  if (relError || !relation) return null;

  const { data: registry, error: regError } = await serviceClient
    .from("ai_model_registry")
    .select("id,provider,model_key,modality,status,is_active,default_output_count,default_output_size")
    .eq("id", relation.model_config_id)
    .maybeSingle<AiModelRegistryRecord>();

  if (regError || !registry) return null;
  if (!registry.is_active || !ACTIVE_STATUSES.has(registry.status)) return null;
  if (!SUPPORTED_MODALITIES.has(registry.modality)) return null;

  const provider = registry.provider as ProviderName;
  if (!IMPLEMENTED_PROVIDERS.has(provider)) return null;

  return {
    ok: true,
    registryModel: registry,
    allowedRelation: relation,
    effectiveProvider: provider,
    effectiveModelKey: registry.model_key,
    effectiveCreditCost: relation.credit_cost_override ?? productCreditCost,
  };
}
