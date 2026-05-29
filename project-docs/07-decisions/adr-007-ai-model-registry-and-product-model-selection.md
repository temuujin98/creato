# ADR-007: AI Model Registry and Product-Level Model Selection

**Date:** 2026-05-29
**Status:** Accepted

## Context

Creato uses AI providers (Gemini, OpenAI) to generate images. As the product grows:
- New providers and models will be added.
- Different products (presets) may be allowed to use only specific models.
- Users may eventually choose a model within a product's allowed set.
- Cost visibility and provider management are admin concerns.

Two separate tables handle model configuration at different levels.

## The two tables

### 1. `model_configs` (product-level routing)
Created in `0001_initial_schema.sql`. Each row links a **product** to its
`primary_provider + primary_model` and optional fallback. Used by the generation
pipeline to select the right provider at runtime.

### 2. `ai_model_registry` (global catalog)
Created in `0015_model_configs_registry.sql`. A global list of all known
AI providers and models. Stores metadata: modality, status, cost estimates,
capability flags, connection status. Managed exclusively by admins.

These are separate concerns; the tables do not overlap.

## Design decisions

### API keys
API keys for Gemini, OpenAI, and any future provider **must never be stored in
the database**. They live in server-side environment variables only.
`ai_model_registry` stores metadata and cost estimates, not credentials.

### model_configs vs ai_model_registry join
In Phase 27, `model_configs.primary_provider + primary_model` may be linked to
`ai_model_registry` via `(provider, model_key)`. This join is optional and will
be enforced with a soft reference, not a FK (providers can change without
breaking product configs).

### Connection status
In Phase 26, `connection_status` in `ai_model_registry` is set manually by
admins. Automated health-check pinging will be added as a server-side Edge
Function in a later phase.

### Product-level allowed models (Phase 27)
A future `product_allowed_models` join table will limit which registry entries
are usable by a given product. Schema sketch:
```
product_allowed_models (
  product_id   uuid FK products,
  registry_id  uuid FK ai_model_registry,
  sort_order   integer,
  primary key (product_id, registry_id)
)
```

### User model selection
Users will only see models that:
1. Are in `ai_model_registry` with `is_active = true`.
2. Are listed in `product_allowed_models` for the selected product.
3. Have matching capability flags (e.g. `supports_image_input` if the flow requires image upload).

This keeps the public surface minimal and prevents users from accessing
inactive or deprecated models.

### Inactive/deprecated models
Setting `is_active = false` or `status = deprecated` immediately hides a model
from public selection. Existing product configs referencing that model are
flagged in the product readiness check but not automatically broken.

## Consequences

- Phase 26: admins can manage the global model registry via `/admin/model-settings`.
- Phase 27: `product_allowed_models` join table + product editor UI for model assignment.
- Phase 28+: user-facing model selector for products that expose the choice.
- API keys remain env-var-only at all phases.
