import { supabase } from "./supabase";
import type { PaymentStatus } from "./payments";

export type { PaymentStatus };

export type AdminPayment = {
  id: string;
  userId: string;
  userEmail: string | null;
  userName: string | null;
  creditPackageId: string | null;
  packageCode: string | null;
  packageName: string | null;
  credits: number | null;
  amountMnt: number;
  currency: string;
  provider: string;
  providerReference: string | null;
  status: PaymentStatus;
  paidAt: string | null;
  creditedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AdminPaymentSummary = {
  total: number;
  pending: number;
  paid: number;
  failedOrCanceled: number;
  totalPaidAmountMnt: number;
  creditsSold: number;
};

export type AdminPaymentsFilters = {
  status?: string;
  provider?: string;
  range?: "today" | "7d" | "30d" | "all";
  page?: number;
  pageSize?: number;
};

type PaymentRow = {
  id: string;
  user_id: string;
  credit_package_id: string | null;
  package_code: string | null;
  package_name: string | null;
  credits: number | null;
  amount_mnt: number;
  currency: string;
  provider: string;
  provider_reference: string | null;
  status: string;
  paid_at: string | null;
  credited_at: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
  profiles: { email: string | null; full_name: string | null } | null;
};

function rangeStart(range: string | undefined): string | null {
  if (!range || range === "all") return null;
  const now = new Date();
  if (range === "today") {
    return new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  }
  const d = new Date(now);
  d.setDate(d.getDate() - (range === "7d" ? 7 : 30));
  return d.toISOString();
}

function toAdminPayment(row: PaymentRow): AdminPayment {
  return {
    id: row.id,
    userId: row.user_id,
    userEmail: row.profiles?.email ?? null,
    userName: row.profiles?.full_name ?? null,
    creditPackageId: row.credit_package_id,
    packageCode: row.package_code,
    packageName: row.package_name,
    credits: row.credits,
    amountMnt: Number(row.amount_mnt),
    currency: row.currency ?? "MNT",
    provider: row.provider,
    providerReference: row.provider_reference,
    status: row.status as PaymentStatus,
    paidAt: row.paid_at,
    creditedAt: row.credited_at,
    expiresAt: row.expires_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getAdminPaymentSummary(
  range?: string,
): Promise<AdminPaymentSummary> {
  if (!supabase) throw new Error("Supabase is not configured.");

  const start = rangeStart(range);

  const makeCount = (statuses?: string[]) => {
    let q = supabase!.from("payments").select("*", { count: "exact", head: true });
    if (statuses) q = q.in("status", statuses);
    if (start) q = q.gte("created_at", start);
    return q;
  };

  const [totalRes, pendingRes, paidRes, failedRes] = await Promise.all([
    makeCount(),
    makeCount(["pending"]),
    makeCount(["paid"]),
    makeCount(["failed", "canceled", "expired"]),
  ]);

  // Aggregate paid amounts and credits (capped at 5k rows for MVP)
  let aggQuery = supabase
    .from("payments")
    .select("amount_mnt,credits,status")
    .eq("status", "paid")
    .limit(5000);
  if (start) aggQuery = aggQuery.gte("created_at", start);

  const { data: aggData } = await aggQuery;
  const aggRows = (aggData ?? []) as { amount_mnt: number; credits: number | null }[];

  let totalPaidAmountMnt = 0;
  let creditsSold = 0;
  for (const r of aggRows) {
    totalPaidAmountMnt += Number(r.amount_mnt ?? 0);
    creditsSold += r.credits ?? 0;
  }

  return {
    total: totalRes.count ?? 0,
    pending: pendingRes.count ?? 0,
    paid: paidRes.count ?? 0,
    failedOrCanceled: failedRes.count ?? 0,
    totalPaidAmountMnt,
    creditsSold,
  };
}

export async function listAdminPayments(
  filters: AdminPaymentsFilters = {},
): Promise<{ items: AdminPayment[]; totalCount: number }> {
  if (!supabase) throw new Error("Supabase is not configured.");

  const page = filters.page ?? 0;
  const pageSize = filters.pageSize ?? 25;
  const from = page * pageSize;
  const to = from + pageSize - 1;
  const start = rangeStart(filters.range);

  let query = supabase
    .from("payments")
    .select(
      "id,user_id,credit_package_id,package_code,package_name,credits,amount_mnt,currency,provider,provider_reference,status,paid_at,credited_at,expires_at,created_at,updated_at,profiles:user_id(email,full_name)",
      { count: "exact" },
    )
    .order("created_at", { ascending: false })
    .range(from, to);

  if (filters.status && filters.status !== "all") {
    query = query.eq("status", filters.status);
  }
  if (filters.provider && filters.provider !== "all") {
    query = query.eq("provider", filters.provider);
  }
  if (start) {
    query = query.gte("created_at", start);
  }

  const { data, error, count } = await query;
  if (error) throw new Error("Could not load payments.");

  const rows = (data ?? []) as unknown as PaymentRow[];
  return {
    items: rows.map(toAdminPayment),
    totalCount: count ?? 0,
  };
}

export async function adminMarkPaymentPaid(
  paymentId: string,
): Promise<{ paymentId: string; newStatus: string; creditsAdded: number; transactionId: string }> {
  if (!supabase) throw new Error("Supabase is not configured.");

  const { data, error } = await supabase.rpc("admin_mark_payment_paid", {
    p_payment_id: paymentId,
  });

  if (error) throw new Error(error.message);

  const row = (
    data as Array<{
      payment_id: string;
      new_status: string;
      credits_added: number;
      transaction_id: string;
    }>
  )[0];
  if (!row) throw new Error("Unexpected empty response from admin_mark_payment_paid.");

  return {
    paymentId: row.payment_id,
    newStatus: row.new_status,
    creditsAdded: row.credits_added,
    transactionId: row.transaction_id,
  };
}

export async function adminCancelPayment(
  paymentId: string,
): Promise<{ paymentId: string; newStatus: string }> {
  if (!supabase) throw new Error("Supabase is not configured.");

  const { data, error } = await supabase.rpc("admin_cancel_payment", {
    p_payment_id: paymentId,
  });

  if (error) throw new Error(error.message);

  const row = (data as Array<{ payment_id: string; new_status: string }>)[0];
  if (!row) throw new Error("Unexpected empty response from admin_cancel_payment.");

  return { paymentId: row.payment_id, newStatus: row.new_status };
}
