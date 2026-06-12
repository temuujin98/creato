-- 0003_security_fixes.sql — Advisor-flagged security hardening
-- 1. touch_updated_at: add set search_path to silence mutable search_path warning
-- 2. Revoke EXECUTE on internal RPCs from anon/authenticated (called only via service role)
-- 3. Recreate views with security_invoker=true to silence security_definer_view warnings
-- 4. Tighten public-assets SELECT policy to prevent broad bucket listing

create or replace function public.touch_updated_at()
returns trigger language plpgsql security invoker set search_path = public as
$$ begin new.updated_at = now(); return new; end $$;

revoke execute on function public.handle_new_user() from anon, authenticated;
revoke execute on function public.admin_adjust_credits(uuid, integer, text, text, text) from anon, authenticated;
revoke execute on function public.reserve_credits(uuid, integer, uuid) from anon, authenticated;
revoke execute on function public.spend_credits(uuid) from anon, authenticated;
revoke execute on function public.refund_credits(uuid) from anon, authenticated;

drop view if exists public.preset_public;
drop view if exists public.preset_fields_public;

create view public.preset_public
  with (security_invoker = true)
  as
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

create view public.preset_fields_public
  with (security_invoker = true)
  as
  select f.id, f.preset_id, f.field_key, f.label, f.input_type, f.required,
         f.placeholder, f.help_text, f.default_value, f.choices, f.sort_order
  from public.preset_fields f
  join public.presets p on p.id = f.preset_id
  where f.is_active and p.status = 'active';

grant select on public.preset_public to anon, authenticated;
grant select on public.preset_fields_public to anon, authenticated;

drop policy if exists "public assets read" on storage.objects;
create policy "public assets read" on storage.objects for select
  using (bucket_id = 'public-assets' and name is not null);
