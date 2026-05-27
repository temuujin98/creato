# AI Generation Test Checklist

## Preflight

- Supabase migrations are applied.
- RLS policies are enabled.
- `user-uploads` bucket exists.
- `generation-outputs` bucket exists.
- `process-generation` Edge Function is deployed or served locally.
- Edge Function server-only secrets are set.
- No AI keys use the `VITE_` prefix.

## Catalog And Config

- Product exists in `products`.
- Static frontend `dbProductId` matches database `products.id`.
- Active `prompt_versions` row exists.
- Active `model_configs` row exists.
- Product image requirements match generate UI requirements.
- Visible option schema matches backend validation expectations.

## User Setup

- User can sign in.
- User has a `profiles` row.
- User has a `wallets` row.
- Wallet has enough available balance.
- `reserve_credits` works.

## Generation Preparation

- User uploads required images.
- Upload paths follow:

```text
users/{userId}/uploads/{timestamp}-{safeFileName}
```

- Generation record exists.
- `generation_inputs` rows exist for uploads and options.
- Generation status is `queued` or `processing`.
- Credits are reserved, not spent.

## Edge Function Processing

- Bearer token is required.
- Owner/admin authorization works.
- Generation context loads.
- Product context loads.
- Input rows load.
- Prompt/model config loads.
- Prompt text is not returned.
- Provider config is not returned.
- Private storage URLs are not returned.

## Future Provider Test

- Text-only request can be assembled.
- Single-image request can be assembled.
- Multi-image request can be assembled.
- Gemini adapter follows `gemini-adapter-implementation-spec.md`.
- Real Gemini request succeeds when `GEMINI_API_KEY` is configured.
- Dry-run request still works with `dryRun: true`.
- Unsupported MIME fails safely.
- Provider timeout is classified.
- Provider safety block is classified.
- Provider rate limit is classified.

## Output And Wallet Settlement

- Output uploads to:

```text
users/{userId}/generations/{generationId}/outputs/{outputIndex}.png
```

- `generation_outputs` row is inserted.
- Generation is marked completed.
- `spend_reserved_credits` is called with `spend:{generationId}`.
- Failed generation calls `refund_reserved_credits` with `refund:{generationId}`.
- No double spend occurs on retry.
- No prompt leakage appears in user responses.

## Phase 14C-A Rollout Checks

- Dry-run adapter smoke test passes before enabling Gemini.
- Gemini is enabled for one internal product first.
- Edge Function secrets are configured outside frontend env.
- No signed URLs are returned from `process-generation`.
- No storage paths are returned to public responses.
- Admin recovery path is documented for spend/refund failures.
