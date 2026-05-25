-- References (citations) — added in PaperAssistant H1 milestone.

create table if not exists public.references (
  id            uuid primary key default gen_random_uuid(),
  project_id    uuid not null references public.projects(id) on delete cascade,
  user_id       uuid not null references auth.users(id) on delete cascade,
  citation_key  text not null,
  csl_json      jsonb not null default '{}'::jsonb,
  bibtex        text,
  doi           text,
  url           text,
  pdf_file_id   uuid references public.files(id) on delete set null,
  tags          text[] not null default '{}',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (project_id, citation_key)
);

create index if not exists references_project_idx on public.references(project_id);
create index if not exists references_user_idx on public.references(user_id);
create index if not exists references_doi_idx on public.references(doi);
create index if not exists references_updated_at_idx on public.references(updated_at desc);

alter table public.references enable row level security;

drop policy if exists "references: owner select" on public.references;
create policy "references: owner select" on public.references
  for select using (auth.uid() = user_id);

drop policy if exists "references: owner insert" on public.references;
create policy "references: owner insert" on public.references
  for insert with check (auth.uid() = user_id);

drop policy if exists "references: owner update" on public.references;
create policy "references: owner update" on public.references
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "references: owner delete" on public.references;
create policy "references: owner delete" on public.references
  for delete using (auth.uid() = user_id);

drop trigger if exists references_set_updated_at on public.references;
create trigger references_set_updated_at
  before update on public.references
  for each row execute function public.set_updated_at();
