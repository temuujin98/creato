# process-generation

## Purpose

`process-generation` is the future backend entry point for processing a queued `creato` generation record.

Current status: Gemini adapter and output storage implemented.

This function loads generation context, active prompt configuration, and active model configuration from the database. It compiles a server-side prompt draft internally, builds a normalized provider request, calls Gemini when `dryRun` is not set, stores generated outputs, and settles reserved credits. It still supports `dryRun: true` for adapter smoke testing.

## Request Format

```json
{
  "generationId": "00000000-0000-4000-8000-000000000000",
  "dryRun": false
}
```

The request must be `POST` and include an `Authorization: Bearer <token>` header.

## Example Request

```bash
curl -i \
  -X POST \
  -H "Authorization: Bearer <user-or-service-token>" \
  -H "Content-Type: application/json" \
  --data '{"generationId":"00000000-0000-4000-8000-000000000000"}' \
  http://localhost:54321/functions/v1/process-generation
```

## Example Response

```json
{
  "ok": true,
  "status": "completed",
  "generationId": "00000000-0000-4000-8000-000000000000",
  "outputCount": 1
}
```

## Future Environment Variables

Server-only:

```bash
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
GEMINI_API_KEY=
OPENAI_API_KEY=
```

These must never be exposed to browser/client code.

## Security Rules

- The frontend must not call AI providers directly.
- Service role may only be used inside trusted server runtime.
- Prompt templates, model configs, provider config, and API keys must never be returned to clients.
- The function must validate generation ownership/status before processing.
- Credit spend/refund must happen only through transaction-safe wallet RPC.
- Signed URLs and private storage URLs are not returned by this scaffold.
- User PII is not returned.

## What It Does Now

- Validates request method and JSON shape.
- Validates UUID-like `generationId`.
- Verifies bearer token with Supabase Auth.
- Loads the generation row.
- Allows generation owner or admin/super_admin profile.
- Validates status is `queued`, `processing`, or `credit_reserved`.
- Loads non-sensitive product fields.
- Loads product name translations.
- Loads generation input metadata and returns safe counts only.
- Loads the latest active prompt version for the product.
- Loads an active model config for the product.
- Builds an internal server-side prompt draft from prompt config and visible option values.
- Builds a normalized provider request.
- Selects a provider adapter through `providers/providerFactory.ts`.
- Calls Gemini for real processing when `dryRun` is false.
- Supports dry-run provider adapter when `dryRun` is true.
- Downloads input images from `user-uploads`.
- Stores generated output in `generation-outputs`.
- Inserts `generation_outputs` rows.
- Marks generation completed on success.
- Calls `spend_reserved_credits` on success.
- Marks generation failed and calls `refund_reserved_credits` on failure.
- Returns only safe completion/failure metadata.

## What It Does Not Do Yet

- No prompt text returned.
- No provider/model names returned.
- No signed URLs returned.
- No output storage paths returned.
- No OpenAI implementation.

## Provider Adapter Scaffold

Provider adapter files live in:

```text
supabase/functions/process-generation/providers
```

Files:

- `types.ts`: normalized provider request/result/error contracts.
- `dryRunProvider.ts`: scaffold adapter that returns no outputs and makes no provider calls.
- `geminiProvider.ts`: fetch-based Gemini adapter.
- `providerFactory.ts`: routes Gemini to Gemini adapter, OpenAI remains unimplemented.
- `errors.ts`: safe provider error mapping.

The dry-run adapter remains available for safe smoke tests. OpenAI is deferred.

## Current Setup Requirement

The MVP catalog seed does not insert `prompt_versions` or `model_configs`. Until an admin-managed active prompt version and active model config exist for a product, this function returns a safe `409` response:

- `active_prompt_version_missing`
- `active_model_config_missing`

Do not seed real production prompts into public frontend data. Prompt and model config rows belong in secure backend/admin storage only.

## Future Implementation Checklist

1. Add frontend trigger and result polling.
2. Add signed output URL retrieval in protected flows.
3. Add admin generation recovery tools.
4. Add OpenAI fallback only after Gemini path is stable.

## Local Test

```bash
supabase functions serve process-generation
```

## Deploy

```bash
supabase functions deploy process-generation
```
