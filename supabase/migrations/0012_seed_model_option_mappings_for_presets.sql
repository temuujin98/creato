-- creato 0012: Seed prompt_versions and model_configs for presets.
-- Targets: clean-studio-product-shot (2201), luxury-product-ad (2202), food-highlight-poster (2205).
-- Real AI generation remains disabled (ENABLE_REAL_AI_GENERATION is not set).
-- No provider API keys, no Gemini calls, no secret exposure.
-- Safe to run more than once (conflict guards on all inserts).

-- ============================================================
-- 1. Prompt versions (admin-only, never exposed to public API)
-- ============================================================

insert into public.prompt_versions (
  product_id, version, base_prompt, negative_prompt, prompt_suffix,
  quality_prompt, internal_note, is_active
)
values
  (
    '22222222-2222-4222-8222-222222222201', 1,
    'Professional studio product photograph. Clean white or light grey background. Soft even lighting with subtle shadow. Product centered, sharp focus, e-commerce ready.',
    'cluttered background, harsh shadows, blurry, distorted, text overlay, watermark',
    'high-resolution, commercial quality',
    'ultra sharp, 8k detail, professional product photography',
    'v1 seed for clean-studio-product-shot. Placeholder — refine after real generation testing.',
    true
  ),
  (
    '22222222-2222-4222-8222-222222222202', 1,
    'Luxury product advertisement. Cinematic lighting, rich dark tones with accent highlights. Premium materials visible. Campaign-ready composition.',
    'cheap look, flat lighting, cluttered, text overlay, watermark, low quality',
    'cinematic, premium advertising campaign',
    'ultra sharp, 8k detail, luxury brand photography',
    'v1 seed for luxury-product-ad. Placeholder — refine after real generation testing.',
    true
  ),
  (
    '22222222-2222-4222-8222-222222222205', 1,
    'Food highlight poster. Appetizing overhead or 45-degree angle shot. Warm inviting lighting, shallow depth of field. Restaurant menu quality.',
    'unappetizing, cold lighting, cluttered table, text overlay, watermark, low quality',
    'food photography, menu poster',
    'ultra sharp, appetizing colors, professional food photography',
    'v1 seed for food-highlight-poster. Placeholder — refine after real generation testing.',
    true
  )
on conflict (product_id, version) do update
set base_prompt = excluded.base_prompt,
    negative_prompt = excluded.negative_prompt,
    prompt_suffix = excluded.prompt_suffix,
    quality_prompt = excluded.quality_prompt,
    internal_note = excluded.internal_note,
    is_active = excluded.is_active;

-- ============================================================
-- 2. Model configs: fast + premium for each preset
-- ============================================================
-- primary_provider/primary_model are required NOT NULL columns.
-- We use 'gemini' enum value + a safe placeholder model name.
-- These do NOT trigger real API calls (ENABLE_REAL_AI_GENERATION guards that).

-- 2a. clean-studio-product-shot (2201) — fast
insert into public.model_configs (
  product_id, public_option_id, display_name, is_default,
  credit_cost_override, primary_provider, primary_model,
  output_size, output_count, retry_limit, cleanup_enabled,
  estimated_cost_mnt, is_active
)
values (
  '22222222-2222-4222-8222-222222222201',
  'fast', 'Fast', true,
  1, 'gemini', 'imagen-3.0-generate-002',
  '1024x1024', 1, 1, false,
  990, true
)
on conflict on constraint model_configs_one_active_public_option_idx
do update
set display_name = excluded.display_name,
    is_default = excluded.is_default,
    credit_cost_override = excluded.credit_cost_override,
    updated_at = now();

-- 2b. clean-studio-product-shot (2201) — premium
insert into public.model_configs (
  product_id, public_option_id, display_name, is_default,
  credit_cost_override, primary_provider, primary_model,
  output_size, output_count, retry_limit, cleanup_enabled,
  estimated_cost_mnt, is_active
)
values (
  '22222222-2222-4222-8222-222222222201',
  'premium', 'Premium', false,
  2, 'gemini', 'imagen-3.0-generate-002',
  '1024x1024', 1, 2, false,
  1980, true
)
on conflict on constraint model_configs_one_active_public_option_idx
do update
set display_name = excluded.display_name,
    is_default = excluded.is_default,
    credit_cost_override = excluded.credit_cost_override,
    updated_at = now();

-- 2c. luxury-product-ad (2202) — fast
insert into public.model_configs (
  product_id, public_option_id, display_name, is_default,
  credit_cost_override, primary_provider, primary_model,
  output_size, output_count, retry_limit, cleanup_enabled,
  estimated_cost_mnt, is_active
)
values (
  '22222222-2222-4222-8222-222222222202',
  'fast', 'Fast', true,
  1, 'gemini', 'imagen-3.0-generate-002',
  '1024x1024', 1, 1, false,
  990, true
)
on conflict on constraint model_configs_one_active_public_option_idx
do update
set display_name = excluded.display_name,
    is_default = excluded.is_default,
    credit_cost_override = excluded.credit_cost_override,
    updated_at = now();

-- 2d. luxury-product-ad (2202) — premium
insert into public.model_configs (
  product_id, public_option_id, display_name, is_default,
  credit_cost_override, primary_provider, primary_model,
  output_size, output_count, retry_limit, cleanup_enabled,
  estimated_cost_mnt, is_active
)
values (
  '22222222-2222-4222-8222-222222222202',
  'premium', 'Premium', false,
  2, 'gemini', 'imagen-3.0-generate-002',
  '1024x1024', 1, 2, false,
  1980, true
)
on conflict on constraint model_configs_one_active_public_option_idx
do update
set display_name = excluded.display_name,
    is_default = excluded.is_default,
    credit_cost_override = excluded.credit_cost_override,
    updated_at = now();

-- 2e. food-highlight-poster (2205) — fast
insert into public.model_configs (
  product_id, public_option_id, display_name, is_default,
  credit_cost_override, primary_provider, primary_model,
  output_size, output_count, retry_limit, cleanup_enabled,
  estimated_cost_mnt, is_active
)
values (
  '22222222-2222-4222-8222-222222222205',
  'fast', 'Fast', true,
  1, 'gemini', 'imagen-3.0-generate-002',
  '1024x1024', 1, 1, false,
  990, true
)
on conflict on constraint model_configs_one_active_public_option_idx
do update
set display_name = excluded.display_name,
    is_default = excluded.is_default,
    credit_cost_override = excluded.credit_cost_override,
    updated_at = now();

-- 2f. food-highlight-poster (2205) — premium
insert into public.model_configs (
  product_id, public_option_id, display_name, is_default,
  credit_cost_override, primary_provider, primary_model,
  output_size, output_count, retry_limit, cleanup_enabled,
  estimated_cost_mnt, is_active
)
values (
  '22222222-2222-4222-8222-222222222205',
  'premium', 'Premium', false,
  2, 'gemini', 'imagen-3.0-generate-002',
  '1024x1024', 1, 2, false,
  1980, true
)
on conflict on constraint model_configs_one_active_public_option_idx
do update
set display_name = excluded.display_name,
    is_default = excluded.is_default,
    credit_cost_override = excluded.credit_cost_override,
    updated_at = now();
