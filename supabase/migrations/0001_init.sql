-- 0001_init.sql — Creato core schema, RLS, views, RPCs
-- Principle: prompt/model/cost columns are server-only; client reads via views / column grants.

-- ═══════════════ TABLES ═══════════════

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  role text not null default 'user' check (role in ('user','admin')),
  trial_granted boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.wallets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles(id) on delete cascade,
  balance integer not null default 0 check (balance >= 0),
  updated_at timestamptz not null default now()
);

create table public.wallet_transactions (
  id uuid primary key default gen_random_uuid(),
  wallet_id uuid not null references public.wallets(id) on delete cascade,
  amount integer not null,
  type text not null check (type in (
    'trial','purchase','reserve','spend','refund','failed_generation_refund',
    'compensation','manual_topup','bonus','correction','creator_reward','other')),
  status text not null default 'completed' check (status in ('pending','completed','cancelled')),
  generation_id uuid,
  payment_id uuid,
  admin_id uuid references public.profiles(id),
  reason text,
  note text,
  created_at timestamptz not null default now()
);
create index on public.wallet_transactions (wallet_id, created_at desc);
create index on public.wallet_transactions (generation_id);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.presets (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  category_id uuid references public.categories(id) on delete set null,
  -- public columns
  name text not null,
  short_description text,
  full_description text,
  user_guide text,
  thumbnail_url text,
  example_image_urls text[] not null default '{}',
  credit_cost integer not null default 1 check (credit_cost > 0),
  status text not null default 'draft' check (status in ('draft','active','hidden')),
  sort_order integer not null default 0,
  is_featured boolean not null default false,
  is_trending boolean not null default false,
  is_popular boolean not null default false,
  is_new boolean not null default true,
  requires_image boolean not null default false,
  min_image_count integer not null default 0,
  max_image_count integer not null default 0,
  allowed_file_types text[] not null default '{jpg,jpeg,png,webp}',
  max_file_size_mb integer not null default 10,
  upload_guide_text text,
  upload_example_url text,
  allowed_sizes text[] not null default '{1:1}',
  output_count integer not null default 1 check (output_count between 1 and 4),
  -- SERVER-ONLY columns (never exposed to client)
  base_prompt text,
  negative_prompt text,
  prompt_suffix text,
  quality_prompt text,
  cleanup_prompt text,
  internal_note text,
  prompt_version integer not null default 1,
  primary_provider text not null default 'gemini' check (primary_provider in ('gemini','openai')),
  primary_model text,
  fallback_provider text check (fallback_provider in ('gemini','openai')),
  fallback_model text,
  quality_preset text not null default 'standard' check (quality_preset in ('standard','high','premium')),
  retry_limit integer not null default 1 check (retry_limit between 0 and 5),
  cleanup_enabled boolean not null default false,
  estimated_cost numeric,
  credit_auto_calculated integer,
  credit_override boolean not null default false,
  credit_override_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on public.presets (category_id);
create index on public.presets (status, sort_order);

create table public.preset_fields (
  id uuid primary key default gen_random_uuid(),
  preset_id uuid not null references public.presets(id) on delete cascade,
  field_key text not null,
  label text not null,
  input_type text not null check (input_type in
    ('text','textarea','select','radio','checkbox','color','number','image','aspect_ratio')),
  required boolean not null default false,
  placeholder text,
  help_text text,
  default_value text,
  choices jsonb,
  prompt_mapping text, -- SERVER-ONLY
  sort_order integer not null default 0,
  is_active boolean not null default true,
  unique (preset_id, field_key)
);

create table public.generations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  preset_id uuid not null references public.presets(id),
  status text not null default 'processing' check (status in ('processing','completed','failed')),
  user_inputs jsonb not null default '{}',
  input_image_paths text[] not null default '{}',
  output_paths text[] not null default '{}',
  selected_size text,
  output_count integer not null default 1,
  credit_cost integer not null,
  transaction_id uuid,
  -- SERVER-ONLY columns
  compiled_prompt text,
  provider_used text,
  model_used text,
  attempt_count integer not null default 0,
  error_message text,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);
create index on public.generations (user_id, created_at desc);

create table public.homepage_sections (
  id uuid primary key default gen_random_uuid(),
  section_key text not null unique,
  section_type text not null check (section_type in (
    'hero','benefit_strip','featured_presets','how_it_works','showcase',
    'creator_community','business_use_cases','final_cta','faq','custom_content')),
  title text,
  subtitle text,
  is_visible boolean not null default true,
  sort_order integer not null default 0,
  layout_variant text,
  background_variant text,
  cta_label text,
  cta_url text,
  content_source jsonb,
  metadata jsonb,
  publish_at timestamptz,
  updated_at timestamptz not null default now()
);

