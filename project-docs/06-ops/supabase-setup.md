# Supabase Setup Plan

## Overview

This document describes the planned Supabase setup for `creato`. Phase 7 only creates SQL migration drafts and setup documentation. It does not integrate Supabase into the frontend, add a Supabase client, wire auth, create API calls, or implement payment, wallet, upload, storage, or AI generation logic.

## Required Environment Variables

### Browser-exposed variables

These variables use the `VITE_` prefix and are visible in browser bundles:

```bash
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

Only public Supabase project URL and anon key belong here. The anon key is not a service credential and must rely on RLS policies for safety.

### Server-only variables

These must never be exposed to browser/client code:

```bash
SUPABASE_SERVICE_ROLE_KEY=
GEMINI_API_KEY=
OPENAI_API_KEY=
QPAY_CLIENT_ID=
QPAY_CLIENT_SECRET=
QPAY_INVOICE_CODE=
APP_URL=
```

`SUPABASE_SERVICE_ROLE_KEY` bypasses RLS. It should only be used by trusted backend code, serverless functions, workers, or secure admin tooling.

## Suggested Supabase Project Setup Steps

1. Create a Supabase project for `creato`.
2. Confirm the project region and database password are stored securely.
3. Enable email auth providers later during Phase 8.
4. Review the migration drafts in `supabase/migrations`.
5. Apply schema migration first, then RLS policies, then storage policies.
6. Create separate environments for local, staging, and production before real users are onboarded.
7. Store server-only variables in backend hosting environment secrets, not in frontend `.env` files.

## How to Run Migrations Manually

Using Supabase CLI later:

```bash
supabase link --project-ref <project-ref>
supabase db push
```

For manual SQL review:

1. Open Supabase SQL editor.
2. Run `0001_initial_schema.sql`.
3. Run `0002_rls_policies.sql`.
4. Run `0003_storage_policies.sql`.
5. Run `0004_seed_mvp_catalog.sql`.
6. Run `0005_wallet_rpc.sql`.
7. Verify tables, policies, buckets, seeded catalog rows, and wallet RPC functions.

Do not run these against production without review. The current files are migration drafts.

## How to Apply RLS Policies

RLS policies live in:

```text
supabase/migrations/0002_rls_policies.sql
```

Policy intent:

- Public users can read active product catalog data.
- Authenticated users can read their own profiles, wallets, payments, and generations.
- Normal users cannot mutate wallet transactions or payment status.
- Admin-only tables are restricted to admin roles.
- Prompt versions, model configs, and admin logs have no public access.

Future backend functions should handle:

- Profile creation after auth signup.
- Wallet creation.
- Payment confirmation.
- Credit reservation/spend/refund.
- Generation queue creation and status updates.

## Storage Bucket Setup

Storage policy draft:

```text
supabase/migrations/0003_storage_policies.sql
```

Planned buckets:

| Bucket | Visibility | Purpose |
| --- | --- | --- |
| `user-uploads` | Private | User-uploaded source images. |
| `generation-outputs` | Private | AI-generated output images. |
| `product-assets` | Public | Product thumbnails and examples. |

Private file access should use signed URLs or authenticated storage policies. Backend code must enforce path conventions:

```text
users/{userId}/uploads/{file}
users/{userId}/generations/{generationId}/outputs/{file}
```

## Phase 9 Upload Scope

Phase 9 adds authenticated frontend upload support for user input images only.

Required bucket:

- `user-uploads`

Required path convention:

```text
users/{userId}/uploads/{timestamp}-{safeFileName}
```

Storage and security reminders:

- Keep `user-uploads` private.
- Users may upload/read only files under their own `users/{userId}` prefix.
- The frontend uses only the browser-safe Supabase anon client and the authenticated user session.
- `SUPABASE_SERVICE_ROLE_KEY` must never be exposed to browser/client code.
- Signed URLs should be used later when private uploaded files need to be displayed after refresh.
- Backend/storage policies must remain the final security boundary; frontend validation is only UX.
- This phase uploads user inputs only. It does not create generation rows, save `generation_inputs`, generate outputs, deduct credits, or call AI providers.

## Local Development Notes

Future local setup may use:

```bash
supabase start
supabase db reset
```

Before Phase 8, decide whether development uses:

- A local Supabase stack.
- A hosted Supabase development project.
- Both, with separate `.env.local` values.

Keep `.env.local` out of git.

## MVP Catalog Seed

The public MVP catalog seed lives in:

```text
supabase/migrations/0004_seed_mvp_catalog.sql
```

Apply migrations in this order:

1. `0001_initial_schema.sql`
2. `0002_rls_policies.sql`
3. `0003_storage_policies.sql`
4. `0004_seed_mvp_catalog.sql`
5. `0005_wallet_rpc.sql`

The seed creates public catalog data only:

- MVP categories.
- Category translations for `mn` and `en`.
- MVP products.
- Product translations for `mn` and `en`.
- Visible product options and choices.

It does not seed prompts, model configs, provider secrets, admin-only config, payment data, wallet data, or AI generation outputs.

The static frontend product records in `src/data/products.ts` include `dbProductId` values. These UUIDs must match the seeded `products.id` values so the generate page can create `generations` rows safely.

Validation helper:

```sql
select id, slug from public.products order by sort_order;
```

## Wallet RPC Setup

The transaction-safe wallet RPC migration lives in:

```text
supabase/migrations/0005_wallet_rpc.sql
```

It creates:

- `reserve_credits`
- `refund_reserved_credits`
- `spend_reserved_credits`

The frontend calls RPC for reserve/refund. `spend_reserved_credits` exists for the future AI completion phase and is not used by the generate UI yet.

Payment credit purchase is still not implemented. Test users need wallet rows and positive balances before reserve can succeed.

## Edge Function Scaffold

Phase 13A adds a scaffold-only Edge Function:

```text
supabase/functions/process-generation
```

Local serve:

```bash
supabase functions serve process-generation
```

Deploy:

```bash
supabase functions deploy process-generation
```

Future server-only variables:

```bash
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
GEMINI_API_KEY=
OPENAI_API_KEY=
```

Security reminders:

- Do not expose `SUPABASE_SERVICE_ROLE_KEY` to the frontend.
- Do not expose AI provider keys to the frontend.
- The scaffold does not call AI, does not create outputs, and does not spend/refund credits.
- Future worker implementation must load prompts/model config server-side only.

Phase 13B expands the scaffold so it loads generation, product, and generation input context with the Edge Function server-side client.

Phase 13C expands the scaffold so it loads active `prompt_versions` and `model_configs` server-side and compiles an internal prompt draft. Prompt text, provider names, model names, estimated costs, and compiled prompt content are never returned to the client or logged.

The MVP seed does not create active prompt/model rows. Until secure admin-managed config exists, `process-generation` should return a safe `409` for missing prompt or model configuration.

The function still does not call AI, create outputs, spend credits, or refund credits.

Phase 13E connects the admin product editor to `prompt_versions` and `model_configs` with the authenticated Supabase anon client. The existing RLS policies must allow admin/super_admin profiles to select, insert, and update those tables. Public product pages must not query those tables.

Manual setup reminder:

- Ensure the signed-in admin has `profiles.role` set to `admin` or `super_admin`.
- Confirm `0002_rls_policies.sql` admin policies for `prompt_versions` and `model_configs` are applied.
- Keep AI provider keys only in Edge Function/server environment variables.
- Do not log prompt text while testing admin CRUD.

## AI Provider Environment

Future AI generation must run only in the Edge Function/server runtime. These variables are server-only:

```bash
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
GEMINI_API_KEY=
OPENAI_API_KEY=
```

Do not create `VITE_GEMINI_API_KEY`, `VITE_OPENAI_API_KEY`, or any browser-exposed AI secret. `VITE_` variables are included in the browser bundle.

Supabase Edge Function secrets can be configured with:

```bash
supabase secrets set GEMINI_API_KEY=...
supabase secrets set OPENAI_API_KEY=...
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=...
supabase secrets set SUPABASE_URL=...
```

Do not commit real keys. Use separate local, staging, and production secrets.

Phase 14A planning docs:

- `project-docs/03-architecture/ai-provider-integration-plan.md`
- `project-docs/03-architecture/gemini-image-generation-plan.md`
- `project-docs/03-architecture/generation-error-retry-fallback.md`
- `project-docs/04-data/generation-wallet-settlement.md`
- `project-docs/06-ops/ai-generation-test-checklist.md`

Phase 14C-B implements the Gemini adapter in the Edge Function. Required setup before testing real generation:

- `GEMINI_API_KEY` set as a Supabase Edge Function secret.
- `SUPABASE_URL` set as an Edge Function secret.
- `SUPABASE_SERVICE_ROLE_KEY` set as an Edge Function secret.
- `generation-outputs` bucket exists and remains private.
- Wallet RPC migration is applied.
- Active prompt version and active model config exist for the product.
- Test user has enough reserved credits through the normal generate flow.

The function response does not include signed output URLs yet. A later frontend phase should add status polling and protected signed URL retrieval.

## Security Checklist

- Do not expose `SUPABASE_SERVICE_ROLE_KEY` in frontend code.
- Do not expose AI provider keys in frontend code.
- Do not expose QPay secrets in frontend code.
- Keep prompt versions and model configs admin-only.
- Keep uploaded and generated images in private buckets unless explicitly public.
- Use signed URLs for private media.
- Enable RLS before real user data exists.
- Validate all generation option values server-side.
- Never trust client-submitted credit cost or payment status.
- Never permanently deduct credits before generation succeeds.
- Write wallet ledger rows for every balance change.

## What Is Not Implemented Yet

- Supabase client.
- Auth provider.
- Real login/register.
- Protected dashboard or my-images routes.
- Database migration execution.
- Profile creation triggers.
- Wallet creation triggers.
- Payment provider integration.
- Upload/storage UI integration.
- AI generation workers.
- Admin backend actions.

## Next Implementation Phase

Phase 8 should integrate Supabase Auth only:

- Install Supabase client.
- Add environment example.
- Add auth provider.
- Implement real login/register.
- Protect dashboard and my-images.
- Keep payment, wallet logic, upload/storage, and AI generation out of scope.
