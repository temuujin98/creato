/**
 * modelRegistry.ts
 *
 * Helpers for the global ai_model_registry table.
 * This is distinct from model_configs (product-level routing) in adminProductConfig.ts.
 *
 * Rules:
 * - Never return or accept API key fields.
 * - Public helpers return only safe, active-model fields.
 * - Admin helpers rely on Supabase RLS (is_admin() policy) — no service role in client.
 */
import { supabase } from "./supabase";

// ─── Domain types ─────────────────────────────────────────────────────────────

export type ModelModality = "image" | "video" | "text" | "multimodal";
export type ModelStatus = "active" | "inactive" | "testing" | "deprecated";
export type ModelConnectionStatus =
  | "connected"
  | "not_configured"
  | "error"
  | "unknown";

export type AiModelRegistry = {
  connectionStatus: ModelConnectionStatus;
  costPerGenerationMnt: number | null;
  costPerInputImageMnt: number | null;
  costPerOutputMnt: number | null;
  createdAt: string;
  defaultAspectRatio: string | null;
  defaultOutputCount: number;
  defaultOutputSize: string | null;
  description: string | null;
  displayName: string;
  estimatedCostNote: string | null;
  id: string;
  isActive: boolean;
  isDefault: boolean;
  isPremium: boolean;
  maxOutputs: number;
  modelKey: string;
  modality: ModelModality;
  provider: string;
  sortOrder: number;
  status: ModelStatus;
  supportsAspectRatio: boolean;
  supportsImageInput: boolean;
  supportsMultipleOutputs: boolean;
  supportsTextPrompt: boolean;
  updatedAt: string;
};

export type AiModelRegistryInput = Omit<AiModelRegistry, "id" | "createdAt" | "updatedAt">;

/** Public-safe subset — no cost fields, no connection status. */
export type PublicAiModel = {
  defaultAspectRatio: string | null;
  defaultOutputCount: number;
  defaultOutputSize: string | null;
  description: string | null;
  displayName: string;
  id: string;
  isPremium: boolean;
  maxOutputs: number;
  modelKey: string;
  modality: ModelModality;
  provider: string;
  sortOrder: number;
  supportsAspectRatio: boolean;
  supportsImageInput: boolean;
  supportsMultipleOutputs: boolean;
  supportsTextPrompt: boolean;
};

// ─── Internal row types ───────────────────────────────────────────────────────

type AdminRow = {
  connection_status: string;
  cost_per_generation_mnt: number | null;
  cost_per_input_image_mnt: number | null;
  cost_per_output_mnt: number | null;
  created_at: string;
  default_aspect_ratio: string | null;
  default_output_count: number;
  default_output_size: string | null;
  description: string | null;
  display_name: string;
  estimated_cost_note: string | null;
  id: string;
  is_active: boolean;
  is_default: boolean;
  is_premium: boolean;
  max_outputs: number;
  model_key: string;
  modality: string;
  provider: string;
  sort_order: number;
  status: string;
  supports_aspect_ratio: boolean;
  supports_image_input: boolean;
  supports_multiple_outputs: boolean;
  supports_text_prompt: boolean;
  updated_at: string;
};

type PublicRow = {
  default_aspect_ratio: string | null;
  default_output_count: number;
  default_output_size: string | null;
  description: string | null;
  display_name: string;
  id: string;
  is_premium: boolean;
  max_outputs: number;
  model_key: string;
  modality: string;
  provider: string;
  sort_order: number;
  supports_aspect_ratio: boolean;
  supports_image_input: boolean;
  supports_multiple_outputs: boolean;
  supports_text_prompt: boolean;
};

// ─── Mappers ──────────────────────────────────────────────────────────────────

function toAdminModel(r: AdminRow): AiModelRegistry {
  return {
    connectionStatus:      r.connection_status as ModelConnectionStatus,
    costPerGenerationMnt:  r.cost_per_generation_mnt,
    costPerInputImageMnt:  r.cost_per_input_image_mnt,
    costPerOutputMnt:      r.cost_per_output_mnt,
    createdAt:             r.created_at,
    defaultAspectRatio:    r.default_aspect_ratio,
    defaultOutputCount:    r.default_output_count,
    defaultOutputSize:     r.default_output_size,
    description:           r.description,
    displayName:           r.display_name,
    estimatedCostNote:     r.estimated_cost_note,
    id:                    r.id,
    isActive:              r.is_active,
    isDefault:             r.is_default,
    isPremium:             r.is_premium,
    maxOutputs:            r.max_outputs,
    modelKey:              r.model_key,
    modality:              r.modality as ModelModality,
    provider:              r.provider,
    sortOrder:             r.sort_order,
    status:                r.status as ModelStatus,
    supportsAspectRatio:   r.supports_aspect_ratio,
    supportsImageInput:    r.supports_image_input,
    supportsMultipleOutputs: r.supports_multiple_outputs,
    supportsTextPrompt:    r.supports_text_prompt,
    updatedAt:             r.updated_at,
  };
}

function toPublicModel(r: PublicRow): PublicAiModel {
  return {
    defaultAspectRatio:    r.default_aspect_ratio,
    defaultOutputCount:    r.default_output_count,
    defaultOutputSize:     r.default_output_size,
    description:           r.description,
    displayName:           r.display_name,
    id:                    r.id,
    isPremium:             r.is_premium,
    maxOutputs:            r.max_outputs,
    modelKey:              r.model_key,
    modality:              r.modality as ModelModality,
    provider:              r.provider,
    sortOrder:             r.sort_order,
    supportsAspectRatio:   r.supports_aspect_ratio,
    supportsImageInput:    r.supports_image_input,
    supportsMultipleOutputs: r.supports_multiple_outputs,
    supportsTextPrompt:    r.supports_text_prompt,
  };
}

