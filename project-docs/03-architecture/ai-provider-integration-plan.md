# AI Provider Integration Plan

## Overview

`creato` will use Gemini as the default image generation provider for the MVP. OpenAI can be introduced later as a premium provider, fallback provider, or product-specific route.

The frontend must never call AI providers directly. All provider calls must happen inside a secure Edge Function or backend runtime where server-only environment variables, prompt templates, model routing, storage access, and wallet settlement can be controlled.

## Provider Priority

1. Default provider: Gemini
2. Fallback provider: OpenAI
3. Future routing: per-product provider and model selection through `model_configs`

`model_configs` should decide:

- Primary provider
- Primary model
- Fallback provider
- Fallback model
- Output count
- Output size
- Retry limit
- Cleanup behavior

## Why Gemini-First

Gemini is the preferred first provider for MVP validation because:

- Lower cost is assumed for early product/social visual workflows.
- It is suitable for basic product, poster, and social visual generation experiments.
- It lets `creato` validate demand before premium routing complexity.
- OpenAI can remain reserved for premium, text-heavy, fallback, or higher-quality workflows.

Provider choice should stay configurable per product. The application should not hardcode a single global model into public client code.

## Edge Function Responsibilities

`process-generation` should eventually own the complete server-side generation transaction:

1. Load generation by id.
2. Validate owner/admin or trusted service context.
3. Validate status is `queued` or `processing`.
4. Load product.
5. Load `generation_inputs`.
6. Load active `prompt_versions`.
7. Load active `model_configs`.
8. Compile prompt server-side.
9. Load input images from Supabase Storage.
10. Call the selected provider.
11. Normalize provider output.
12. Upload output to `generation-outputs`.
13. Insert `generation_outputs`.
14. Mark generation `completed`.
15. Call `spend_reserved_credits`.
16. On failure, mark generation `failed` and call `refund_reserved_credits`.

All sensitive state must be derived server-side.

## Frontend Request Contract

The frontend sends only:

```json
{
  "generationId": "uuid"
}
```

The request must include:

```http
Authorization: Bearer <supabase-user-token>
```

The frontend must not send:

- Prompt text
- Compiled prompt
- Model name
- Provider config
- API keys
- Hidden admin config
- Internal provider cost
- Wallet settlement instructions

## Future Edge Function Response

For user-triggered processing, return only safe status:

```json
{
  "ok": true,
  "generationId": "uuid",
  "status": "completed",
  "outputCount": 1
}
```

Do not return prompt text, provider raw responses, private storage paths unless needed by a protected client flow, or signed URLs unless deliberately scoped and short-lived.

## Data Dependencies

Required rows before processing:

- `generations` row with status `queued` or `processing`
- `generation_inputs` upload and option rows
- Active `prompt_versions` row
- Active `model_configs` row
- Reserved wallet credits

Required storage:

- `user-uploads` bucket for source files
- `generation-outputs` bucket for generated output files

## Security Checklist

- Service role key only in Edge Function/server runtime.
- AI provider keys only in server secrets.
- Public product APIs never return prompt/model rows.
- Prompt text is not logged.
- Provider raw responses are sanitized before storage.
- Storage reads/writes use backend-controlled paths.
- Wallet spend/refund uses transaction-safe RPC.
- Client-submitted credit cost is ignored.

## Implementation Sequence

1. Provider adapter scaffold with no real calls. Done in Phase 14B.
2. Storage input loader scaffold.
3. Gemini adapter implementation.
4. Output upload and `generation_outputs` insert.
5. Wallet spend/refund settlement.
6. Retry/fallback behavior.
7. Admin monitoring and recovery tools.

## Phase 14B Adapter Boundary

The Edge Function now has provider adapter files:

```text
supabase/functions/process-generation/providers/types.ts
supabase/functions/process-generation/providers/dryRunProvider.ts
supabase/functions/process-generation/providers/providerFactory.ts
supabase/functions/process-generation/providers/errors.ts
```

The current implementation always uses dry-run mode. Gemini/OpenAI adapter implementations are intentionally deferred. The dry-run path validates the internal request shape without calling providers, creating outputs, or settling wallet credits.

## Phase 14C-A Gemini Adapter Spec

The detailed Gemini adapter implementation plan lives in:

```text
project-docs/03-architecture/gemini-adapter-implementation-spec.md
```

It defines the future file layout for Gemini adapter code, storage input helpers, output storage helpers, and wallet settlement helpers. It also documents MIME/base64 conversion, response normalization, safety handling, retry behavior, and rollout checks.

No real provider calls are implemented in Phase 14C-A.

## Phase 14C-B Gemini Implementation

Phase 14C-B implements the Gemini path inside `process-generation`:

- `providers/geminiProvider.ts` calls Gemini with server-only `GEMINI_API_KEY`.
- `storage/imageInputs.ts` downloads and base64-encodes uploaded images.
- `storage/outputStorage.ts` stores generated images and inserts `generation_outputs`.
- `process-generation/index.ts` marks completion and calls `spend_reserved_credits`.
- Failure paths mark failed and call `refund_reserved_credits`.

OpenAI remains unimplemented. Frontend behavior is unchanged until a later trigger/polling phase.
