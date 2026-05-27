import type {
  NormalizedGenerationRequest,
  NormalizedGenerationResult,
  ProviderAdapter,
} from "./types.ts";

export const dryRunProvider: ProviderAdapter = {
  name: "dry_run",
  async generateImage(
    request: NormalizedGenerationRequest,
  ): Promise<NormalizedGenerationResult> {
    // Scaffold only: this adapter does not call any AI provider and returns no image bytes.
    return {
      model: request.model,
      ok: true,
      outputs: [],
      provider: "dry_run",
      rawMetadata: {
        dryRun: true,
        inputImageCount: request.inputImages.length,
        outputCountRequested: request.outputCount,
      },
    };
  },
};
