-- 0002_storage.sql — buckets + policies

insert into storage.buckets (id, name, public)
values ('public-assets','public-assets', true),
       ('uploads','uploads', false),
       ('outputs','outputs', false)
on conflict (id) do nothing;

-- public-assets: anyone reads; admin writes (preset thumbnails, CMS images)
create policy "public assets read" on storage.objects for select
  using (bucket_id = 'public-assets');
create policy "public assets admin write" on storage.objects for insert
  with check (bucket_id = 'public-assets' and public.is_admin());
create policy "public assets admin update" on storage.objects for update
  using (bucket_id = 'public-assets' and public.is_admin());
create policy "public assets admin delete" on storage.objects for delete
  using (bucket_id = 'public-assets' and public.is_admin());

-- uploads: user writes/reads own folder uploads/{user_id}/...
create policy "uploads own write" on storage.objects for insert
  with check (bucket_id = 'uploads' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "uploads own read" on storage.objects for select
  using (bucket_id = 'uploads' and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin()));
create policy "uploads own delete" on storage.objects for delete
  using (bucket_id = 'uploads' and (storage.foldername(name))[1] = auth.uid()::text);

-- outputs: written by service role only (bypasses RLS); user reads own folder outputs/{user_id}/...
create policy "outputs own read" on storage.objects for select
  using (bucket_id = 'outputs' and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin()));
create policy "outputs own delete" on storage.objects for delete
  using (bucket_id = 'outputs' and (storage.foldername(name))[1] = auth.uid()::text);
