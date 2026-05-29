import type { PaymentProviderKey, PaymentProviderMeta } from "./types";

export const PAYMENT_PROVIDERS: Record<PaymentProviderKey, PaymentProviderMeta> = {
  manual: {
    key: "manual",
    displayName: "Manual",
    status: "manual_only",
    checkoutMode: "manual",
  },
  qpay: {
    key: "qpay",
    displayName: "QPay",
    status: "not_configured",
    checkoutMode: "qr",
  },
  bonum: {
    key: "bonum",
    displayName: "Bonum",
    status: "not_configured",
    checkoutMode: "invoice",
  },
  pocket: {
    key: "pocket",
    displayName: "Pocket",
    status: "not_configured",
    checkoutMode: "deeplink",
  },
  storepay: {
    key: "storepay",
    displayName: "StorePay",
    status: "not_configured",
    checkoutMode: "invoice",
  },
};

export function getPaymentProviderMeta(
  provider: string,
): PaymentProviderMeta {
  return (
    PAYMENT_PROVIDERS[provider as PaymentProviderKey] ?? PAYMENT_PROVIDERS.manual
  );
}

export function listPaymentProviderMeta(): PaymentProviderMeta[] {
  return Object.values(PAYMENT_PROVIDERS);
}

export function isPaymentProviderEnabled(provider: string): boolean {
  const meta = PAYMENT_PROVIDERS[provider as PaymentProviderKey];
  return meta?.status === "active" || meta?.status === "testing" || meta?.status === "manual_only";
}
