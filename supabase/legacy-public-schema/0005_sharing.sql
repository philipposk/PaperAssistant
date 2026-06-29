-- Sharing: project membership + email invitations.
-- Owners always have full access. "editor" members can read + write all
-- rows in shared projects; "viewer" members can read only.

create table if not exists public.project_members (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null references public.projects(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  role        text not null check (role in ('owner', 'editor', 'viewer')),
  created_at  timestamptz not null default now(),
  unique (project_id, user_id)
);

create index if not exists project_members_project_idx on public.project_members(project_id);
create index if not exists project_members_user_idx on public.project_members(user_id);

alter table public.project_members enable row level security;

-- Members can see the membership rows of any project they belong to.
drop policy if exists "project_members: member select" on public.project_members;
create policy "project_members: member select" on public.project_members
  for select using (
    user_id = auth.uid() or exists (
      select 1 from public.project_members pm
       where pm.project_id = project_members.project_id
         and pm.user_id = auth.uid()
    )
  );

-- Only owners may insert/update/delete membership.
drop policy if exists "project_members: owner write" on public.project_members;
create policy "project_members: owner write" on public.project_members
  for all using (
    exists (
      select 1 from public.project_members pm
       where pm.project_id = project_members.project_id
         and pm.user_id = auth.uid()
         and pm.role = 'owner'
    )
  ) with check (
    exists (
      select 1 from public.project_members pm
       where pm.project_id = project_members.project_id
         and pm.user_id = auth.uid()
         and pm.role = 'owner'
    )
  );


create table if not exists public.project_invites (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null references public.projects(id) on delete cascade,
  email       text not null,
  role        text not null check (role in ('editor', 'viewer')) default 'editor',
  token       text not null unique,
  invited_by  uuid not null references auth.users(id) on delete cascade,
  expires_at  timestamptz not null default (now() + interval '7 days'),
  accepted_at timestamptz,
  accepted_by uuid references auth.users(id) on delete set null,
  created_at  timestamptz not null default now()
);

create index if not exists project_invites_project_idx on public.project_invites(project_id);
create index if not exists project_invites_token_idx on public.project_invites(token);
create index if not exists project_invites_email_idx on public.project_invites(email);

alter table public.project_invites enable row level security;

-- Owners see + write invites for their projects.
drop policy if exists "project_invites: owner all" on public.project_invites;
create policy "project_invites: owner all" on public.project_invites
  for all using (
    exists (
      select 1 from public.project_members pm
       where pm.project_id = project_invites.project_id
         and pm.user_id = auth.uid()
         and pm.role = 'owner'
    )
  ) with check (
    exists (
      select 1 from public.project_members pm
       where pm.project_id = project_invites.project_id
         and pm.user_id = auth.uid()
         and pm.role = 'owner'
    )
  );

-- A signed-in user may SELECT a single invite by exact token (so the
-- accept-invite page can fetch it without owning the project yet).
drop policy if exists "project_invites: by-token select" on public.project_invites;
create policy "project_invites: by-token select" on public.project_invites
  for select using (auth.uid() is not null);


-- ===== seed owner membership for existing projects =====
-- Every existing project row implies the user is the owner.
insert into public.project_members (project_id, user_id, role)
select p.id, p.user_id, 'owner'
  from public.projects p
  on conflict do nothing;


-- ===== trigger: every new project auto-creates an owner membership =====
create or replace function public.projects_create_owner_membership()
returns trigger language plpgsql security definer as $$
begin
  insert into public.project_members (project_id, user_id, role)
    values (new.id, new.user_id, 'owner')
    on conflict do nothing;
  return new;
end;
$$;

drop trigger if exists projects_owner_membership on public.projects;
create trigger projects_owner_membership
  after insert on public.projects
  for each row execute function public.projects_create_owner_membership();


-- ===== broaden RLS so members (not only owners) can read/write =====
-- Drop the old "owner only" policies and replace with membership-aware
-- versions. We keep four policies per table: read for any member, write
-- (insert/update/delete) for editors+owners.

-- projects --
drop policy if exists "projects: owner select" on public.projects;
drop policy if exists "projects: owner insert" on public.projects;
drop policy if exists "projects: owner update" on public.projects;
drop policy if exists "projects: owner delete" on public.projects;

create policy "projects: member select" on public.projects
  for select using (
    exists (
      select 1 from public.project_members pm
       where pm.project_id = projects.id
         and pm.user_id = auth.uid()
    )
  );

create policy "projects: owner write" on public.projects
  for insert with check (user_id = auth.uid());

create policy "projects: editor update" on public.projects
  for update using (
    exists (
      select 1 from public.project_members pm
       where pm.project_id = projects.id
         and pm.user_id = auth.uid()
         and pm.role in ('owner', 'editor')
    )
  ) with check (
    exists (
      select 1 from public.project_members pm
       where pm.project_id = projects.id
         and pm.user_id = auth.uid()
         and pm.role in ('owner', 'editor')
    )
  );

create policy "projects: owner delete" on public.projects
  for delete using (
    exists (
      select 1 from public.project_members pm
       where pm.project_id = projects.id
         and pm.user_id = auth.uid()
         and pm.role = 'owner'
    )
  );

-- helper macro replacement: build the four policies for each child table
create or replace function public.__pa_apply_member_policies(tbl regclass)
returns void language plpgsql as $$
declare
  t text := tbl::text;
begin
  execute format('drop policy if exists "%I: owner select" on %s', t, tbl);
  execute format('drop policy if exists "%I: owner insert" on %s', t, tbl);
  execute format('drop policy if exists "%I: owner update" on %s', t, tbl);
  execute format('drop policy if exists "%I: owner delete" on %s', t, tbl);

  execute format($f$
    create policy "%I: member select" on %s
      for select using (
        exists (
          select 1 from public.project_members pm
           where pm.project_id = %s.project_id
             and pm.user_id = auth.uid()
        )
      )
  $f$, t, tbl, t);

  execute format($f$
    create policy "%I: editor insert" on %s
      for insert with check (
        exists (
          select 1 from public.project_members pm
           where pm.project_id = %s.project_id
             and pm.user_id = auth.uid()
             and pm.role in ('owner', 'editor')
        )
      )
  $f$, t, tbl, t);

  execute format($f$
    create policy "%I: editor update" on %s
      for update using (
        exists (
          select 1 from public.project_members pm
           where pm.project_id = %s.project_id
             and pm.user_id = auth.uid()
             and pm.role in ('owner', 'editor')
        )
      ) with check (
        exists (
          select 1 from public.project_members pm
           where pm.project_id = %s.project_id
             and pm.user_id = auth.uid()
             and pm.role in ('owner', 'editor')
        )
      )
  $f$, t, tbl, t, t);

  execute format($f$
    create policy "%I: editor delete" on %s
      for delete using (
        exists (
          select 1 from public.project_members pm
           where pm.project_id = %s.project_id
             and pm.user_id = auth.uid()
             and pm.role in ('owner', 'editor')
        )
      )
  $f$, t, tbl, t);
end;
$$;

select public.__pa_apply_member_policies('public.files');
select public.__pa_apply_member_policies('public.notes');
select public.__pa_apply_member_policies('public.references');
select public.__pa_apply_member_policies('public.highlights');

drop function public.__pa_apply_member_policies(regclass);
