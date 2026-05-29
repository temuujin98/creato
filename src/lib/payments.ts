import { supabase } from "./supabase";
import type { PaymentCheckoutResponse, PaymentProviderKey } from "./paymentProviders/types";
import { manualAdapter } from "./paymentProviders/manualAdapter";

export type PaymentStatus = "pending" | "paid" | "failed" | "canceled" | "expired" | "refunded";

export type PaymentOrder = {
  id: string;
  credits: number;
  amountMnt: number;
  currency: string;
  packageCode: string | null;
  packageName: string | null;
  provider: string;
  status: PaymentStatus;
  expiresAt: string | null;
  paidAt: string | null;
  creditedAt: string | null;
  createdAt: string;
};

type PaymentOrderRow = {
  id: string;
  credits: number;
  amount_mnt: number;
  currency: string;
  package_code: string | null;
  package_name: string | null;
  provider: string;
  status: string;
  expires_at: string | null;
  paid_at: string | null;
  credited_at: string | null;
  created_at: string;
};

const SELECT_FIELDS =
  "id,credits,amount_mnt,currency,package_code,package_name,provider,status,expires_at,paid_at,credited_at,created_at";

function toPaymentOrder(row: PaymentOrderRow): PaymentOrder {
  return {
    id: row.id,
    credits: row.credits,
    amountMnt: Number(row.amount_mnt),
    currency: row.currency ?? "MNT",
    packageCode: row.package_code,
    packageName: row.package_name,
    provider: row.provider ?? "manual",
    status: row.status as PaymentStatus,
    expiresAt: row.expires_at,
    paidAt: row.paid_at,
    creditedAt: row.credited_at,
    createdAt: row.created_at,
  };
}

export async function createPaymentOrder(packageId: string): Promise<PaymentOrder> {
  if (!supabase) throw new Error("Supabase is not configured.");

  const { data, error } = await supabase.rpc("create_payment_order", {
    p_package_id: packageId,
  });

  if (error) throw new Error(error.message);

  const row = (data as PaymentOrderRow[])[0];
  if (!row) throw new Error("Unexpected empty response from create_payment_order.");

  return toPaymentOrder(row);
}

export async function listUserPayments(): Promise<PaymentOrder[]> {
  if (!supabase) throw new Error("Supabase is not configured.");

  const { data, error } = await supabase
    .from("payments")
    .select(SELECT_FIELDS)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) throw new Error("Could not load payment orders.");

  return ((data ?? []) as PaymentOrderRow[]).map(toPaymentOrder);
}

export type PaymentCheckoutResult = {
  order: PaymentOrder;
  checkout: PaymentCheckoutResponse;
};

export async function createPaymentCheckout(
  packageId: string,
  provider: PaymentProviderKey = "manual",
): Promise<PaymentCheckoutResult> {
  if (provider !== "manual") {
    throw new Error("payment_provider_not_configured");
  }

  const order = await createPaymentOrder(packageId);

  const checkout = await manualAdapter.createCheckout({
    paymentId: order.id,
    amountMnt: order.amountMnt,
    credits: order.credits,
    packageCode: order.packageCode ?? "",
    packageName: order.packageName ?? "",
    currency: order.currency,
  });

  return { order, checkout };
}

export async function cancelOwnPaymentOrder(
  paymentId: string,
): Promise<{ newStatus: string }> {
  if (!supabase) throw new Error("Supabase is not configured.");

  const { data, error } = await supabase.rpc("cancel_own_payment_order", {
    p_payment_id: paymentId,
  });

  if (error) throw new Error(error.message);

  const row = (data as Array<{ payment_id: string; new_status: string }>)[0];
  if (!row) throw new Error("Unexpected empty response from cancel_own_payment_order.");

  return { newStatus: row.new_status };
}
