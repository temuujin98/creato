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

## Phase 28 plan

- `process-generation` Edge Function validates `model_config_id` from the generation record
- Selected provider/model_key from `ai_model_registry` replaces hardcoded routing
- Video modality gated (returns error if product does not support video)
