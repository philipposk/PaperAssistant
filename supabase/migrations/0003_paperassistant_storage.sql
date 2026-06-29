-- Storage bucket for PaperAssistant file blobs. Per-app bucket name so
-- sibling apps on the shared 6x7 platform project can't collide.
-- Path convention: {user_id}/{project_id}/{file_id}.

insert into storage.buckets (id, name, public)
values ('paperassistant-files', 'paperassistant-files', false)
on conflict (id) do nothing;

drop policy if exists "pa-files: owner select" on storage.objects;
create policy "pa-files: owner select" on storage.objects
  for select
  using (
    bucket_id = 'paperassistant-files'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "pa-files: owner insert" on storage.objects;
create policy "pa-files: owner insert" on storage.objects
  for insert
  with check (
    bucket_id = 'paperassistant-files'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "pa-files: owner update" on storage.objects;
create policy "pa-files: owner update" on storage.objects
  for update
  using (
    bucket_id = 'paperassistant-files'
    and auth.uid()::text = (storage.foldername(name))[1]
  )
  with check (
    bucket_id = 'paperassistant-files'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "pa-files: owner delete" on storage.objects;
create policy "pa-files: owner delete" on storage.objects
  for delete
  using (
    bucket_id = 'paperassistant-files'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
