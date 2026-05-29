-- Phase 26: global AI model registry
--
-- NOTE: model_configs (0001_initial_schema.sql) is the product-level routing table
-- where each product references its primary/fallback provider+model.
-- ai_model_registry is the global catalog of available providers and models
-- that admins manage. These are two separate concerns.

create table if not exists public.ai_model_registry (
  id                       uuid primary key default gen_random_uuid(),
  provider                 text not null,
  model_key                text not null,
  display_name             text not null,
  description              text,
  modality                 text not null default 'image'
    check (modality in ('image', 'video', 'text', 'multimodal')),
  status                   text not null default 'active'
    check (status in ('active', 'inactive', 'testing', 'deprecated')),
  connection_status        text not null default 'unknown'
    check (connection_status in ('connected', 'not_configured', 'error', 'unknown')),
  is_active                boolean not null default true,
  is_default               boolean not null default false,
  is_premium               boolean not null default false,
  supports_image_input     boolean not null default false,
  supports_text_prompt     boolean not null default true,
  supports_aspect_ratio    boolean not null default true,
  supports_multiple_outputs boolean not null default false,
  max_outputs              integer not null default 1 check (max_outputs > 0),
  default_output_count     integer not null default 1 check (default_output_count > 0),
  default_aspect_ratio     text,
  default_output_size      text,
  cost_per_generation_mnt  integer check (cost_per_generation_mnt  is null or cost_per_generation_mnt  >= 0),
  cost_per_input_image_mnt integer check (cost_per_input_image_mnt is null or cost_per_input_image_mnt >= 0),
  cost_per_output_mnt      integer check (cost_per_output_mnt      is null or cost_per_output_mnt      >= 0),
  estimated_cost_note      text,
  sort_order               integer not null default 0,
  metadata                 jsonb   not null default '{}'::jsonb,
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now(),
  constraint ai_model_registry_provider_model_key_key unique (provider, model_key),
  constraint ai_model_registry_output_count_le_max
    check (default_output_count <= max_outputs)
);

-- Updated_at trigger
create trigger set_ai_model_registry_updated_at
  before update on public.ai_model_registry
  for each row execute function public.set_updated_at();

-- Index for ordered listing
create index if not exists ai_model_registry_sort_idx
  on public.ai_model_registry(sort_order, created_at);

-- RLS
alter table public.ai_model_registry enable row level security;

create policy "Admins can manage ai model registry"
on public.ai_model_registry for all
to authenticated
using  ((select public.is_admin()))
with check ((select public.is_admin()));

-- Public/client read: active models only (safe fields returned by lib query)
create policy "Public can read active ai models"
on public.ai_model_registry for select
to anon, authenticated
using (is_active = true);

-- Seed the initial model catalog
insert into public.ai_model_registry (
  provider, model_key, display_name, description, modality, status,
  connection_status, is_active, is_default, is_premium,
  supports_image_input, supports_text_prompt, supports_aspect_ratio,
  supports_multiple_outputs, max_outputs, default_output_count,
  default_aspect_ratio, default_output_size, cost_per_generation_mnt,
  sort_order
) values
  ( 'gemini', 'gemini-image',
    'Gemini Image',
    'Default fast image generation model',
    'image', 'active', 'unknown', true, true, false,
    true, true, true, false, 1, 1, '1:1', '1024x1024', 241, 10 ),

  ( 'openai', 'gpt-image',
    'OpenAI GPT-image',
    'Premium/fallback image generation model',
    'image', 'active', 'unknown', true, false, true,
    true, true, true, true, 4, 1, '1:1', '1024x1024', null, 20 ),

  ( 'future', 'video-placeholder',
    'Video generation placeholder',
    'Reserved for future video generation support',
    'video', 'inactive', 'not_configured', false, false, true,
    true, true, true, false, 1, 1, null, null, null, 90 )

on conflict (provider, model_key) do update set
  display_name              = excluded.display_name,
  description               = excluded.description,
  modality                  = excluded.modality,
  status                    = excluded.status,
  connection_status         = excluded.connection_status,
  is_active                 = excluded.is_active,
  is_default                = excluded.is_default,
  is_premium                = excluded.is_premium,
  supports_image_input      = excluded.supports_image_input,
  supports_text_prompt      = excluded.supports_text_prompt,
  supports_aspect_ratio     = excluded.supports_aspect_ratio,
  supports_multiple_outputs = excluded.supports_multiple_outputs,
  max_outputs               = excluded.max_outputs,
  default_output_count      = excluded.default_output_count,
  default_aspect_ratio      = excluded.default_aspect_ratio,
  default_output_size       = excluded.default_output_size,
  cost_per_generation_mnt   = excluded.cost_per_generation_mnt,
  sort_order                = excluded.sort_order,
  updated_at                = now();

comment on table public.ai_model_registry is
  'Global catalog of AI providers and models available in the system. '
  'Distinct from model_configs (product-level routing). '
  'API keys must NOT be stored here — env-vars only.';
