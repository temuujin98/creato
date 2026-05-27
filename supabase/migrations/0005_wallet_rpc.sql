-- creato Phase 11.1 transaction-safe wallet RPC draft.
-- These functions keep reserve/refund/spend atomic inside Postgres.
-- They do not implement payment, AI generation, or generation output creation.

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
  v_wallet public.wallets%rowtype;
  v_existing_transaction public.wallet_transactions%rowtype;
  v_transaction_id uuid;
begin
  if auth.uid() is null then
    raise exception 'unauthorized user';
  end if;

  if auth.uid() <> p_user_id and not public.is_admin() then
    raise exception 'unauthorized user';
  end if;

  if p_amount is null or p_amount <= 0 then
    raise exception 'invalid amount';
  end if;

  if p_idempotency_key is null or length(trim(p_idempotency_key)) = 0 then
    raise exception 'idempotency key is required';
  end if;

  select *
  into v_wallet
  from public.wallets
  where user_id = p_user_id
  for update;

  if not found then
    raise exception 'wallet not found';
  end if;

  select *
  into v_existing_transaction
  from public.wallet_transactions
  where idempotency_key = p_idempotency_key;

  if found then
    if v_existing_transaction.status = 'completed' then
      wallet_id := v_wallet.id;
      balance := v_wallet.balance;
      reserved_balance := v_wallet.reserved_balance;
      transaction_id := v_existing_transaction.id;
      return next;
      return;
    end if;

    raise exception 'duplicate idempotency key already exists';
  end if;

  if v_wallet.balance < p_amount then
    raise exception 'insufficient balance';
  end if;

  update public.wallets
  set balance = balance - p_amount,
      reserved_balance = reserved_balance + p_amount
  where id = v_wallet.id
  returning * into v_wallet;

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
    v_wallet.id,
    p_user_id,
    'reserve',
    'completed',
    -p_amount,
    v_wallet.balance,
    p_idempotency_key,
    p_reason,
    jsonb_build_object('reserved_balance_after', v_wallet.reserved_balance)
  )
  returning id into v_transaction_id;

  wallet_id := v_wallet.id;
  balance := v_wallet.balance;
  reserved_balance := v_wallet.reserved_balance;
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
  v_wallet public.wallets%rowtype;
  v_existing_transaction public.wallet_transactions%rowtype;
  v_transaction_id uuid;
begin
  if auth.uid() is null then
    raise exception 'unauthorized user';
  end if;

  if auth.uid() <> p_user_id and not public.is_admin() then
    raise exception 'unauthorized user';
  end if;

  if p_amount is null or p_amount <= 0 then
    raise exception 'invalid amount';
  end if;

  if p_idempotency_key is null or length(trim(p_idempotency_key)) = 0 then
    raise exception 'idempotency key is required';
  end if;

  select *
  into v_wallet
  from public.wallets
  where user_id = p_user_id
  for update;

  if not found then
    raise exception 'wallet not found';
  end if;

  select *
  into v_existing_transaction
  from public.wallet_transactions
  where idempotency_key = p_idempotency_key;

  if found then
    if v_existing_transaction.status = 'completed' then
      wallet_id := v_wallet.id;
      balance := v_wallet.balance;
      reserved_balance := v_wallet.reserved_balance;
      transaction_id := v_existing_transaction.id;
      return next;
      return;
    end if;

    raise exception 'duplicate idempotency key already exists';
  end if;

  if v_wallet.reserved_balance < p_amount then
    raise exception 'insufficient reserved balance';
  end if;

  update public.wallets
  set balance = balance + p_amount,
      reserved_balance = reserved_balance - p_amount
  where id = v_wallet.id
  returning * into v_wallet;

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
    v_wallet.id,
    p_user_id,
    'refund',
    'completed',
    p_amount,
    v_wallet.balance,
    p_idempotency_key,
    p_reason,
    jsonb_build_object('reserved_balance_after', v_wallet.reserved_balance)
  )
  returning id into v_transaction_id;

  wallet_id := v_wallet.id;
  balance := v_wallet.balance;
  reserved_balance := v_wallet.reserved_balance;
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
  v_wallet public.wallets%rowtype;
  v_existing_transaction public.wallet_transactions%rowtype;
  v_transaction_id uuid;
begin
  if auth.uid() is null then
    raise exception 'unauthorized user';
  end if;

  if auth.uid() <> p_user_id and not public.is_admin() then
    raise exception 'unauthorized user';
  end if;

  if p_amount is null or p_amount <= 0 then
    raise exception 'invalid amount';
  end if;

  if p_idempotency_key is null or length(trim(p_idempotency_key)) = 0 then
    raise exception 'idempotency key is required';
  end if;

  select *
  into v_wallet
  from public.wallets
  where user_id = p_user_id
  for update;

  if not found then
    raise exception 'wallet not found';
  end if;

  select *
  into v_existing_transaction
  from public.wallet_transactions
  where idempotency_key = p_idempotency_key;

  if found then
    if v_existing_transaction.status = 'completed' then
      wallet_id := v_wallet.id;
      balance := v_wallet.balance;
      reserved_balance := v_wallet.reserved_balance;
      transaction_id := v_existing_transaction.id;
      return next;
      return;
    end if;

    raise exception 'duplicate idempotency key already exists';
  end if;

  if v_wallet.reserved_balance < p_amount then
    raise exception 'insufficient reserved balance';
  end if;

  update public.wallets
  set reserved_balance = reserved_balance - p_amount
  where id = v_wallet.id
  returning * into v_wallet;

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
    v_wallet.id,
    p_user_id,
    p_generation_id,
    'spend',
    'completed',
    -p_amount,
    v_wallet.balance,
    p_idempotency_key,
    p_reason,
    jsonb_build_object('reserved_balance_after', v_wallet.reserved_balance)
  )
  returning id into v_transaction_id;

  wallet_id := v_wallet.id;
  balance := v_wallet.balance;
  reserved_balance := v_wallet.reserved_balance;
  transaction_id := v_transaction_id;
  return next;
end;
$$;

grant execute on function public.reserve_credits(uuid, integer, text, text) to authenticated;
grant execute on function public.refund_reserved_credits(uuid, integer, text, text) to authenticated;
grant execute on function public.spend_reserved_credits(uuid, uuid, integer, text, text) to authenticated;

comment on function public.reserve_credits(uuid, integer, text, text) is
  'Atomically reserves credits for future generation processing. No AI call is performed.';
comment on function public.refund_reserved_credits(uuid, integer, text, text) is
  'Atomically refunds reserved credits when preparation or generation fails.';
comment on function public.spend_reserved_credits(uuid, uuid, integer, text, text) is
  'Atomically spends reserved credits after generation succeeds. Intended for future backend worker use.';
