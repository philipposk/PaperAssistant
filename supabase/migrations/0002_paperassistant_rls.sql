-- RLS policies for paperassistant schema. Member-aware: any project
-- member can read; editors + owners can write; only owners delete the
-- project itself. project_invites is owner-managed but a single invite
-- is readable by any signed-in user that knows the token, so the
-- accept-invite page can fetch it before the member row exists.

-- ===== project_members =====
drop policy if exists "pm: member select" on paperassistant.project_members;
create policy "pm: member select" on paperassistant.project_members
  for select using (
    user_id = auth.uid() or exists (
      select 1 from paperassistant.project_members pm
       where pm.project_id = project_members.project_id
         and pm.user_id = auth.uid()
    )
  );

drop policy if exists "pm: owner write" on paperassistant.project_members;
create policy "pm: owner write" on paperassistant.project_members
  for all using (
    exists (
      select 1 from paperassistant.project_members pm
       where pm.project_id = project_members.project_id
         and pm.user_id = auth.uid()
         and pm.role = 'owner'
    )
  ) with check (
    exists (
      select 1 from paperassistant.project_members pm
       where pm.project_id = project_members.project_id
         and pm.user_id = auth.uid()
         and pm.role = 'owner'
    )
  );

-- ===== project_invites =====
drop policy if exists "inv: owner all" on paperassistant.project_invites;
create policy "inv: owner all" on paperassistant.project_invites
  for all using (
    exists (
      select 1 from paperassistant.project_members pm
       where pm.project_id = project_invites.project_id
         and pm.user_id = auth.uid()
         and pm.role = 'owner'
    )
  ) with check (
    exists (
      select 1 from paperassistant.project_members pm
       where pm.project_id = project_invites.project_id
         and pm.user_id = auth.uid()
         and pm.role = 'owner'
    )
  );

drop policy if exists "inv: by-token select" on paperassistant.project_invites;
create policy "inv: by-token select" on paperassistant.project_invites
  for select using (auth.uid() is not null);

-- ===== projects =====
drop policy if exists "projects: member select" on paperassistant.projects;
create policy "projects: member select" on paperassistant.projects
  for select using (
    exists (
      select 1 from paperassistant.project_members pm
       where pm.project_id = projects.id
         and pm.user_id = auth.uid()
    )
  );

drop policy if exists "projects: owner write" on paperassistant.projects;
create policy "projects: owner write" on paperassistant.projects
  for insert with check (user_id = auth.uid());

drop policy if exists "projects: editor update" on paperassistant.projects;
create policy "projects: editor update" on paperassistant.projects
  for update using (
    exists (
      select 1 from paperassistant.project_members pm
       where pm.project_id = projects.id
         and pm.user_id = auth.uid()
         and pm.role in ('owner', 'editor')
    )
  ) with check (
    exists (
      select 1 from paperassistant.project_members pm
       where pm.project_id = projects.id
         and pm.user_id = auth.uid()
         and pm.role in ('owner', 'editor')
    )
  );

drop policy if exists "projects: owner delete" on paperassistant.projects;
create policy "projects: owner delete" on paperassistant.projects
  for delete using (
    exists (
      select 1 from paperassistant.project_members pm
       where pm.project_id = projects.id
         and pm.user_id = auth.uid()
         and pm.role = 'owner'
    )
  );

-- ===== files =====
drop policy if exists "files: member select" on paperassistant.files;
create policy "files: member select" on paperassistant.files
  for select using (
    exists (
      select 1 from paperassistant.project_members pm
       where pm.project_id = files.project_id
         and pm.user_id = auth.uid()
    )
  );
drop policy if exists "files: editor insert" on paperassistant.files;
create policy "files: editor insert" on paperassistant.files
  for insert with check (
    exists (
      select 1 from paperassistant.project_members pm
       where pm.project_id = files.project_id
         and pm.user_id = auth.uid()
         and pm.role in ('owner', 'editor')
    )
  );
drop policy if exists "files: editor update" on paperassistant.files;
create policy "files: editor update" on paperassistant.files
  for update using (
    exists (
      select 1 from paperassistant.project_members pm
       where pm.project_id = files.project_id
         and pm.user_id = auth.uid()
         and pm.role in ('owner', 'editor')
    )
  ) with check (
    exists (
      select 1 from paperassistant.project_members pm
       where pm.project_id = files.project_id
         and pm.user_id = auth.uid()
         and pm.role in ('owner', 'editor')
    )
  );
drop policy if exists "files: editor delete" on paperassistant.files;
create policy "files: editor delete" on paperassistant.files
  for delete using (
    exists (
      select 1 from paperassistant.project_members pm
       where pm.project_id = files.project_id
         and pm.user_id = auth.uid()
         and pm.role in ('owner', 'editor')
    )
  );

