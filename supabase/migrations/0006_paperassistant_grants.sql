-- Grant base table privileges on the paperassistant schema to the API roles.
--
-- Supabase auto-grants anon/authenticated on the `public` schema, but a custom
-- schema gets nothing by default -- so every request hit
--   401 42501 "permission denied for table ..."
-- even with RLS in place. RLS decides WHICH rows a role may see; the role still
-- needs table-level privileges to touch the table at all. We grant broadly and
-- let the (member-aware) RLS policies do the actual gating: anon has no
-- auth.uid(), so its membership checks fail and it sees zero rows -- a clean
-- empty result instead of a 401.

grant usage on schema paperassistant to anon, authenticated, service_role;

grant select, insert, update, delete on all tables in schema paperassistant to anon, authenticated;
grant all on all tables in schema paperassistant to service_role;
grant execute on all routines in schema paperassistant to anon, authenticated, service_role;

-- Cover any tables/functions added later in this schema.
alter default privileges in schema paperassistant
  grant select, insert, update, delete on tables to anon, authenticated;
alter default privileges in schema paperassistant
  grant all on tables to service_role;
alter default privileges in schema paperassistant
  grant execute on routines to anon, authenticated, service_role;
