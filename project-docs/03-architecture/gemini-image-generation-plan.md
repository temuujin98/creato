# Gemini Image Generation Plan

## Overview

Gemini is the planned default image provider for `creato` MVP generation. This document is an implementation plan only. It does not include production API code or SDK usage.

Target runtime:

- Supabase Edge Function
- Deno
- Server-only environment variables

Required environment variable:

```bash
GEMINI_API_KEY=
```

## Supported Input Types

The provider adapter should support these product shapes:

1. Text prompt only
2. Prompt plus one uploaded image
3. Prompt plus multiple uploaded images

The final prompt and image bundle must be assembled server-side from:

- Active `prompt_versions`
- Active `model_configs`
- `generation_inputs`
- Uploaded image storage paths
- Validated visible option values

## Reading Uploaded Images

Generation input rows provide storage paths:

```text
generation_inputs.storage_path
```

The Edge Function should:

1. Query upload inputs for the generation.
2. Read files from the private `user-uploads` bucket using the server-side Supabase client.
3. Validate the file path belongs to the generation owner path convention.
4. Detect or preserve MIME type.
5. Convert bytes to the provider-compatible format.

Path convention:

```text
users/{userId}/uploads/{timestamp}-{safeFileName}
```

## MIME Handling

Allowed input MIME types:

- `image/jpeg`
- `image/png`
- `image/webp`

The adapter should reject or fail safely for unsupported input MIME types.

Provider-compatible inline data shape, in pseudocode:

```ts
type ProviderImageInput = {
  mimeType: "image/jpeg" | "image/png" | "image/webp";
  dataBase64: string;
};
```

## Prompt And Request Pseudocode

No real provider code is included in this phase.

```ts
const prompt = compilePrompt(promptVersion, optionInputs);
const imageInputs = await loadStorageImages(uploadInputs);

const providerRequest = {
  model: modelConfig.primary_model,
  prompt,
  images: imageInputs,
  outputCount: modelConfig.output_count,
  outputSize: modelConfig.output_size
};

const providerResponse = await geminiAdapter.generate(providerRequest);
```

Do not log `prompt` or raw provider request payloads.

## Adapter Boundary

Phase 14B adds the provider adapter boundary but does not implement Gemini calls.

The future Gemini adapter should implement:

```ts
type ProviderAdapter = {
  name: "gemini";
  generateImage(request: NormalizedGenerationRequest): Promise<NormalizedGenerationResult | NormalizedProviderError>;
};
```

For now, provider factory routes Gemini to the dry-run adapter. Replacing dry-run with Gemini should not change frontend behavior or public response shape.

Detailed implementation spec:

```text
project-docs/03-architecture/gemini-adapter-implementation-spec.md
```

Phase 14C-A keeps this as planning only. The next code phase can add `geminiProvider.ts`, storage image input helpers, output storage helpers, and settlement helpers.

## Output Handling

Provider responses may return generated images as:

- Bytes
- Base64
- Provider-hosted URL

The Edge Function should normalize each output to binary before storage.

Output storage path:

```text
users/{userId}/generations/{generationId}/outputs/{outputIndex}.png
```

Bucket:

```text
generation-outputs
```

The bucket should remain private. User access should use signed URLs or protected storage policies later.

## `generation_outputs` Insert Strategy

For each output:

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
    "outputIndex": 0
  }
}
```

Metadata must not include:

- API keys
- Prompt text
- Negative prompt
- Full raw provider response if sensitive
- Internal cost details unless admin-only

## Failure Rules

If Gemini fails:

1. Classify the error.
2. Retry once if the error is transient and retry budget allows.
3. Fall back to OpenAI only if `model_configs` provides fallback config.
4. Mark generation failed if all attempts fail.
5. Call `refund_reserved_credits`.

Do not spend reserved credits until output storage and `generation_outputs` insertion both succeed.

## Testing Checklist

- Text-only generation request can be assembled.
- Single image request loads one file from storage.
- Multi-image request loads all required files.
- Unsupported MIME fails safely.
- Missing storage file produces `storage_input_missing`.
- Provider response normalizes to binary.
- Output is uploaded to the expected path.
- No prompt text appears in user-visible response.
