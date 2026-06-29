-- Storage bucket for user-uploaded file bytes.
-- Path convention: {user_id}/{project_id}/{file_id}

insert into storage.buckets (id, name, public)
values ('files', 'files', false)
on conflict (id) do nothing;

-- Policies on storage.objects scoped to the "files" bucket.
-- A path's first segment must equal auth.uid().

drop policy if exists "files bucket: owner select" on storage.objects;
create policy "files bucket: owner select" on storage.objects
  for select
  using (
    bucket_id = 'files'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "files bucket: owner insert" on storage.objects;
create policy "files bucket: owner insert" on storage.objects
  for insert
  with check (
    bucket_id = 'files'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "files bucket: owner update" on storage.objects;
create policy "files bucket: owner update" on storage.objects
  for update
  using (
    bucket_id = 'files'
    and auth.uid()::text = (storage.foldername(name))[1]
  )
  with check (
    bucket_id = 'files'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "files bucket: owner delete" on storage.objects;
create policy "files bucket: owner delete" on storage.objects
  for delete
  using (
    bucket_id = 'files'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
