-- Lock down search_path on PaperAssistant's trigger functions.
--
-- Supabase's security linter (lint 0011 function_search_path_mutable) flags
-- functions whose search_path is role-mutable: a caller could prepend their
-- own schema and shadow an unqualified name the function relies on. Both
-- functions below already use fully-qualified names (or only pg_catalog
-- builtins like now()), so pinning search_path to '' changes nothing at
-- runtime — it just removes the lint and the theoretical hijack vector.
--
-- 0001 now bakes `set search_path = ''` into the CREATE statements, so a
-- fresh deploy is hardened from the start. This migration re-applies it via
-- ALTER for databases that already ran the original 0001.

alter function paperassistant.set_updated_at() set search_path = '';
alter function paperassistant.projects_create_owner_membership() set search_path = '';
