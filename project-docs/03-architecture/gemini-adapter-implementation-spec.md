# Gemini Adapter Implementation Spec

## Overview

The real Gemini adapter will replace dry-run behavior for `provider = "gemini"` inside `process-generation`.

It must run only inside the Supabase Edge Function/server runtime. It must never run in browser/frontend code, and it must never expose prompt text, provider config, storage paths, signed URLs, or provider secrets to public clients.

Phase 14C-B implements this plan with a fetch-based Gemini adapter. No Gemini SDK is installed.

## Target File Plan

Implemented files:

```text
supabase/functions/process-generation/providers/geminiProvider.ts
supabase/functions/process-generation/storage/imageInputs.ts
supabase/functions/process-generation/storage/outputStorage.ts
```

Responsibilities:

- `geminiProvider.ts`: implement the `ProviderAdapter` contract for Gemini.
- `imageInputs.ts`: load and normalize uploaded input images from Supabase Storage.
- `outputStorage.ts`: upload generated outputs and insert `generation_outputs`.
- Settlement is currently handled in `process-generation/index.ts`.

## Required Server Environment

Server-only Edge Function variables:

```bash
GEMINI_API_KEY=
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
```

Rules:

- Never create `VITE_GEMINI_API_KEY`.
- Never use `SUPABASE_SERVICE_ROLE_KEY` in frontend code.
- Do not persist provider keys in database rows.
- Do not return provider keys or model config to clients.

## Input Image Loading

Input image rows come from:

```text
generation_inputs
```

The worker should:

1. Select upload inputs for the generation.
2. Read each `storage_path`.
3. Download each file from the private `user-uploads` bucket with the Edge Function service client.
4. Validate path convention:

```text
users/{userId}/uploads/{timestamp}-{safeFileName}
```

5. Validate MIME type:

```text
image/jpeg
image/png
image/webp
```

6. Enforce maximum input count from `products.max_images`.
7. Convert binary to base64 or Gemini-compatible inline data.
8. Never return input images, storage paths, public URLs, or signed URLs in the function response.

## MIME And Base64 Strategy

Internal normalized input:

```ts
type GeminiInlineImage = {
  mimeType: "image/jpeg" | "image/png" | "image/webp";
  dataBase64: string;
};
```

Conversion strategy:

1. Download `Blob` or byte response from Supabase Storage.
2. Read as `ArrayBuffer`.
3. Convert to `Uint8Array`.
4. Convert bytes to base64.
5. Preserve MIME from storage metadata when available.
6. Fall back to extension-based MIME detection only if metadata is missing.

Unsupported MIME should produce:

```text
storage_input_missing
```

or a stricter future code:

```text
validation_error
```

## Prompt Handling

Gemini requests use the compiled server-side prompt from `process-generation`.

Prompt composition:

- `base_prompt`
- Visible option value summary
- `prompt_suffix`
- `quality_prompt`
- `artifact_cleanup_prompt`

Negative prompt handling:

- If Gemini supports negative prompt fields for the selected model, pass it through provider-specific config.
- If not supported, fold safe negative instructions into the server-side text prompt.
- Never expose or log the full negative prompt.

Rules:

- Never log full prompt.
- Never return prompt to client.
- Never accept prompt text from frontend.
- Avoid storing compiled prompt in user-visible generation metadata.

## Gemini Request Construction

Pseudocode only:

```ts
const request = {
  model: modelConfig.primary_model,
  contents: [
    { type: "text", text: compiledPrompt },
    ...inputImages.map((image) => ({
      type: "inline_data",
      mimeType: image.mimeType,
      data: image.dataBase64
    }))
  ],
  generationConfig: {
    outputCount: modelConfig.output_count,
    outputSize: modelConfig.output_size
  }
};

const response = await geminiAdapter.generate(request);
```

Phase 14C-B uses a direct REST `fetch` call to the Gemini `generateContent` endpoint. The adapter is isolated so request shape changes stay inside `geminiProvider.ts`.

## Response Normalization

The Gemini adapter should return the existing normalized shape:

```ts
type NormalizedGenerationResult = {
  ok: true;
  provider: "gemini";
  model: string;
  outputs: NormalizedGenerationOutput[];
  rawMetadata?: Record<string, unknown>;
};
```

