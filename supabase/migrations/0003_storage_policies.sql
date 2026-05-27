-- creato Phase 7 Supabase Storage policy draft.
-- Private files should be served through signed URLs. Backend writes should use service role.

insert into storage.buckets (id, name, public)
values
  ('user-uploads', 'user-uploads', false),
  ('generation-outputs', 'generation-outputs', false),
  ('product-assets', 'product-assets', true)
on conflict (id) do nothing;

-- user-uploads path convention:
-- users/{userId}/uploads/{file}
create policy "Users can read own uploads"
on storage.objects for select
to authenticated
using (
  bucket_id = 'user-uploads'
  and (storage.foldername(name))[1] = 'users'
  and (storage.foldername(name))[2] = auth.uid()::text
);

create policy "Users can upload own files"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'user-uploads'
  and (storage.foldername(name))[1] = 'users'
  and (storage.foldername(name))[2] = auth.uid()::text
);

create policy "Users can update own uploads"
on storage.objects for update
to authenticated
using (
  bucket_id = 'user-uploads'
  and (storage.foldername(name))[1] = 'users'
  and (storage.foldername(name))[2] = auth.uid()::text
)
with check (
  bucket_id = 'user-uploads'
  and (storage.foldername(name))[1] = 'users'
  and (storage.foldername(name))[2] = auth.uid()::text
);

create policy "Users can delete own uploads"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'user-uploads'
  and (storage.foldername(name))[1] = 'users'
  and (storage.foldername(name))[2] = auth.uid()::text
);

create policy "Admins can manage all uploads"
on storage.objects for all
to authenticated
using (bucket_id = 'user-uploads' and public.is_admin())
with check (bucket_id = 'user-uploads' and public.is_admin());

-- generation-outputs path convention:
-- users/{userId}/generations/{generationId}/outputs/{file}
-- Backend/service role should write generated outputs after validating generation ownership.
create policy "Users can read own generation outputs"
on storage.objects for select
to authenticated
using (
  bucket_id = 'generation-outputs'
  and (storage.foldername(name))[1] = 'users'
  and (storage.foldername(name))[2] = auth.uid()::text
);

create policy "Admins can manage all generation outputs"
on storage.objects for all
to authenticated
using (bucket_id = 'generation-outputs' and public.is_admin())
with check (bucket_id = 'generation-outputs' and public.is_admin());

-- product-assets can be public for thumbnails and examples. Writes stay admin-only.
create policy "Public can read product assets"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'product-assets');

create policy "Admins can manage product assets"
on storage.objects for all
to authenticated
using (bucket_id = 'product-assets' and public.is_admin())
with check (bucket_id = 'product-assets' and public.is_admin());

-- Notes:
-- 1. The backend must enforce path conventions before creating signed upload URLs.
-- 2. Service role bypasses RLS and must only run in trusted backend environments.
-- 3. Never expose SUPABASE_SERVICE_ROLE_KEY to browser/client code.
