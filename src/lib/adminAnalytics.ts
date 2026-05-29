import { supabase } from "./supabase";

export type AnalyticsRange = "today" | "7d" | "30d" | "all";

export const DEFAULT_GEMINI_COST_MNT = 241;
export const CREDIT_ANCHOR_PRICE_MNT = 990;

const COMPLETED_STATUSES = ["completed", "credit_spent"];
const FAILED_STATUSES = ["failed", "credit_refunded", "canceled"];
const PROCESSING_STATUSES = ["created", "credit_reserved", "queued", "processing"];

export type AnalyticsSummary = {
  totalGenerations: number;
  completedGenerations: number;
  failedGenerations: number;
  processingGenerations: number;
  refundedGenerations: number;
  successRate: number;
  failureRate: number;
  retryCount: number;
  retryRate: number;
  creditsUsed: number;
  creditsRefunded: number;
  netCredits: number;
  revenueEstimateMnt: number;
  estimatedProviderCostMnt: number;
  estimatedGrossProfitMnt: number;
  costIsPartial: boolean;
};

export type ProviderUsageRow = {
  provider: string;
  generations: number;
  completed: number;
  failed: number;
  credits: number;
  estimatedCostMnt: number;
  successRate: number;
};

export type ModelUsageRow = {
  model: string;
  provider: string;
  generations: number;
  completed: number;
  failed: number;
  credits: number;
  estimatedCostMnt: number;
  successRate: number;
};

export type TopProductRow = {
  productId: string;
  productSlug: string | null;
  generations: number;
  completed: number;
  failed: number;
  creditsUsed: number;
  successRate: number;
};

function rangeStart(range: AnalyticsRange): string | null {
  if (range === "all") return null;
  const now = new Date();
  if (range === "today") {
    return new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  }
  const d = new Date(now);
  d.setDate(d.getDate() - (range === "7d" ? 7 : 30));
  return d.toISOString();
}

type AggRow = {
  status: string;
  credit_cost: number;
  provider: string | null;
  retry_count: number;
};

type ProductAggRow = {
  product_id: string;
  status: string;
  credit_cost: number;
  products: { slug: string | null } | null;
};

type ModelAggRow = {
  status: string;
  credit_cost: number;
  provider: string | null;
  model: string | null;
};

function applyRange<T extends object>(
  query: T,
  start: string | null,
): T {
  if (!start) return query;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (query as any).gte("created_at", start) as T;
}

export async function getAdminAnalyticsSummary(
  range: AnalyticsRange,
): Promise<AnalyticsSummary> {
  if (!supabase) throw new Error("Supabase is not configured.");

  const start = rangeStart(range);

  // Accurate total counts using count-only queries
  const makeCountQuery = (statuses?: string[]) => {
    let q = supabase!.from("generations").select("*", { count: "exact", head: true });
    if (statuses) q = q.in("status", statuses);
    if (start) q = q.gte("created_at", start);
    return q;
  };

  const [totalRes, completedRes, failedRes, processingRes, refundedRes] = await Promise.all([
    makeCountQuery(),
    makeCountQuery(COMPLETED_STATUSES),
    makeCountQuery(FAILED_STATUSES),
    makeCountQuery(PROCESSING_STATUSES),
    makeCountQuery(["credit_refunded"]),
  ]);

  // Aggregate rows (capped at 10 000) for credits/cost/retry
  let aggQuery = supabase
    .from("generations")
    .select("status,credit_cost,provider,retry_count")
    .limit(10000);
  aggQuery = applyRange(aggQuery, start);

  const { data: aggData, error: aggError } = await aggQuery;
  if (aggError) throw new Error("Could not load analytics aggregation data.");

  const rows = (aggData ?? []) as AggRow[];

  let creditsUsed = 0;
  let creditsRefunded = 0;
  let retryCount = 0;
  let estimatedProviderCostMnt = 0;
  let costIsPartial = false;

  for (const row of rows) {
    retryCount += row.retry_count ?? 0;

    if (COMPLETED_STATUSES.includes(row.status)) {
      creditsUsed += row.credit_cost ?? 0;
      if (row.provider === "gemini") {
        estimatedProviderCostMnt += DEFAULT_GEMINI_COST_MNT;
      } else if (row.provider) {
        costIsPartial = true;
      } else {
        costIsPartial = true;
      }
    }

    if (row.status === "credit_refunded") {
      creditsRefunded += row.credit_cost ?? 0;
    }
  }

  const total = totalRes.count ?? 0;
  const completed = completedRes.count ?? 0;
  const failed = failedRes.count ?? 0;
  const netCredits = Math.max(0, creditsUsed - creditsRefunded);
  const revenueEstimateMnt = netCredits * CREDIT_ANCHOR_PRICE_MNT;

  return {
    totalGenerations: total,
    completedGenerations: completed,
    failedGenerations: failed,
    processingGenerations: processingRes.count ?? 0,
    refundedGenerations: refundedRes.count ?? 0,
    successRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    failureRate: total > 0 ? Math.round((failed / total) * 100) : 0,
    retryCount,
    retryRate: total > 0 ? Math.round((retryCount / total) * 100) : 0,
    creditsUsed,
    creditsRefunded,
    netCredits,
    revenueEstimateMnt,
    estimatedProviderCostMnt,
    estimatedGrossProfitMnt: revenueEstimateMnt - estimatedProviderCostMnt,
    costIsPartial,
  };
}

