-- Privacy rules (RLS) ran auth.uid() / the is_admin() check once per row. Wrapped in (select ...) so each runs once
-- per query (Postgres InitPlan). Identical access, checked by hashing every visible row for 7 users and anon before
-- and after. Already applied to production on 2026-10-29.
alter policy "pa-files: owner delete" on storage.objects using (((bucket_id = 'paperassistant-files'::text) AND (((select auth.uid()))::text = (storage.foldername(name))[1])));
alter policy "pa-files: owner insert" on storage.objects with check (((bucket_id = 'paperassistant-files'::text) AND (((select auth.uid()))::text = (storage.foldername(name))[1])));
alter policy "pa-files: owner select" on storage.objects using (((bucket_id = 'paperassistant-files'::text) AND (((select auth.uid()))::text = (storage.foldername(name))[1])));
alter policy "pa-files: owner update" on storage.objects using (((bucket_id = 'paperassistant-files'::text) AND (((select auth.uid()))::text = (storage.foldername(name))[1]))) with check (((bucket_id = 'paperassistant-files'::text) AND (((select auth.uid()))::text = (storage.foldername(name))[1])));