create table public.credit_packages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  credits integer not null check (credits > 0),
  price_mnt integer not null check (price_mnt >= 0),
  is_org boolean not null default false,
  sort_order integer not null default 0,
  is_active boolean not null default true
);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id),
  package_id uuid references public.credit_packages(id),
  amount_mnt integer not null,
  provider text not null default 'bonum',
  provider_invoice_id text,
  status text not null default 'pending' check (status in ('pending','paid','failed','cancelled')),
  fee_mnt integer not null default 0,
  created_at timestamptz not null default now(),
  paid_at timestamptz
);
create index on public.payments (user_id, created_at desc);

create table public.admin_audit_logs (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid not null references public.profiles(id),
  action text not null,
  target_table text,
  target_id text,
  payload jsonb,
  created_at timestamptz not null default now()
);

-- ═══════════════ HELPERS & TRIGGERS ═══════════════

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as
$$ select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin') $$;

create or replace function public.touch_updated_at()
returns trigger language plpgsql as
$$ begin new.updated_at = now(); return new; end $$;

create trigger trg_profiles_touch before update on public.profiles
  for each row execute function public.touch_updated_at();
create trigger trg_presets_touch before update on public.presets
  for each row execute function public.touch_updated_at();
create trigger trg_homepage_touch before update on public.homepage_sections
  for each row execute function public.touch_updated_at();

-- New user: profile + wallet + 1 trial credit
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare w_id uuid;
begin
  insert into public.profiles (id, email, display_name, trial_granted)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email,'@',1)), true);
  insert into public.wallets (user_id, balance) values (new.id, 1) returning id into w_id;
  insert into public.wallet_transactions (wallet_id, amount, type, status, note)
  values (w_id, 1, 'trial', 'completed', 'Signup trial credit');
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ═══════════════ CREDIT RPCs (SECURITY DEFINER, row-locked) ═══════════════

create or replace function public.reserve_credits(p_user uuid, p_amount integer, p_generation uuid)
returns uuid language plpgsql security definer set search_path = public as $$
declare w record; tx_id uuid;
begin
  if p_amount <= 0 then raise exception 'invalid amount'; end if;
  select * into w from public.wallets where user_id = p_user for update;
  if not found then raise exception 'wallet not found'; end if;
  if w.balance < p_amount then raise exception 'insufficient_credits'; end if;
  update public.wallets set balance = balance - p_amount, updated_at = now() where id = w.id;
  insert into public.wallet_transactions (wallet_id, amount, type, status, generation_id)
  values (w.id, -p_amount, 'reserve', 'pending', p_generation) returning id into tx_id;
  return tx_id;
end $$;

create or replace function public.spend_credits(p_generation uuid)
returns void language plpgsql security definer set search_path = public as $$
declare tx record;
begin
  select * into tx from public.wallet_transactions
   where generation_id = p_generation and type = 'reserve' and status = 'pending'
   for update;
  if not found then raise exception 'no pending reserve for generation %', p_generation; end if;
  update public.wallet_transactions set type = 'spend', status = 'completed' where id = tx.id;
end $$;

create or replace function public.refund_credits(p_generation uuid)
returns void language plpgsql security definer set search_path = public as $$
declare tx record;
begin
  select * into tx from public.wallet_transactions
   where generation_id = p_generation and type = 'reserve' and status = 'pending'
   for update;
  if not found then raise exception 'no pending reserve for generation %', p_generation; end if;
  update public.wallets set balance = balance + abs(tx.amount), updated_at = now() where id = tx.wallet_id;
  update public.wallet_transactions set status = 'cancelled' where id = tx.id;
  insert into public.wallet_transactions (wallet_id, amount, type, status, generation_id)
  values (tx.wallet_id, abs(tx.amount), 'failed_generation_refund', 'completed', p_generation);
end $$;

create or replace function public.admin_adjust_credits(
  p_user uuid, p_amount integer, p_type text, p_reason text, p_note text)
returns uuid language plpgsql security definer set search_path = public as $$
declare w record; tx_id uuid;
begin
  if not public.is_admin() then raise exception 'admin only'; end if;
  if p_type not in ('refund','compensation','manual_topup','bonus','correction','failed_generation_refund','other')
    then raise exception 'invalid adjustment type'; end if;
  if coalesce(trim(p_reason),'') = '' or coalesce(trim(p_note),'') = ''
    then raise exception 'reason and note are required'; end if;
  select * into w from public.wallets where user_id = p_user for update;
  if not found then raise exception 'wallet not found'; end if;
  if w.balance + p_amount < 0 then raise exception 'balance cannot go negative'; end if;
  update public.wallets set balance = balance + p_amount, updated_at = now() where id = w.id;
  insert into public.wallet_transactions (wallet_id, amount, type, status, admin_id, reason, note)
  values (w.id, p_amount, p_type, 'completed', auth.uid(), p_reason, p_note) returning id into tx_id;
  insert into public.admin_audit_logs (admin_id, action, target_table, target_id, payload)
  values (auth.uid(), 'credit_adjustment', 'wallets', w.id::text,
          jsonb_build_object('user_id',p_user,'amount',p_amount,'type',p_type,'reason',p_reason,'note',p_note));
  return tx_id;
