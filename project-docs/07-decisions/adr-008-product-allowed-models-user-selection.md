# ADR-008: Product Allowed Models and User Model Selection

**Date:** 2026-05-29
**Status:** Accepted

## Context

The global `ai_model_registry` (Phase 26) catalogs all available AI providers and models.
Products (presets) need to expose a curated subset of those models to users during generation.
Users should see only the models their chosen product supports, not the full global list.

## The three-layer model system

```
ai_model_registry           (global catalog — admin managed)
        ↓ via product_allowed_models
product_allowed_models      (per-product availability — admin managed)
        ↓ queried by
GeneratePage / GenerateForm (user-facing selector — read-only)
```

### Layer 1: ai_model_registry
Phase 26. Global truth about available providers, models, capabilities, and costs.
Admin sets global `is_active` and `status`. Inactive/deprecated models are hidden from users.

### Layer 2: product_allowed_models
Phase 27. Each row links one product to one registry entry with optional overrides:
- `is_active` — whether this model is available for this product
- `is_default` — pre-selected model for this product (unique per product)
- `credit_cost_override` — optional per-product credit cost (null = use product.credit_cost)
- `sort_order` — display order in the selector

### Layer 3: User selection
`GeneratePage` calls `listPublicProductAllowedModels(dbProductId)` to fetch allowed models.
`GenerateForm` shows DB models (if any) in place of static `product.modelOptions`.
The selected `model_config_id` is stored in the generation record for monitoring and future routing.

## Security design

### Public model query returns only safe fields
`listPublicProductAllowedModels` does not return:
- `cost_per_generation_mnt` from registry
- `connection_status`
- `admin_note`
- `metadata`
- provider API keys or secrets

### Client-side validation is enforced
Before creating the generation record, `validateProductModelSelection(productId, modelConfigId)`
checks that the selected model is still active and allowed. This prevents:
- Using a model that was deactivated between page load and submit
- Manipulated model IDs in the request payload

### Server-side validation (next phase)
The `process-generation` Edge Function should also validate `model_config_id` before
calling the provider. This is the authoritative server-side gate. Phase 28 will add this.

### API keys
API keys for Gemini, OpenAI, and any future provider are environment variables only.
`ai_model_registry` and `product_allowed_models` store metadata only.

## Inactive / deprecated model behavior

- Global `is_active = false` → hidden from `listPublicProductAllowedModels` (RLS + client filter)
- Global `status = deprecated` → same; hidden from public queries
- Relation `is_active = false` → hidden from user selector
- Admins can still see and reactivate these from the product editor

## Credit cost behavior

Priority order for effective credit cost shown to users:
1. `product_allowed_models.credit_cost_override` (if set)
2. `product.credit_cost` (product default)

Note: the actual credit reservation currently uses `product.credit_cost` from the product data.
To respect the override, `GeneratePage` computes `selectedCreditCost` from the DB model's
`effectiveCreditCost` when DB models are active. This feeds into `reserveCredits`.

## Backfill behavior

Migration 0016 automatically seeds a `product_allowed_models` row for each active product,
linking it to the default active image model from `ai_model_registry` (gemini-image).
This ensures the generate flow works for existing products without manual admin setup.

## Phase 28 implementation

Phase 28 completed the server-side security enforcement.

### What the Edge Function now does

1. **Reads `generation.model_config_id`** from the generation record (set by the client in Phase 27).
2. **If set** → calls `validateRegistryModel(serviceClient, productId, modelConfigId, productCreditCost)`:
   - Checks `product_allowed_models.is_active = true`
   - Checks `ai_model_registry.is_active = true`
   - Checks `ai_model_registry.status IN ('active', 'testing')`
   - Checks `ai_model_registry.modality IN ('image', 'multimodal')`
   - Checks provider is implemented (`gemini` or `openai`)
   - Returns typed error on any failure → `failGenerationAndRefund` before any provider call
3. **If not set** → calls `resolveDefaultRegistryModel` to get the product's default allowed model.
   - If found → uses it
   - If not found → falls back to legacy `model_configs` (backward-compatible path for pre-Phase 27 products)
4. **Server-side credit cost enforcement**: computes `effectiveCreditCost` from `product_allowed_models.credit_cost_override ?? product.credit_cost`. Compares to `generation.credit_cost`. Fails if mismatch.
5. **Provider routing**: uses `effectiveProvider` (from registry) instead of trusting client.
6. **Records**: updates `selected_provider` and `selected_model_key` on completion.

### Client is NOT trusted

The client model selector (Phase 27) is UX-only. The server ignores client-supplied provider/model strings. All routing decisions come from the validated registry record.

### Error codes returned on validation failure

| Code | Meaning |
|---|---|
| `model_not_allowed` | Model not in product_allowed_models or relation.is_active = false |
| `model_inactive` | ai_model_registry.is_active = false or status = deprecated |
| `model_not_configured` | No allowed model exists for this product |
| `unsupported_model_modality` | Model is video/text — not image-compatible |
| `provider_not_configured` | Provider not implemented in Edge Function |
| `credit_cost_mismatch` | Client reserved a different amount than server-derived cost |

All errors trigger `failGenerationAndRefund` — reserved credits are returned before the function exits.
