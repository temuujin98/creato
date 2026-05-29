/**
 * productAllowedModels.ts
 *
 * Per-product model availability management.
 * product_allowed_models links products to the global ai_model_registry.
 *
 * - Public helpers: return only safe, active-model fields.
 * - Admin helpers: full fields for management UI.
 * - No API keys, provider secrets, or prompt fields.
 */
import { supabase } from "./supabase";

// ─── Public model type (returned to client/user context) ─────────────────────

export type PublicAllowedModel = {
  /** product_allowed_models.id */
  id: string;
  /** ai_model_registry.id */
  modelConfigId: string;
  provider: string;
  modelKey: string;
  displayName: string;
  description: string | null;
  modality: string;
  /** is_premium_override ?? ai_model_registry.is_premium */
  isPremium: boolean;
  supportsImageInput: boolean;
  supportsTextPrompt: boolean;
  supportsAspectRatio: boolean;
  supportsMultipleOutputs: boolean;
  maxOutputs: number;
  defaultOutputCount: number;
  defaultAspectRatio: string | null;
  defaultOutputSize: string | null;
  /** credit_cost_override from relation (null means use product.credit_cost) */
  effectiveCreditCost: number | null;
  isDefault: boolean;
  sortOrder: number;
};

// ─── Admin model type ─────────────────────────────────────────────────────────

export type AdminAllowedModel = PublicAllowedModel & {
  isActive: boolean;
  isPremiumOverride: boolean | null;
  creditCostOverride: number | null;
  adminNote: string | null;
  globalIsActive: boolean;
  globalStatus: string;
  globalConnectionStatus: string;
  createdAt: string;
};

// ─── Update input type ────────────────────────────────────────────────────────

export type ProductAllowedModelUpdate = {
  modelConfigId: string;
  isActive: boolean;
  isDefault: boolean;
  isPremiumOverride?: boolean | null;
  creditCostOverride?: number | null;
  sortOrder?: number;
  adminNote?: string | null;
};

// ─── Internal row types ───────────────────────────────────────────────────────

type AllowedRow = {
  id: string;
  model_config_id: string;
  is_default: boolean;
  is_active: boolean;
  is_premium_override: boolean | null;
  credit_cost_override: number | null;
  sort_order: number;
  admin_note: string | null;
  created_at: string;
  // nested registry join
  ai_model_registry: {
    id: string;
    provider: string;
    model_key: string;
    display_name: string;
    description: string | null;
    modality: string;
    is_premium: boolean;
    is_active: boolean;
    status: string;
    connection_status: string;
    supports_image_input: boolean;
    supports_text_prompt: boolean;
    supports_aspect_ratio: boolean;
    supports_multiple_outputs: boolean;
    max_outputs: number;
    default_output_count: number;
    default_aspect_ratio: string | null;
    default_output_size: string | null;
  } | null;
};

// ─── Select fragments ─────────────────────────────────────────────────────────

const REGISTRY_PUBLIC_FIELDS =
  "id,provider,model_key,display_name,description,modality," +
  "is_premium,is_active,status," +
  "supports_image_input,supports_text_prompt,supports_aspect_ratio,supports_multiple_outputs," +
  "max_outputs,default_output_count,default_aspect_ratio,default_output_size";

const REGISTRY_ADMIN_FIELDS = REGISTRY_PUBLIC_FIELDS + ",connection_status";

const RELATION_FIELDS =
  "id,model_config_id,is_default,is_active,is_premium_override,credit_cost_override,sort_order,admin_note,created_at";

// ─── Mappers ──────────────────────────────────────────────────────────────────

function toPublic(row: AllowedRow): PublicAllowedModel | null {
  const r = row.ai_model_registry;
  if (!r) return null;
  return {
    id:                    row.id,
    modelConfigId:         row.model_config_id,
    provider:              r.provider,
    modelKey:              r.model_key,
    displayName:           r.display_name,
    description:           r.description,
    modality:              r.modality,
    isPremium:             row.is_premium_override ?? r.is_premium,
    supportsImageInput:    r.supports_image_input,
    supportsTextPrompt:    r.supports_text_prompt,
    supportsAspectRatio:   r.supports_aspect_ratio,
    supportsMultipleOutputs: r.supports_multiple_outputs,
    maxOutputs:            r.max_outputs,
    defaultOutputCount:    r.default_output_count,
    defaultAspectRatio:    r.default_aspect_ratio,
    defaultOutputSize:     r.default_output_size,
    effectiveCreditCost:   row.credit_cost_override,
    isDefault:             row.is_default,
    sortOrder:             row.sort_order,
  };
}

function toAdmin(row: AllowedRow): AdminAllowedModel | null {
  const base = toPublic(row);
  if (!base || !row.ai_model_registry) return null;
  return {
    ...base,
    isActive:              row.is_active,
    isPremiumOverride:     row.is_premium_override,
    creditCostOverride:    row.credit_cost_override,
    adminNote:             row.admin_note,
    globalIsActive:        row.ai_model_registry.is_active,
    globalStatus:          row.ai_model_registry.status,
    globalConnectionStatus: (row.ai_model_registry as { connection_status?: string }).connection_status ?? "unknown",
    createdAt:             row.created_at,
  };
}

