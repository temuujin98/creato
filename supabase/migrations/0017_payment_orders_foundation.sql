-- Phase 30: payment order foundation
-- The payments table, payment_status enum, and payment_provider enum already exist
-- from migration 0001. This migration extends them with snapshot/lifecycle columns
-- and adds three server-side RPCs for safe payment lifecycle management.

-- ─── 1. Extend enums ─────────────────────────────────────────────────────────

-- Add 'expired' to payment_status (idempotent via IF NOT EXISTS)
alter type public.payment_status add value if not exists 'expired';

-- Add future provider values for forward compatibility
alter type public.payment_provider add value if not exists 'bonum';
alter type public.payment_provider add value if not exists 'pocket';
alter type public.payment_provider add value if not exists 'storepay';

-- ─── 2. Extend payments table ────────────────────────────────────────────────

-- Snapshot fields (populated by create_payment_order RPC)
alter table public.payments
  add column if not exists package_code  text,
  add column if not exists package_name  text,
  add column if not exists credits       integer,
  add column if not exists currency      text not null default 'MNT',
  add column if not exists expires_at    timestamptz,
  add column if not exists credited_at   timestamptz,
  add column if not exists updated_by    uuid references public.profiles(id) on delete set null,
  add column if not exists metadata      jsonb not null default '{}'::jsonb;

-- ─── 3. Additional indexes ───────────────────────────────────────────────────

create index if not exists payments_status_created_idx
  on public.payments(status, created_at desc);

create index if not exists payments_credited_at_idx
  on public.payments(credited_at)
  where credited_at is not null;

create index if not exists payments_expires_at_idx
  on public.payments(expires_at)
  where expires_at is not null;

-- ─── 4. RPC: create_payment_order ────────────────────────────────────────────
-- Authenticated users create a pending payment order for a credit package.
-- Package values are snapshotted server-side so client cannot manipulate price/credits.

