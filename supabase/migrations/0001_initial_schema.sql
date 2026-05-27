-- creato Phase 7 initial schema draft.
-- This migration is a planning draft and does not seed production data.

create extension if not exists "pgcrypto";

create type public.user_role as enum ('user', 'admin', 'super_admin');
create type public.product_status as enum ('draft', 'active', 'hidden');
create type public.payment_status as enum ('pending', 'paid', 'failed', 'canceled', 'refunded');
create type public.payment_provider as enum ('qpay', 'manual', 'other');
create type public.wallet_transaction_type as enum (
  'purchase',
  'bonus',
  'reserve',
  'spend',
  'refund',
  'admin_adjustment',
  'expiry'
);
create type public.wallet_transaction_status as enum ('pending', 'completed', 'failed', 'canceled');
create type public.generation_status as enum (
  'created',
  'credit_reserved',
  'queued',
  'processing',
  'completed',
  'failed',
  'credit_spent',
  'credit_refunded',
  'canceled'
);
create type public.ai_provider as enum ('gemini', 'openai');
create type public.generation_input_type as enum ('upload', 'option', 'text');
create type public.generation_output_type as enum ('image');

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  role public.user_role not null default 'user',
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.wallets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles(id) on delete cascade,
  balance integer not null default 0 check (balance >= 0),
  reserved_balance integer not null default 0 check (reserved_balance >= 0),
  lifetime_credits_purchased integer not null default 0 check (lifetime_credits_purchased >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.wallet_transactions (
  id uuid primary key default gen_random_uuid(),
  wallet_id uuid not null references public.wallets(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  generation_id uuid,
  payment_id uuid,
  type public.wallet_transaction_type not null,
  status public.wallet_transaction_status not null default 'completed',
  amount integer not null,
  balance_after integer,
  idempotency_key text unique,
  reason text,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.credit_packages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  credits integer not null check (credits > 0),
  bonus_credits integer not null default 0 check (bonus_credits >= 0),
  price_mnt numeric(12,2) not null check (price_mnt >= 0),
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  credit_package_id uuid references public.credit_packages(id) on delete set null,
  provider public.payment_provider not null,
  status public.payment_status not null default 'pending',
  amount_mnt numeric(12,2) not null check (amount_mnt >= 0),
  provider_reference text,
  provider_payload jsonb not null default '{}'::jsonb,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  status public.product_status not null default 'active',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.category_translations (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories(id) on delete cascade,
  locale text not null,
  name text not null,
  description text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (category_id, locale)
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories(id) on delete restrict,
  slug text not null unique,
  thumbnail_url text,
  credit_cost integer not null default 1 check (credit_cost > 0),
  status public.product_status not null default 'draft',
  sort_order integer not null default 0,
  is_featured boolean not null default false,
  is_trending boolean not null default false,
  is_popular boolean not null default false,
  is_new boolean not null default false,
  requires_image boolean not null default false,
  min_images integer not null default 0 check (min_images >= 0),
  max_images integer not null default 0 check (max_images >= 0),
  enable_options boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (max_images >= min_images)
);

create table public.product_translations (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  locale text not null,
  name text not null,
  short_description text not null,
  description text not null,
  guide text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (product_id, locale)
);

create table public.product_options (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  key text not null,
  input_type text not null,
  required boolean not null default false,
  placeholder text,
  help_text text,
  default_value text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (product_id, key)
);

create table public.product_option_choices (
  id uuid primary key default gen_random_uuid(),
  option_id uuid not null references public.product_options(id) on delete cascade,
  label text not null,
  value text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (option_id, value)
);

create table public.option_translations (
  id uuid primary key default gen_random_uuid(),
  option_id uuid not null references public.product_options(id) on delete cascade,
  locale text not null,
  label text not null,
  placeholder text,
  help_text text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (option_id, locale)
);

create table public.generations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  status public.generation_status not null default 'created',
  credit_cost integer not null check (credit_cost > 0),
  provider public.ai_provider,
  model text,
  retry_count integer not null default 0 check (retry_count >= 0),
  error_code text,
  error_message text,
  metadata jsonb not null default '{}'::jsonb,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.generation_inputs (
  id uuid primary key default gen_random_uuid(),
  generation_id uuid not null references public.generations(id) on delete cascade,
  input_type public.generation_input_type not null,
  storage_path text,
  option_key text,
  option_value text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.generation_outputs (
  id uuid primary key default gen_random_uuid(),
  generation_id uuid not null references public.generations(id) on delete cascade,
  output_type public.generation_output_type not null default 'image',
  storage_path text not null,
  public_url text,
  width integer check (width is null or width > 0),
  height integer check (height is null or height > 0),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.prompt_versions (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  version integer not null check (version > 0),
  base_prompt text not null,
  negative_prompt text,
  prompt_suffix text,
  quality_prompt text,
  artifact_cleanup_prompt text,
  internal_note text,
  is_active boolean not null default false,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (product_id, version)
);

create table public.model_configs (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  primary_provider public.ai_provider not null,
  primary_model text not null,
  fallback_provider public.ai_provider,
  fallback_model text,
  output_size text,
  output_count integer not null default 1 check (output_count > 0),
  retry_limit integer not null default 1 check (retry_limit >= 0),
  cleanup_enabled boolean not null default false,
  estimated_cost_mnt numeric(12,2) check (estimated_cost_mnt is null or estimated_cost_mnt >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.admin_logs (
  id uuid primary key default gen_random_uuid(),
  admin_user_id uuid not null references public.profiles(id) on delete restrict,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.wallet_transactions
  add constraint wallet_transactions_generation_id_fkey
  foreign key (generation_id) references public.generations(id) on delete set null;

alter table public.wallet_transactions
  add constraint wallet_transactions_payment_id_fkey
  foreign key (payment_id) references public.payments(id) on delete set null;

create trigger set_profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger set_wallets_updated_at before update on public.wallets
  for each row execute function public.set_updated_at();
create trigger set_credit_packages_updated_at before update on public.credit_packages
  for each row execute function public.set_updated_at();
create trigger set_payments_updated_at before update on public.payments
  for each row execute function public.set_updated_at();
create trigger set_categories_updated_at before update on public.categories
  for each row execute function public.set_updated_at();
create trigger set_category_translations_updated_at before update on public.category_translations
  for each row execute function public.set_updated_at();
create trigger set_products_updated_at before update on public.products
  for each row execute function public.set_updated_at();
create trigger set_product_translations_updated_at before update on public.product_translations
  for each row execute function public.set_updated_at();
create trigger set_product_options_updated_at before update on public.product_options
  for each row execute function public.set_updated_at();
create trigger set_product_option_choices_updated_at before update on public.product_option_choices
  for each row execute function public.set_updated_at();
create trigger set_option_translations_updated_at before update on public.option_translations
  for each row execute function public.set_updated_at();
create trigger set_generations_updated_at before update on public.generations
  for each row execute function public.set_updated_at();
create trigger set_model_configs_updated_at before update on public.model_configs
  for each row execute function public.set_updated_at();

create index profiles_role_idx on public.profiles(role);
create index wallet_transactions_user_created_idx on public.wallet_transactions(user_id, created_at desc);
create index wallet_transactions_wallet_created_idx on public.wallet_transactions(wallet_id, created_at desc);
create index payments_user_status_idx on public.payments(user_id, status);
create index categories_status_sort_idx on public.categories(status, sort_order);
create index category_translations_locale_idx on public.category_translations(locale);
create index products_category_status_sort_idx on public.products(category_id, status, sort_order);
create index products_status_flags_idx on public.products(status, is_featured, is_popular);
create index product_translations_locale_idx on public.product_translations(locale);
create index product_options_product_sort_idx on public.product_options(product_id, sort_order);
create index product_option_choices_option_sort_idx on public.product_option_choices(option_id, sort_order);
create index generations_user_created_idx on public.generations(user_id, created_at desc);
create index generations_status_created_idx on public.generations(status, created_at desc);
create index generation_inputs_generation_idx on public.generation_inputs(generation_id);
create index generation_outputs_generation_idx on public.generation_outputs(generation_id);
create index prompt_versions_product_active_idx on public.prompt_versions(product_id, is_active);
create index model_configs_product_active_idx on public.model_configs(product_id, is_active);
create index admin_logs_admin_created_idx on public.admin_logs(admin_user_id, created_at desc);

comment on table public.prompt_versions is 'Admin-only prompt templates. Do not expose to public client APIs.';
comment on table public.model_configs is 'Admin-only provider/model routing config. API keys must not be stored here.';
comment on table public.wallet_transactions is 'Immutable wallet ledger. Never mutate wallet balance without a corresponding transaction row.';
