import type { PaymentCheckoutRequest, PaymentCheckoutResponse, PaymentProviderAdapter } from "./types";

async function createCheckout(
  request: PaymentCheckoutRequest,
): Promise<PaymentCheckoutResponse> {
  return {
    provider: "manual",
    providerReference: `manual-${request.paymentId}`,
    checkoutMode: "manual",
    status: "pending",
    safeMessage:
      "Manual payment foundation created. External provider integration is not enabled yet.",
  };
}

export const manualAdapter: PaymentProviderAdapter = {
  key: "manual",
  displayName: "Manual",
  status: "manual_only",
  checkoutMode: "manual",
  createCheckout,
};
