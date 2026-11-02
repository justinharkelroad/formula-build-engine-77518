-- Email-only toolkit entry approved by Justin. These sessions grant access to
-- the AI toolkit only. They never create or authenticate an auth.users account.
create table formula_private.ai_portal_sessions (
  token_hash text primary key check (token_hash ~ '^[a-f0-9]{64}$'),
  member_id uuid not null references formula_private.ai_portal_members(id) on delete cascade,
  created_at timestamptz not null default now()
);
create index ai_portal_sessions_member on formula_private.ai_portal_sessions(member_id);

create table formula_private.ai_portal_entry_attempts (
  id bigint generated always as identity primary key,
  client_hash text not null check (client_hash ~ '^[a-f0-9]{64}$'),
  created_at timestamptz not null default now()
);
create index ai_portal_entry_attempts_client_time
  on formula_private.ai_portal_entry_attempts(client_hash, created_at desc);
alter table formula_private.ai_portal_sessions enable row level security;
alter table formula_private.ai_portal_entry_attempts enable row level security;
revoke all on formula_private.ai_portal_sessions, formula_private.ai_portal_entry_attempts
  from public, anon, authenticated;

create function formula_private.ai_portal_member_status(p_member_id uuid)
returns jsonb language sql stable security definer set search_path = '' as $$
  select jsonb_build_object(
    'access', true,
    'accessUntil', s.access_until,
    'member', jsonb_build_object('email', m.normalized_email, 'displayName', m.display_name,
      'source', m.source, 'platform', m.platform),
    'progress', coalesce((select jsonb_object_agg(p.content_id, p.max_percent)
      from formula_private.ai_portal_progress p where p.member_id = m.id), '{}'::jsonb)
  )
  from formula_private.ai_portal_members m
  cross join formula_private.ai_portal_settings s
  where m.id = p_member_id and s.id = 'formula-2026';
$$;

create function public.formula_ai_portal_email_entry(p_email text, p_token_hash text, p_client_hash text)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  v_email text := formula_private.ai_portal_normalize_email(p_email);
  v_settings formula_private.ai_portal_settings;
  v_eligibility jsonb;
  v_member_id uuid;
begin
  if v_email is null or p_token_hash is null or p_token_hash !~ '^[a-f0-9]{64}$'
    or p_client_hash is null or p_client_hash !~ '^[a-f0-9]{64}$' then
    raise exception 'formula_ai_portal_invalid_request';
  end if;
  -- Serialize this client's admission checks so concurrent attempts cannot
  -- bypass the limit. Rejected emails count too.
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_client_hash, 0));
  if (select count(*) from formula_private.ai_portal_entry_attempts a
    where a.client_hash = p_client_hash and a.created_at > now() - interval '15 minutes') >= 30 then
    return jsonb_build_object('access', false, 'reason', 'rate_limited');
  end if;
  insert into formula_private.ai_portal_entry_attempts(client_hash) values(p_client_hash);
  select * into v_settings from formula_private.ai_portal_settings where id = 'formula-2026';
  if v_settings.id is null or not v_settings.sign_in_open then
    return jsonb_build_object('access', false, 'reason', 'closed');
  end if;
  if now() > v_settings.access_until then
    return jsonb_build_object('access', false, 'reason', 'expired');
  end if;
  v_eligibility := formula_private.ai_portal_eligibility(v_email);
  if not coalesce((v_eligibility->>'eligible')::boolean, false) then
    return jsonb_build_object('access', false, 'reason', v_eligibility->>'reason');
  end if;
  insert into formula_private.ai_portal_members(normalized_email, source, display_name)
  values(v_email, v_eligibility->>'source', v_eligibility->>'displayName')
  on conflict(normalized_email) do update set
    source = excluded.source,
    display_name = coalesce(excluded.display_name, formula_private.ai_portal_members.display_name),
    visit_count = formula_private.ai_portal_members.visit_count
      + case when formula_private.ai_portal_members.last_seen_at < now() - interval '30 minutes' then 1 else 0 end,
    last_seen_at = now()
  returning id into v_member_id;
  insert into formula_private.ai_portal_sessions(token_hash, member_id) values(p_token_hash, v_member_id);
  return formula_private.ai_portal_member_status(v_member_id);
end;
$$;

create function public.formula_ai_portal_session_action(
  p_token_hash text, p_action text, p_platform text default null,
  p_content_id text default null, p_percent integer default null,
  p_asset_id text default null, p_issued boolean default false
)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  v_member formula_private.ai_portal_members;
  v_until timestamptz;
  v_percent integer;
begin
  select m.* into v_member from formula_private.ai_portal_sessions s
    join formula_private.ai_portal_members m on m.id = s.member_id
    where s.token_hash = p_token_hash;
  if not found or v_member.state <> 'active' then
    raise exception 'formula_ai_portal_no_access';
  end if;
  select access_until into v_until from formula_private.ai_portal_settings where id = 'formula-2026';
  if v_until is null or now() > v_until
    or not coalesce((formula_private.ai_portal_eligibility(v_member.normalized_email)->>'eligible')::boolean, false) then
    raise exception 'formula_ai_portal_no_access';
  end if;
  if p_action = 'status' then
    update formula_private.ai_portal_members set
      visit_count = visit_count + case when last_seen_at < now() - interval '30 minutes' then 1 else 0 end,
      last_seen_at = now() where id = v_member.id;
    return formula_private.ai_portal_member_status(v_member.id);
  elsif p_action = 'set-platform' then
    if p_platform is null or p_platform not in ('claude', 'codex') then
      raise exception 'formula_ai_portal_invalid_platform';
    end if;
    update formula_private.ai_portal_members set platform = p_platform where id = v_member.id;
    return jsonb_build_object('platform', p_platform);
  elsif p_action = 'progress' then
    if p_content_id is null or p_content_id not in ('day-1', 'day-2') or p_percent is null then
      raise exception 'formula_ai_portal_invalid_progress';
    end if;
    insert into formula_private.ai_portal_progress(member_id, content_id, max_percent)
    values(v_member.id, p_content_id, greatest(0, least(100, p_percent)))
    on conflict(member_id, content_id) do update set
      max_percent = greatest(formula_private.ai_portal_progress.max_percent, excluded.max_percent),
      updated_at = case when excluded.max_percent > formula_private.ai_portal_progress.max_percent
        then now() else formula_private.ai_portal_progress.updated_at end
    returning max_percent into v_percent;
    return jsonb_build_object('contentId', p_content_id, 'maxPercent', v_percent);
  elsif p_action = 'download' then
    if p_asset_id is null or p_asset_id !~ '^[a-z0-9-]{1,60}$' then
      raise exception 'formula_ai_portal_unknown_asset';
    end if;
    if p_issued then
      insert into formula_private.ai_portal_downloads(member_id, asset_id) values(v_member.id, p_asset_id);
    end if;
    return jsonb_build_object('ok', true);
  else
    raise exception 'formula_ai_portal_invalid_request';
  end if;
end;
$$;

revoke all on function formula_private.ai_portal_member_status(uuid) from public, anon, authenticated;
revoke all on function public.formula_ai_portal_email_entry(text, text, text) from public, anon, authenticated;
revoke all on function public.formula_ai_portal_session_action(text, text, text, text, integer, text, boolean)
  from public, anon, authenticated;
grant execute on function public.formula_ai_portal_email_entry(text, text, text) to service_role;
grant execute on function public.formula_ai_portal_session_action(text, text, text, text, integer, text, boolean)
  to service_role;
