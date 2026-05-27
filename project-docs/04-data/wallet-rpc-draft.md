# Wallet RPC Draft

Phase 11.1 adds the first SQL migration draft for transaction-safe wallet operations:

```text
supabase/migrations/0005_wallet_rpc.sql
```

The frontend now calls wallet RPC functions for reserve/refund instead of directly updating wallet balances.

## Implemented RPC Drafts

### `reserve_credits`

- Validates `auth.uid()` matches `p_user_id` or caller is admin.
- Locks the user's wallet row with `for update`.
- Checks available balance.
- Inserts a `wallet_transactions` ledger row with type `reserve` and a negative amount.
- Updates `wallets.balance` and `wallets.reserved_balance` atomically.
- Returns wallet snapshot and transaction id.
- Uses idempotency key handling.

### `refund_reserved_credits`

- Validates user/admin authorization.
- Locks the wallet row.
- Checks reserved balance.
- Inserts a `refund` ledger row with a positive amount.
- Updates spendable and reserved balances atomically.
- Returns wallet snapshot and transaction id.

### `spend_reserved_credits`

- Exists for the future AI completion phase.
- Validates user/admin authorization.
- Locks the wallet row.
- Checks reserved balance.
- Inserts a `spend` ledger row with a negative amount and `generation_id`.
- Decreases reserved balance only.

## Phase Boundary

Phase 11.1 does not call AI providers, does not create generation outputs, and does not implement payment/QPay.

The generate UI still only reserves credits and creates a generation preparation record. Spending reserved credits is intentionally left for a future backend worker phase after successful AI generation.
