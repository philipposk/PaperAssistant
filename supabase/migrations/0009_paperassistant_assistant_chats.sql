-- Saved assistant chats ("account" chat history) for the floating page assistant.
--
-- Adapted from the page-assistant SDK's reference migration
-- (packages/widget/supabase/assistant_chats.sql) to this repo's conventions: the table
-- lives in the `paperassistant` schema, which the app's browser client already targets
-- (app/src/lib/supabase.ts), so `.from("assistant_chats")` in the adapter hits it.
-- The `app` column is kept because the SDK adapter writes and filters on it; the app sets
-- it to 'paperassistant'.
--
-- Access: row-level security. A signed-in user can read, add, change and delete only their
-- own rows. anon gets nothing (0006 default-granted DML to anon; revoked below).
--
-- Retention: chats with no activity for 12 months (updated_at) are deleted by
-- paperassistant.assistant_chats_delete_inactive(), scheduled daily with pg_cron when the
-- extension is enabled on the shared project. See the end of the file otherwise.

create table if not exists paperassistant.assistant_chats (
  id          text        not null check (char_length(id) between 1 and 128),
  user_id     uuid        not null default auth.uid() references auth.users (id) on delete cascade,
  app         text        not null default '' check (char_length(app) <= 128),
  title       text        not null default 'New chat' check (char_length(title) <= 500),
  messages    jsonb       not null default '[]'::jsonb
                          check (jsonb_typeof(messages) = 'array')
                          -- Generous cap so one user cannot fill the database. The widget
                          -- keeps at most 100 messages per chat.
                          check (octet_length(messages::text) <= 5000000),
  pinned      boolean     not null default false,
  archived    boolean     not null default false,
  group_id    text,
  model       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  primary key (user_id, id)
);

-- The list: one user's chats, newest first.
create index if not exists assistant_chats_user_app_updated_idx
  on paperassistant.assistant_chats (user_id, app, updated_at desc);
-- The retention sweep.
create index if not exists assistant_chats_updated_idx
  on paperassistant.assistant_chats (updated_at);

-- The client sends its own timestamps so a chat moved from a device keeps its real age.
-- Never in the future: that would dodge the retention rule.
create or replace function paperassistant.assistant_chats_clamp_times()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at := least(coalesce(new.updated_at, now()), now());
  new.created_at := least(coalesce(new.created_at, now()), new.updated_at);
  return new;
end; $$;

drop trigger if exists assistant_chats_clamp_times on paperassistant.assistant_chats;
create trigger assistant_chats_clamp_times
  before insert or update on paperassistant.assistant_chats
  for each row execute function paperassistant.assistant_chats_clamp_times();

-- ===== RLS: every policy is "the row is mine" =====
alter table paperassistant.assistant_chats enable row level security;

drop policy if exists "assistant_chats: select own" on paperassistant.assistant_chats;
create policy "assistant_chats: select own" on paperassistant.assistant_chats
  for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "assistant_chats: insert own" on paperassistant.assistant_chats;
create policy "assistant_chats: insert own" on paperassistant.assistant_chats
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "assistant_chats: update own" on paperassistant.assistant_chats;
create policy "assistant_chats: update own" on paperassistant.assistant_chats
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "assistant_chats: delete own" on paperassistant.assistant_chats;
create policy "assistant_chats: delete own" on paperassistant.assistant_chats
  for delete to authenticated
  using ((select auth.uid()) = user_id);

revoke all on table paperassistant.assistant_chats from anon;
grant select, insert, update, delete on table paperassistant.assistant_chats to authenticated;
grant all on table paperassistant.assistant_chats to service_role;

-- ===== retention: delete chats with no activity for 12 months =====
-- The interval is fixed (no parameter), so nobody can call it to wipe everything.
create or replace function paperassistant.assistant_chats_delete_inactive()
returns integer language plpgsql set search_path = '' as $$
declare deleted integer;
begin
  delete from paperassistant.assistant_chats
  where updated_at < now() - interval '12 months';
  get diagnostics deleted = row_count;
  return deleted;
end; $$;

-- 0006 default-granted execute to anon/authenticated: revoke so only the owner and
-- service_role can run the sweep.
revoke all on function paperassistant.assistant_chats_delete_inactive() from public, anon, authenticated;
grant execute on function paperassistant.assistant_chats_delete_inactive() to service_role;

-- Daily at 03:17 UTC, when pg_cron is enabled (Dashboard -> Database -> Extensions).
-- The job name carries the schema so it cannot overwrite a sibling app's job on the shared
-- project (cron.schedule with an existing name replaces that job). Re-running updates it.
do $$
begin
  if exists (select 1 from pg_extension where extname = 'pg_cron') then
    perform cron.schedule(
      'paperassistant-assistant-chats-retention',
      '17 3 * * *',
      'select paperassistant.assistant_chats_delete_inactive()'
    );
  else
    raise notice 'pg_cron is not enabled: enable it, then run the cron.schedule(...) call from 0009_paperassistant_assistant_chats.sql once.';
  end if;
end; $$;

-- If pg_cron is enabled after this migration ran, run once in the SQL editor:
--
--   select cron.schedule('paperassistant-assistant-chats-retention', '17 3 * * *',
--                        'select paperassistant.assistant_chats_delete_inactive()');
--
-- The widget adapter also deletes a returning user's own chats past 12 months each time
-- they open the assistant; users who never come back are covered only by the scheduled job.
