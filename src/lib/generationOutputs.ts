import { supabase } from "./supabase";

type GenerationOutputRow = {
  created_at: string | null;
  generation_id: string;
  height: number | null;
  id: string;
  metadata: Record<string, unknown> | null;
  output_type: "image";
  storage_path: string;
  width: number | null;
};

export type GenerationOutputPreview = {
  createdAt?: string | null;
  height?: number | null;
  id: string;
  url: string;
  width?: number | null;
};

async function assertOwnCompletedGeneration(generationId: string) {
  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData.user) {
    throw new Error("Authentication is required.");
  }

  const { data: generation, error } = await supabase
    .from("generations")
    .select("id,user_id,status")
    .eq("id", generationId)
    .single<{ id: string; status: string; user_id: string }>();

  if (error || !generation) {
    throw new Error("Generation could not be loaded.");
  }

  if (generation.user_id !== userData.user.id) {
    throw new Error("Generation does not belong to the current user.");
  }

  if (generation.status !== "completed" && generation.status !== "credit_spent") {
    throw new Error("Generation is not completed yet.");
  }
}

export async function listGenerationOutputs(generationId: string) {
  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  await assertOwnCompletedGeneration(generationId);

  const { data, error } = await supabase
    .from("generation_outputs")
    .select("id,generation_id,output_type,storage_path,width,height,created_at,metadata")
    .eq("generation_id", generationId)
    .eq("output_type", "image")
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error("Generation outputs could not be loaded.");
  }

  return (data ?? []) as GenerationOutputRow[];
}

export async function createSignedOutputUrl(storagePath: string) {
  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  const { data, error } = await supabase.storage
    .from("generation-outputs")
    .createSignedUrl(storagePath, 60 * 60);

  if (error || !data?.signedUrl) {
    throw new Error("Could not create signed output URL.");
  }

  return data.signedUrl;
}

export async function getGenerationOutputPreviews(generationId: string) {
  const outputs = await listGenerationOutputs(generationId);

  return Promise.all(
    outputs.map(async (output) => ({
      createdAt: output.created_at,
      height: output.height,
      id: output.id,
      url: await createSignedOutputUrl(output.storage_path),
      width: output.width,
    })),
  );
}
