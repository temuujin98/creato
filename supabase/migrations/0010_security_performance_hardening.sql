-- creato focused Supabase hardening.
-- Keeps current app flows intact while reducing exposed RPC and advisor noise.
-- No table/data drops, no physical preset/product renames, no provider changes.

-- 1) Harden function search paths against caller-controlled search_path.
alter function public.is_admin()
  set search_path = public, pg_temp;

alter function public.is_service_role()
  set search_path = public, pg_temp;

alter function public.reserve_credits(uuid, integer, text, text)
  set search_path = public, pg_temp;

alter function public.refund_reserved_credits(uuid, integer, text, text)
  set search_path = public, pg_temp;

alter function public.spend_reserved_credits(uuid, uuid, integer, text, text)
  set search_path = public, pg_temp;

alter function public.set_updated_at()
  set search_path = public, pg_temp;

-- 2) Tighten RPC execute grants.
-- PUBLIC implicitly included anon/authenticated/service_role before this phase.
revoke execute on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated, service_role;

revoke execute on function public.is_service_role() from public, anon, authenticated;
grant execute on function public.is_service_role() to service_role;

revoke execute on function public.reserve_credits(uuid, integer, text, text) from public, anon;
grant execute on function public.reserve_credits(uuid, integer, text, text) to authenticated, service_role;

revoke execute on function public.refund_reserved_credits(uuid, integer, text, text) from public, anon;
grant execute on function public.refund_reserved_credits(uuid, integer, text, text) to authenticated, service_role;

-- Current frontend does not call spend_reserved_credits; Edge Function/service role settles spend.
revoke execute on function public.spend_reserved_credits(uuid, uuid, integer, text, text)
  from public, anon, authenticated;
grant execute on function public.spend_reserved_credits(uuid, uuid, integer, text, text) to service_role;

-- Trigger-only helper should not be exposed as a public RPC.
revoke execute on function public.set_updated_at() from public, anon, authenticated;
grant execute on function public.set_updated_at() to service_role;

-- 3) Add covering indexes for advisor-reported foreign keys.
create index if not exists generations_product_id_idx
  on public.generations(product_id);

create index if not exists payments_credit_package_id_idx
  on public.payments(credit_package_id);

create index if not exists prompt_versions_created_by_idx
  on public.prompt_versions(created_by);

create index if not exists wallet_transactions_created_by_idx
  on public.wallet_transactions(created_by);

create index if not exists wallet_transactions_generation_id_idx
  on public.wallet_transactions(generation_id);

create index if not exists wallet_transactions_payment_id_idx
  on public.wallet_transactions(payment_id);

-- 4) Reduce product-assets bucket listing exposure.
-- The bucket itself remains public, so direct object URLs continue to work.
drop policy if exists "Public can read product assets" on storage.objects;

-- 5) Low-risk RLS init-plan optimization: wrap auth.uid()/is_admin() calls in SELECT.
-- Public catalog policies remain intentionally permissive for active catalog rows.
alter policy "Users can select own profile"
on public.profiles
using (id = (select auth.uid()));

alter policy "Users can update safe own profile fields"
on public.profiles
using (id = (select auth.uid()))
with check (id = (select auth.uid()) and role = 'user');

alter policy "Admins can manage profiles"
on public.profiles
using ((select public.is_admin()))
with check ((select public.is_admin()));

alter policy "Users can select own wallet"
on public.wallets
using (user_id = (select auth.uid()));

alter policy "Admins can select wallets"
on public.wallets
using ((select public.is_admin()));

alter policy "Admins can manage wallets"
on public.wallets
using ((select public.is_admin()))
with check ((select public.is_admin()));

alter policy "Users can select own wallet transactions"
on public.wallet_transactions
using (user_id = (select auth.uid()));

alter policy "Admins can manage wallet transactions"
on public.wallet_transactions
using ((select public.is_admin()))
with check ((select public.is_admin()));

alter policy "Admins can manage credit packages"
on public.credit_packages
using ((select public.is_admin()))
with check ((select public.is_admin()));

alter policy "Users can select own payments"
on public.payments
using (user_id = (select auth.uid()));

alter policy "Admins can manage payments"
on public.payments
using ((select public.is_admin()))
with check ((select public.is_admin()));

alter policy "Admins can manage categories"
on public.categories
using ((select public.is_admin()))
with check ((select public.is_admin()));

alter policy "Admins can manage category translations"
on public.category_translations
using ((select public.is_admin()))
with check ((select public.is_admin()));

