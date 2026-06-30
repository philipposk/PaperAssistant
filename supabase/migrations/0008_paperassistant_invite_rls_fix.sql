-- Stop any signed-in user from enumerating all invites (emails + tokens).
-- Token lookup for accept flow uses a security-definer RPC instead.

drop policy if exists "inv: by-token select" on paperassistant.project_invites;

create or replace function paperassistant.get_invite_by_token(p_token text)
returns paperassistant.project_invites
language sql
stable
security definer
set search_path = paperassistant
as $$
  select *
    from paperassistant.project_invites
   where token = p_token
     and accepted_at is null
     and expires_at > now()
   limit 1;
$$;

revoke all on function paperassistant.get_invite_by_token(text) from public;
grant execute on function paperassistant.get_invite_by_token(text) to authenticated;
