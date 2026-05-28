-- creato Phase 15 model option mapping.
-- Public preset model options are safe tier ids such as fast/premium.
-- Provider/model names remain admin-only in model_configs.

alter table public.model_configs
  add column if not exists public_option_id text,
  add column if not exists display_name text,
  add column if not exists is_default boolean not null default false,
  add column if not exists credit_cost_override integer;

alter table public.model_configs
  drop constraint if exists model_configs_public_option_id_format_check;

alter table public.model_configs
  add constraint model_configs_public_option_id_format_check
  check (
    public_option_id is null
    or public_option_id ~ '^[a-z0-9][a-z0-9_-]{0,63}$'
  );

alter table public.model_configs
  drop constraint if exists model_configs_credit_cost_override_check;

alter table public.model_configs
  add constraint model_configs_credit_cost_override_check
  check (credit_cost_override is null or credit_cost_override > 0);

create index if not exists model_configs_product_public_option_active_idx
  on public.model_configs(product_id, public_option_id, is_active);

create unique index if not exists model_configs_one_active_public_option_idx
  on public.model_configs(product_id, public_option_id)
  where is_active = true and public_option_id is not null;

create unique index if not exists model_configs_one_default_active_idx
  on public.model_configs(product_id)
  where is_active = true and is_default = true;

with selected_fast_config as (
  select id
  from public.model_configs
  where product_id = '22222222-2222-4222-8222-222222222201'
    and is_active = true
    and public_option_id is null
  order by created_at desc
  limit 1
)
update public.model_configs config
set public_option_id = 'fast',
    display_name = coalesce(config.display_name, 'Fast'),
    is_default = true,
    credit_cost_override = coalesce(config.credit_cost_override, 1),
    updated_at = now()
from selected_fast_config
where config.id = selected_fast_config.id;

insert into public.model_configs (
  product_id,
  public_option_id,
  display_name,
  is_default,
  credit_cost_override,
  primary_provider,
  primary_model,
  fallback_provider,
  fallback_model,
  output_size,
  output_count,
  retry_limit,
  cleanup_enabled,
  estimated_cost_mnt,
  is_active
)
select
  fast.product_id,
  'premium',
  'Premium',
  false,
  2,
  fast.primary_provider,
  fast.primary_model,
  fast.fallback_provider,
  fast.fallback_model,
  fast.output_size,
  fast.output_count,
  fast.retry_limit,
  fast.cleanup_enabled,
  fast.estimated_cost_mnt,
  true
from public.model_configs fast
where fast.product_id = '22222222-2222-4222-8222-222222222201'
  and fast.public_option_id = 'fast'
  and fast.is_active = true
  and not exists (
    select 1
    from public.model_configs existing
    where existing.product_id = fast.product_id
      and existing.public_option_id = 'premium'
      and existing.is_active = true
  )
limit 1;

comment on column public.model_configs.public_option_id is
  'Safe public tier id, for example fast or premium. Does not expose provider/model identity.';
comment on column public.model_configs.display_name is
  'Admin-facing label for the model config.';
comment on column public.model_configs.is_default is
  'Default active model config when no public model option was submitted.';
comment on column public.model_configs.credit_cost_override is
  'Trusted server-side credit cost for this model option. Null falls back to products.credit_cost.';
