-- 0004_view_access_fix.sql
-- security_invoker views require invoker privileges on base tables.
-- Grant ONLY public columns + RLS row filter; server-only columns stay inaccessible.

-- presets: public columns only (base_prompt, negative_prompt, prompt_suffix, quality_prompt,
-- cleanup_prompt, internal_note, provider/model config, costs are NOT granted)
grant select (id, slug, category_id, name, short_description, full_description, user_guide,
  thumbnail_url, example_image_urls, credit_cost, status, sort_order,
  is_featured, is_trending, is_popular, is_new,
  requires_image, min_image_count, max_image_count,
  allowed_file_types, max_file_size_mb, upload_guide_text, upload_example_url,
  allowed_sizes, output_count, created_at)
  on public.presets to anon, authenticated;

drop policy if exists "presets public read active" on public.presets;
create policy "presets public read active" on public.presets
  for select using (status = 'active');

-- preset_fields: all columns except prompt_mapping
grant select (id, preset_id, field_key, label, input_type, required,
  placeholder, help_text, default_value, choices, sort_order, is_active)
  on public.preset_fields to anon, authenticated;

drop policy if exists "preset_fields public read active" on public.preset_fields;
create policy "preset_fields public read active" on public.preset_fields
  for select using (
    is_active and exists (
      select 1 from public.presets p where p.id = preset_id and p.status = 'active'));

-- Credit RPC hardening: default EXECUTE is granted to PUBLIC — revoke everywhere,
-- then grant only what's needed. reserve/spend/refund = server (service_role) only;
-- admin_adjust_credits = authenticated (checks is_admin() internally).
revoke execute on function public.reserve_credits(uuid,integer,uuid) from public, anon, authenticated;
revoke execute on function public.spend_credits(uuid) from public, anon, authenticated;
revoke execute on function public.refund_credits(uuid) from public, anon, authenticated;
revoke execute on function public.admin_adjust_credits(uuid,integer,text,text,text) from public, anon;
grant execute on function public.reserve_credits(uuid,integer,uuid) to service_role;
grant execute on function public.spend_credits(uuid) to service_role;
grant execute on function public.refund_credits(uuid) to service_role;
grant execute on function public.admin_adjust_credits(uuid,integer,text,text,text) to authenticated, service_role;
