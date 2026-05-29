import { supabase } from "./supabase";

// Anchor/reference price per credit in MNT (used to compute discounts).
export const ANCHOR_PRICE_PER_CREDIT = 990;

// ─── Types ──────────────────────────────────────────────────────────────────

/** Fields safe to expose to public/client callers. */
export type ClientCreditPackage = {
  badgeText: string | null;
  code: string;
  credits: number;
  description: string | null;
  id: string;
  isFeatured: boolean;
  name: string;
  priceMnt: number;
  sortOrder: number;
};

/** Full fields for admin callers. */
export type AdminCreditPackage = ClientCreditPackage & {
  bonusCredits: number;
  createdAt: string;
  isActive: boolean;
  updatedAt: string;
};

/** Input shape for create / update mutations. */
export type CreditPackageInput = {
  badgeText: string | null;
  code: string;
  credits: number;
  description: string | null;
  isActive: boolean;
  isFeatured: boolean;
  name: string;
  priceMnt: number;
  sortOrder: number;
};

// ─── Internal row types ──────────────────────────────────────────────────────

type PublicRow = {
  badge_text: string | null;
  code: string;
  credits: number;
  description: string | null;
  id: string;
  is_featured: boolean;
  name: string;
  price_mnt: number;
  sort_order: number;
};

type AdminRow = PublicRow & {
  bonus_credits: number;
  created_at: string;
  is_active: boolean;
  updated_at: string;
};

// ─── Mappers ─────────────────────────────────────────────────────────────────

function toClient(row: PublicRow): ClientCreditPackage {
  return {
    badgeText: row.badge_text,
    code: row.code,
    credits: row.credits,
    description: row.description,
    id: row.id,
    isFeatured: row.is_featured,
    name: row.name,
    priceMnt: Number(row.price_mnt),
    sortOrder: row.sort_order,
  };
}

function toAdmin(row: AdminRow): AdminCreditPackage {
  return {
    ...toClient(row),
    bonusCredits: row.bonus_credits,
    createdAt: row.created_at,
    isActive: row.is_active,
    updatedAt: row.updated_at,
  };
}

// ─── Public queries ───────────────────────────────────────────────────────────

/** Returns active packages only — safe to call from any client context. */
export async function listActiveCreditPackages(): Promise<ClientCreditPackage[]> {
  if (!supabase) throw new Error("Supabase is not configured.");

  const { data, error } = await supabase
    .from("credit_packages")
    .select(
      "id,code,name,description,credits,price_mnt,badge_text,is_featured,sort_order",
    )
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) throw new Error("Could not load credit packages.");
  return ((data ?? []) as PublicRow[]).map(toClient);
}

// ─── Admin queries ────────────────────────────────────────────────────────────

/** Returns all packages (admin RLS gate applied server-side). */
export async function listAdminCreditPackages(): Promise<AdminCreditPackage[]> {
  if (!supabase) throw new Error("Supabase is not configured.");

  const { data, error } = await supabase
    .from("credit_packages")
    .select(
      "id,code,name,description,credits,bonus_credits,price_mnt,badge_text,is_featured,is_active,sort_order,created_at,updated_at",
    )
    .order("sort_order", { ascending: true });

  if (error) throw new Error("Could not load credit packages.");
  return ((data ?? []) as AdminRow[]).map(toAdmin);
}

// ─── Admin mutations (RLS enforces is_admin()) ────────────────────────────────

export async function createCreditPackage(
  input: CreditPackageInput,
): Promise<AdminCreditPackage> {
  if (!supabase) throw new Error("Supabase is not configured.");

  const { data, error } = await supabase
    .from("credit_packages")
    .insert({
      badge_text:   input.badgeText?.trim() || null,
      bonus_credits: 0,
      code:         input.code.toLowerCase().trim(),
      description:  input.description?.trim() || null,
      credits:      input.credits,
      is_active:    input.isActive,
      is_featured:  input.isFeatured,
      name:         input.name.trim(),
      price_mnt:    input.priceMnt,
      sort_order:   input.sortOrder,
    })
    .select(
      "id,code,name,description,credits,bonus_credits,price_mnt,badge_text,is_featured,is_active,sort_order,created_at,updated_at",
    )
    .single();

  if (error) throw new Error(error.message);
  return toAdmin(data as AdminRow);
}

export async function updateCreditPackage(
  id: string,
  input: CreditPackageInput,
): Promise<AdminCreditPackage> {
  if (!supabase) throw new Error("Supabase is not configured.");

  const { data, error } = await supabase
    .from("credit_packages")
    .update({
      badge_text:  input.badgeText?.trim() || null,
      code:        input.code.toLowerCase().trim(),
      description: input.description?.trim() || null,
      credits:     input.credits,
      is_active:   input.isActive,
      is_featured: input.isFeatured,
      name:        input.name.trim(),
      price_mnt:   input.priceMnt,
      sort_order:  input.sortOrder,
    })
    .eq("id", id)
    .select(
      "id,code,name,description,credits,bonus_credits,price_mnt,badge_text,is_featured,is_active,sort_order,created_at,updated_at",
    )
    .single();

  if (error) throw new Error(error.message);
  return toAdmin(data as AdminRow);
}

export async function setCreditPackageActive(
  id: string,
  isActive: boolean,
): Promise<void> {
  if (!supabase) throw new Error("Supabase is not configured.");

  const { error } = await supabase
    .from("credit_packages")
    .update({ is_active: isActive })
    .eq("id", id);

  if (error) throw new Error(error.message);
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Average price in MNT per credit. */
export function avgPerCredit(pkg: ClientCreditPackage): number {
  return pkg.credits > 0 ? Math.round(pkg.priceMnt / pkg.credits) : 0;
}

/** Discount % vs ANCHOR_PRICE_PER_CREDIT. Negative means a premium. */
export function discountPct(pkg: ClientCreditPackage): number {
  const avg = avgPerCredit(pkg);
  if (avg <= 0) return 0;
  return Math.round(((ANCHOR_PRICE_PER_CREDIT - avg) / ANCHOR_PRICE_PER_CREDIT) * 100);
}
