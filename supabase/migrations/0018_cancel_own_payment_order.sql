-- Phase 31: user self-cancellation of pending payment orders
-- Users can cancel their own pending, uncredited payment orders.
-- No wallet mutation occurs. No admin privilege required.

create or replace function public.cancel_own_payment_order(p_payment_id uuid)
returns table (
  payment_id uuid,
  new_status text
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid;
  v_payment public.payments%rowtype;
begin
  v_user_id := auth.uid();
  if v_user_id is null then
    raise exception 'unauthorized';
  end if;

  select * into v_payment
    from public.payments
   where id = p_payment_id
   for update;

  if not found then
    raise exception 'payment not found';
  end if;

  -- Ownership guard
  if v_payment.user_id <> v_user_id then
    raise exception 'unauthorized: this payment does not belong to you';
  end if;

  -- Status guard: only pending orders can be canceled
  if v_payment.status::text <> 'pending' then
    raise exception 'only pending payment orders can be canceled (status: %)', v_payment.status::text;
  end if;

  -- Credit guard: cannot cancel if already credited
  if v_payment.credited_at is not null then
    raise exception 'credits already applied — cannot cancel';
  end if;

  update public.payments
     set status     = 'canceled',
         updated_by = v_user_id,
         updated_at = now()
   where id = p_payment_id;

  return query select p_payment_id, 'canceled'::text;
end;
$$;

revoke execute on function public.cancel_own_payment_order(uuid) from public, anon;
grant  execute on function public.cancel_own_payment_order(uuid) to authenticated;

comment on function public.cancel_own_payment_order(uuid) is
  'Allows authenticated users to cancel their own pending, uncredited payment orders. '
  'No wallet mutation occurs. Status and ownership are strictly validated.';
