// Payment provider adapter types — client-safe, no secrets.

export type PaymentProviderKey = "manual" | "qpay" | "bonum" | "pocket" | "storepay";

export type PaymentProviderStatus =
  | "not_configured"
  | "manual_only"
  | "testing"
  | "active"
  | "disabled";

export type PaymentCheckoutMode = "manual" | "redirect" | "qr" | "invoice" | "deeplink";

// ─── Request / Response ───────────────────────────────────────────────────────

export interface PaymentCheckoutRequest {
  paymentId: string;
  userId?: string; // available server-side only; optional for client-side adapters
  amountMnt: number;
  credits: number;
  packageCode: string;
  packageName: string;
  currency: string;
  returnUrl?: string;
  cancelUrl?: string;
}

export interface PaymentCheckoutResponse {
  provider: PaymentProviderKey;
  providerReference: string | null;
  checkoutMode: PaymentCheckoutMode;
  checkoutUrl?: string;
  qrText?: string;
  qrImageUrl?: string;
  invoiceText?: string;
  expiresAt?: string;
  status: string;
  safeMessage: string;
}

// ─── Provider adapter interface ───────────────────────────────────────────────

export interface PaymentProviderMeta {
  key: PaymentProviderKey;
  displayName: string;
  status: PaymentProviderStatus;
  checkoutMode: PaymentCheckoutMode;
}

export interface PaymentProviderAdapter extends PaymentProviderMeta {
  createCheckout(request: PaymentCheckoutRequest): Promise<PaymentCheckoutResponse>;
  verifyPayment?(providerReference: string): Promise<{
    status: string;
    paidAt?: string;
    rawSafeMetadata?: Record<string, unknown>;
  }>;
}
