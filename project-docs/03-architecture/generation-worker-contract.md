# Generation Worker Contract

## Overview

`creato` generation records can now be prepared and moved into `queued` or `processing` placeholder states. The actual AI generation backend is not connected yet.

This document defines the future secure backend worker or serverless function contract for processing queued generations.

## Why The Frontend Must Not Call AI Providers

The browser must never call Gemini, OpenAI, or any other AI provider directly because:

- API keys would be exposed.
- Prompt templates and provider configuration would leak.
- Credit spend/refund logic would be easy to bypass.
- Provider retries, failures, and costs require server-side audit logs.
- Storage writes for generated outputs need secure backend enforcement.

## Required Secure Backend Responsibilities

The backend worker must:

- Run with trusted server credentials.
- Load prompt and model config from admin-only tables.
- Validate generation ownership and status.
- Compile prompts server-side.
- Call the selected AI provider.
- Store generated files in the private `generation-outputs` bucket.
- Insert `generation_outputs` rows.
- Mark generation success or failure.
- Call wallet RPC functions to spend or refund reserved credits.
- Write audit logs and structured errors.

## Input Contract

Minimum input:

```json
{
  "generation_id": "uuid"
}
```

The backend may receive authenticated user context for user-triggered processing, or run in service role context for queue workers. Browser requests must not include prompt text, provider config, model names, API keys, or internal cost values.

## Backend Steps

1. Load generation by `generation_id`.
2. Verify status is `queued` or `processing`.
3. Load product.
4. Load active `prompt_versions` row.
5. Load active `model_configs` row.
6. Load `generation_inputs`.
7. Compile final prompt server-side.
8. Call Gemini/OpenAI or configured provider.
9. Store output in `generation-outputs` bucket.
10. Insert `generation_outputs` row.
11. Mark generation `completed`.
12. Call `spend_reserved_credits`.
13. On failure, mark generation `failed` and call `refund_reserved_credits`.

## Future Endpoint Options

HTTP endpoint:

```http
POST /api/generations/:id/process
```

Supabase Edge Function:

```text
process-generation
```

The endpoint should accept only a generation id and derive all sensitive context server-side.

## Phase 13A Edge Function Scaffold

The current scaffold lives at:

```text
supabase/functions/process-generation/index.ts
```

Current behavior:

- Accepts `POST` only.
- Handles CORS preflight.
- Requires an `Authorization` header.
- Validates JSON body shape.
- Requires `generationId` to be UUID-like.
- Returns `not_implemented`.
- Does not query the database.
- Does not call AI providers.
- Does not create outputs.
- Does not spend or refund credits.

Future request:

```json
{
  "generationId": "uuid"
}
```

Current placeholder response:

```json
{
  "ok": false,
  "status": "not_implemented",
  "message": "AI generation backend is not connected yet.",
  "generationId": "uuid"
}
```

## Status Transitions

Recommended success path:

```text
created -> credit_reserved -> queued -> processing -> completed -> credit_spent
```

Recommended failure path:

```text
created -> credit_reserved -> queued -> processing -> failed -> credit_refunded
```

Phase 12 only simulates:

```text
created -> queued -> processing
```

It does not complete the job, spend credits, refund credits, or create outputs.

## Phase 13B Database Access Scaffold

`process-generation` now loads safe database context:

- Authenticates the bearer token.
- Loads generation by id.
- Allows generation owner or admin/super_admin.
- Validates status is `queued`, `processing`, or `credit_reserved`.
- Loads non-sensitive product fields.
- Loads product translations for display name.
- Loads generation input metadata and returns safe counts.

Deferred to Phase 13C:

- Load active prompt version.
- Load model config.
- Compile prompt server-side.

Still deferred:

- AI provider call.
- Output storage.
- `generation_outputs` insert.
- Credit spend/refund.

## Phase 13C Prompt/Model Loading Scaffold

`process-generation` now also loads admin-only generation configuration server-side:

- Loads the latest active `prompt_versions` row for the product.
- Loads an active `model_configs` row for the product.
- Builds an internal prompt draft from `base_prompt`, visible option values, prompt suffix, quality prompt, and cleanup prompt.
- Keeps negative prompt separate internally.
- Returns only safe readiness metadata: prompt ready/version, model ready, fallback configured, output count, and cleanup enabled.

The function must not return or log:

- Base prompt.
- Negative prompt.
- Prompt suffix.
- Quality prompt.
- Compiled prompt text.
- Provider names.
- Model names.
- Estimated provider cost.

The current MVP catalog seed does not include `prompt_versions` or `model_configs`, so the function returns a safe `409` until secure admin-managed config exists.

Deferred after Phase 13C:

- Provider-specific request construction.
- AI provider call.
- Output storage.
- `generation_outputs` insert.
- Credit spend/refund.

## Phase 13D Admin Prompt/Model UI Shell

The admin product editor now includes frontend-only preparation UI for:

- Prompt version fields.
- Model routing fields.
- Option-to-prompt mapping placeholders.
- Edge Function readiness checklist.

This is not connected to `prompt_versions` or `model_configs` CRUD yet. Prompt/model fields remain admin-only UI concepts and must not be added to public product data or returned by public product APIs.

Option mapping persistence may require a future schema migration. See:

```text
project-docs/04-data/prompt-mapping-schema-note.md
```

## Phase 13E Admin Prompt/Model CRUD

The admin product editor now uses the authenticated Supabase anon client to manage `prompt_versions` and `model_configs` through RLS-protected admin policies.

Rules:

