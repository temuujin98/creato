-- Phase 25: extend credit_packages with slug code, badge, featured flag, metadata
-- and seed the four canonical Creato packages.

-- 1. Add new columns (idempotent via IF NOT EXISTS)
alter table public.credit_packages
  add column if not exists code        text,
  add column if not exists description text,
  add column if not exists badge_text  text,
  add column if not exists is_featured boolean not null default false,
  add column if not exists metadata    jsonb   not null default '{}'::jsonb;

-- 2. Back-fill code from name for any pre-existing rows (slug-style)
update public.credit_packages
   set code = lower(regexp_replace(trim(name), '\s+', '-', 'g'))
 where code is null;

-- 3. Make code NOT NULL
alter table public.credit_packages
  alter column code set not null;

-- 4. Unique index so ON CONFLICT (code) works
create unique index if not exists credit_packages_code_idx
  on public.credit_packages(code);

-- 5. Upsert the four canonical packages
insert into public.credit_packages (
  code, name, credits, price_mnt, bonus_credits,
  sort_order, is_active, is_featured, badge_text
) values
  ('starter',  'Starter',    10,   9900, 0, 10, true, false, null),
  ('creator',  'Creator',    25,  22900, 0, 20, true, true,  'Хамгийн тохиромжтой'),
  ('business', 'Business',   60,  49900, 0, 30, true, false, 'Бизнес хэрэглээнд'),
  ('pro',      'Pro',       150, 119000, 0, 40, true, false, 'Их хэрэглээнд')
on conflict (code) do update set
  name        = excluded.name,
  credits     = excluded.credits,
  price_mnt   = excluded.price_mnt,
  sort_order  = excluded.sort_order,
  is_active   = excluded.is_active,
  is_featured = excluded.is_featured,
  badge_text  = excluded.badge_text,
  updated_at  = now();

comment on column public.credit_packages.code is
  'Slug-style unique identifier (e.g. starter, creator, business, pro).';
comment on column public.credit_packages.is_featured is
  'Whether this package is highlighted in the pricing UI.';
comment on column public.credit_packages.badge_text is
  'Short promotional badge shown on the pricing card.';
