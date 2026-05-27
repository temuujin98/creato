import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";
import type { ImageInput } from "../providers/types.ts";

const allowedMimeTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

type LoadedImageInput = ImageInput & {
  base64: string;
  mimeType: string;
};

function detectMimeType(input: ImageInput) {
  if (input.mimeType && allowedMimeTypes.has(input.mimeType)) {
    return input.mimeType;
  }

  const lowerPath = input.storagePath.toLowerCase();

  if (lowerPath.endsWith(".jpg") || lowerPath.endsWith(".jpeg")) {
    return "image/jpeg";
  }

  if (lowerPath.endsWith(".png")) {
    return "image/png";
  }

  if (lowerPath.endsWith(".webp")) {
    return "image/webp";
  }

  return null;
}

function bytesToBase64(bytes: Uint8Array) {
  let binary = "";
  const chunkSize = 0x8000;

  for (let index = 0; index < bytes.length; index += chunkSize) {
    const chunk = bytes.subarray(index, index + chunkSize);
    binary += String.fromCharCode(...chunk);
  }

  return btoa(binary);
}

export async function loadImageInputs(
  serviceClient: SupabaseClient,
  uploadInputs: ImageInput[],
): Promise<LoadedImageInput[]> {
  const loadedImages: LoadedImageInput[] = [];

  for (const input of uploadInputs) {
    const mimeType = detectMimeType(input);

    if (!mimeType) {
      throw new Error("storage_input_missing");
    }

    const { data, error } = await serviceClient.storage
      .from("user-uploads")
      .download(input.storagePath);

    if (error || !data) {
      throw new Error("storage_input_missing");
    }

    const bytes = new Uint8Array(await data.arrayBuffer());

    loadedImages.push({
      ...input,
      base64: bytesToBase64(bytes),
      mimeType,
    });
  }

  return loadedImages;
}