- Only admin/super_admin profiles should be able to select, insert, or update prompt/model config rows.
- Public product pages must never query `prompt_versions` or `model_configs`.
- Prompt text must not be logged by frontend code.
- API keys remain server-only Edge Function environment variables.
- Edge Function readiness can check whether active prompt/model config rows exist, but it must not expose prompt text or provider secrets.

## Phase 14A AI Provider Planning

Phase 14A documents the Gemini-first generation path without adding provider code.

Planning docs:

- `project-docs/03-architecture/ai-provider-integration-plan.md`
- `project-docs/03-architecture/gemini-image-generation-plan.md`
- `project-docs/03-architecture/generation-error-retry-fallback.md`
- `project-docs/04-data/generation-wallet-settlement.md`
- `project-docs/06-ops/ai-generation-test-checklist.md`

The next code phase should create provider adapter boundaries before adding real provider calls. The implementation must keep prompt/model loading server-side, write outputs only after provider success, and settle reserved credits only after output persistence.

## Phase 14B Provider Adapter Scaffold

`process-generation` now has a provider adapter boundary under:

```text
supabase/functions/process-generation/providers
```

Current adapter files:

- `types.ts`: normalized request, output, result, error, and adapter types.
- `dryRunProvider.ts`: scaffold adapter that does not call AI and returns no outputs.
- `providerFactory.ts`: provider selection function. Gemini and OpenAI currently resolve to dry-run mode.
- `errors.ts`: safe provider error mapping.

The Edge Function now builds a normalized provider request internally after loading generation, inputs, prompt config, and model config. It calls the dry-run adapter only and returns `provider_adapter_scaffold_ready`.

Still deferred:

- Real Gemini call.
- Real OpenAI call.
- Storage image download.
- Output upload.
- `generation_outputs` insert.
- Credit spend/refund.

## Phase 14C-A Gemini Adapter Implementation Spec

Phase 14C-A adds an implementation-ready Gemini adapter spec without adding provider code:

```text
project-docs/03-architecture/gemini-adapter-implementation-spec.md
```

The spec defines future files:

- `providers/geminiProvider.ts`
- `storage/imageInputs.ts`
- `storage/outputStorage.ts`
- `generationSettlement.ts`

It documents input image download, MIME/base64 conversion, Gemini request construction, response normalization, output storage, `generation_outputs` insertion, spend/refund settlement, provider safety handling, and rollout checks.

Still no real provider call exists after Phase 14C-A.

## Phase 14C-B Gemini Adapter Implementation

`process-generation` now has a real Gemini path inside the Edge Function:

- Downloads upload inputs from `user-uploads`.
- Converts supported images to base64.
- Calls Gemini through a fetch-based provider adapter.
- Normalizes image outputs.
- Uploads outputs to `generation-outputs`.
- Inserts `generation_outputs`.
- Marks generation `completed`.
- Calls `spend_reserved_credits`.
- On provider/storage failure, marks generation `failed` and calls `refund_reserved_credits`.

`dryRun: true` remains available for adapter smoke testing and does not call Gemini, store outputs, or settle credits.

The public response still does not include prompt text, model config, storage paths, signed URLs, or raw provider responses. OpenAI remains unimplemented.

## Retry And Fallback Strategy

- Track attempt count.
- Retry transient provider errors with a bounded retry limit.
- Switch to fallback provider only when model config allows it.
- Keep provider errors in admin-only logs.
- Avoid charging users twice for retries of the same reserved generation.

## Timeout Rules

- Jobs stuck in `queued` or `processing` beyond timeout should be recovered by scheduled backend logic.
- If no provider output exists, mark failed and refund reserved credits.
- If provider output exists but storage failed, attempt recovery before refund.

## Error Logging

Store:

- Error stage.
- Provider error code.
- Sanitized provider message.
- Retry count.
- Trace id or request id.
- Admin-only raw diagnostic payload when safe.

Do not expose raw provider responses to public clients.

## Audit Requirements

Every processed generation should preserve:

- User id.
- Product id.
- Prompt version id.
- Model config id.
- Input ids.
- Output ids.
- Wallet transaction ids.
- Status timestamps.
- Error details when applicable.

This keeps `creato` debuggable and financially auditable without exposing prompt or provider internals.

## Phase 14D Frontend Trigger And Polling

The generate page now invokes the `process-generation` Edge Function after the frontend has reserved credits, created the generation record, saved `generation_inputs`, and moved the row to `queued`/`processing`.

Frontend request contract:

```json
{
  "generationId": "uuid",
  "dryRun": false
}
```

The frontend sends only the generation id and the current authenticated Supabase bearer token. It never sends prompt text, model names, provider config, uploaded image bytes, storage paths, API keys, or wallet settlement instructions.

After invocation, the frontend polls `generations` for safe fields only:

- `id`
- `status`
- `error_code`
- `error_message`
- `completed_at`
- `updated_at`
- `credit_cost`

Polling stops when the status reaches `completed`, `failed`, `credit_spent`, `credit_refunded`, or `canceled`, or when the bounded polling window expires.

## Phase 14E Signed Output Preview

When polling reaches `completed`, the frontend loads completed generation outputs through a safe client-side preview flow:

1. Verify the authenticated user owns the completed generation.
2. Query `generation_outputs` for the generation.
3. Create temporary signed URLs from the private `generation-outputs` bucket.
4. Render image previews and download links.

The UI does not display storage paths, prompt text, model/provider configuration, raw provider responses, or service-role-only data. Signed URLs are temporary and should be treated as bearer URLs. A full My Images gallery remains a later phase.
