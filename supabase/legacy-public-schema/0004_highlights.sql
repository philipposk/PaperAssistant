-- Highlights anchored into PDF files — added in PaperAssistant H2.

create table if not exists public.highlights (
  id          uuid primary key default gen_random_uuid(),
  file_id     uuid not null references public.files(id) on delete cascade,
  project_id  uuid not null references public.projects(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  page        integer not null default 1,
  position    jsonb not null default '{}'::jsonb,
  content     jsonb not null default '{}'::jsonb,
  comment     text not null default '',
  color       text not null default '#ffd54f',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists highlights_file_idx on public.highlights(file_id);
create index if not exists highlights_project_idx on public.highlights(project_id);
create index if not exists highlights_user_idx on public.highlights(user_id);
create index if not exists highlights_updated_at_idx on public.highlights(updated_at desc);

alter table public.highlights enable row level security;

drop policy if exists "highlights: owner select" on public.highlights;
create policy "highlights: owner select" on public.highlights
  for select using (auth.uid() = user_id);

drop policy if exists "highlights: owner insert" on public.highlights;
create policy "highlights: owner insert" on public.highlights
  for insert with check (auth.uid() = user_id);

drop policy if exists "highlights: owner update" on public.highlights;
create policy "highlights: owner update" on public.highlights
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "highlights: owner delete" on public.highlights;
create policy "highlights: owner delete" on public.highlights
  for delete using (auth.uid() = user_id);

drop trigger if exists highlights_set_updated_at on public.highlights;
create trigger highlights_set_updated_at
  before update on public.highlights
  for each row execute function public.set_updated_at();
