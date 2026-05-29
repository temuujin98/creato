import { providerErrorCodes } from "./errors.ts";
import type {
  NormalizedGenerationOutput,
  NormalizedGenerationRequest,
  NormalizedGenerationResult,
  NormalizedProviderError,
  ProviderAdapter,
} from "./types.ts";

// ── Gemini response types ─────────────────────────────────────────────────────

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

// ── Gemini error response types ───────────────────────────────────────────────

type GeminiErrorDetail = {
  "@type"?: string;
  domain?: string;
  metadata?: Record<string, string | undefined>;
  reason?: string;
};

type GeminiErrorBody = {
  error?: {
    code?: number;
    details?: GeminiErrorDetail[];
    message?: string;
    status?: string;
  };
};

// ── Helpers ───────────────────────────────────────────────────────────────────

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

// ── Error body classifier ─────────────────────────────────────────────────────
// Reads the Gemini error response body and emits a safe diagnostic log.
// Never logs: API key, prompt text, base64 image data, service role key.
// Always logs: HTTP status, provider status string, quota metadata, model, image count.

async function classifyGeminiError(
  response: Response,
  context: { imageInputCount: number; model: string; outputCount: number },
): Promise<NormalizedProviderError> {
  const httpStatus = response.status;

  let body: GeminiErrorBody = {};
  try {
    body = (await response.json()) as GeminiErrorBody;
  } catch {
    // Body not JSON — fall through to status-only classification.
  }

  const providerStatus = body.error?.status ?? "";
  const providerMessage = body.error?.message ?? "";
  const providerCode = body.error?.code ?? httpStatus;
  const details = body.error?.details ?? [];

  // Extract quota details safely — these contain no user data.
  const firstReason = details.find((d) => d.reason)?.reason ?? null;
  const firstQuotaMetric =
    details.find((d) => d.metadata?.quota_metric)?.metadata?.quota_metric ?? null;
  const firstQuotaId =
    details.find((d) => d.metadata?.quota_id)?.metadata?.quota_id ?? null;

  // Safe diagnostic log — first 160 chars of message only, contains no user data.
  console.log("gemini_provider_error", {
    httpStatus,
    imageInputCount: context.imageInputCount,
    model: context.model,
    outputCount: context.outputCount,
    providerCode,
    providerMessagePrefix: providerMessage.slice(0, 160),
    providerStatus,
    quotaId: firstQuotaId,
    quotaMetric: firstQuotaMetric,
    quotaReason: firstReason,
  });

  const lowerMessage = providerMessage.toLowerCase();

  // ── 401 / 403 / PERMISSION_DENIED ─────────────────────────────────────────
  if (
    httpStatus === 401 ||
    httpStatus === 403 ||
    providerStatus === "PERMISSION_DENIED"
  ) {
    return providerError(
      providerErrorCodes.providerAuthError,
      "Gemini authentication or permission denied.",
      false,
    );
  }

  // ── 429 / RESOURCE_EXHAUSTED ───────────────────────────────────────────────
  // Distinguish per-minute rate limit (retryable soon) from daily/monthly quota
  // exhaustion (not retryable within session).
  if (httpStatus === 429 || providerStatus === "RESOURCE_EXHAUSTED") {
    const quotaIdLower = (firstQuotaId ?? "").toLowerCase();
    const quotaMetricLower = (firstQuotaMetric ?? "").toLowerCase();
    const isPerMinuteLimit =
      quotaIdLower.includes("perminute") ||
      quotaMetricLower.includes("perminute") ||
      lowerMessage.includes("per minute") ||
      lowerMessage.includes("perminute");

    if (isPerMinuteLimit) {
      return providerError(
        providerErrorCodes.providerRateLimit,
        "Gemini rate limit reached (per-minute). Wait before retrying.",
        true,
      );
    }

    // Daily/monthly quota or unspecified quota — treat as non-retryable within session.
    return providerError(
      providerErrorCodes.providerQuotaExceeded,
      "Gemini quota exhausted. Check billing and daily limits.",
      false,
    );
  }

  // ── 400 / INVALID_ARGUMENT ─────────────────────────────────────────────────
  if (httpStatus === 400 || providerStatus === "INVALID_ARGUMENT") {
    return providerError(
      providerErrorCodes.providerInvalidRequest,
      "Gemini rejected the request as invalid.",
      false,
    );
  }

  // ── 404 / NOT_FOUND ────────────────────────────────────────────────────────
  if (httpStatus === 404 || providerStatus === "NOT_FOUND") {
    return providerError(
      providerErrorCodes.providerModelUnavailable,
      "Gemini model is not available or not found.",
      false,
    );
  }

  // ── Billing / FAILED_PRECONDITION ──────────────────────────────────────────
  if (
    providerStatus === "FAILED_PRECONDITION" ||
    lowerMessage.includes("billing") ||
    lowerMessage.includes("payment required") ||
    lowerMessage.includes("project billing")
  ) {
    return providerError(
      providerErrorCodes.providerBillingError,
      "Gemini billing or account configuration issue.",
      false,
    );
  }

  // ── Fallback ───────────────────────────────────────────────────────────────
  return providerError(
    providerErrorCodes.providerUnknownError,
    "Gemini request failed.",
    httpStatus >= 500,
  );
}

// ── Provider adapter ──────────────────────────────────────────────────────────

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

    // Safe request-shape log — no API key, no prompt text, no base64 image data.
    console.log("gemini_request_shape", {
      hasNegativePrompt: Boolean(request.negativePrompt),
      imageInputCount: request.inputImages.length,
      model: request.model,
      outputCount: request.outputCount,
      outputSize: request.outputSize ?? null,
      responseModalities: ["IMAGE"],
    });

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

    const errorContext = {
      imageInputCount: request.inputImages.length,
      model: request.model,
      outputCount: request.outputCount,
    };

    try {
      const response = await fetch(getEndpoint(request.model, apiKey), {
        body: JSON.stringify({
          contents: [{ parts }],
          generationConfig: {
            candidateCount: request.outputCount,
            responseModalities: ["IMAGE"],
          },
        }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
        signal: abortController.signal,
      });

      if (!response.ok) {
        return await classifyGeminiError(response, errorContext);
      }

      const payload = (await response.json()) as GeminiResponse;

      if (payload.promptFeedback?.blockReason || payload.promptFeedback?.block_reason) {
        console.log("gemini_safety_block", {
          blockReason:
            payload.promptFeedback.blockReason ??
            payload.promptFeedback.block_reason,
          model: request.model,
        });
        return providerError(
          providerErrorCodes.providerSafetyBlock,
          "Gemini blocked the request for safety reasons.",
          false,
        );
      }

      const outputs = normalizeGeminiOutputs(payload);

      if (outputs.length === 0) {
        // Log candidate count and finish reasons to help diagnose why no image was returned.
        const candidateInfo = (payload.candidates ?? []).map((c) => ({
          finishReason: c.finishReason ?? c.finish_reason ?? null,
          partCount: c.content?.parts?.length ?? 0,
        }));
        console.log("gemini_no_image_output", {
          candidateCount: (payload.candidates ?? []).length,
          candidates: candidateInfo,
          imageInputCount: request.inputImages.length,
          model: request.model,
        });
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
        rawMetadata: { outputCount: outputs.length },
      };
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        console.log("gemini_timeout", { model: request.model, timeoutMs: 60000 });
        return providerError(
          providerErrorCodes.providerTimeout,
          "Gemini request timed out.",
          true,
        );
      }

      console.log("gemini_fetch_error", {
        errorName: error instanceof Error ? error.name : "unknown",
        model: request.model,
      });
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
