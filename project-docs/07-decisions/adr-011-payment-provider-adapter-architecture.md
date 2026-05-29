# ADR-011: Payment Provider Adapter Architecture

**Date:** 2026-05-29
**Status:** Accepted
**Phase:** 32

## Context

Creato will eventually integrate Mongolian payment providers (QPay, Bonum, Pocket, StorePay).
Phase 32 establishes a clean adapter architecture so future integrations can plug in without rewriting the payment lifecycle.

## Decisions

### 1. Payment orders remain provider-neutral

- The `payments` table stores `provider`, `provider_reference`, and `provider_payload` fields but the internal lifecycle (pending → paid → credited) is the same for all providers.
- Provider-specific data is stored in `provider_reference` and `provider_payload`; only `provider_reference` is shown to admins.
- `provider_payload` is never exposed to the client in any phase.

### 2. Provider integrations plug into `PaymentProviderAdapter`

- Each provider implements the `PaymentProviderAdapter` interface (`src/lib/paymentProviders/types.ts`).
- The interface defines: `key`, `displayName`, `status`, `checkoutMode`, `createCheckout()`, and optional `verifyPayment()`.
- `createCheckout()` takes a `PaymentCheckoutRequest` (safe fields only) and returns a `PaymentCheckoutResponse` (safe fields only).
- No adapter stores API secrets. Secrets belong in server-side environment variables (Edge Function).

### 3. API secrets stay in environment variables / server-side only

- In future integration phases, real provider API calls (QPay invoice creation, Bonum checkout, etc.) will be made from Edge Functions, not from client-side adapter code.
- Client-side adapters may construct safe responses (e.g., for manual/foundation) but must not receive or transmit provider secrets.
- The `src/lib/paymentProviders/` directory is client-safe and must never contain secrets or API keys.

### 4. Manual provider remains default until real provider integration

- `manualAdapter` is the only active adapter in Phase 32.
- `createPaymentCheckout()` in `payments.ts` rejects non-manual providers with `payment_provider_not_configured`.
- The `PAYMENT_PROVIDERS` registry marks QPay, Bonum, Pocket, StorePay as `not_configured`.

### 5. QPay / Bonum / Pocket / StorePay are prepared but not active

- Provider keys and metadata are defined in `registry.ts` for all five providers.
- `isPaymentProviderEnabled()` returns `true` only for `active`, `testing`, or `manual_only` status.
- Provider status badges are shown in the admin payments page readiness section.

### 6. Client receives only safe checkout fields

- `PaymentCheckoutResponse` contains: `provider`, `providerReference`, `checkoutMode`, `checkoutUrl?`, `qrText?`, `qrImageUrl?`, `invoiceText?`, `expiresAt?`, `status`, `safeMessage`.
- No raw provider payloads, credentials, or internal routing data are included.

### 7. Paid / credited lifecycle remains RPC / server-side protected

- `admin_mark_payment_paid` is the only path to crediting a wallet for a payment (Phase 30 decision, unchanged).
- Future provider webhooks will call a server-side Edge Function that verifies the webhook signature and calls the payment settlement RPC — no direct client trigger.

## Future Phases

- Phase 33+: Implement `qpayAdapter` using an Edge Function endpoint for invoice creation. Map QPay webhook → `admin_mark_payment_paid` RPC equivalent, server-side only.
- Add `verifyPayment()` to adapters that support polling (e.g. QPay status check).
- Update `create_payment_order` RPC to accept `p_provider` parameter when a real provider becomes active.
- Update `PAYMENT_PROVIDERS[provider].status` to `testing` or `active` as integrations are enabled.
- Add provider credentials management in a secure admin settings page (credentials stored only in Supabase secrets / Edge Function env vars, never in the database).
