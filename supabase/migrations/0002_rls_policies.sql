-- creato Phase 7 RLS policy draft.
-- Backend service role functions are expected for wallet mutation, payments, uploads, and generation processing.

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role in ('admin', 'super_admin')
      and status = 'active'
  );
$$;

alter table public.profiles enable row level security;
alter table public.wallets enable row level security;
alter table public.wallet_transactions enable row level security;
alter table public.credit_packages enable row level security;
alter table public.payments enable row level security;
alter table public.categories enable row level security;
alter table public.category_translations enable row level security;
alter table public.products enable row level security;
alter table public.product_translations enable row level security;
alter table public.product_options enable row level security;
alter table public.product_option_choices enable row level security;
alter table public.option_translations enable row level security;
alter table public.generations enable row level security;
alter table public.generation_inputs enable row level security;
alter table public.generation_outputs enable row level security;
alter table public.prompt_versions enable row level security;
alter table public.model_configs enable row level security;
alter table public.admin_logs enable row level security;

-- profiles
create policy "Users can select own profile"
on public.profiles for select
to authenticated
using (id = auth.uid());

create policy "Users can update safe own profile fields"
on public.profiles for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid() and role = 'user');

create policy "Admins can manage profiles"
on public.profiles for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- wallets
create policy "Users can select own wallet"
on public.wallets for select
to authenticated
using (user_id = auth.uid());

create policy "Admins can select wallets"
on public.wallets for select
to authenticated
using (public.is_admin());

create policy "Admins can manage wallets"
on public.wallets for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- wallet transactions
create policy "Users can select own wallet transactions"
on public.wallet_transactions for select
to authenticated
using (user_id = auth.uid());

create policy "Admins can manage wallet transactions"
on public.wallet_transactions for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- credit packages
create policy "Public can select active credit packages"
on public.credit_packages for select
to anon, authenticated
using (is_active = true);

create policy "Admins can manage credit packages"
on public.credit_packages for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- payments
create policy "Users can select own payments"
on public.payments for select
to authenticated
using (user_id = auth.uid());

create policy "Admins can manage payments"
on public.payments for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- categories and translations
create policy "Public can select active categories"
on public.categories for select
to anon, authenticated
using (status = 'active');

create policy "Admins can manage categories"
on public.categories for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Public can select active category translations"
on public.category_translations for select
to anon, authenticated
using (
  exists (
    select 1 from public.categories c
    where c.id = category_id and c.status = 'active'
  )
);

create policy "Admins can manage category translations"
on public.category_translations for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- public product catalog
create policy "Public can select active products"
on public.products for select
to anon, authenticated
using (status = 'active');

create policy "Admins can manage products"
on public.products for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Public can select active product translations"
on public.product_translations for select
to anon, authenticated
using (
  exists (
    select 1 from public.products p
    where p.id = product_id and p.status = 'active'
  )
);

create policy "Admins can manage product translations"
on public.product_translations for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Public can select active product options"
on public.product_options for select
to anon, authenticated
using (
  is_active = true
  and exists (
    select 1 from public.products p
    where p.id = product_id and p.status = 'active'
  )
);

create policy "Admins can manage product options"
on public.product_options for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Public can select choices for active options"
on public.product_option_choices for select
to anon, authenticated
using (
  exists (
    select 1
    from public.product_options po
    join public.products p on p.id = po.product_id
    where po.id = option_id
      and po.is_active = true
      and p.status = 'active'
  )
);

create policy "Admins can manage product option choices"
on public.product_option_choices for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Public can select option translations for active options"
on public.option_translations for select
to anon, authenticated
using (
  exists (
    select 1
    from public.product_options po
    join public.products p on p.id = po.product_id
    where po.id = option_id
      and po.is_active = true
      and p.status = 'active'
  )
);

create policy "Admins can manage option translations"
on public.option_translations for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- generations: conservative for Phase 7. Client inserts should later go through backend functions.
create policy "Users can select own generations"
on public.generations for select
to authenticated
using (user_id = auth.uid());

create policy "Admins can manage generations"
on public.generations for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Users can select own generation inputs"
on public.generation_inputs for select
to authenticated
using (
  exists (
    select 1 from public.generations g
    where g.id = generation_id and g.user_id = auth.uid()
  )
);

create policy "Admins can manage generation inputs"
on public.generation_inputs for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Users can select own generation outputs"
on public.generation_outputs for select
to authenticated
using (
  exists (
    select 1 from public.generations g
    where g.id = generation_id and g.user_id = auth.uid()
  )
);

create policy "Admins can manage generation outputs"
on public.generation_outputs for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- Admin-only prompt and provider configuration. No public policies.
create policy "Admins can manage prompt versions"
on public.prompt_versions for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Admins can manage model configs"
on public.model_configs for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Admins can select admin logs"
on public.admin_logs for select
to authenticated
using (public.is_admin());

create policy "Admins can insert admin logs"
on public.admin_logs for insert
to authenticated
with check (public.is_admin());
