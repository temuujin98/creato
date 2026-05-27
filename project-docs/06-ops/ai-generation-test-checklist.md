# AI Generation Test Checklist

## Preflight

- Supabase migrations are applied.
- Migrations through `0007_wallet_rpc_service_role_auth_patch.sql` are applied.
- RLS policies are enabled.
- `user-uploads` bucket exists.
- `generation-outputs` bucket exists.
- `process-generation` Edge Function is deployed or served locally.
- Edge Function server-only secrets are set:
  - `SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `GEMINI_API_KEY` before real provider testing
- No AI keys use the `VITE_` prefix.

## Gemini Key Pending State

Before `GEMINI_API_KEY` is available, do not run real generation. Verify readiness with:

- Active product, prompt version, and model config exist.
- Upload to `user-uploads` works for the authenticated test user.
- Wallet reserve/refund smoke test returns the wallet to its starting balance.
- `process-generation` remains deployed and returns safe errors.
- `provider_auth_error` is expected for real provider mode while `GEMINI_API_KEY` is missing.

After `GEMINI_API_KEY` is added as an Edge Function secret:

- Redeploy `process-generation` if required.
- Run one internal generation with a low-risk uploaded image.
- Confirm output storage, `generation_outputs` insert, completed status, signed preview, and wallet spend.

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

## Phase 14D Frontend Trigger Checks

- Generate page sends only `generationId` and optional `dryRun` to `process-generation`.
- Current Supabase session bearer token is required.
- Frontend does not send prompt, model, provider config, image bytes, or storage paths.
- Frontend polls only safe `generations` fields.
- Polling stops on completed/failed/refunded/canceled states or timeout.
- Completed UI confirms output is saved but does not fetch a signed URL yet.
- Failed UI shows a safe error and notes backend refund handling may have been attempted.
- Browser source contains no AI provider keys or service role key.

## Phase 14E Signed Output Preview Checks

- Completed generation belongs to the authenticated user before outputs are loaded.
- `generation_outputs` rows are queried only after completed status.
- Signed URLs are created from the private `generation-outputs` bucket.
- Signed URLs expire after a short window.
- UI shows generated images and a download button.
- UI does not show storage paths, prompts, model config, provider config, or raw metadata.
- Empty output state is handled without crashing.
- Signed URL failure shows a safe error.
