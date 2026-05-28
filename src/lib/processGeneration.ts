import { supabase } from "./supabase";

export type ProcessGenerationResponse =
  | {
      generationId: string;
      ok: true;
      outputCount?: number;
      status: "completed";
    }
  | {
      error?: string;
      generationId?: string;
      message?: string;
      ok: false;
      outputCount?: number;
      status?:
        | "failed"
        | "provider_adapter_scaffold_ready"
        | "prompt_scaffold_ready"
        | "real_ai_disabled"
        | "wallet_spend_failed"
        | string;
    };

export async function processGeneration(
  generationId: string,
  options?: { dryRun?: boolean },
) {
  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  const { data, error: sessionError } = await supabase.auth.getSession();

  if (sessionError || !data.session?.access_token) {
    throw new Error("Authentication session is required.");
  }

  const { data: response, error } =
    await supabase.functions.invoke<ProcessGenerationResponse>(
      "process-generation",
      {
        body: {
          dryRun: options?.dryRun ?? false,
          generationId,
        },
      },
    );

  if (error) {
    throw new Error(error.message || "Edge Function call failed.");
  }

  if (!response) {
    throw new Error("Edge Function returned an empty response.");
  }

  return response;
}