create or replace function public.create_payment_order(p_package_id uuid)
returns table (
  id          uuid,
  credits     integer,
  amount_mnt  numeric,
  package_code text,
  package_name text,
  status      text,
  expires_at  timestamptz,
  created_at  timestamptz
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid;
  v_pkg     public.credit_packages%rowtype;
  v_pay_id  uuid;
begin
  v_user_id := auth.uid();
  if v_user_id is null then
    raise exception 'unauthorized';
  end if;

  select * into v_pkg
    from public.credit_packages
   where id = p_package_id
     and is_active = true;

  if not found then
    raise exception 'credit package not found or inactive';
  end if;

  insert into public.payments (
    user_id,
    credit_package_id,
    package_code,
    package_name,
    credits,
    amount_mnt,
    currency,
    provider,
    status,
    expires_at,
    updated_by,
    provider_payload
  ) values (
    v_user_id,
    v_pkg.id,
    v_pkg.code,
    v_pkg.name,
    v_pkg.credits,
    v_pkg.price_mnt,
    'MNT',
    'manual',
    'pending',
    now() + interval '24 hours',
    v_user_id,
    '{}'::jsonb
  )
  returning payments.id into v_pay_id;

  return query
    select
      p.id,
      p.credits,
      p.amount_mnt,
      p.package_code,
      p.package_name,
      p.status::text,
      p.expires_at,
      p.created_at
    from public.payments p
   where p.id = v_pay_id;
end;
$$;

revoke execute on function public.create_payment_order(uuid) from public, anon;
grant  execute on function public.create_payment_order(uuid) to authenticated;

-- ─── 5. RPC: admin_mark_payment_paid ─────────────────────────────────────────
-- Admin-only. Transitions a pending payment to paid, credits the user wallet,
-- and inserts a purchase wallet_transaction. Double-credit protected.

create or replace function public.admin_mark_payment_paid(p_payment_id uuid)
returns table (
  payment_id     uuid,
  new_status     text,
  credits_added  integer,
  transaction_id uuid
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_payment   public.payments%rowtype;
  v_wallet_id uuid;
  v_txn_id    uuid;
begin
  if not public.is_admin() then
    raise exception 'unauthorized: admin required';
  end if;

  select * into v_payment
    from public.payments
   where id = p_payment_id
   for update;

  if not found then
    raise exception 'payment not found';
  end if;

  if v_payment.status::text <> 'pending' then
    raise exception 'only pending payments can be marked paid (current status: %)', v_payment.status::text;
  end if;

  -- Double-credit guard: credited_at timestamp
  if v_payment.credited_at is not null then
    raise exception 'credits already applied for this payment';
  end if;

  -- Double-credit guard: existing purchase transaction
  if exists (
    select 1
      from public.wallet_transactions
     where payment_id = p_payment_id
       and type = 'purchase'
       and status = 'completed'
  ) then
    raise exception 'purchase transaction already exists for this payment';
  end if;

  if v_payment.credits is null or v_payment.credits <= 0 then
    raise exception 'payment has invalid or missing credits value';
  end if;

  -- Lock and update wallet
  select id into v_wallet_id
    from public.wallets
   where user_id = v_payment.user_id
   for update;

  if not found then
    raise exception 'user wallet not found';
  end if;

  update public.wallets
     set balance                    = balance + v_payment.credits,
         lifetime_credits_purchased = lifetime_credits_purchased + v_payment.credits,
         updated_at                 = now()
   where id = v_wallet_id;

  insert into public.wallet_transactions (
    wallet_id,
    user_id,
    payment_id,
    type,
    status,
    amount,
    created_by
  ) values (
    v_wallet_id,
    v_payment.user_id,
    p_payment_id,
    'purchase',
    'completed',
    v_payment.credits,
    auth.uid()
  )
  returning id into v_txn_id;

  update public.payments
     set status      = 'paid',
         paid_at     = now(),
         credited_at = now(),
         updated_by  = auth.uid(),
         updated_at  = now()
   where id = p_payment_id;

  insert into public.admin_logs (
    admin_user_id,
    action,
    entity_type,
    entity_id,
    metadata
  ) values (
    auth.uid(),
    'payment_marked_paid',
    'payment',
    p_payment_id,
    jsonb_build_object(
      'user_id',        v_payment.user_id,
      'credits',        v_payment.credits,
      'amount_mnt',     v_payment.amount_mnt,
      'package_code',   v_payment.package_code,
      'transaction_id', v_txn_id
    )
  );

  return query select p_payment_id, 'paid'::text, v_payment.credits, v_txn_id;
end;
$$;

revoke execute on function public.admin_mark_payment_paid(uuid) from public, anon;
grant  execute on function public.admin_mark_payment_paid(uuid) to authenticated;

-- ─── 6. RPC: admin_cancel_payment ────────────────────────────────────────────
-- Admin-only. Cancels a pending/failed/expired payment order.

create or replace function public.admin_cancel_payment(p_payment_id uuid)
returns table (
  payment_id uuid,
  new_status text
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_payment public.payments%rowtype;
begin
  if not public.is_admin() then
    raise exception 'unauthorized: admin required';
  end if;

  select * into v_payment
    from public.payments
   where id = p_payment_id
   for update;

  if not found then
    raise exception 'payment not found';
  end if;

  if v_payment.status::text in ('paid', 'refunded') then
    raise exception 'cannot cancel a paid or refunded payment';
  end if;

  if v_payment.credited_at is not null then
    raise exception 'credits already applied — cannot cancel';
  end if;

  update public.payments
     set status     = 'canceled',
         updated_by = auth.uid(),
         updated_at = now()
   where id = p_payment_id;

  insert into public.admin_logs (
    admin_user_id,
    action,
    entity_type,
    entity_id,
    metadata
  ) values (
    auth.uid(),
    'payment_canceled',
    'payment',
    p_payment_id,
    jsonb_build_object(
      'previous_status', v_payment.status::text,
      'user_id',         v_payment.user_id,
      'package_code',    v_payment.package_code
    )
  );

  return query select p_payment_id, 'canceled'::text;
end;
$$;

revoke execute on function public.admin_cancel_payment(uuid) from public, anon;
grant  execute on function public.admin_cancel_payment(uuid) to authenticated;

-- ─── 7. Comments ─────────────────────────────────────────────────────────────

comment on function public.create_payment_order(uuid) is
  'Creates a pending payment order for the authenticated user. '
  'Snapshots package code, name, credits, and amount server-side to prevent client manipulation.';

comment on function public.admin_mark_payment_paid(uuid) is
  'Admin-only: marks a pending payment as paid and credits the user wallet. '
  'Double-credit protected via credited_at check and wallet_transaction deduplication.';

comment on function public.admin_cancel_payment(uuid) is
  'Admin-only: cancels a pending, failed, or expired payment order.';

comment on column public.payments.package_code is
  'Snapshot of credit_packages.code at order creation time.';

comment on column public.payments.package_name is
  'Snapshot of credit_packages.name at order creation time.';

comment on column public.payments.credits is
  'Snapshot of credit_packages.credits at order creation time.';

comment on column public.payments.credited_at is
  'Timestamp when credits were applied to the user wallet. Null means not yet credited.';

comment on column public.payments.expires_at is
  'Timestamp when this pending payment order expires.';
