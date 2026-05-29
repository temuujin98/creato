-- Admin generation refund RPC
-- Allows admins to refund credits for a generation, updating wallet balance
-- and inserting a wallet_transaction record.
create or replace function admin_refund_generation(p_generation_id uuid)
returns table(transaction_id uuid, new_status text)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user_id        uuid;
  v_product_id     uuid;
  v_status         text;
  v_credit_cost    integer;
  v_retry_count    integer;
  v_wallet_id      uuid;
  v_reserved       integer;
  v_from_reserved  boolean;
  v_txn_id         uuid;
begin
  -- 1. Admin guard
  if not is_admin() then
    raise exception 'unauthorized: admin required';
  end if;

  -- 2. Fetch generation
  select user_id, product_id, status::text, credit_cost, retry_count
    into v_user_id, v_product_id, v_status, v_credit_cost, v_retry_count
    from generations
   where id = p_generation_id;

  if not found then
    raise exception 'generation not found';
  end if;

  -- 3. Status guards
  if v_status = 'credit_refunded' then
    raise exception 'generation already refunded';
  end if;

  if v_status = 'created' then
    raise exception 'no credits reserved for this generation';
  end if;

  if v_status not in ('failed','credit_reserved','queued','processing','completed','credit_spent','canceled') then
    raise exception 'refund not allowed for this generation status';
  end if;

  -- 6. Double-refund guard
  if exists (
    select 1 from wallet_transactions
     where generation_id = p_generation_id
       and type in ('refund','admin_adjustment')
       and status = 'completed'
  ) then
    raise exception 'refund transaction already exists for this generation';
  end if;

  -- 7. Lock wallet
  select id, reserved_balance into v_wallet_id, v_reserved
    from wallets
   where user_id = v_user_id
   for update;

  if not found then
    raise exception 'wallet not found';
  end if;

  -- 8. Determine path and update wallet
  if v_status = 'credit_spent' or v_reserved < v_credit_cost then
    v_from_reserved := false;
    update wallets
       set balance = balance + v_credit_cost
     where user_id = v_user_id;
  else
    v_from_reserved := true;
    update wallets
       set balance          = balance + v_credit_cost,
           reserved_balance = reserved_balance - v_credit_cost
     where user_id = v_user_id;
  end if;

  -- 9. Insert wallet transaction (wallet_id is NOT NULL — must be included)
  insert into wallet_transactions (
    wallet_id,
    user_id,
    type,
    status,
    amount,
    generation_id,
    created_by
  ) values (
    v_wallet_id,
    v_user_id,
    case when v_from_reserved then 'refund' else 'admin_adjustment' end,
    'completed',
    v_credit_cost,
    p_generation_id,
    auth.uid()
  )
  returning id into v_txn_id;

  -- 10. Update generation status
  update generations
     set status     = 'credit_refunded',
         updated_at = now()
   where id = p_generation_id;

  -- 11. Insert admin log
  insert into admin_logs (
    admin_user_id,
    action,
    entity_type,
    entity_id,
    metadata
  ) values (
    auth.uid(),
    'generation_refund',
    'generation',
    p_generation_id,
    jsonb_build_object(
      'previous_status',       v_status,
      'new_status',            'credit_refunded',
      'credit_amount',         v_credit_cost,
      'from_reserved_balance', v_from_reserved,
      'user_id',               v_user_id,
      'product_id',            v_product_id
    )
  );

  -- 12. Return
  return query select v_txn_id, 'credit_refunded'::text;
end;
$$;

grant execute on function admin_refund_generation(uuid) to authenticated;

comment on function admin_refund_generation(uuid) is
  'Admin-only RPC: refund credits for a generation. '
  'Restores user balance and marks the generation as credit_refunded.';


-- Admin generation retry RPC
-- Allows admins to re-queue a failed generation for reprocessing.
create or replace function admin_queue_generation_retry(p_generation_id uuid)
returns table(new_status text, retry_count integer)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user_id          uuid;
  v_product_id       uuid;
  v_status           text;
  v_retry_count      integer;
  v_new_retry_count  integer;
begin
  -- 1. Admin guard
  if not is_admin() then
    raise exception 'unauthorized: admin required';
  end if;

  -- 2. Fetch generation
  select user_id, product_id, status::text, retry_count
    into v_user_id, v_product_id, v_status, v_retry_count
    from generations
   where id = p_generation_id;

  if not found then
    raise exception 'generation not found';
  end if;

  -- 3. Status guard
  if v_status != 'failed' then
    raise exception 'only failed generations can be retried';
  end if;

  -- 4. Increment retry count
  v_new_retry_count := coalesce(v_retry_count, 0) + 1;

  -- 5. Update generation
  update generations
     set status        = 'credit_reserved',
         retry_count   = v_new_retry_count,
         error_code    = null,
         error_message = null,
         updated_at    = now()
   where id = p_generation_id;

  -- 6. Insert admin log
  insert into admin_logs (
    admin_user_id,
    action,
    entity_type,
    entity_id,
    metadata
  ) values (
    auth.uid(),
    'generation_retry',
    'generation',
    p_generation_id,
    jsonb_build_object(
      'previous_status', 'failed',
      'new_status',      'credit_reserved',
      'retry_count',     v_new_retry_count,
      'user_id',         v_user_id,
      'product_id',      v_product_id
    )
  );

  -- 7. Return
  return query select 'credit_reserved'::text, v_new_retry_count;
end;
$$;

grant execute on function admin_queue_generation_retry(uuid) to authenticated;

comment on function admin_queue_generation_retry(uuid) is
  'Admin-only RPC: re-queue a failed generation for reprocessing. '
  'Resets error fields and bumps retry_count, setting status back to credit_reserved.';
