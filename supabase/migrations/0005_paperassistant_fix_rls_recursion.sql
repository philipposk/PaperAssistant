-- Fix: infinite recursion in PaperAssistant RLS (Postgres 42P17).
--
-- The original 0002 policies check membership with an inline
--   `exists (select 1 from project_members ...)`
-- subquery. When that subquery runs against project_members, it re-triggers
-- project_members' OWN select policy, which runs the same subquery again ->
-- infinite recursion. Because files/notes/references/highlights/projects all
-- probe project_members the same way, every table in the schema returned
-- `500 infinite recursion detected in policy for relation "project_members"`.
--
-- Canonical Supabase fix: do the membership lookup inside SECURITY DEFINER
-- functions. A definer function runs as its owner and bypasses RLS, so the
-- lookup never re-enters the policy -> no recursion. All policies then call
-- these helpers instead of inlining the subquery.

-- ===== membership helpers (SECURITY DEFINER -> bypass RLS) =====
create or replace function paperassistant.is_project_member(pid uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from paperassistant.project_members pm
     where pm.project_id = pid and pm.user_id = auth.uid()
  );
$$;

create or replace function paperassistant.is_project_editor(pid uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from paperassistant.project_members pm
     where pm.project_id = pid and pm.user_id = auth.uid()
       and pm.role in ('owner', 'editor')
  );
$$;

create or replace function paperassistant.is_project_owner(pid uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from paperassistant.project_members pm
     where pm.project_id = pid and pm.user_id = auth.uid()
       and pm.role = 'owner'
  );
$$;

grant execute on function paperassistant.is_project_member(uuid)  to anon, authenticated;
grant execute on function paperassistant.is_project_editor(uuid)  to anon, authenticated;
grant execute on function paperassistant.is_project_owner(uuid)   to anon, authenticated;

-- ===== project_members (the recursive table) =====
drop policy if exists "pm: member select" on paperassistant.project_members;
create policy "pm: member select" on paperassistant.project_members
  for select using (
    user_id = auth.uid() or paperassistant.is_project_member(project_id)
  );

drop policy if exists "pm: owner write" on paperassistant.project_members;
create policy "pm: owner write" on paperassistant.project_members
  for all using (paperassistant.is_project_owner(project_id))
          with check (paperassistant.is_project_owner(project_id));

-- ===== project_invites =====
drop policy if exists "inv: owner all" on paperassistant.project_invites;
create policy "inv: owner all" on paperassistant.project_invites
  for all using (paperassistant.is_project_owner(project_id))
          with check (paperassistant.is_project_owner(project_id));
-- "inv: by-token select" does not touch project_members; left as-is.

-- ===== projects =====
drop policy if exists "projects: member select" on paperassistant.projects;
create policy "projects: member select" on paperassistant.projects
  for select using (
    user_id = auth.uid() or paperassistant.is_project_member(id)
  );

drop policy if exists "projects: editor update" on paperassistant.projects;
create policy "projects: editor update" on paperassistant.projects
  for update using (paperassistant.is_project_editor(id))
            with check (paperassistant.is_project_editor(id));

drop policy if exists "projects: owner delete" on paperassistant.projects;
create policy "projects: owner delete" on paperassistant.projects
  for delete using (paperassistant.is_project_owner(id));
-- "projects: owner write" (insert) uses user_id = auth.uid(); left as-is.

-- ===== files =====
drop policy if exists "files: member select" on paperassistant.files;
create policy "files: member select" on paperassistant.files
  for select using (paperassistant.is_project_member(project_id));
drop policy if exists "files: editor insert" on paperassistant.files;
create policy "files: editor insert" on paperassistant.files
  for insert with check (paperassistant.is_project_editor(project_id));
drop policy if exists "files: editor update" on paperassistant.files;
create policy "files: editor update" on paperassistant.files
  for update using (paperassistant.is_project_editor(project_id))
            with check (paperassistant.is_project_editor(project_id));
drop policy if exists "files: editor delete" on paperassistant.files;
create policy "files: editor delete" on paperassistant.files
  for delete using (paperassistant.is_project_editor(project_id));

-- ===== notes =====
drop policy if exists "notes: member select" on paperassistant.notes;
create policy "notes: member select" on paperassistant.notes
  for select using (paperassistant.is_project_member(project_id));
drop policy if exists "notes: editor insert" on paperassistant.notes;
create policy "notes: editor insert" on paperassistant.notes
  for insert with check (paperassistant.is_project_editor(project_id));
drop policy if exists "notes: editor update" on paperassistant.notes;
create policy "notes: editor update" on paperassistant.notes
  for update using (paperassistant.is_project_editor(project_id))
            with check (paperassistant.is_project_editor(project_id));
drop policy if exists "notes: editor delete" on paperassistant.notes;
create policy "notes: editor delete" on paperassistant.notes
  for delete using (paperassistant.is_project_editor(project_id));

-- ===== references (reserved word -> quoted) =====
drop policy if exists "refs: member select" on paperassistant."references";
create policy "refs: member select" on paperassistant."references"
  for select using (paperassistant.is_project_member(project_id));
drop policy if exists "refs: editor insert" on paperassistant."references";
create policy "refs: editor insert" on paperassistant."references"
  for insert with check (paperassistant.is_project_editor(project_id));
drop policy if exists "refs: editor update" on paperassistant."references";
create policy "refs: editor update" on paperassistant."references"
  for update using (paperassistant.is_project_editor(project_id))
            with check (paperassistant.is_project_editor(project_id));
drop policy if exists "refs: editor delete" on paperassistant."references";
create policy "refs: editor delete" on paperassistant."references"
  for delete using (paperassistant.is_project_editor(project_id));

-- ===== highlights =====
drop policy if exists "highlights: member select" on paperassistant.highlights;
create policy "highlights: member select" on paperassistant.highlights
  for select using (paperassistant.is_project_member(project_id));
drop policy if exists "highlights: editor insert" on paperassistant.highlights;
create policy "highlights: editor insert" on paperassistant.highlights
  for insert with check (paperassistant.is_project_editor(project_id));
drop policy if exists "highlights: editor update" on paperassistant.highlights;
create policy "highlights: editor update" on paperassistant.highlights
  for update using (paperassistant.is_project_editor(project_id))
            with check (paperassistant.is_project_editor(project_id));
drop policy if exists "highlights: editor delete" on paperassistant.highlights;
create policy "highlights: editor delete" on paperassistant.highlights
  for delete using (paperassistant.is_project_editor(project_id));
