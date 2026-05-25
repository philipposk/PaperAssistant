-- PaperAssistant cloud schema, v0.1
-- Run after creating a fresh Supabase project.

-- ===== projects =====
create table if not exists public.projects (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  name        text not null check (char_length(name) between 1 and 200),
  description text,
  color       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists projects_user_id_idx on public.projects(user_id);
create index if not exists projects_updated_at_idx on public.projects(updated_at desc);

alter table public.projects enable row level security;

drop policy if exists "projects: owner select" on public.projects;
create policy "projects: owner select" on public.projects
  for select using (auth.uid() = user_id);

drop policy if exists "projects: owner insert" on public.projects;
create policy "projects: owner insert" on public.projects
  for insert with check (auth.uid() = user_id);

drop policy if exists "projects: owner update" on public.projects;
create policy "projects: owner update" on public.projects
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "projects: owner delete" on public.projects;
create policy "projects: owner delete" on public.projects
  for delete using (auth.uid() = user_id);


-- ===== files =====
create table if not exists public.files (
  id           uuid primary key default gen_random_uuid(),
  project_id   uuid not null references public.projects(id) on delete cascade,
  user_id      uuid not null references auth.users(id) on delete cascade,
  name         text not null,
  mime         text not null default 'application/octet-stream',
  size_bytes   bigint not null default 0,
  storage_path text not null,
  tags         text[] not null default '{}',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists files_project_idx on public.files(project_id);
create index if not exists files_user_idx on public.files(user_id);
create index if not exists files_updated_at_idx on public.files(updated_at desc);

alter table public.files enable row level security;

drop policy if exists "files: owner select" on public.files;
create policy "files: owner select" on public.files
  for select using (auth.uid() = user_id);

drop policy if exists "files: owner insert" on public.files;
create policy "files: owner insert" on public.files
  for insert with check (auth.uid() = user_id);

drop policy if exists "files: owner update" on public.files;
create policy "files: owner update" on public.files
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "files: owner delete" on public.files;
create policy "files: owner delete" on public.files
  for delete using (auth.uid() = user_id);


-- ===== notes =====
create table if not exists public.notes (
  id         uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  title      text not null default 'Untitled',
  markdown   text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists notes_project_idx on public.notes(project_id);
create index if not exists notes_user_idx on public.notes(user_id);
create index if not exists notes_updated_at_idx on public.notes(updated_at desc);

alter table public.notes enable row level security;

drop policy if exists "notes: owner select" on public.notes;
create policy "notes: owner select" on public.notes
  for select using (auth.uid() = user_id);

drop policy if exists "notes: owner insert" on public.notes;
create policy "notes: owner insert" on public.notes
  for insert with check (auth.uid() = user_id);

drop policy if exists "notes: owner update" on public.notes;
create policy "notes: owner update" on public.notes
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "notes: owner delete" on public.notes;
create policy "notes: owner delete" on public.notes
  for delete using (auth.uid() = user_id);


-- ===== keep updated_at fresh =====
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists projects_set_updated_at on public.projects;
create trigger projects_set_updated_at
  before update on public.projects
  for each row execute function public.set_updated_at();

drop trigger if exists files_set_updated_at on public.files;
create trigger files_set_updated_at
  before update on public.files
  for each row execute function public.set_updated_at();

drop trigger if exists notes_set_updated_at on public.notes;
create trigger notes_set_updated_at
  before update on public.notes
  for each row execute function public.set_updated_at();
