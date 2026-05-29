import { supabase } from "./supabase";

export type PaymentStatus = "pending" | "paid" | "failed" | "canceled" | "expired" | "refunded";

export type PaymentOrder = {
  id: string;
  credits: number;
  amountMnt: number;
  packageCode: string | null;
  packageName: string | null;
  status: PaymentStatus;
  expiresAt: string | null;
  createdAt: string;
};

type PaymentOrderRow = {
  id: string;
  credits: number;
  amount_mnt: number;
  package_code: string | null;
  package_name: string | null;
  status: string;
  expires_at: string | null;
  created_at: string;
};

export async function createPaymentOrder(packageId: string): Promise<PaymentOrder> {
  if (!supabase) throw new Error("Supabase is not configured.");

  const { data, error } = await supabase.rpc("create_payment_order", {
    p_package_id: packageId,
  });

  if (error) throw new Error(error.message);

  const row = (data as PaymentOrderRow[])[0];
  if (!row) throw new Error("Unexpected empty response from create_payment_order.");

  return {
    id: row.id,
    credits: row.credits,
    amountMnt: Number(row.amount_mnt),
    packageCode: row.package_code,
    packageName: row.package_name,
    status: row.status as PaymentStatus,
    expiresAt: row.expires_at,
    createdAt: row.created_at,
  };
}

export async function listUserPayments(): Promise<PaymentOrder[]> {
  if (!supabase) throw new Error("Supabase is not configured.");

  const { data, error } = await supabase
    .from("payments")
    .select("id,credits,amount_mnt,package_code,package_name,status,expires_at,created_at")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) throw new Error("Could not load payment orders.");

  return ((data ?? []) as PaymentOrderRow[]).map((row) => ({
    id: row.id,
    credits: row.credits,
    amountMnt: Number(row.amount_mnt),
    packageCode: row.package_code,
    packageName: row.package_name,
    status: row.status as PaymentStatus,
    expiresAt: row.expires_at,
    createdAt: row.created_at,
  }));
}
