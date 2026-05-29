import type { NormalizedProviderError, ProviderName } from "./types.ts";

export const providerErrorCodes = {
  providerAuthError: "provider_auth_error",
  providerBillingError: "provider_billing_error",
  providerInvalidRequest: "provider_invalid_request",
  providerModelUnavailable: "provider_model_unavailable",
  providerNotConfigured: "provider_not_configured",
  providerQuotaExceeded: "provider_quota_exceeded",
  providerRateLimit: "provider_rate_limit",
  providerResponseInvalid: "provider_response_invalid",
  providerSafetyBlock: "provider_safety_block",
  providerTimeout: "provider_timeout",
  providerUnknownError: "provider_unknown_error",
} as const;

export function mapProviderError(
  error: unknown,
  provider: ProviderName,
): NormalizedProviderError {
  if (typeof error === "object" && error && "ok" in error && error.ok === false) {
    return error as NormalizedProviderError;
  }

  const message = error instanceof Error ? error.message : "";
  const code =
    message === providerErrorCodes.providerNotConfigured
      ? providerErrorCodes.providerNotConfigured
      : providerErrorCodes.providerUnknownError;

  return {
    code,
    message:
      code === providerErrorCodes.providerNotConfigured
        ? "Provider is not configured."
        : "Provider failed before image generation could complete.",
    ok: false,
    provider,
    retryable: code !== providerErrorCodes.providerNotConfigured,
  };
}
