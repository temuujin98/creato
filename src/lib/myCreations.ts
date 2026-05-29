import { supabase } from "./supabase";

export type MyCreationStatus =
  | "created"
  | "credit_reserved"
  | "queued"
  | "processing"
  | "completed"
  | "failed"
  | "credit_spent"
  | "credit_refunded"
  | "canceled";

export type MyCreationsFilterStatus =
  | "all"
  | "completed"
  | "failed"
  | "processing"
  | "queued";

export type MyCreationSafeMetadata = {
  costSafetyMode?: boolean;
  failedAt?: string;
  outputCount?: number;
  walletRefundFailed?: boolean;
};

export type MyCreation = {
  completedAt: string | null;
  createdAt: string;
  creditCost: number;
  errorCode: string | null;
  errorMessage: string | null;
  id: string;
  metadata: MyCreationSafeMetadata;
  productId: string;
  status: MyCreationStatus;
  updatedAt: string | null;
};

export type MyCreationOutputPreview = {
  createdAt?: string | null;
  height?: number | null;
  id: string;
  url: string;
  width?: number | null;
};

type GenerationRow = {
  completed_at: string | null;
  created_at: string;
  credit_cost: number;
  error_code: string | null;
  error_message: string | null;
  id: string;
  metadata: Record<string, unknown> | null;
  product_id: string;
  status: MyCreationStatus;
  updated_at: string | null;
  user_id: string;
};

type GenerationOutputRow = {
  created_at: string | null;
  generation_id: string;
  height: number | null;
  id: string;
  metadata: Record<string, unknown> | null;
  output_type: "image";
  storage_path: string;
  width: number | null;
};

function sanitizeMetadata(
  metadata: Record<string, unknown> | null,
): MyCreationSafeMetadata {
  if (!metadata) return {};

  return {
    costSafetyMode:
      typeof metadata.costSafetyMode === "boolean"
        ? metadata.costSafetyMode
        : undefined,
    failedAt:
      typeof metadata.failedAt === "string" ? metadata.failedAt : undefined,
    outputCount:
      typeof metadata.outputCount === "number" ? metadata.outputCount : undefined,
    walletRefundFailed:
      typeof metadata.wallet_refund_failed === "boolean"
        ? metadata.wallet_refund_failed
        : undefined,
  };
}

function toMyCreation(row: GenerationRow): MyCreation {
  return {
    completedAt: row.completed_at,
    createdAt: row.created_at,
    creditCost: row.credit_cost,
    errorCode: row.error_code,
    errorMessage: row.error_message,
    id: row.id,
    metadata: sanitizeMetadata(row.metadata),
    productId: row.product_id,
    status: row.status,
    updatedAt: row.updated_at,
  };
}

function statusValuesForFilter(status: MyCreationsFilterStatus) {
  if (status === "completed") return ["completed", "credit_spent"];
  if (status === "failed") return ["failed", "credit_refunded", "canceled"];
  if (status === "processing") return ["created", "credit_reserved", "processing"];
  if (status === "queued") return ["queued"];
  return null;
}

async function getCurrentUserId() {
  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    throw new Error("Authentication is required.");
  }

  return data.user.id;
}

export async function listMyCreations(params?: {
  limit?: number;
  offset?: number;
  status?: MyCreationsFilterStatus;
}) {
  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  const userId = await getCurrentUserId();
  const limit = params?.limit ?? 48;
  const offset = params?.offset ?? 0;
  const statusValues = statusValuesForFilter(params?.status ?? "all");

  let query = supabase
    .from("generations")
    .select(
      "id,user_id,product_id,status,credit_cost,error_code,error_message,created_at,updated_at,completed_at,metadata",
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (statusValues) {
    query = query.in("status", statusValues);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error("Could not load creations.");
  }

  return ((data ?? []) as GenerationRow[]).map(toMyCreation);
}

async function assertOwnGeneration(generationId: string) {
  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  const userId = await getCurrentUserId();
  const { data, error } = await supabase
    .from("generations")
    .select("id,user_id")
    .eq("id", generationId)
    .eq("user_id", userId)
    .maybeSingle<{ id: string; user_id: string }>();

  if (error || !data) {
    throw new Error("Generation could not be loaded.");
  }
}

export async function listCreationOutputs(generationId: string) {
  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }
  const client = supabase;

  await assertOwnGeneration(generationId);

  const { data, error } = await client
    .from("generation_outputs")
    .select("id,generation_id,output_type,storage_path,width,height,created_at,metadata")
    .eq("generation_id", generationId)
    .eq("output_type", "image")
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error("Creation outputs could not be loaded.");
  }

  const outputs = (data ?? []) as GenerationOutputRow[];

  return Promise.all(
    outputs.map(async (output) => {
      const { data: signedData, error: signedError } = await client.storage
        .from("generation-outputs")
        .createSignedUrl(output.storage_path, 60 * 60);

      if (signedError || !signedData?.signedUrl) {
        throw new Error("Could not create signed output URL.");
      }

      return {
        createdAt: output.created_at,
        height: output.height,
        id: output.id,
        url: signedData.signedUrl,
        width: output.width,
      } satisfies MyCreationOutputPreview;
    }),
  );
}

export function getMyCreationPreviews(generationId: string) {
  return listCreationOutputs(generationId);
}

export function listCreationOutputsForCreation(creationId: string) {
  return listCreationOutputs(creationId);
}

export function isReadyCreation(creation: MyCreation): boolean {
  return creation.status === "completed" || creation.status === "credit_spent";
}

export async function listReadyMyCreations(params?: {
  limit?: number;
  offset?: number;
}) {
  return listMyCreations({ ...params, status: "completed" });
}

export function listRecentMyCreations(limit = 6) {
  return listReadyMyCreations({ limit });
}
