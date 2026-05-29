# ADR-010: Payment Orders Foundation

**Date:** 2026-05-29
**Status:** Accepted
**Phase:** 30

## Context

Creato needs a credit purchase flow where users select a credit package and pay for it.
Phase 30 establishes the internal payment order lifecycle without integrating any real payment provider.

## Decisions

### 1. Phase 30 creates internal payment order lifecycle only

- No QPay, Bonum, Pocket, or StorePay integration is added in this phase.
- Users can create a `pending` payment order via the `create_payment_order` RPC.
- The UI shows a clear message: "Payment provider integration will be added in a later phase."
- The `provider` field defaults to `'manual'` for all orders created in this phase.

### 2. The `payments` table stores a package snapshot

- At order creation, `package_code`, `package_name`, `credits`, and `amount_mnt` are copied from
  the credit package row into the payment row.
- This preserves the historical price and credit count even if the package is later edited or deleted.
- Client cannot supply these values — they are set server-side by the `create_payment_order` RPC.

### 3. Paid lifecycle credits the wallet server-side only

- The `admin_mark_payment_paid` RPC is the only path to crediting a user wallet for a payment.
- No client component can mark a payment paid or modify wallet balance directly.
- The RPC uses `FOR UPDATE` row locking to prevent race conditions.

### 4. Double-credit protection is mandatory

Two guards prevent a payment from crediting a wallet more than once:
- `credited_at IS NOT NULL` — payment has already been credited; raise exception.
- Existing `wallet_transactions` row with `payment_id` and `type = 'purchase'` — duplicate detected; raise exception.

Both checks run inside the same transaction that modifies the wallet, ensuring atomicity.

### 5. Future provider integrations map into `provider` and `provider_reference`

- QPay, Bonum, Pocket, StorePay references will be stored in `provider` and `provider_reference`.
- `provider_payload` stores raw provider callback data (not exposed to client in any phase).
- The `payment_provider` enum has been extended to include `bonum`, `pocket`, `storepay` for forward compatibility.

### 6. `provider_payload` is never shown to the client

- The `listAdminPayments` and `getAdminPaymentSummary` functions do not select `provider_payload`.
- The `create_payment_order` RPC return type does not include `provider_payload`.
- This prevents accidental exposure of future webhook secrets or provider tokens.

### 7. Gross profit / revenue tracking

- Payment revenue tracking will be accurate once real payments are reconciled with provider invoices.
- The existing analytics `revenueEstimateMnt` (credit-based estimate) remains the MVP indicator until Phase 30+ adds payment-based reconciliation.
- `totalPaidAmountMnt` in admin payments summary provides the direct payment revenue signal.

## Future Phases

- Phase 31+: Integrate QPay (or another MN payment provider). Map provider webhook → update `provider_reference`, `provider_payload`, trigger `admin_mark_payment_paid` or equivalent server-side settlement.
- Add webhook endpoint (Edge Function) to receive provider payment confirmations and automatically settle payments without admin intervention.
- Add user-facing payment history page (`/billing`) showing own payment orders.
- Add payment expiry job that marks `expires_at < now()` and `status = 'pending'` orders as `expired`.
- Add provider invoice reconciliation for accounting-grade revenue reporting.
