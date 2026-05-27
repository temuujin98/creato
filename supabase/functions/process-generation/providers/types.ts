export type ProviderName = "gemini" | "openai" | "dry_run";

export type ImageInput = {
  storagePath: string;
  mimeType?: string;
  fileName?: string;
  base64?: string;
};

export type NormalizedGenerationRequest = {
  provider: ProviderName;
  model: string;
  prompt: string;
  negativePrompt?: string;
  inputImages: ImageInput[];
  outputSize?: string | null;
  outputCount: number;
  metadata?: Record<string, unknown>;
};

export type NormalizedGenerationOutput = {
  index: number;
  mimeType: string;
  data?: Uint8Array;
  base64?: string;
  providerOutputId?: string;
  metadata?: Record<string, unknown>;
};

export type NormalizedGenerationResult = {
  ok: true;
  provider: ProviderName;
  model: string;
  outputs: NormalizedGenerationOutput[];
  rawMetadata?: Record<string, unknown>;
};

export type NormalizedProviderError = {
  ok: false;
  provider: ProviderName;
  code: string;
  message: string;
  retryable: boolean;
  rawMetadata?: Record<string, unknown>;
};

export type ProviderAdapter = {
  name: ProviderName;
  generateImage(
    request: NormalizedGenerationRequest,
  ): Promise<NormalizedGenerationResult | NormalizedProviderError>;
};
