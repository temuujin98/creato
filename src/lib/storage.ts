import { supabase } from "./supabase";

const uploadBucket = "user-uploads";

export function sanitizeFileName(fileName: string) {
  const extension = fileName.split(".").pop()?.toLowerCase() ?? "image";
  const baseName = fileName
    .replace(/\.[^/.]+$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);

  return `${baseName || "upload"}.${extension}`;
}

export function buildUserUploadPath(userId: string, fileName: string) {
  const timestamp = new Date()
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\..+/, "");

  return `users/${userId}/uploads/${timestamp}-${sanitizeFileName(fileName)}`;
}

export async function uploadUserImage(file: File, userId: string) {
  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  const path = buildUserUploadPath(userId, file.name);
  const { error } = await supabase.storage.from(uploadBucket).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });

  if (error) {
    throw new Error("Upload failed.");
  }

  return { path };
}