alter policy "Admins can manage products"
on public.products
using ((select public.is_admin()))
with check ((select public.is_admin()));

alter policy "Admins can manage product translations"
on public.product_translations
using ((select public.is_admin()))
with check ((select public.is_admin()));

alter policy "Admins can manage product options"
on public.product_options
using ((select public.is_admin()))
with check ((select public.is_admin()));

alter policy "Admins can manage product option choices"
on public.product_option_choices
using ((select public.is_admin()))
with check ((select public.is_admin()));

alter policy "Admins can manage option translations"
on public.option_translations
using ((select public.is_admin()))
with check ((select public.is_admin()));

alter policy "Users can select own generations"
on public.generations
using (user_id = (select auth.uid()));

alter policy "Admins can manage generations"
on public.generations
using ((select public.is_admin()))
with check ((select public.is_admin()));

alter policy "Users can select own generation inputs"
on public.generation_inputs
using (
  exists (
    select 1
    from public.generations g
    where g.id = generation_id
      and g.user_id = (select auth.uid())
  )
);

alter policy "Admins can manage generation inputs"
on public.generation_inputs
using ((select public.is_admin()))
with check ((select public.is_admin()));

alter policy "Users can select own generation outputs"
on public.generation_outputs
using (
  exists (
    select 1
    from public.generations g
    where g.id = generation_id
      and g.user_id = (select auth.uid())
  )
);

alter policy "Admins can manage generation outputs"
on public.generation_outputs
using ((select public.is_admin()))
with check ((select public.is_admin()));

alter policy "Admins can manage prompt versions"
on public.prompt_versions
using ((select public.is_admin()))
with check ((select public.is_admin()));

alter policy "Admins can manage model configs"
on public.model_configs
using ((select public.is_admin()))
with check ((select public.is_admin()));

alter policy "Admins can select admin logs"
on public.admin_logs
using ((select public.is_admin()));

alter policy "Admins can insert admin logs"
on public.admin_logs
with check ((select public.is_admin()));

-- Storage policies with low-risk auth/is_admin init-plan optimization.
alter policy "Admins can manage product assets"
on storage.objects
using (bucket_id = 'product-assets' and (select public.is_admin()))
with check (bucket_id = 'product-assets' and (select public.is_admin()));

alter policy "Admins can manage all uploads"
on storage.objects
using (bucket_id = 'user-uploads' and (select public.is_admin()))
with check (bucket_id = 'user-uploads' and (select public.is_admin()));

alter policy "Admins can manage all generation outputs"
on storage.objects
using (bucket_id = 'generation-outputs' and (select public.is_admin()))
with check (bucket_id = 'generation-outputs' and (select public.is_admin()));

alter policy "Users can upload own files"
on storage.objects
with check (
  bucket_id = 'user-uploads'
  and (storage.foldername(name))[1] = 'users'
  and (storage.foldername(name))[2] = (select auth.uid())::text
);

alter policy "Users can read own uploads"
on storage.objects
using (
  bucket_id = 'user-uploads'
  and (storage.foldername(name))[1] = 'users'
  and (storage.foldername(name))[2] = (select auth.uid())::text
);

alter policy "Users can update own uploads"
on storage.objects
using (
  bucket_id = 'user-uploads'
  and (storage.foldername(name))[1] = 'users'
  and (storage.foldername(name))[2] = (select auth.uid())::text
)
with check (
  bucket_id = 'user-uploads'
  and (storage.foldername(name))[1] = 'users'
  and (storage.foldername(name))[2] = (select auth.uid())::text
);

alter policy "Users can delete own uploads"
on storage.objects
using (
  bucket_id = 'user-uploads'
  and (storage.foldername(name))[1] = 'users'
  and (storage.foldername(name))[2] = (select auth.uid())::text
);

alter policy "Users can read own generation outputs"
on storage.objects
using (
  bucket_id = 'generation-outputs'
  and (storage.foldername(name))[1] = 'users'
  and (storage.foldername(name))[2] = (select auth.uid())::text
);

comment on function public.is_admin() is
  'Admin role helper for RLS policies. Execute is limited to authenticated/service_role.';

comment on function public.is_service_role() is
  'Service role helper for backend wallet settlement. Execute is limited to service_role.';

comment on function public.spend_reserved_credits(uuid, uuid, integer, text, text) is
  'Atomically spends reserved credits after generation succeeds. Execute is limited to service_role.';
