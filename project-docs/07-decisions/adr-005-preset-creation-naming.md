# ADR-005: Preset and Creation Naming

## Status

Accepted

## Decision

Public catalog workflows are called Presets. Generated user outputs are called Creations.

Header navigation uses the short label Image for the image preset library. Page titles may still use Image Presets when the extra context is helpful.

## Database Naming Strategy

The MVP keeps legacy physical Supabase table and column names such as `products` and `product_id` to avoid a high-risk rename across RLS policies, migrations, seeds, Edge Functions, and existing generation records.

Migration `0009_preset_naming_aliases.sql` adds non-destructive preset-named views:

- `presets`
- `preset_translations`
- `preset_options`
- `preset_option_choices`

These views are aliases only. A full physical rename can happen after MVP stabilization with a dedicated compatibility plan.

## Model Option Boundary

Presets may expose public model options such as Fast or Premium. These are user-facing tiers only.

Public model options must not include:

- Provider names.
- Provider model IDs.
- API keys.
- Hidden routing config.
- Internal provider cost.

The backend maps submitted `model_option` values to `model_configs.public_option_id`. It must validate trusted credit cost server-side before generation. Frontend credit display is only a UX hint.
