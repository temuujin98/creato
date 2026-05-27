import { dryRunProvider } from "./dryRunProvider.ts";
import { geminiProvider } from "./geminiProvider.ts";
import type { ProviderAdapter, ProviderName } from "./types.ts";

export function getProviderAdapter(
  provider: ProviderName,
  options: { dryRun?: boolean } = {},
): ProviderAdapter {
  if (options.dryRun) {
    return dryRunProvider;
  }

  if (provider === "gemini") {
    return geminiProvider;
  }

  if (provider === "openai") {
    // TODO: Return OpenAI adapter after fallback/premium provider integration is approved.
    throw new Error("provider_not_configured");
  }

  if (provider === "dry_run") {
    return dryRunProvider;
  }

  throw new Error("provider_not_configured");
}
