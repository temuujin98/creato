import { supabase } from "./supabase";

export type Wallet = {
  balance: number;
  id: string;
  lifetime_credits_purchased: number;
  reserved_balance: number;
  user_id: string;
};

export type ReserveCreditsInput = {
  amount: number;
  idempotencyKey: string;
  reason?: string;
  userId: string;
  walletId: string;
};

export type RefundReservedCreditsInput = ReserveCreditsInput;

export type SpendReservedCreditsInput = ReserveCreditsInput & {
  generationId: string;
};

type WalletRpcRow = {
  balance: number;
  reserved_balance: number;
  transaction_id: string;
  wallet_id: string;
};

function requireSupabase() {
  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  return supabase;
}

function safeWalletError(message: string | undefined, fallback: string) {
  if (!message) return fallback;
  if (message.includes("insufficient balance")) return "Insufficient credits.";
  if (message.includes("insufficient reserved balance")) {
    return "Insufficient reserved credits.";
  }
  if (message.includes("wallet not found")) return "Wallet is unavailable.";
  if (message.includes("unauthorized")) return "Unauthorized wallet operation.";
  return fallback;
}

async function getWalletAfterRpc(userId: string, rpcRow: WalletRpcRow) {
  const wallet = await getWallet(userId);

  return (
    wallet ?? {
      balance: rpcRow.balance,
      id: rpcRow.wallet_id,
      lifetime_credits_purchased: 0,
      reserved_balance: rpcRow.reserved_balance,
      user_id: userId,
    }
  );
}

export async function getWallet(userId: string) {
  const client = requireSupabase();
  const { data, error } = await client
    .from("wallets")
    .select("id,user_id,balance,reserved_balance,lifetime_credits_purchased")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new Error("Wallet is unavailable.");
  }

  return (data as Wallet | null) ?? null;
}

export async function getOrCreateWallet(userId: string) {
  const existingWallet = await getWallet(userId);
  if (existingWallet) {
    return existingWallet;
  }

  const client = requireSupabase();
  const { data, error } = await client
    .from("wallets")
    .insert({ user_id: userId })
    .select("id,user_id,balance,reserved_balance,lifetime_credits_purchased")
    .single();

  if (error || !data) {
    throw new Error("Wallet could not be created. Backend/RLS setup may be required.");
  }

  return data as Wallet;
}

export async function reserveCredits({
  amount,
  idempotencyKey,
  reason,
  userId,
}: ReserveCreditsInput) {
  const client = requireSupabase();
  const { data, error } = await client.rpc("reserve_credits", {
    p_amount: amount,
    p_idempotency_key: idempotencyKey,
    p_reason: reason ?? null,
    p_user_id: userId,
  });

  if (error || !data?.[0]) {
    throw new Error(safeWalletError(error?.message, "Credit reserve failed."));
  }

  return getWalletAfterRpc(userId, data[0] as WalletRpcRow);
}

export async function refundReservedCredits({
  amount,
  idempotencyKey,
  reason,
  userId,
}: RefundReservedCreditsInput) {
  const client = requireSupabase();
  const { data, error } = await client.rpc("refund_reserved_credits", {
    p_amount: amount,
    p_idempotency_key: idempotencyKey,
    p_reason: reason ?? null,
    p_user_id: userId,
  });

  if (error || !data?.[0]) {
    throw new Error(
      safeWalletError(error?.message, "Reserved credit refund failed."),
    );
  }

  return getWalletAfterRpc(userId, data[0] as WalletRpcRow);
}

export async function spendReservedCredits({
  amount,
  generationId,
  idempotencyKey,
  reason,
  userId,
}: SpendReservedCreditsInput) {
  const client = requireSupabase();
  const { data, error } = await client.rpc("spend_reserved_credits", {
    p_amount: amount,
    p_generation_id: generationId,
    p_idempotency_key: idempotencyKey,
    p_reason: reason ?? null,
    p_user_id: userId,
  });

  if (error || !data?.[0]) {
    throw new Error(
      safeWalletError(error?.message, "Reserved credit spend failed."),
    );
  }

  return getWalletAfterRpc(userId, data[0] as WalletRpcRow);
}
