import { supabase } from "./supabase";
import type { MyCreationStatus } from "./myCreations";

export type AdminGenerationStatus = MyCreationStatus;

export type AdminGeneration = {
  id: string;
  userId: string;
  userEmail: string | null;
  userName: string | null;
  productId: string;
  productSlug: string | null;
  productThumbnail: string | null;
  status: AdminGenerationStatus;
  creditCost: number;
  provider: string | null;
  model: string | null;
  retryCount: number;
  errorCode: string | null;
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string | null;
  completedAt: string | null;
  startedAt: string | null;
};

export type AdminGenerationSummary = {
  total: number;
  completed: number;
  processing: number;
  failed: number;
  creditsUsed: number;
};

export type AdminGenerationOutput = {
  id: string;
  url: string | null;
  width: number | null;
  height: number | null;
  createdAt: string | null;
};

export type AdminGenerationDetail = AdminGeneration & {
  inputCount: number;
  outputCount: number;
  outputs: AdminGenerationOutput[];
};

export type AdminGenerationsFilters = {
  status?: string;
  provider?: string;
  range?: "today" | "week" | "month" | "all";
  page?: number;
  pageSize?: number;
};

type GenerationListRow = {
  id: string;
  user_id: string;
  product_id: string;
  status: AdminGenerationStatus;
  credit_cost: number;
  provider: string | null;
  model: string | null;
  retry_count: number;
  error_code: string | null;
  error_message: string | null;
  created_at: string;
  updated_at: string | null;
  completed_at: string | null;
  started_at: string | null;
  profiles: { email: string | null; full_name: string | null } | null;
  products: { slug: string | null; thumbnail_url: string | null } | null;
};

type GenerationOutputRow = {
  id: string;
  storage_path: string;
  public_url: string | null;
  width: number | null;
  height: number | null;
  created_at: string | null;
};

const COMPLETED_STATUSES: AdminGenerationStatus[] = ["completed", "credit_spent"];
const PROCESSING_STATUSES: AdminGenerationStatus[] = [
  "created",
  "credit_reserved",
  "queued",
  "processing",
];
const FAILED_STATUSES: AdminGenerationStatus[] = [
  "failed",
  "credit_refunded",
  "canceled",
];

function rangeStartDate(range: string | undefined): string | null {
  if (!range || range === "all") return null;
  const now = new Date();
  if (range === "today") {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return d.toISOString();
  }
  if (range === "week") {
    const d = new Date(now);
    d.setDate(d.getDate() - 7);
    return d.toISOString();
  }
  if (range === "month") {
    const d = new Date(now);
    d.setDate(d.getDate() - 30);
    return d.toISOString();
  }
  return null;
}

function toAdminGeneration(row: GenerationListRow): AdminGeneration {
  return {
    id: row.id,
    userId: row.user_id,
    userEmail: row.profiles?.email ?? null,
    userName: row.profiles?.full_name ?? null,
    productId: row.product_id,
    productSlug: row.products?.slug ?? null,
    productThumbnail: row.products?.thumbnail_url ?? null,
    status: row.status,
    creditCost: row.credit_cost,
    provider: row.provider,
    model: row.model,
    retryCount: row.retry_count,
    errorCode: row.error_code,
    errorMessage: row.error_message,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    completedAt: row.completed_at,
    startedAt: row.started_at,
  };
}

export async function getAdminGenerationSummary(): Promise<AdminGenerationSummary> {
  if (!supabase) throw new Error("Supabase is not configured.");

  const [totalRes, completedRes, processingRes, failedRes, creditRes] =
    await Promise.all([
      supabase.from("generations").select("*", { count: "exact", head: true }),
      supabase
        .from("generations")
        .select("*", { count: "exact", head: true })
        .in("status", COMPLETED_STATUSES),
      supabase
        .from("generations")
        .select("*", { count: "exact", head: true })
        .in("status", PROCESSING_STATUSES),
      supabase
        .from("generations")
        .select("*", { count: "exact", head: true })
        .in("status", FAILED_STATUSES),
      // Credits used from completed generations — capped at 10 000 rows for now
      supabase
        .from("generations")
        .select("credit_cost")
        .in("status", COMPLETED_STATUSES)
        .limit(10000),
    ]);

  const creditsUsed = ((creditRes.data ?? []) as { credit_cost: number }[]).reduce(
    (sum, row) => sum + (row.credit_cost ?? 0),
    0,
  );

  return {
    total: totalRes.count ?? 0,
    completed: completedRes.count ?? 0,
    processing: processingRes.count ?? 0,
    failed: failedRes.count ?? 0,
    creditsUsed,
  };
}