-- ===== notes =====
drop policy if exists "notes: member select" on paperassistant.notes;
create policy "notes: member select" on paperassistant.notes
  for select using (
    exists (
      select 1 from paperassistant.project_members pm
       where pm.project_id = notes.project_id
         and pm.user_id = auth.uid()
    )
  );
drop policy if exists "notes: editor insert" on paperassistant.notes;
create policy "notes: editor insert" on paperassistant.notes
  for insert with check (
    exists (
      select 1 from paperassistant.project_members pm
       where pm.project_id = notes.project_id
         and pm.user_id = auth.uid()
         and pm.role in ('owner', 'editor')
    )
  );
drop policy if exists "notes: editor update" on paperassistant.notes;
create policy "notes: editor update" on paperassistant.notes
  for update using (
    exists (
      select 1 from paperassistant.project_members pm
       where pm.project_id = notes.project_id
         and pm.user_id = auth.uid()
         and pm.role in ('owner', 'editor')
    )
  ) with check (
    exists (
      select 1 from paperassistant.project_members pm
       where pm.project_id = notes.project_id
         and pm.user_id = auth.uid()
         and pm.role in ('owner', 'editor')
    )
  );
drop policy if exists "notes: editor delete" on paperassistant.notes;
create policy "notes: editor delete" on paperassistant.notes
  for delete using (
    exists (
      select 1 from paperassistant.project_members pm
       where pm.project_id = notes.project_id
         and pm.user_id = auth.uid()
         and pm.role in ('owner', 'editor')
    )
  );

-- ===== references (reserved word — must be quoted) =====
drop policy if exists "refs: member select" on paperassistant."references";
create policy "refs: member select" on paperassistant."references"
  for select using (
    exists (
      select 1 from paperassistant.project_members pm
       where pm.project_id = "references".project_id
         and pm.user_id = auth.uid()
    )
  );
drop policy if exists "refs: editor insert" on paperassistant."references";
create policy "refs: editor insert" on paperassistant."references"
  for insert with check (
    exists (
      select 1 from paperassistant.project_members pm
       where pm.project_id = "references".project_id
         and pm.user_id = auth.uid()
         and pm.role in ('owner', 'editor')
    )
  );
drop policy if exists "refs: editor update" on paperassistant."references";
create policy "refs: editor update" on paperassistant."references"
  for update using (
    exists (
      select 1 from paperassistant.project_members pm
       where pm.project_id = "references".project_id
         and pm.user_id = auth.uid()
         and pm.role in ('owner', 'editor')
    )
  ) with check (
    exists (
      select 1 from paperassistant.project_members pm
       where pm.project_id = "references".project_id
         and pm.user_id = auth.uid()
         and pm.role in ('owner', 'editor')
    )
  );
drop policy if exists "refs: editor delete" on paperassistant."references";
create policy "refs: editor delete" on paperassistant."references"
  for delete using (
    exists (
      select 1 from paperassistant.project_members pm
       where pm.project_id = "references".project_id
         and pm.user_id = auth.uid()
         and pm.role in ('owner', 'editor')
    )
  );

-- ===== highlights =====
drop policy if exists "highlights: member select" on paperassistant.highlights;
create policy "highlights: member select" on paperassistant.highlights
  for select using (
    exists (
      select 1 from paperassistant.project_members pm
       where pm.project_id = highlights.project_id
         and pm.user_id = auth.uid()
    )
  );
drop policy if exists "highlights: editor insert" on paperassistant.highlights;
create policy "highlights: editor insert" on paperassistant.highlights
  for insert with check (
    exists (
      select 1 from paperassistant.project_members pm
       where pm.project_id = highlights.project_id
         and pm.user_id = auth.uid()
         and pm.role in ('owner', 'editor')
    )
  );
drop policy if exists "highlights: editor update" on paperassistant.highlights;
create policy "highlights: editor update" on paperassistant.highlights
  for update using (
    exists (
      select 1 from paperassistant.project_members pm
       where pm.project_id = highlights.project_id
         and pm.user_id = auth.uid()
         and pm.role in ('owner', 'editor')
    )
  ) with check (
    exists (
      select 1 from paperassistant.project_members pm
       where pm.project_id = highlights.project_id
         and pm.user_id = auth.uid()
         and pm.role in ('owner', 'editor')
    )
  );
drop policy if exists "highlights: editor delete" on paperassistant.highlights;
create policy "highlights: editor delete" on paperassistant.highlights
  for delete using (
    exists (
      select 1 from paperassistant.project_members pm
       where pm.project_id = highlights.project_id
         and pm.user_id = auth.uid()
         and pm.role in ('owner', 'editor')
    )
  );
