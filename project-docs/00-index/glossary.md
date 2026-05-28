# Glossary

## creato

The visible brand name for the service.

## creato.mn

The domain context. It should not replace `creato` as the visible brand name.

## Category

A top-level grouping for creative workflows, such as e-commerce, restaurant, fashion, or beauty.

## Preset

A specific creative workflow inside a category. Future presets may require images, options, model choices, and credits.

## Legacy product tables

The physical Supabase tables currently remain `products`, `product_translations`, `product_options`, and `product_option_choices` for MVP compatibility. Public and admin UI terminology is Preset. Migration `0009_preset_naming_aliases.sql` adds non-destructive preset-named views as aliases.

## Public model option

A user-facing tier inside a preset, such as Fast or Premium. Public model options do not expose provider names, model IDs, API keys, or internal routing. The backend maps `model_option` input values to `model_configs.public_option_id` and validates trusted credit cost server-side.

## Credit

The future unit used to consume generation capacity. Current static pricing states that 1 credit equals 990 MNT.

## Generation

Future backend-controlled AI image creation workflow. It is not implemented in Phase 1.
