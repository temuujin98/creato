# ADR-009: Admin Cost & Usage Analytics

**Date:** 2026-05-29
**Status:** Accepted
**Phase:** 29

## Context

Admins need visibility into generation volume, credit consumption, provider/model distribution, and estimated financial performance without exposing private prompt or provider configuration data.

## Decisions

### 1. Analytics are read-only MVP estimates

- The `/admin/analytics` page is read-only.
- All data is fetched via the same Supabase anon client + RLS policies used by other admin pages.
- No new backend RPCs or mutations are introduced in this phase.

### 2. Revenue estimate uses 990 MNT/credit anchor price

- `CREDIT_ANCHOR_PRICE_MNT = 990` is a planning constant representing the standard per-credit sale price.
- Revenue estimate = `netCredits × 990`.
- This is an approximation. Actual revenue depends on which credit package each user purchased and any discounts applied.
- Future phases may add payment-based revenue reconciliation once a payment transaction table is available.

### 3. Provider cost uses ai_model_registry fallback

- Ideal path: `generation.model_config_id → ai_model_registry.cost_per_generation_mnt`.
- Since `model_config_id` is not yet exposed in generation queries, MVP uses provider-level fallback:
  - `provider = 'gemini'` → `DEFAULT_GEMINI_COST_MNT = 241 MNT` per completed generation.
  - Other or unknown providers → cost shown as "—" and `costIsPartial = true` flag is set.
- When `costIsPartial` is true, the UI shows a notice that estimated cost may be incomplete.

### 4. Gross profit is estimated, not accounting-grade

- `estimatedGrossProfitMnt = revenueEstimateMnt − estimatedProviderCostMnt`
- This excludes infrastructure, storage, bandwidth, and operational costs.
- It is a directional indicator only, not a P&L figure.

### 5. Prompt and provider secrets are excluded

- No `base_prompt`, `negative_prompt`, `compiled_prompt`, `raw_provider_payload`, or API keys are selected in any analytics query.
- Analytics queries select only: `status`, `credit_cost`, `provider`, `model`, `retry_count`, `product_id`, `created_at`.

### 6. Row caps for aggregation queries

- Summary count queries are exact (count-only, no row limit).
- Aggregation queries (for credits, cost, retry) are capped at 10,000 rows.
- Provider/model/product breakdown queries are capped at 5,000 rows.
- These caps are safe for current MVP scale. Future phases may add database-level aggregation views or RPCs to handle larger datasets accurately.

### 7. Analytics page is admin-only

- Route `/admin/analytics` is nested inside the `ProtectedRoute requireAdmin` layout.
- No analytics data is exposed to public endpoints or non-admin users.

## Future Phases

- Add payment-based revenue reconciliation once a payment transaction table exists.
- Add `model_config_id` to generation queries and join `ai_model_registry` for per-model cost accuracy.
- Add database-level aggregation views or RPCs to remove row caps.
- Add CSV export for analytics data.
- Add time-series charts (requires chart library introduction or a simple SVG approach).
- Add provider invoice reconciliation.
