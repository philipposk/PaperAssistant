-- PaperAssistant schema on the shared 6x7 platform project
-- (project id: fmrnqepyyjucnfbrqawl). Mirrors the legacy public-schema
-- migrations now archived in supabase/legacy-public-schema/, but
-- namespaced under its own schema so it can't collide with sibling
-- apps that share the same Supabase project.

create schema if not exists paperassistant;

-- ===== updated_at helper =====
create or replace function paperassistant.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ===== projects =====
create table if not exists paperassistant.projects (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  name        text not null check (char_length(name) between 1 and 200),
  description text,
  color       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists projects_user_id_idx on paperassistant.projects(user_id);
create index if not exists projects_updated_at_idx on paperassistant.projects(updated_at desc);
alter table paperassistant.projects enable row level security;

drop trigger if exists projects_set_updated_at on paperassistant.projects;
create trigger projects_set_updated_at
  before update on paperassistant.projects
  for each row execute function paperassistant.set_updated_at();

-- ===== files =====
create table if not exists paperassistant.files (
  id           uuid primary key default gen_random_uuid(),
  project_id   uuid not null references paperassistant.projects(id) on delete cascade,
  user_id      uuid not null references auth.users(id) on delete cascade,
  name         text not null,
  mime         text not null default 'application/octet-stream',
  size_bytes   bigint not null default 0,
  storage_path text not null,
  tags         text[] not null default '{}',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index if not exists files_project_idx on paperassistant.files(project_id);
create index if not exists files_user_idx on paperassistant.files(user_id);
create index if not exists files_updated_at_idx on paperassistant.files(updated_at desc);
alter table paperassistant.files enable row level security;

drop trigger if exists files_set_updated_at on paperassistant.files;
create trigger files_set_updated_at
  before update on paperassistant.files
  for each row execute function paperassistant.set_updated_at();

-- ===== notes =====
create table if not exists paperassistant.notes (
  id         uuid primary key default gen_random_uuid(),
  project_id uuid not null references paperassistant.projects(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  title      text not null default 'Untitled',
  markdown   text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists notes_project_idx on paperassistant.notes(project_id);
create index if not exists notes_user_idx on paperassistant.notes(user_id);
create index if not exists notes_updated_at_idx on paperassistant.notes(updated_at desc);
alter table paperassistant.notes enable row level security;

drop trigger if exists notes_set_updated_at on paperassistant.notes;
create trigger notes_set_updated_at
  before update on paperassistant.notes
  for each row execute function paperassistant.set_updated_at();

-- ===== references (PostgreSQL reserved word — must be quoted) =====
create table if not exists paperassistant."references" (
  id            uuid primary key default gen_random_uuid(),
  project_id    uuid not null references paperassistant.projects(id) on delete cascade,
  user_id       uuid not null references auth.users(id) on delete cascade,
  citation_key  text not null,
  csl_json      jsonb not null default '{}'::jsonb,
  bibtex        text,
  doi           text,
  url           text,
  pdf_file_id   uuid references paperassistant.files(id) on delete set null,
  tags          text[] not null default '{}',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (project_id, citation_key)
);
create index if not exists references_project_idx on paperassistant."references"(project_id);
create index if not exists references_user_idx on paperassistant."references"(user_id);
create index if not exists references_doi_idx on paperassistant."references"(doi);
create index if not exists references_updated_at_idx on paperassistant."references"(updated_at desc);
alter table paperassistant."references" enable row level security;

drop trigger if exists references_set_updated_at on paperassistant."references";
create trigger references_set_updated_at
  before update on paperassistant."references"
  for each row execute function paperassistant.set_updated_at();

-- ===== highlights =====
create table if not exists paperassistant.highlights (
  id          uuid primary key default gen_random_uuid(),
  file_id     uuid not null references paperassistant.files(id) on delete cascade,
  project_id  uuid not null references paperassistant.projects(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  page        integer not null default 1,
  position    jsonb not null default '{}'::jsonb,
  content     jsonb not null default '{}'::jsonb,
  comment     text not null default '',
  color       text not null default '#ffd54f',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists highlights_file_idx on paperassistant.highlights(file_id);
create index if not exists highlights_project_idx on paperassistant.highlights(project_id);
create index if not exists highlights_user_idx on paperassistant.highlights(user_id);
create index if not exists highlights_updated_at_idx on paperassistant.highlights(updated_at desc);
alter table paperassistant.highlights enable row level security;

drop trigger if exists highlights_set_updated_at on paperassistant.highlights;
create trigger highlights_set_updated_at
  before update on paperassistant.highlights
  for each row execute function paperassistant.set_updated_at();

-- ===== sharing =====
create table if not exists paperassistant.project_members (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null references paperassistant.projects(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  role        text not null check (role in ('owner', 'editor', 'viewer')),
  created_at  timestamptz not null default now(),
  unique (project_id, user_id)
);
create index if not exists project_members_project_idx on paperassistant.project_members(project_id);
create index if not exists project_members_user_idx on paperassistant.project_members(user_id);
alter table paperassistant.project_members enable row level security;

create table if not exists paperassistant.project_invites (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null references paperassistant.projects(id) on delete cascade,
  email       text not null,
  role        text not null check (role in ('editor', 'viewer')) default 'editor',
  token       text not null unique,
  invited_by  uuid not null references auth.users(id) on delete cascade,
  expires_at  timestamptz not null default (now() + interval '7 days'),
  accepted_at timestamptz,
  accepted_by uuid references auth.users(id) on delete set null,
  created_at  timestamptz not null default now()
);
create index if not exists project_invites_project_idx on paperassistant.project_invites(project_id);
create index if not exists project_invites_token_idx on paperassistant.project_invites(token);
create index if not exists project_invites_email_idx on paperassistant.project_invites(email);
alter table paperassistant.project_invites enable row level security;

create or replace function paperassistant.projects_create_owner_membership()
returns trigger language plpgsql security definer as $$
begin
  insert into paperassistant.project_members (project_id, user_id, role)
    values (new.id, new.user_id, 'owner')
    on conflict do nothing;
  return new;
end;
$$;

drop trigger if exists projects_owner_membership on paperassistant.projects;
create trigger projects_owner_membership
  after insert on paperassistant.projects
  for each row execute function paperassistant.projects_create_owner_membership();
