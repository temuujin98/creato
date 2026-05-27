-- Allow server-side Edge Function settlement calls to use wallet RPCs safely.
-- Normal browser clients still need auth.uid() = p_user_id or admin role.

create or replace function public.is_service_role()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(current_setting('request.jwt.claim.role', true), '') = 'service_role'
    or coalesce(current_setting('role', true), '') = 'service_role';
$$;

create or replace function public.reserve_credits(
  p_user_id uuid,
  p_amount integer,
  p_idempotency_key text,
  p_reason text default null
)
returns table (
  wallet_id uuid,
  balance integer,
  reserved_balance integer,
  transaction_id uuid
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_wallet_id uuid;
  v_balance integer;
  v_reserved_balance integer;
  v_existing_transaction_id uuid;
  v_existing_transaction_status public.wallet_transaction_status;
  v_transaction_id uuid;
begin
  if auth.uid() is null and not public.is_service_role() then
    raise exception 'unauthorized user';
  end if;

  if not (
    auth.uid() = p_user_id
    or public.is_admin()
    or public.is_service_role()
  ) then
    raise exception 'unauthorized user';
  end if;

  if p_amount is null or p_amount <= 0 then
    raise exception 'invalid amount';
  end if;

  if p_idempotency_key is null or length(trim(p_idempotency_key)) = 0 then
    raise exception 'idempotency key is required';
  end if;

  select w.id, w.balance, w.reserved_balance
  into v_wallet_id, v_balance, v_reserved_balance
  from public.wallets as w
  where w.user_id = p_user_id
  for update;

  if not found then
    raise exception 'wallet not found';
  end if;

  select wt.id, wt.status
  into v_existing_transaction_id, v_existing_transaction_status
  from public.wallet_transactions as wt
  where wt.idempotency_key = p_idempotency_key;

  if found then
    if v_existing_transaction_status = 'completed' then
      wallet_id := v_wallet_id;
      balance := v_balance;
      reserved_balance := v_reserved_balance;
      transaction_id := v_existing_transaction_id;
      return next;
      return;
    end if;

    raise exception 'duplicate idempotency key already exists';
  end if;

  if v_balance < p_amount then
    raise exception 'insufficient balance';
  end if;

  update public.wallets as w
  set balance = w.balance - p_amount,
      reserved_balance = w.reserved_balance + p_amount
  where w.id = v_wallet_id
  returning w.id, w.balance, w.reserved_balance
  into v_wallet_id, v_balance, v_reserved_balance;

  insert into public.wallet_transactions (
    wallet_id,
    user_id,
    type,
    status,
    amount,
    balance_after,
    idempotency_key,
    reason,
    metadata
  )
  values (
    v_wallet_id,
    p_user_id,
    'reserve',
    'completed',
    -p_amount,
    v_balance,
    p_idempotency_key,
    p_reason,
    jsonb_build_object('reserved_balance_after', v_reserved_balance)
  )
  returning public.wallet_transactions.id into v_transaction_id;

  wallet_id := v_wallet_id;
  balance := v_balance;
  reserved_balance := v_reserved_balance;
  transaction_id := v_transaction_id;
  return next;
end;
$$;

create or replace function public.refund_reserved_credits(
  p_user_id uuid,
  p_amount integer,
  p_idempotency_key text,
  p_reason text default null
)
returns table (
  wallet_id uuid,
  balance integer,
  reserved_balance integer,
  transaction_id uuid
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_wallet_id uuid;
  v_balance integer;
  v_reserved_balance integer;
  v_existing_transaction_id uuid;
  v_existing_transaction_status public.wallet_transaction_status;
  v_transaction_id uuid;
begin
  if auth.uid() is null and not public.is_service_role() then
    raise exception 'unauthorized user';
  end if;

  if not (
    auth.uid() = p_user_id
    or public.is_admin()
    or public.is_service_role()
  ) then
    raise exception 'unauthorized user';
  end if;

  if p_amount is null or p_amount <= 0 then
    raise exception 'invalid amount';
  end if;

  if p_idempotency_key is null or length(trim(p_idempotency_key)) = 0 then
    raise exception 'idempotency key is required';
  end if;

  select w.id, w.balance, w.reserved_balance
  into v_wallet_id, v_balance, v_reserved_balance
  from public.wallets as w
  where w.user_id = p_user_id
  for update;

  if not found then
    raise exception 'wallet not found';
  end if;

  select wt.id, wt.status
  into v_existing_transaction_id, v_existing_transaction_status
  from public.wallet_transactions as wt
  where wt.idempotency_key = p_idempotency_key;

  if found then
    if v_existing_transaction_status = 'completed' then
      wallet_id := v_wallet_id;
      balance := v_balance;
      reserved_balance := v_reserved_balance;
      transaction_id := v_existing_transaction_id;
      return next;
      return;
    end if;

    raise exception 'duplicate idempotency key already exists';
  end if;

  if v_reserved_balance < p_amount then
    raise exception 'insufficient reserved balance';
  end if;

  update public.wallets as w
  set balance = w.balance + p_amount,
      reserved_balance = w.reserved_balance - p_amount
  where w.id = v_wallet_id
  returning w.id, w.balance, w.reserved_balance
  into v_wallet_id, v_balance, v_reserved_balance;

  insert into public.wallet_transactions (
    wallet_id,
    user_id,
    type,
    status,
    amount,
    balance_after,
    idempotency_key,
    reason,
    metadata
  )
  values (
    v_wallet_id,
    p_user_id,
    'refund',
    'completed',
    p_amount,
    v_balance,
    p_idempotency_key,
    p_reason,
    jsonb_build_object('reserved_balance_after', v_reserved_balance)
  )
  returning public.wallet_transactions.id into v_transaction_id;

  wallet_id := v_wallet_id;
  balance := v_balance;
  reserved_balance := v_reserved_balance;
  transaction_id := v_transaction_id;
  return next;
end;
$$;

create or replace function public.spend_reserved_credits(
  p_user_id uuid,
  p_generation_id uuid,
  p_amount integer,
  p_idempotency_key text,
  p_reason text default null
)
returns table (
  wallet_id uuid,
  balance integer,
  reserved_balance integer,
  transaction_id uuid
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_wallet_id uuid;
  v_balance integer;
  v_reserved_balance integer;
  v_existing_transaction_id uuid;
  v_existing_transaction_status public.wallet_transaction_status;
  v_transaction_id uuid;
begin
  if auth.uid() is null and not public.is_service_role() then
    raise exception 'unauthorized user';
  end if;

  if not (
    auth.uid() = p_user_id
    or public.is_admin()
    or public.is_service_role()
  ) then
    raise exception 'unauthorized user';
  end if;

  if p_amount is null or p_amount <= 0 then
    raise exception 'invalid amount';
  end if;

  if p_idempotency_key is null or length(trim(p_idempotency_key)) = 0 then
    raise exception 'idempotency key is required';
  end if;

  select w.id, w.balance, w.reserved_balance
  into v_wallet_id, v_balance, v_reserved_balance
  from public.wallets as w
  where w.user_id = p_user_id
  for update;

  if not found then
    raise exception 'wallet not found';
  end if;

  select wt.id, wt.status
  into v_existing_transaction_id, v_existing_transaction_status
  from public.wallet_transactions as wt
  where wt.idempotency_key = p_idempotency_key;

  if found then
    if v_existing_transaction_status = 'completed' then
      wallet_id := v_wallet_id;
      balance := v_balance;
      reserved_balance := v_reserved_balance;
      transaction_id := v_existing_transaction_id;
      return next;
      return;
    end if;

    raise exception 'duplicate idempotency key already exists';
  end if;

  if v_reserved_balance < p_amount then
    raise exception 'insufficient reserved balance';
  end if;

  update public.wallets as w
  set reserved_balance = w.reserved_balance - p_amount
  where w.id = v_wallet_id
  returning w.id, w.balance, w.reserved_balance
  into v_wallet_id, v_balance, v_reserved_balance;

  insert into public.wallet_transactions (
    wallet_id,
    user_id,
    generation_id,
    type,
    status,
    amount,
    balance_after,
    idempotency_key,
    reason,
    metadata
  )
  values (
    v_wallet_id,
    p_user_id,
    p_generation_id,
    'spend',
    'completed',
    -p_amount,
    v_balance,
    p_idempotency_key,
    p_reason,
    jsonb_build_object('reserved_balance_after', v_reserved_balance)
  )
  returning public.wallet_transactions.id into v_transaction_id;

  wallet_id := v_wallet_id;
  balance := v_balance;
  reserved_balance := v_reserved_balance;
  transaction_id := v_transaction_id;
  return next;
end;
$$;

grant execute on function public.is_service_role() to authenticated, service_role;
grant execute on function public.reserve_credits(uuid, integer, text, text) to authenticated, service_role;
grant execute on function public.refund_reserved_credits(uuid, integer, text, text) to authenticated, service_role;
grant execute on function public.spend_reserved_credits(uuid, uuid, integer, text, text) to authenticated, service_role;

comment on function public.is_service_role() is
  'Returns true only for Supabase service_role JWT/session context used by server runtimes.';
comment on function public.reserve_credits(uuid, integer, text, text) is
  'Atomically reserves credits. Browser callers must own the wallet or be admin; server service_role may settle backend flows.';
comment on function public.refund_reserved_credits(uuid, integer, text, text) is
  'Atomically refunds reserved credits. Browser callers must own the wallet or be admin; server service_role may settle backend flows.';
comment on function public.spend_reserved_credits(uuid, uuid, integer, text, text) is
  'Atomically spends reserved credits after generation succeeds. Intended for backend worker or Edge Function settlement.';
