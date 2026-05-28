# Prompt Template and Product Option Schema

## Overview

`creato` products expose simple user-facing options while hiding prompt engineering, model routing, provider configuration, and internal cost data. The frontend must never receive production prompts or provider secrets.

## Why Prompts Must Be Hidden From Client

Prompts and provider settings are product IP and security-sensitive operational config. Exposing them in frontend code would allow:

- Prompt copying.
- Prompt injection analysis against internal mappings.
- Provider routing leakage.
- Internal cost leakage.
- Accidental API-key or model-config exposure.

The backend must compile final prompts server-side.

## Public Product Data vs Admin-Only Product Config

Public client may receive:

- Product id.
- Product name.
- Category.
- Description.
- Guide.
- Thumbnail.
- Credit cost.
- Upload requirements.
- Visible options.
- Public model option tiers such as Fast or Premium.

Admin/backend only:

- Base prompt.
- Negative prompt.
- Prompt suffix.
- Prompt mapping.
- Model provider.
- Model name.
- Retry/fallback rules.
- Internal provider cost.
- Admin notes.

Public model option tiers must remain safe display data. They can describe user-facing quality or speed choices and credit cost, but they must not contain Gemini/OpenAI model IDs, provider names, prompt fragments, API keys, or routing rules.

## Public Visible Option Schema

Public options should describe form UI, not prompt internals.

Example:

```json
{
  "productId": "luxury-product-ad",
  "options": [
    {
      "key": "backgroundStyle",
      "label": { "mn": "Background style", "en": "Background style" },
      "type": "select",
      "required": true,
      "choices": [
        { "label": { "mn": "Minimal studio", "en": "Minimal studio" }, "value": "minimal-studio" },
        { "label": { "mn": "Luxury surface", "en": "Luxury surface" }, "value": "luxury-surface" }
      ]
    },
    {
      "key": "aspectRatio",
      "label": { "mn": "Hemjee", "en": "Aspect ratio" },
      "type": "aspect-ratio",
      "required": true,
      "choices": [
        { "label": { "mn": "Square 1:1", "en": "Square 1:1" }, "value": "1:1" },
        { "label": { "mn": "Story 9:16", "en": "Story 9:16" }, "value": "9:16" }
      ]
    }
  ]
}
```

## Admin Prompt Config Schema

Admin prompt versions should live in secure backend/admin storage.

Example shape:

```json
{
  "productId": "luxury-product-ad",
  "version": 3,
  "status": "active",
  "basePrompt": "[admin-only template]",
  "negativePrompt": "[admin-only negative template]",
  "promptSuffix": "[admin-only suffix]",
  "optionMapping": {
    "backgroundStyle": {
      "minimal-studio": "[admin-only fragment]",
      "luxury-surface": "[admin-only fragment]"
    },
    "aspectRatio": {
      "1:1": { "width": 1024, "height": 1024 },
      "9:16": { "width": 1024, "height": 1792 }
    }
  }
}
```

The example intentionally uses placeholders instead of real prompts.

## Prompt Versioning Strategy

- Each product can have multiple prompt versions.
- Only one active prompt version should be used for new generations.
- Generations should store `prompt_version_id` for audit.
- Old prompt versions should be archived, not overwritten.
- Draft prompt versions should be testable only inside admin/backend flows.

## Prompt Compilation Flow

1. Client submits product id, uploaded image ids, and public option values.
2. Backend loads product and validates it is active.
3. Backend validates image ownership and upload requirements.
4. Backend validates option values against public schema.
5. Backend loads active prompt version and model config using service/admin privileges.
6. Backend maps option values to internal prompt fragments.
7. Backend compiles final prompt.
8. Backend calls provider.
9. Backend stores generation metadata without returning hidden prompt details.

## Option Value Validation

Validation should happen server-side:

- Required fields must be present.
- Choice values must be in allowed public choices.
- Text values should have max length.
- Number values should have min/max.
- Color values should match safe color format.
- Aspect ratios should match configured allowed values.
- Unknown option keys should be rejected.

Client-side validation is useful for UX but cannot be trusted.

## Prompt Mapping Strategy

Prompt mappings translate safe public values into admin-only instructions. Example:

| Public option | Public value | Admin-only mapping |
| --- | --- | --- |
| backgroundStyle | minimal-studio | Hidden prompt fragment |
| mood | premium | Hidden prompt fragment |
| aspectRatio | 4:5 | Provider size parameters |

Do not store mapping fragments in public product data.

## Model Routing Config

Model routing should be stored in `model_configs`:

- Primary provider.
- Primary model.
- Fallback provider.
- Fallback model.
- Retry limit.
- Timeout seconds.
- Internal cost estimate.

API keys must be environment variables or secret manager entries, not database fields.

Public `modelOptionId` values map to `model_configs.public_option_id` only inside backend/admin code. The backend must validate that the selected model option belongs to the preset and must compute trusted credit cost server-side.

`model_configs` now supports:

- `public_option_id`: safe user-facing tier id such as `fast` or `premium`.
- `display_name`: admin-facing label.
- `is_default`: default active config when no model option is submitted.
- `credit_cost_override`: trusted server-side credit cost for that option.

Frontend credit display is never the source of truth.

## Security Rules

- Do not store real production prompts in frontend mock data.
- Do not return prompt versions to public clients.
- Do not return model configs to public clients.
- Do not compile prompts client-side.
- Do not trust client-provided product credit cost.
- Do not trust client-provided model option credit cost.
- Do not expose provider/model IDs through public model options.
- Do not trust client-provided option labels.
- Validate all submitted values on the backend.
- Log admin prompt changes in `admin_logs`.

## Example Compiled Prompt Flow

The backend may internally combine:

```text
base_prompt + selected_option_fragments + product_context + prompt_suffix
```

The public response should contain only:

```json
{
  "generationId": "uuid",
  "status": "queued",
  "creditCost": 2
}
```

No final prompt, prompt fragments, provider config, or hidden mapping should be returned.

## Multilingual Prompt Strategy

Public product text can be multilingual. Prompt compilation should have a primary internal prompt language chosen by admin configuration.

Recommended approach:

- Store public labels in translation tables.
- Store prompt templates in a stable internal language.
- Map public option values by stable keys, not translated labels.
- If user-entered text is Mongolian or English, pass it as user content after validation.
- Avoid using translated UI labels as prompt mapping keys.

## Phase 13D Admin UI Shell

The admin product editor now has frontend-only UI sections for prompt versions, model routing, option-to-prompt mapping placeholders, and Edge Function readiness checks.

Current boundaries:

- No real CRUD is connected to `prompt_versions` or `model_configs`.
- No prompt fields are added to public product data.
- No provider secrets or API keys are stored in frontend code.
- Save buttons are disabled/mock.
- Option-to-prompt mapping is a placeholder only.

Future persistence should use admin-only Supabase tables and RLS policies. Option mapping may use either a `product_options.prompt_mapping` column or a separate `product_option_prompt_mappings` table, documented in `prompt-mapping-schema-note.md`.

## Phase 13E Admin CRUD Boundary

The admin product editor now connects to `prompt_versions` and `model_configs` using the browser-safe Supabase anon client. Security depends on RLS admin policies, not frontend checks.

Required rules:

- Admin/super_admin can select, insert, and update prompt/model rows.
- Normal authenticated users have no access.
- Anonymous users have no access.
- Public product pages must not import the admin config service.
- Prompt text and model config must not be returned from public APIs.
- API keys are never database fields and remain server-only environment variables.
