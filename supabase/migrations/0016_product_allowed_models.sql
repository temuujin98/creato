-- Phase 27: product_allowed_models — connects products to the global ai_model_registry.
-- Also adds model selection tracking columns to generations.

-- ─── product_allowed_models ───────────────────────────────────────────────────

create table if not exists public.product_allowed_models (
  id                   uuid primary key default gen_random_uuid(),
  product_id           uuid not null references public.products(id) on delete cascade,
  model_config_id      uuid not null references public.ai_model_registry(id) on delete cascade,
  is_default           boolean not null default false,
  is_active            boolean not null default true,
  is_premium_override  boolean,
  credit_cost_override integer check (credit_cost_override is null or credit_cost_override >= 0),
  sort_order           integer not null default 0,
  admin_note           text,
  metadata             jsonb not null default '{}'::jsonb,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),
  constraint product_allowed_models_product_model_key unique (product_id, model_config_id)
);

create trigger set_product_allowed_models_updated_at
  before update on public.product_allowed_models
  for each row execute function public.set_updated_at();

create index if not exists product_allowed_models_product_idx
  on public.product_allowed_models(product_id, is_active, is_default);

-- Only one default active model per product (enforced in app + advisory DB index)
create unique index if not exists product_allowed_models_one_default_idx
  on public.product_allowed_models(product_id)
  where is_default = true and is_active = true;

-- RLS
alter table public.product_allowed_models enable row level security;

create policy "Admins can manage product allowed models"
on public.product_allowed_models for all
to authenticated
using  ((select public.is_admin()))
with check ((select public.is_admin()));

-- Public read: only active relations whose registry model is active
create policy "Public can read active product allowed models"
on public.product_allowed_models for select
to anon, authenticated
using (
  is_active = true
  and exists (
    select 1 from public.ai_model_registry r
    where r.id = model_config_id
      and r.is_active = true
      and r.status in ('active', 'testing')
  )
);

-- ─── generations: model selection tracking ────────────────────────────────────
-- Nullable — no backfill needed; existing rows keep null.

alter table public.generations
  add column if not exists model_config_id    uuid references public.ai_model_registry(id),
  add column if not exists selected_provider  text,
  add column if not exists selected_model_key text;

create index if not exists generations_model_config_idx
  on public.generations(model_config_id)
  where model_config_id is not null;

-- ─── Backfill: assign default global model to existing active products ─────────

insert into public.product_allowed_models (
  product_id, model_config_id, is_default, is_active, sort_order
)
select
  p.id,
  r.id,
  true,
  true,
  10
from
  public.products p
cross join (
  select id from public.ai_model_registry
  where is_active = true
    and is_default = true
    and modality = 'image'
  order by sort_order
  limit 1
) r
where p.status = 'active'
  and not exists (
    select 1 from public.product_allowed_models pam
    where pam.product_id = p.id
  );

comment on table public.product_allowed_models is
  'Per-product registry of allowed AI models from ai_model_registry. '
  'Controls which models users can select during generation for each product.';
