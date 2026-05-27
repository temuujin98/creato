# Project Docs Index

This folder tracks product, design, architecture, and decision documentation for `creato`.

## Sections

- `01-product`: PRD, roadmap, and product taxonomy.
- `02-design`: homepage spec, design system, and UX flows.
- `03-architecture`: frontend architecture, future backend direction, and security notes.
- `04-data`: Supabase/Postgres schema planning, wallet ledger, generation lifecycle, and prompt template strategy.
- `06-ops`: Supabase setup and future operational notes.
- `07-decisions`: architecture decision records.

## Data Planning

- [`04-data/db-schema.md`](../04-data/db-schema.md): Supabase/Postgres-ready schema plan and table-level security notes.
- [`04-data/wallet-ledger.md`](../04-data/wallet-ledger.md): Credit wallet ledger rules, reservation/spend/refund flows, and idempotency requirements.
- [`04-data/generation-wallet-settlement.md`](../04-data/generation-wallet-settlement.md): Generation success/failure wallet spend/refund settlement plan.
- [`04-data/wallet-rpc-draft.md`](../04-data/wallet-rpc-draft.md): Future transaction-safe wallet RPC plan.
- [`04-data/generation-lifecycle.md`](../04-data/generation-lifecycle.md): Generation job state machine, retry/fallback behavior, storage relationship, and refund rules.
- [`04-data/prompt-template-schema.md`](../04-data/prompt-template-schema.md): Public option schema vs admin-only prompt/model configuration strategy.
- [`04-data/prompt-mapping-schema-note.md`](../04-data/prompt-mapping-schema-note.md): Future admin-only option-to-prompt mapping schema options.

## Architecture

- [`03-architecture/generation-worker-contract.md`](../03-architecture/generation-worker-contract.md): Future secure backend worker contract for queued generation processing.
- [`03-architecture/ai-provider-integration-plan.md`](../03-architecture/ai-provider-integration-plan.md): Gemini-first provider strategy and server-side processing responsibilities.
- [`03-architecture/gemini-image-generation-plan.md`](../03-architecture/gemini-image-generation-plan.md): Gemini request/response, input image, and output storage plan.
- [`03-architecture/gemini-adapter-implementation-spec.md`](../03-architecture/gemini-adapter-implementation-spec.md): Detailed Gemini adapter file plan, storage handling, output persistence, settlement, and rollout checklist.
- [`03-architecture/generation-error-retry-fallback.md`](../03-architecture/generation-error-retry-fallback.md): Error categories, retry rules, fallback rules, and admin monitoring needs.
- [`../../supabase/functions/process-generation/providers/types.ts`](../../supabase/functions/process-generation/providers/types.ts): Provider adapter scaffold type boundary.

## Supabase Planning

- [`06-ops/supabase-setup.md`](../06-ops/supabase-setup.md): Supabase setup plan, environment variables, migration order, storage setup, and security checklist.
- [`06-ops/ai-generation-test-checklist.md`](../06-ops/ai-generation-test-checklist.md): Future AI generation preflight and settlement test checklist.
- [`../../supabase/migrations/0001_initial_schema.sql`](../../supabase/migrations/0001_initial_schema.sql): Initial schema draft.
- [`../../supabase/migrations/0002_rls_policies.sql`](../../supabase/migrations/0002_rls_policies.sql): RLS policy draft.
- [`../../supabase/migrations/0003_storage_policies.sql`](../../supabase/migrations/0003_storage_policies.sql): Storage bucket and policy draft.
- [`../../supabase/migrations/0004_seed_mvp_catalog.sql`](../../supabase/migrations/0004_seed_mvp_catalog.sql): Public MVP catalog seed with stable product UUIDs.
- [`../../supabase/migrations/0005_wallet_rpc.sql`](../../supabase/migrations/0005_wallet_rpc.sql): Transaction-safe wallet reserve/refund/spend RPC draft.
- [`../../supabase/functions/process-generation/README.md`](../../supabase/functions/process-generation/README.md): Scaffold-only Edge Function contract for future generation processing.

## Current Scope

Implemented frontend scope:

- Frontend foundation.
- Premium homepage.
- Pricing page.
- Product discovery and product detail pages.
- Frontend-only generate UI.
- Frontend-only auth/account shell.
- Frontend-only admin UI shell.

Backend integration, real auth, wallet logic, payment, database migrations, API routes, upload/storage, and AI generation remain future work.
