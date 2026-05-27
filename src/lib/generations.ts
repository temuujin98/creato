import { supabase } from "./supabase";

export type GenerationOptionValue = string | number | boolean | string[];

export type CreateGenerationRecordInput = {
  creditCost: number;
  optionValues: Record<string, GenerationOptionValue>;
  productId: string;
  uploadedFiles: Array<{
    fileName?: string;
    mimeType?: string;
    size?: number;
    storagePath: string;
  }>;
  userId: string;
};

function serializeOptionValue(value: GenerationOptionValue) {
  return typeof value === "string" ? value : JSON.stringify(value);
}

export async function createGenerationRecord({
  creditCost,
  optionValues,
  productId,
  uploadedFiles,
  userId,
}: CreateGenerationRecordInput) {
  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  const { data: generation, error: generationError } = await supabase
    .from("generations")
    .insert({
      credit_cost: creditCost,
      metadata: {
        no_ai_generation: true,
        source: "frontend_prepare_only",
      },
      product_id: productId,
      status: "created",
      user_id: userId,
    })
    .select("id")
    .single();

  if (generationError || !generation) {
    throw new Error("Could not create generation record.");
  }

  const inputRows = [
    ...uploadedFiles.map((file) => ({
      generation_id: generation.id,
      input_type: "upload",
      metadata: {
        fileName: file.fileName,
        mimeType: file.mimeType,
        size: file.size,
      },
      storage_path: file.storagePath,
    })),
    ...Object.entries(optionValues).map(([key, value]) => ({
      generation_id: generation.id,
      input_type: "option",
      option_key: key,
      option_value: serializeOptionValue(value),
    })),
  ];

  if (inputRows.length > 0) {
    // TODO: move generation and input creation into a transactional backend function.
    const { error: inputsError } = await supabase
      .from("generation_inputs")
      .insert(inputRows);

    if (inputsError) {
      throw new Error("Generation was created, but inputs could not be saved.");
    }
  }

  return { generationId: generation.id as string };
}

async function updateGenerationStatus({
  generationId,
  status,
  userId,
}: {
  generationId: string;
  status: "queued" | "processing";
  userId: string;
}) {
  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  // Future production implementation should route this through a backend job creation endpoint.
  const { error } = await supabase
    .from("generations")
    .update({
      metadata: {
        ai_backend_connected: false,
        frontend_placeholder: true,
      },
      status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", generationId)
    .eq("user_id", userId);

  if (error) {
    throw new Error("Could not update generation status.");
  }
}

export function markGenerationQueued(generationId: string, userId: string) {
  return updateGenerationStatus({
    generationId,
    status: "queued",
    userId,
  });
}

export function markGenerationProcessing(generationId: string, userId: string) {
  return updateGenerationStatus({
    generationId,
    status: "processing",
    userId,
  });
}