Handle provider outcomes:

- Base64 image: decode or preserve as `base64`.
- Binary image: preserve as `Uint8Array`.
- No image returned: map to `provider_response_invalid`.
- Safety block: map to `provider_safety_block`.
- Provider auth failure: map to `provider_auth_error`.
- Rate limit: map to `provider_rate_limit`.
- Timeout: map to `provider_timeout`.
- Unknown error: map to `provider_unknown_error`.

Raw provider response should be sanitized before storing or logging.

## Output Storage

Output bucket:

```text
generation-outputs
```

Output path:

```text
users/{userId}/generations/{generationId}/outputs/{index}.png
```

Storage rules:

- Bucket remains private.
- Upload with service client from Edge Function.
- Do not expose public URLs by default.
- Signed URLs can be added later in a protected gallery/history flow.

## `generation_outputs` Insert Strategy

After each output is uploaded, insert:

```json
{
  "generation_id": "uuid",
  "output_type": "image",
  "storage_path": "users/{userId}/generations/{generationId}/outputs/0.png",
  "width": null,
  "height": null,
  "metadata": {
    "provider": "gemini",
    "model": "safe-model-id-if-allowed",
    "outputIndex": 0,
    "generatedAt": "ISO timestamp"
  }
}
```

Metadata must not include:

- API key
- Prompt text
- Negative prompt
- Full raw provider response
- User private input image data

## Wallet Settlement

### Success

1. Generation status is `processing`.
2. Provider returns output.
3. Output upload succeeds.
4. `generation_outputs` insert succeeds.
5. Mark generation `completed`.
6. Call `spend_reserved_credits` with:

```text
spend:{generationId}
```

### Failure

1. Provider error, safety block, timeout, or storage failure occurs.
2. Mark generation `failed`.
3. Store safe `error_code` and sanitized `error_message`.
4. Call `refund_reserved_credits` with:

```text
refund:{generationId}
```

### Partial Failures

If output storage succeeds but spend fails:

- Keep generation `completed`.
- Add `wallet_spend_failed` metadata.
- Require admin recovery.
- Retry spend with the same idempotency key.

If provider succeeds but output storage fails:

- Mark generation `failed`.
- Store `output_storage_failed`.
- Refund reserved credits.

If refund fails:

- Keep generation `failed`.
- Store `wallet_refund_failed`.
- Require admin recovery.

## Retry And Fallback

MVP Gemini phase:

- Retry Gemini once if retryable.
- Do not implement OpenAI fallback unless explicitly included in the code phase.
- If retry fails, mark failed and refund.

Later fallback:

- Use `model_configs.fallback_provider`.
- Use `model_configs.fallback_model`.
- Attempt fallback only for fallback-eligible errors.
- Do not fallback for validation errors, missing storage inputs, or prompt/model config errors.

## Safety Handling

Provider safety block should:

- Mark generation `failed`.
- Store `provider_safety_block`.
- Refund reserved credits.
- Return a user-safe message.
- Keep raw provider safety details out of public responses.

Do not bypass provider safety systems.

## Testing Checklist

- Text-only product.
- Single-image product.
- Multi-image product.
- Missing input image.
- Unsupported MIME.
- Missing prompt config.
- Missing model config.
- Provider auth failure.
- Provider safety block.
- Provider timeout.
- Provider invalid response.
- Output upload failure.
- `generation_outputs` insert failure.
- Wallet spend failure.
- Wallet refund failure.
- Retry with no fallback configured.
- Prompt text not returned.
- Storage path not returned.

## Rollout Checklist

1. Confirm migrations and RLS are applied.
2. Confirm `generation-outputs` bucket exists and is private.
3. Confirm Edge Function secrets are set.
4. Confirm active prompt version exists.
5. Confirm active model config exists.
6. Confirm test user has wallet balance.
7. Run dry-run adapter smoke test.
8. Enable Gemini adapter for one internal test product.
9. Verify output storage.
10. Verify wallet spend/refund.
11. Verify no prompt leakage.
12. Add admin recovery notes for failed settlement cases.
