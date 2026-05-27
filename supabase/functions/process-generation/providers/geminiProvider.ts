import { providerErrorCodes } from "./errors.ts";
import type {
  NormalizedGenerationOutput,
  NormalizedGenerationRequest,
  NormalizedGenerationResult,
  NormalizedProviderError,
  ProviderAdapter,
} from "./types.ts";

type GeminiInlineData = {
  data?: string;
  mimeType?: string;
  mime_type?: string;
};

type GeminiPart = {
  inlineData?: GeminiInlineData;
  inline_data?: GeminiInlineData;
  text?: string;
};

type GeminiResponse = {
  candidates?: Array<{
    content?: {
      parts?: GeminiPart[];
    };
    finishReason?: string;
    finish_reason?: string;
  }>;
  promptFeedback?: {
    blockReason?: string;
    block_reason?: string;
  };
};

function providerError(
  code: string,
  message: string,
  retryable: boolean,
): NormalizedProviderError {
  return {
    code,
    message,
    ok: false,
    provider: "gemini",
    retryable,
  };
}

function getEndpoint(model: string, apiKey: string) {
  const modelPath = model.startsWith("models/") ? model : `models/${model}`;
  return `https://generativelanguage.googleapis.com/v1beta/${modelPath}:generateContent?key=${apiKey}`;
}

function normalizeGeminiOutputs(response: GeminiResponse): NormalizedGenerationOutput[] {
  const outputs: NormalizedGenerationOutput[] = [];

  for (const candidate of response.candidates ?? []) {
    for (const part of candidate.content?.parts ?? []) {
      const inlineData = part.inlineData ?? part.inline_data;

      if (inlineData?.data) {
        outputs.push({
          base64: inlineData.data,
          index: outputs.length,
          mimeType: inlineData.mimeType ?? inlineData.mime_type ?? "image/png",
        });
      }
    }
  }

  return outputs;
}

export const geminiProvider: ProviderAdapter = {
  name: "gemini",
  async generateImage(
    request: NormalizedGenerationRequest,
  ): Promise<NormalizedGenerationResult | NormalizedProviderError> {
    const apiKey = Deno.env.get("GEMINI_API_KEY");

    if (!apiKey) {
      return providerError(
        providerErrorCodes.providerAuthError,
        "Gemini provider is not configured.",
        false,
      );
    }

    const parts: Array<Record<string, unknown>> = [
      {
        text: request.negativePrompt
          ? `${request.prompt}\n\nAvoid: ${request.negativePrompt}`
          : request.prompt,
      },
      ...request.inputImages.map((image) => ({
        inline_data: {
          data: image.base64,
          mime_type: image.mimeType,
        },
      })),
    ];

    const abortController = new AbortController();
    const timeout = setTimeout(() => abortController.abort(), 60000);

    try {
      const response = await fetch(getEndpoint(request.model, apiKey), {
        body: JSON.stringify({
          contents: [
            {
              parts,
            },
          ],
          generationConfig: {
            candidateCount: request.outputCount,
            responseModalities: ["IMAGE"],
          },
        }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
        signal: abortController.signal,
      });

      if (response.status === 401 || response.status === 403) {
        return providerError(
          providerErrorCodes.providerAuthError,
          "Gemini authentication failed.",
          false,
        );
      }

      if (response.status === 429) {
        return providerError(
          providerErrorCodes.providerRateLimit,
          "Gemini rate limit reached.",
          true,
        );
      }

      if (!response.ok) {
        return providerError(
          providerErrorCodes.providerUnknownError,
          "Gemini request failed.",
          true,
        );
      }

      const payload = (await response.json()) as GeminiResponse;

      if (payload.promptFeedback?.blockReason || payload.promptFeedback?.block_reason) {
        return providerError(
          providerErrorCodes.providerSafetyBlock,
          "Gemini blocked the request for safety reasons.",
          false,
        );
      }

      const outputs = normalizeGeminiOutputs(payload);

      if (outputs.length === 0) {
        return providerError(
          providerErrorCodes.providerResponseInvalid,
          "Gemini did not return an image output.",
          false,
        );
      }

      return {
        model: request.model,
        ok: true,
        outputs,
        provider: "gemini",
        rawMetadata: {
          outputCount: outputs.length,
        },
      };
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return providerError(
          providerErrorCodes.providerTimeout,
          "Gemini request timed out.",
          true,
        );
      }

      return providerError(
        providerErrorCodes.providerUnknownError,
        "Gemini request failed.",
        true,
      );
    } finally {
      clearTimeout(timeout);
    }
  },
};