// ─── Public queries ───────────────────────────────────────────────────────────

/**
 * Returns allowed models for a product that are safe to show to users.
 * Filters: relation is_active, registry is_active, registry status active/testing.
 */
export async function listPublicProductAllowedModels(
  productId: string,
): Promise<PublicAllowedModel[]> {
  if (!supabase) throw new Error("Supabase is not configured.");

  const { data, error } = await supabase
    .from("product_allowed_models")
    .select(
      `${RELATION_FIELDS},ai_model_registry:model_config_id(${REGISTRY_PUBLIC_FIELDS})`,
    )
    .eq("product_id", productId)
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) throw new Error("Could not load allowed models.");

  const rows = (data ?? []) as unknown as AllowedRow[];
  return rows
    .filter(
      (r) =>
        r.ai_model_registry?.is_active === true &&
        ["active", "testing"].includes(r.ai_model_registry?.status ?? ""),
    )
    .map(toPublic)
    .filter((m): m is PublicAllowedModel => m !== null);
}

/**
 * Returns the default allowed model for a product (or first active if no default).
 */
export async function getDefaultAllowedModelForProduct(
  productId: string,
): Promise<PublicAllowedModel | null> {
  const models = await listPublicProductAllowedModels(productId);
  if (!models.length) return null;
  return models.find((m) => m.isDefault) ?? models[0];
}

/**
 * Validates that a model config is allowed and active for a product.
 * Returns { valid, reason }.
 * Used before generation to prevent invalid model selection.
 */
export async function validateProductModelSelection(
  productId: string,
  modelConfigId: string,
): Promise<{ valid: boolean; reason?: string }> {
  if (!supabase) return { valid: false, reason: "Supabase is not configured." };

  const { data, error } = await supabase
    .from("product_allowed_models")
    .select(
      `id,is_active,model_config_id,ai_model_registry:model_config_id(is_active,status)`,
    )
    .eq("product_id", productId)
    .eq("model_config_id", modelConfigId)
    .maybeSingle();

  if (error || !data) {
    return { valid: false, reason: "Model is not allowed for this product." };
  }

  const row = data as unknown as {
    is_active: boolean;
    ai_model_registry: { is_active: boolean; status: string } | null;
  };

  if (!row.is_active) {
    return { valid: false, reason: "Model is disabled for this product." };
  }

  const reg = row.ai_model_registry;
  if (!reg?.is_active || !["active", "testing"].includes(reg.status)) {
    return { valid: false, reason: "Model is not globally active." };
  }

  return { valid: true };
}

// ─── Admin queries ────────────────────────────────────────────────────────────

export async function listAdminProductAllowedModels(
  productId: string,
): Promise<AdminAllowedModel[]> {
  if (!supabase) throw new Error("Supabase is not configured.");

  const { data, error } = await supabase
    .from("product_allowed_models")
    .select(
      `${RELATION_FIELDS},ai_model_registry:model_config_id(${REGISTRY_ADMIN_FIELDS})`,
    )
    .eq("product_id", productId)
    .order("sort_order", { ascending: true });

  if (error) throw new Error("Could not load allowed models.");

  const rows = (data ?? []) as unknown as AllowedRow[];
  return rows.map(toAdmin).filter((m): m is AdminAllowedModel => m !== null);
}

// ─── Admin mutations ──────────────────────────────────────────────────────────

/**
 * Batch upsert of product_allowed_models rows.
 * Handles clearing old defaults before setting new one.
 */
export async function updateProductAllowedModels(
  productId: string,
  updates: ProductAllowedModelUpdate[],
): Promise<void> {
  if (!supabase) throw new Error("Supabase is not configured.");

  const hasNewDefault = updates.some((u) => u.isDefault && u.isActive);

  // If a new default is being set, clear all existing defaults first
  if (hasNewDefault) {
    const { error: clearErr } = await supabase
      .from("product_allowed_models")
      .update({ is_default: false })
      .eq("product_id", productId);
    if (clearErr) throw new Error(clearErr.message);
  }

  // Upsert each row
  for (const update of updates) {
    const { error } = await supabase
      .from("product_allowed_models")
      .upsert(
        {
          admin_note:          update.adminNote ?? null,
          credit_cost_override: update.creditCostOverride ?? null,
          is_active:           update.isActive,
          is_default:          update.isDefault,
          is_premium_override: update.isPremiumOverride ?? null,
          model_config_id:     update.modelConfigId,
          product_id:          productId,
          sort_order:          update.sortOrder ?? 0,
        },
        { onConflict: "product_id,model_config_id" },
      );
    if (error) throw new Error(error.message);
  }
}
