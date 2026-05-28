import { supabase, supabaseConfigError } from "./supabase";

const avatarBucket = "user-uploads";
const maxAvatarSize = 5 * 1024 * 1024;
const allowedAvatarTypes = ["image/jpeg", "image/png", "image/webp"];

export type ProfileUpdateInput = {
  avatarUrl?: string | null;
  fullName: string;
  userId: string;
};

function getSupabase() {
  if (!supabase) {
    throw new Error(supabaseConfigError ?? "Supabase is not configured.");
  }

  return supabase;
}

function avatarExtension(file: File) {
  const extension = file.name.split(".").pop()?.toLowerCase();
  if (extension === "jpg" || extension === "jpeg") return "jpg";
  if (extension === "png") return "png";
  if (extension === "webp") return "webp";
  return "png";
}

export function validateAvatarFile(file: File, message: string) {
  if (!allowedAvatarTypes.includes(file.type) || file.size > maxAvatarSize) {
    throw new Error(message);
  }
}

export async function uploadAvatar(file: File, userId: string) {
  const client = getSupabase();
  const path = `users/${userId}/avatars/avatar-${Date.now()}.${avatarExtension(file)}`;
  const { error } = await client.storage.from(avatarBucket).upload(path, file, {
    cacheControl: "3600",
    upsert: true,
  });

  if (error) {
    throw new Error(error.message);
  }

  return path;
}

export async function createAvatarDisplayUrl(pathOrUrl: string | null) {
  if (!pathOrUrl) return null;
  if (/^https?:\/\//i.test(pathOrUrl) || pathOrUrl.startsWith("blob:")) {
    return pathOrUrl;
  }

  const client = getSupabase();
  const { data, error } = await client.storage
    .from(avatarBucket)
    .createSignedUrl(pathOrUrl, 60 * 60);

  if (error) {
    return null;
  }

  return data.signedUrl;
}

export async function updateCurrentProfile({
  avatarUrl,
  fullName,
  userId,
}: ProfileUpdateInput) {
  const client = getSupabase();
  const { error } = await client
    .from("profiles")
    .update({
      avatar_url: avatarUrl ?? null,
      full_name: fullName.trim() || null,
    })
    .eq("id", userId);

  if (error) {
    throw new Error(error.message);
  }
}