const ADMIN_SELECT =
  "id,provider,model_key,display_name,description,modality,status," +
  "connection_status,is_active,is_default,is_premium," +
  "supports_image_input,supports_text_prompt,supports_aspect_ratio,supports_multiple_outputs," +
  "max_outputs,default_output_count,default_aspect_ratio,default_output_size," +
  "cost_per_generation_mnt,cost_per_input_image_mnt,cost_per_output_mnt," +
  "estimated_cost_note,sort_order,created_at,updated_at";

const PUBLIC_SELECT =
  "id,provider,model_key,display_name,description,modality,is_premium," +
  "supports_image_input,supports_text_prompt,supports_aspect_ratio,supports_multiple_outputs," +
  "max_outputs,default_output_count,default_aspect_ratio,default_output_size,sort_order";

// ─── Public queries ───────────────────────────────────────────────────────────

export async function listActiveModelConfigs(): Promise<PublicAiModel[]> {
  if (!supabase) throw new Error("Supabase is not configured.");

  const { data, error } = await supabase
    .from("ai_model_registry")
    .select(PUBLIC_SELECT)
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) throw new Error("Could not load model configs.");
  return ((data ?? []) as unknown as PublicRow[]).map(toPublicModel);
}

// ─── Admin queries ────────────────────────────────────────────────────────────

export async function listAdminModelConfigs(): Promise<AiModelRegistry[]> {
  if (!supabase) throw new Error("Supabase is not configured.");

  const { data, error } = await supabase
    .from("ai_model_registry")
    .select(ADMIN_SELECT)
    .order("sort_order", { ascending: true });

  if (error) throw new Error("Could not load model configs.");
  return ((data ?? []) as unknown as AdminRow[]).map(toAdminModel);
}

// ─── Admin mutations ──────────────────────────────────────────────────────────

export async function createModelConfig(
  input: AiModelRegistryInput,
): Promise<AiModelRegistry> {
  if (!supabase) throw new Error("Supabase is not configured.");

  const { data, error } = await supabase
    .from("ai_model_registry")
    .insert(toDbRow(input))
    .select(ADMIN_SELECT)
    .single();

  if (error) throw new Error(error.message);
  return toAdminModel(data as unknown as AdminRow);
}

export async function updateModelConfig(
  id: string,
  input: AiModelRegistryInput,
): Promise<AiModelRegistry> {
  if (!supabase) throw new Error("Supabase is not configured.");

  const { data, error } = await supabase
    .from("ai_model_registry")
    .update(toDbRow(input))
    .eq("id", id)
    .select(ADMIN_SELECT)
    .single();

  if (error) throw new Error(error.message);
  return toAdminModel(data as unknown as AdminRow);
}

export async function setModelConfigActive(
  id: string,
  isActive: boolean,
): Promise<void> {
  if (!supabase) throw new Error("Supabase is not configured.");

  const { error } = await supabase
    .from("ai_model_registry")
    .update({ is_active: isActive })
    .eq("id", id);

  if (error) throw new Error(error.message);
}

export async function setModelConfigStatus(
  id: string,
  status: ModelStatus,
): Promise<void> {
  if (!supabase) throw new Error("Supabase is not configured.");

  const { error } = await supabase
    .from("ai_model_registry")
    .update({ status })
    .eq("id", id);

  if (error) throw new Error(error.message);
}

/**
 * Set a model as default for its modality.
 * Clears is_default on other models of the same modality first,
 * then sets the target. Two separate calls — acceptable for admin management.
 */
export async function setDefaultModelConfig(
  id: string,
  modality: ModelModality,
): Promise<void> {
  if (!supabase) throw new Error("Supabase is not configured.");

  // Clear existing defaults for this modality
  const { error: clearError } = await supabase
    .from("ai_model_registry")
    .update({ is_default: false })
    .eq("modality", modality)
    .neq("id", id);

  if (clearError) throw new Error(clearError.message);

  // Set new default
  const { error: setError } = await supabase
    .from("ai_model_registry")
    .update({ is_default: true })
    .eq("id", id);

  if (setError) throw new Error(setError.message);
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toDbRow(input: AiModelRegistryInput): Record<string, unknown> {
  return {
    connection_status:         input.connectionStatus,
    cost_per_generation_mnt:   input.costPerGenerationMnt ?? null,
    cost_per_input_image_mnt:  input.costPerInputImageMnt ?? null,
    cost_per_output_mnt:       input.costPerOutputMnt ?? null,
    default_aspect_ratio:      input.defaultAspectRatio?.trim() || null,
    default_output_count:      input.defaultOutputCount,
    default_output_size:       input.defaultOutputSize?.trim() || null,
    description:               input.description?.trim() || null,
    display_name:              input.displayName.trim(),
    estimated_cost_note:       input.estimatedCostNote?.trim() || null,
    is_active:                 input.isActive,
    is_default:                input.isDefault,
    is_premium:                input.isPremium,
    max_outputs:               input.maxOutputs,
    model_key:                 input.modelKey.toLowerCase().trim(),
    modality:                  input.modality,
    provider:                  input.provider.toLowerCase().trim(),
    sort_order:                input.sortOrder,
    status:                    input.status,
    supports_aspect_ratio:     input.supportsAspectRatio,
    supports_image_input:      input.supportsImageInput,
    supports_multiple_outputs: input.supportsMultipleOutputs,
    supports_text_prompt:      input.supportsTextPrompt,
  };
}
