import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";
import type { NormalizedGenerationOutput, ProviderName } from "../providers/types.ts";

type StoreGeneratedOutputsInput = {
  generationId: string;
  model: string;
  outputs: NormalizedGenerationOutput[];
  provider: ProviderName;
  userId: string;
};

type StoredOutput = {
  id: string;
  storagePath: string;
};

function base64ToBytes(base64: string) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}

function outputToBytes(output: NormalizedGenerationOutput) {
  if (output.data) {
    return output.data;
  }

  if (output.base64) {
    return base64ToBytes(output.base64);
  }

  throw new Error("provider_response_invalid");
}

export async function storeGeneratedOutputs(
  serviceClient: SupabaseClient,
  input: StoreGeneratedOutputsInput,
): Promise<StoredOutput[]> {
  const storedOutputs: StoredOutput[] = [];

  for (const output of input.outputs) {
    const outputIndex = output.index;
    const storagePath = `users/${input.userId}/generations/${input.generationId}/outputs/${outputIndex}.png`;
    const bytes = outputToBytes(output);

    const { error: uploadError } = await serviceClient.storage
      .from("generation-outputs")
      .upload(storagePath, bytes, {
        cacheControl: "3600",
        contentType: output.mimeType || "image/png",
        upsert: true,
      });

    if (uploadError) {
      throw new Error("output_storage_failed");
    }

    const { data, error: insertError } = await serviceClient
      .from("generation_outputs")
      .insert({
        generation_id: input.generationId,
        metadata: {
          generatedAt: new Date().toISOString(),
          model: input.model,
          outputIndex,
          provider: input.provider,
        },
        output_type: "image",
        storage_path: storagePath,
      })
      .select("id,storage_path")
      .single();

    if (insertError || !data) {
      throw new Error("output_storage_failed");
    }

    storedOutputs.push({
      id: data.id as string,
      storagePath: data.storage_path as string,
    });
  }

  return storedOutputs;
}
