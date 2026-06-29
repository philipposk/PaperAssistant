-- AI free-tier metering for PaperAssistant.
--
-- The pa-chat Edge Function (service-role) enforces a per-user DAILY request
-- quota for the host-funded free AI tier. This adds the meter table + atomic
-- RPCs. Paid tiers reuse the shared public.subscriptions table (Stripe), same
-- as transcriber/translator — no new billing tables here.
--
-- Security model (mirrors the siblings): all writes go through SECURITY DEFINER
-- RPCs called ONLY by the Edge Function's service-role key. Authenticated users
-- may READ their own usage row (for the quota bar) but can never write it — so
-- a user cannot reset or refund their own counter.

-- ===== per-user, per-day request meter =====
create table if not exists paperassistant.usage (
  user_id       uuid        not null references auth.users(id) on delete cascade,
  day           date        not null default (now() at time zone 'utc')::date,
  requests      integer     not null default 0,
  input_tokens  bigint      not null default 0,
  output_tokens bigint      not null default 0,
  updated_at    timestamptz not null default now(),
  primary key (user_id, day)
);

alter table paperassistant.usage enable row level security;

-- UI quota bar: a user reads only their own rows. No write policy exists, so
-- RLS denies all client writes (service-role bypasses RLS for the RPCs).
drop policy if exists "usage: self read" on paperassistant.usage;
create policy "usage: self read" on paperassistant.usage
  for select using (user_id = auth.uid());

-- migration 0006 default-granted DML on new tables to anon/authenticated;
-- revoke writes here so the only path to mutate usage is the service-role RPCs.
revoke insert, update, delete on paperassistant.usage from anon, authenticated;

-- ===== atomic consume: +1 if under limit for today, else raise =====
create or replace function paperassistant.pa_chat_consume(p_user uuid, p_limit int)
returns integer language plpgsql security definer set search_path = '' as $$
declare new_count int;
begin
  insert into paperassistant.usage as u (user_id, day, requests)
    values (p_user, (now() at time zone 'utc')::date, 1)
    on conflict (user_id, day) do update
      set requests = u.requests + 1, updated_at = now()
      where u.requests < p_limit
    returning u.requests into new_count;

  -- null => conflict row existed but the WHERE (requests < limit) was false
  if new_count is null then
    raise exception 'quota_exceeded';
  end if;
  return new_count;
end; $$;

-- ===== refund one request (provider call failed after reserve) =====
create or replace function paperassistant.pa_chat_refund(p_user uuid)
returns void language plpgsql security definer set search_path = '' as $$
begin
  update paperassistant.usage
    set requests = greatest(requests - 1, 0), updated_at = now()
    where user_id = p_user and day = (now() at time zone 'utc')::date;
end; $$;

-- ===== best-effort token accounting (analytics only) =====
create or replace function paperassistant.pa_chat_record_tokens(p_user uuid, p_in bigint, p_out bigint)
returns void language plpgsql security definer set search_path = '' as $$
begin
  update paperassistant.usage
    set input_tokens  = input_tokens  + coalesce(p_in, 0),
        output_tokens = output_tokens + coalesce(p_out, 0),
        updated_at = now()
    where user_id = p_user and day = (now() at time zone 'utc')::date;
end; $$;

-- Only the service-role (Edge Function) may run these. 0006 default-granted
-- execute to anon/authenticated — revoke so users can't self-refund/inflate.
revoke all on function paperassistant.pa_chat_consume(uuid, int)            from public, anon, authenticated;
revoke all on function paperassistant.pa_chat_refund(uuid)                  from public, anon, authenticated;
revoke all on function paperassistant.pa_chat_record_tokens(uuid, bigint, bigint) from public, anon, authenticated;
grant execute on function paperassistant.pa_chat_consume(uuid, int)            to service_role;
grant execute on function paperassistant.pa_chat_refund(uuid)                  to service_role;
grant execute on function paperassistant.pa_chat_record_tokens(uuid, bigint, bigint) to service_role;