export async function getAdminAnalyticsProviderUsage(
  range: AnalyticsRange,
): Promise<ProviderUsageRow[]> {
  if (!supabase) throw new Error("Supabase is not configured.");

  const start = rangeStart(range);
  let query = supabase
    .from("generations")
    .select("status,credit_cost,provider")
    .limit(5000);
  query = applyRange(query, start);

  const { data, error } = await query;
  if (error) throw new Error("Could not load provider usage data.");

  const rows = (data ?? []) as ModelAggRow[];
  const map = new Map<string, ProviderUsageRow>();

  for (const row of rows) {
    const key = row.provider ?? "(unknown)";
    if (!map.has(key)) {
      map.set(key, {
        provider: key,
        generations: 0,
        completed: 0,
        failed: 0,
        credits: 0,
        estimatedCostMnt: 0,
        successRate: 0,
      });
    }
    const entry = map.get(key)!;
    entry.generations++;
    if (COMPLETED_STATUSES.includes(row.status)) {
      entry.completed++;
      entry.credits += row.credit_cost ?? 0;
      if (key === "gemini") entry.estimatedCostMnt += DEFAULT_GEMINI_COST_MNT;
    }
    if (FAILED_STATUSES.includes(row.status)) entry.failed++;
  }

  const result = Array.from(map.values());
  for (const r of result) {
    r.successRate = r.generations > 0 ? Math.round((r.completed / r.generations) * 100) : 0;
  }
  return result.sort((a, b) => b.generations - a.generations);
}

export async function getAdminAnalyticsModelUsage(
  range: AnalyticsRange,
): Promise<ModelUsageRow[]> {
  if (!supabase) throw new Error("Supabase is not configured.");

  const start = rangeStart(range);
  let query = supabase
    .from("generations")
    .select("status,credit_cost,provider,model")
    .limit(5000);
  query = applyRange(query, start);

  const { data, error } = await query;
  if (error) throw new Error("Could not load model usage data.");

  const rows = (data ?? []) as ModelAggRow[];
  const map = new Map<string, ModelUsageRow>();

  for (const row of rows) {
    const key = `${row.provider ?? ""}::${row.model ?? ""}`;
    if (!map.has(key)) {
      map.set(key, {
        model: row.model ?? "(unknown)",
        provider: row.provider ?? "(unknown)",
        generations: 0,
        completed: 0,
        failed: 0,
        credits: 0,
        estimatedCostMnt: 0,
        successRate: 0,
      });
    }
    const entry = map.get(key)!;
    entry.generations++;
    if (COMPLETED_STATUSES.includes(row.status)) {
      entry.completed++;
      entry.credits += row.credit_cost ?? 0;
      if (row.provider === "gemini") entry.estimatedCostMnt += DEFAULT_GEMINI_COST_MNT;
    }
    if (FAILED_STATUSES.includes(row.status)) entry.failed++;
  }

  const result = Array.from(map.values());
  for (const r of result) {
    r.successRate = r.generations > 0 ? Math.round((r.completed / r.generations) * 100) : 0;
  }
  return result.sort((a, b) => b.generations - a.generations);
}

export async function getAdminAnalyticsTopProducts(
  range: AnalyticsRange,
): Promise<TopProductRow[]> {
  if (!supabase) throw new Error("Supabase is not configured.");

  const start = rangeStart(range);
  let query = supabase
    .from("generations")
    .select("product_id,status,credit_cost,products:product_id(slug)")
    .limit(5000);
  query = applyRange(query, start);

  const { data, error } = await query;
  if (error) throw new Error("Could not load top products data.");

  const rows = (data ?? []) as unknown as ProductAggRow[];
  const map = new Map<string, TopProductRow>();

  for (const row of rows) {
    const key = row.product_id;
    if (!map.has(key)) {
      const slug = (row.products as { slug: string | null } | null)?.slug ?? null;
      map.set(key, {
        productId: key,
        productSlug: slug,
        generations: 0,
        completed: 0,
        failed: 0,
        creditsUsed: 0,
        successRate: 0,
      });
    }
    const entry = map.get(key)!;
    entry.generations++;
    if (COMPLETED_STATUSES.includes(row.status)) {
      entry.completed++;
      entry.creditsUsed += row.credit_cost ?? 0;
    }
    if (FAILED_STATUSES.includes(row.status)) entry.failed++;
  }

  const result = Array.from(map.values());
  for (const r of result) {
    r.successRate = r.generations > 0 ? Math.round((r.completed / r.generations) * 100) : 0;
  }
  return result
    .sort((a, b) => b.generations - a.generations)
    .slice(0, 20);
}