export async function listAdminGenerations(
  filters: AdminGenerationsFilters = {},
): Promise<{ items: AdminGeneration[]; totalCount: number }> {
  if (!supabase) throw new Error("Supabase is not configured.");

  const page = filters.page ?? 0;
  const pageSize = filters.pageSize ?? 25;
  const from = page * pageSize;
  const to = from + pageSize - 1;

  const statusValues =
    filters.status && filters.status !== "all"
      ? [filters.status as AdminGenerationStatus]
      : null;

  const rangeStart = rangeStartDate(filters.range);

  let query = supabase
    .from("generations")
    .select(
      "id,user_id,product_id,status,credit_cost,provider,model,retry_count,error_code,error_message,created_at,updated_at,completed_at,started_at,profiles:user_id(email,full_name),products:product_id(slug,thumbnail_url)",
      { count: "exact" },
    )
    .order("created_at", { ascending: false })
    .range(from, to);

  if (statusValues) {
    query = query.in("status", statusValues);
  }

  if (filters.provider && filters.provider !== "all") {
    query = query.eq("provider", filters.provider);
  }

  if (rangeStart) {
    query = query.gte("created_at", rangeStart);
  }

  const { data, error, count } = await query;

  if (error) throw new Error("Could not load generations.");

  const rows = (data ?? []) as unknown as GenerationListRow[];
  return {
    items: rows.map(toAdminGeneration),
    totalCount: count ?? 0,
  };
}

export async function getAdminGenerationDetail(
  id: string,
): Promise<AdminGenerationDetail> {
  if (!supabase) throw new Error("Supabase is not configured.");

  const { data: genData, error: genError } = await supabase
    .from("generations")
    .select(
      "id,user_id,product_id,status,credit_cost,provider,model,retry_count,error_code,error_message,created_at,updated_at,completed_at,started_at,profiles:user_id(email,full_name),products:product_id(slug,thumbnail_url)",
    )
    .eq("id", id)
    .maybeSingle();

  if (genError || !genData) throw new Error("Generation not found.");

  const row = genData as unknown as GenerationListRow;
  const base = toAdminGeneration(row);

  const [inputsRes, outputsRes] = await Promise.all([
    supabase
      .from("generation_inputs")
      .select("id", { count: "exact", head: true })
      .eq("generation_id", id),
    supabase
      .from("generation_outputs")
      .select("id,storage_path,public_url,width,height,created_at")
      .eq("generation_id", id)
      .eq("output_type", "image")
      .order("created_at", { ascending: true }),
  ]);

  const outputRows = (outputsRes.data ?? []) as GenerationOutputRow[];

  const outputs: AdminGenerationOutput[] = await Promise.all(
    outputRows.map(async (out) => {
      if (out.public_url) {
        return {
          id: out.id,
          url: out.public_url,
          width: out.width,
          height: out.height,
          createdAt: out.created_at,
        };
      }
      // Create a 1-hour signed URL for admin viewing
      const { data: signed, error: signedErr } = await supabase!.storage
        .from("generation-outputs")
        .createSignedUrl(out.storage_path, 3600);
      return {
        id: out.id,
        url: signedErr ? null : (signed?.signedUrl ?? null),
        width: out.width,
        height: out.height,
        createdAt: out.created_at,
      };
    }),
  );

  return {
    ...base,
    inputCount: inputsRes.count ?? 0,
    outputCount: outputs.length,
    outputs,
  };
}