end $$;

-- ═══════════════ CLIENT-SAFE VIEWS ═══════════════

create view public.preset_public as
  select p.id, p.slug, p.category_id, c.name as category_name, c.slug as category_slug,
         p.name, p.short_description, p.full_description, p.user_guide,
         p.thumbnail_url, p.example_image_urls, p.credit_cost,
         p.sort_order, p.is_featured, p.is_trending, p.is_popular, p.is_new,
         p.requires_image, p.min_image_count, p.max_image_count,
         p.allowed_file_types, p.max_file_size_mb, p.upload_guide_text, p.upload_example_url,
         p.allowed_sizes, p.output_count
  from public.presets p
  left join public.categories c on c.id = p.category_id
  where p.status = 'active';

create view public.preset_fields_public as
  select f.id, f.preset_id, f.field_key, f.label, f.input_type, f.required,
         f.placeholder, f.help_text, f.default_value, f.choices, f.sort_order
  from public.preset_fields f
  join public.presets p on p.id = f.preset_id
  where f.is_active and p.status = 'active';

-- ═══════════════ PRIVILEGES ═══════════════

-- Lock down server-only tables/columns from API roles
revoke all on public.presets from anon, authenticated;
revoke all on public.preset_fields from anon, authenticated;
revoke all on public.generations from anon, authenticated;
revoke all on public.wallets from anon, authenticated;
revoke all on public.wallet_transactions from anon, authenticated;
revoke all on public.payments from anon, authenticated;
revoke all on public.admin_audit_logs from anon, authenticated;

-- Views: public read
grant select on public.preset_public to anon, authenticated;
grant select on public.preset_fields_public to anon, authenticated;

-- Column-level grants (client must select explicit columns; '*' fails by design)
grant select (id, user_id, preset_id, status, user_inputs, input_image_paths, output_paths,
              selected_size, output_count, credit_cost, created_at, completed_at)
  on public.generations to authenticated;
grant select (id, user_id, balance, updated_at) on public.wallets to authenticated;
grant select (id, wallet_id, amount, type, status, generation_id, created_at)
  on public.wallet_transactions to authenticated;
grant select (id, user_id, package_id, amount_mnt, provider, status, created_at, paid_at)
  on public.payments to authenticated;

-- ═══════════════ RLS ═══════════════

alter table public.profiles enable row level security;
alter table public.wallets enable row level security;
alter table public.wallet_transactions enable row level security;
alter table public.categories enable row level security;
alter table public.presets enable row level security;
alter table public.preset_fields enable row level security;
alter table public.generations enable row level security;
alter table public.homepage_sections enable row level security;
alter table public.credit_packages enable row level security;
alter table public.payments enable row level security;
alter table public.admin_audit_logs enable row level security;

-- profiles
create policy "own profile read" on public.profiles for select using (id = auth.uid() or public.is_admin());
create policy "own profile update" on public.profiles for update using (id = auth.uid()) with check (id = auth.uid() and role = 'user');
create policy "admin profiles all" on public.profiles for all using (public.is_admin());

-- wallets / transactions / payments / generations: own rows read; admin full
create policy "own wallet" on public.wallets for select using (user_id = auth.uid() or public.is_admin());
create policy "own tx" on public.wallet_transactions for select
  using (wallet_id in (select id from public.wallets where user_id = auth.uid()) or public.is_admin());
create policy "own payments" on public.payments for select using (user_id = auth.uid() or public.is_admin());
create policy "own generations" on public.generations for select using (user_id = auth.uid() or public.is_admin());

-- categories: public read active; admin write
create policy "categories read" on public.categories for select using (is_active or public.is_admin());
create policy "categories admin write" on public.categories for all using (public.is_admin());

-- presets / preset_fields: admin only on base tables (clients use views)
create policy "presets admin" on public.presets for all using (public.is_admin());
create policy "preset_fields admin" on public.preset_fields for all using (public.is_admin());

-- homepage_sections: public read visible; admin write
create policy "homepage read" on public.homepage_sections for select
  using ((is_visible and (publish_at is null or publish_at <= now())) or public.is_admin());
create policy "homepage admin write" on public.homepage_sections for all using (public.is_admin());

-- credit_packages: public read active; admin write
create policy "packages read" on public.credit_packages for select using (is_active or public.is_admin());
create policy "packages admin write" on public.credit_packages for all using (public.is_admin());

-- admin_audit_logs: admin read only (insert via RPC)
create policy "audit admin read" on public.admin_audit_logs for select using (public.is_admin());
