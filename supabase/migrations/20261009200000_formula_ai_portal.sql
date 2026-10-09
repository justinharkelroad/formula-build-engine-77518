-- Formula AI portal: private post-event library at /ai-portal.
--
-- Separate from formula_entitlements on purpose: those rows project into the
-- Formula app, and portal sign-ins must never churn app projections.
-- Eligibility is read live from the roster, partner purchases and manual
-- approvals; nothing here bulk-creates accounts or sends mail.
-- Every table lives in formula_private (not exposed over the Data API) and is
-- reached only through service-role RPCs called by the two portal functions.

create table formula_private.ai_portal_settings (
  id text primary key check (id = 'formula-2026'),
  sign_in_open boolean not null default false,
  access_until timestamptz not null default '2027-04-02T03:59:59.999Z',
  updated_at timestamptz not null default now(),
  updated_by uuid null
);

insert into formula_private.ai_portal_settings (id) values ('formula-2026')
on conflict (id) do nothing;

create table formula_private.ai_portal_approvals (
  id uuid primary key default gen_random_uuid(),
  normalized_email text not null
    check (normalized_email = lower(btrim(normalized_email)) and normalized_email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  display_name text null check (display_name is null or char_length(display_name) <= 120),
  reason text not null check (btrim(reason) <> '' and char_length(reason) <= 500),
  approved_by uuid not null,
  approved_at timestamptz not null default now(),
  revoked_at timestamptz null,
  revoked_by uuid null,
  constraint ai_portal_approvals_revoked_shape check ((revoked_at is null) = (revoked_by is null))
);

create unique index ai_portal_approvals_one_open_per_email
  on formula_private.ai_portal_approvals(normalized_email)
  where revoked_at is null;

create table formula_private.ai_portal_access_requests (
  id uuid primary key default gen_random_uuid(),
  normalized_email text not null
    check (normalized_email = lower(btrim(normalized_email)) and normalized_email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  display_name text not null check (btrim(display_name) <> '' and char_length(display_name) <= 120),
  note text null check (note is null or char_length(note) <= 500),
  client_hash text not null check (client_hash ~ '^[0-9a-f]{64}$'),
  state text not null default 'pending' check (state in ('pending', 'approved', 'dismissed')),
  created_at timestamptz not null default now(),
  resolved_at timestamptz null,
  resolved_by uuid null,
  constraint ai_portal_access_requests_resolved_shape check (
    (state = 'pending' and resolved_at is null and resolved_by is null)
    or (state <> 'pending' and resolved_at is not null and resolved_by is not null)
  )
);

create unique index ai_portal_access_requests_one_pending_per_email
  on formula_private.ai_portal_access_requests(normalized_email)
  where state = 'pending';

-- One row per person who has actually signed in. Keyed by email so a
-- revocation survives even if the underlying sign-in account is removed.
create table formula_private.ai_portal_members (
  id uuid primary key default gen_random_uuid(),
  normalized_email text not null unique
    check (normalized_email = lower(btrim(normalized_email))),
  user_id uuid null unique references auth.users(id) on delete set null,
  source text not null check (source in ('roster', 'purchaser', 'partner', 'manual')),
  display_name text null check (display_name is null or char_length(display_name) <= 120),
  platform text null check (platform in ('claude', 'codex')),
  state text not null default 'active' check (state in ('active', 'revoked')),
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  visit_count integer not null default 1 check (visit_count >= 1),
  revoked_at timestamptz null,
  revoked_by uuid null,
  revoke_reason text null check (revoke_reason is null or char_length(revoke_reason) <= 500),
  constraint ai_portal_members_revoked_shape check (
    (state = 'revoked' and revoked_at is not null and revoked_by is not null)
    or (state = 'active' and revoked_at is null and revoked_by is null and revoke_reason is null)
  )
);

create table formula_private.ai_portal_progress (
  member_id uuid not null references formula_private.ai_portal_members(id) on delete cascade,
  content_id text not null check (content_id ~ '^[a-z0-9-]{1,40}$'),
  max_percent integer not null default 0 check (max_percent between 0 and 100),
  updated_at timestamptz not null default now(),
  primary key (member_id, content_id)
);

create table formula_private.ai_portal_downloads (
  id bigint generated always as identity primary key,
  member_id uuid not null references formula_private.ai_portal_members(id) on delete cascade,
  asset_id text not null check (asset_id ~ '^[a-z0-9-]{1,60}$'),
  requested_at timestamptz not null default now()
);

create index ai_portal_downloads_member on formula_private.ai_portal_downloads(member_id, requested_at desc);

-- Rate-limit ledger for sign-in code requests. No codes are stored here;
-- the auth service owns code generation, expiry and single use.
create table formula_private.ai_portal_code_requests (
  id uuid primary key default gen_random_uuid(),
  normalized_email text not null,
  client_hash text not null check (client_hash ~ '^[0-9a-f]{64}$'),
  outcome text not null default 'pending'
    check (outcome in ('pending', 'sent', 'send_failed', 'not_eligible', 'closed', 'rate_limited', 'admin_account')),
  created_at timestamptz not null default now()
);

create index ai_portal_code_requests_email_time
  on formula_private.ai_portal_code_requests(normalized_email, created_at desc);
create index ai_portal_code_requests_client_time
  on formula_private.ai_portal_code_requests(client_hash, created_at desc);

-- Storage: protected downloads. No storage policies are created, so only the
-- service role can read or write; attendees get five-minute signed URLs.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('formula-ai-portal', 'formula-ai-portal', false, 10485760, array['application/zip', 'application/pdf'])
on conflict (id) do update
  set public = false,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

create or replace function formula_private.ai_portal_normalize_email(p_email text)
returns text
language sql
immutable
set search_path = ''
as $$
  select case
    when p_email is null then null
    when lower(btrim(p_email)) ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' and char_length(btrim(p_email)) <= 254
      then lower(btrim(p_email))
    else null
  end
$$;

-- Who may use the portal, and why. Order matters:
-- revoked portal access > manual approval > active roster seat >
-- inactive roster seat (blocks) > paid purchaser > partner contact.
create or replace function formula_private.ai_portal_eligibility(p_email text)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_email text := formula_private.ai_portal_normalize_email(p_email);
  v_name text;
begin
  if v_email is null then
    return jsonb_build_object('eligible', false, 'reason', 'invalid_email');
  end if;

  if exists (
    select 1 from formula_private.ai_portal_members m
     where m.normalized_email = v_email and m.state = 'revoked'
  ) then
    return jsonb_build_object('eligible', false, 'reason', 'revoked');
  end if;

  select a.display_name into v_name
    from formula_private.ai_portal_approvals a
   where a.normalized_email = v_email and a.revoked_at is null;
  if found then
    return jsonb_build_object('eligible', true, 'source', 'manual', 'displayName', v_name);
  end if;

  select r.invited_name into v_name
    from public.formula_event_registrations r
    join public.formula_entitlements e on e.event_registration_id = r.id
   where r.event_id = 'formula-2026'
     and r.registration_state in ('invited', 'claimed', 'checked_in')
     and e.access_state in ('pending', 'active')
     and (
       r.normalized_email = v_email
       or (r.member_id is not null and exists (
         select 1 from public.formula_member_emails me
          where me.member_id = r.member_id
            and me.normalized_email = v_email
            and me.state = 'verified'
       ))
     )
   order by r.created_at
   limit 1;
  if found then
    return jsonb_build_object('eligible', true, 'source', 'roster', 'displayName', v_name);
  end if;

  -- A seat an admin suspended or revoked is a deliberate "no"; do not let the
  -- purchaser or partner fallbacks quietly re-admit the same email.
  if exists (
    select 1 from public.formula_event_registrations r
     where r.event_id = 'formula-2026'
       and r.normalized_email = v_email
       and r.registration_state in ('suspended', 'revoked')
  ) then
    return jsonb_build_object('eligible', false, 'reason', 'roster_inactive');
  end if;

  select p.name into v_name
    from public.purchases p
   where lower(btrim(p.email)) = v_email
     and p.pass_type in ('agencyOwner', 'team')
   order by p.created_at
   limit 1;
  if found then
    return jsonb_build_object('eligible', true, 'source', 'purchaser', 'displayName', v_name);
  end if;

  select coalesce(p.primary_contact_name, p.purchase_name) into v_name
    from public.partner_profiles p
   where v_email in (
           lower(btrim(coalesce(p.purchase_email, ''))),
           lower(btrim(coalesce(p.primary_contact_email, ''))),
           lower(btrim(coalesce(p.marketing_contact_email, '')))
         )
      or exists (
           select 1
             from jsonb_array_elements(
                    case when jsonb_typeof(p.attendees) = 'array' then p.attendees else '[]'::jsonb end
                  ) attendee
            where lower(btrim(coalesce(attendee->>'email', ''))) = v_email
         )
   order by p.created_at
   limit 1;
  if found then
    return jsonb_build_object('eligible', true, 'source', 'partner', 'displayName', v_name);
  end if;

  if exists (
    select 1 from public.purchases p
     where lower(btrim(p.email)) = v_email and p.pass_type = 'partner'
  ) then
    return jsonb_build_object('eligible', true, 'source', 'partner', 'displayName', null);
  end if;

  return jsonb_build_object('eligible', false, 'reason', 'not_found');
end;
$$;

-- Gate for "email me a code". Records the attempt and answers whether the
-- function may send. The caller must give every outcome the same public reply.
create or replace function public.formula_ai_portal_request_code(p_email text, p_client_hash text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_email text := formula_private.ai_portal_normalize_email(p_email);
  v_settings formula_private.ai_portal_settings;
  v_eligibility jsonb;
  v_outcome text;
  v_request_id uuid;
begin
  if v_email is null then
    return jsonb_build_object('send', false, 'outcome', 'invalid_email');
  end if;
  if p_client_hash is null or p_client_hash !~ '^[0-9a-f]{64}$' then
    raise exception 'formula_ai_portal_invalid_client';
  end if;

  select * into v_settings from formula_private.ai_portal_settings where id = 'formula-2026';

  if (select count(*) from formula_private.ai_portal_code_requests c
       where c.normalized_email = v_email and c.created_at > now() - interval '15 minutes') >= 3
     or (select count(*) from formula_private.ai_portal_code_requests c
       where c.normalized_email = v_email and c.created_at > now() - interval '1 day') >= 10
     or (select count(*) from formula_private.ai_portal_code_requests c
       where c.client_hash = p_client_hash and c.created_at > now() - interval '1 hour') >= 20 then
    v_outcome := 'rate_limited';
  elsif not v_settings.sign_in_open or now() > v_settings.access_until then
    v_outcome := 'closed';
  elsif exists (
    select 1 from auth.users u
      join public.user_roles ur on ur.user_id = u.id and ur.role = 'admin'
     where lower(u.email) = v_email
  ) then
    -- Website admins keep password sign-in. A mailbox code must never open an admin session.
    v_outcome := 'admin_account';
  else
    v_eligibility := formula_private.ai_portal_eligibility(v_email);
    v_outcome := case when (v_eligibility->>'eligible')::boolean then 'pending' else 'not_eligible' end;
  end if;

  insert into formula_private.ai_portal_code_requests (normalized_email, client_hash, outcome)
  values (v_email, p_client_hash, v_outcome)
  returning id into v_request_id;

  return jsonb_build_object(
    'send', v_outcome = 'pending',
    'outcome', v_outcome,
    'requestId', v_request_id,
    'email', v_email
  );
end;
$$;

create or replace function public.formula_ai_portal_record_code_send(p_request_id uuid, p_sent boolean)
returns void
language sql
security definer
set search_path = ''
as $$
  update formula_private.ai_portal_code_requests
     set outcome = case when p_sent then 'sent' else 'send_failed' end
   where id = p_request_id and outcome = 'pending';
$$;

create or replace function public.formula_ai_portal_request_access(p_email text, p_name text, p_note text, p_client_hash text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_email text := formula_private.ai_portal_normalize_email(p_email);
  v_name text := nullif(btrim(coalesce(p_name, '')), '');
  v_note text := nullif(btrim(coalesce(p_note, '')), '');
begin
  if v_email is null or v_name is null or char_length(v_name) > 120 or char_length(coalesce(v_note, '')) > 500 then
    raise exception 'formula_ai_portal_invalid_request';
  end if;
  if p_client_hash is null or p_client_hash !~ '^[0-9a-f]{64}$' then
    raise exception 'formula_ai_portal_invalid_client';
  end if;
  -- Same reply either way; a flood from one client just stops adding rows.
  if (select count(*) from formula_private.ai_portal_access_requests r
       where r.client_hash = p_client_hash and r.created_at > now() - interval '1 hour') >= 5 then
    return jsonb_build_object('received', true);
  end if;
  insert into formula_private.ai_portal_access_requests (normalized_email, display_name, note, client_hash)
  values (v_email, v_name, v_note, p_client_hash)
  on conflict (normalized_email) where state = 'pending'
  do update set display_name = excluded.display_name, note = coalesce(excluded.note, formula_private.ai_portal_access_requests.note);
  return jsonb_build_object('received', true);
end;
$$;

-- Called on every portal load with the identity the auth service verified.
-- Rechecks eligibility and the access window each time; creates the member
-- row on first sign-in; counts a visit at most once per 30 minutes.
create or replace function public.formula_ai_portal_enter(p_user_id uuid, p_email text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_email text := formula_private.ai_portal_normalize_email(p_email);
  v_settings formula_private.ai_portal_settings;
  v_eligibility jsonb;
  v_member formula_private.ai_portal_members;
begin
  if p_user_id is null or v_email is null then
    raise exception 'formula_ai_portal_invalid_identity';
  end if;

  select * into v_settings from formula_private.ai_portal_settings where id = 'formula-2026';
  if now() > v_settings.access_until then
    return jsonb_build_object('access', false, 'reason', 'expired');
  end if;

  v_eligibility := formula_private.ai_portal_eligibility(v_email);
  if not coalesce((v_eligibility->>'eligible')::boolean, false) then
    return jsonb_build_object('access', false, 'reason', v_eligibility->>'reason');
  end if;

  insert into formula_private.ai_portal_members (normalized_email, user_id, source, display_name)
  values (v_email, p_user_id, v_eligibility->>'source', v_eligibility->>'displayName')
  on conflict (normalized_email) do update
    set user_id = excluded.user_id,
        source = excluded.source,
        display_name = coalesce(excluded.display_name, formula_private.ai_portal_members.display_name),
        visit_count = formula_private.ai_portal_members.visit_count
          + case when formula_private.ai_portal_members.last_seen_at < now() - interval '30 minutes' then 1 else 0 end,
        last_seen_at = now()
  returning * into v_member;

  return jsonb_build_object(
    'access', true,
    'accessUntil', v_settings.access_until,
    'member', jsonb_build_object(
      'email', v_member.normalized_email,
      'displayName', v_member.display_name,
      'source', v_member.source,
      'platform', v_member.platform
    ),
    'progress', coalesce((
      select jsonb_object_agg(p.content_id, p.max_percent)
        from formula_private.ai_portal_progress p
       where p.member_id = v_member.id
    ), '{}'::jsonb)
  );
end;
$$;

-- Resolves the active member for a verified user. Raises when the person no
-- longer has access, so every protected action fails closed.
create or replace function formula_private.ai_portal_active_member(p_user_id uuid)
returns formula_private.ai_portal_members
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_member formula_private.ai_portal_members;
  v_until timestamptz;
begin
  select * into v_member from formula_private.ai_portal_members where user_id = p_user_id;
  if not found or v_member.state <> 'active' then
    raise exception 'formula_ai_portal_no_access';
  end if;
  select access_until into v_until from formula_private.ai_portal_settings where id = 'formula-2026';
  if now() > v_until or not coalesce((formula_private.ai_portal_eligibility(v_member.normalized_email)->>'eligible')::boolean, false) then
    raise exception 'formula_ai_portal_no_access';
  end if;
  return v_member;
end;
$$;

create or replace function public.formula_ai_portal_set_platform(p_user_id uuid, p_platform text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_member formula_private.ai_portal_members := formula_private.ai_portal_active_member(p_user_id);
begin
  if p_platform not in ('claude', 'codex') then
    raise exception 'formula_ai_portal_invalid_platform';
  end if;
  update formula_private.ai_portal_members set platform = p_platform where id = v_member.id;
  return jsonb_build_object('platform', p_platform);
end;
$$;

create or replace function public.formula_ai_portal_record_progress(p_user_id uuid, p_content_id text, p_percent integer)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_member formula_private.ai_portal_members := formula_private.ai_portal_active_member(p_user_id);
  v_percent integer := greatest(0, least(100, coalesce(p_percent, 0)));
  v_saved integer;
begin
  insert into formula_private.ai_portal_progress (member_id, content_id, max_percent)
  values (v_member.id, p_content_id, v_percent)
  on conflict (member_id, content_id) do update
    set max_percent = greatest(formula_private.ai_portal_progress.max_percent, excluded.max_percent),
        updated_at = case
          when excluded.max_percent > formula_private.ai_portal_progress.max_percent then now()
          else formula_private.ai_portal_progress.updated_at
        end
  returning max_percent into v_saved;
  return jsonb_build_object('contentId', p_content_id, 'maxPercent', v_saved);
end;
$$;

-- Access check for a download. Raises when the person no longer has access;
-- records the request only when a link was actually issued.
create or replace function public.formula_ai_portal_record_download(p_user_id uuid, p_asset_id text, p_issued boolean)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_member formula_private.ai_portal_members := formula_private.ai_portal_active_member(p_user_id);
begin
  if p_issued then
    insert into formula_private.ai_portal_downloads (member_id, asset_id) values (v_member.id, p_asset_id);
  end if;
end;
$$;

-- ---------------------------------------------------------------------------
-- Admin RPCs. The admin function verifies the caller's admin role first and
-- passes its verified user id as p_actor_id for the audit trail.
-- ---------------------------------------------------------------------------

create or replace function formula_private.ai_portal_audit(
  p_actor_id uuid, p_event_type text, p_entity_type text, p_entity_id text, p_reason_code text, p_summary jsonb
)
returns void
language sql
security definer
set search_path = ''
as $$
  insert into formula_private.audit_events (
    actor_type, actor_id, event_type, entity_type, entity_id, reason_code, correlation_id, state_summary
  ) values (
    'admin', p_actor_id::text, p_event_type, p_entity_type, p_entity_id, p_reason_code, gen_random_uuid(), coalesce(p_summary, '{}'::jsonb)
  );
$$;

create or replace function public.formula_ai_portal_admin_snapshot()
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'settings', (select to_jsonb(s) - 'id' from formula_private.ai_portal_settings s where s.id = 'formula-2026'),
    'members', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', m.id,
        'email', m.normalized_email,
        'displayName', m.display_name,
        'source', m.source,
        'platform', m.platform,
        'state', m.state,
        'firstSeenAt', m.first_seen_at,
        'lastSeenAt', m.last_seen_at,
        'visitCount', m.visit_count,
        'revokedAt', m.revoked_at,
        'revokeReason', m.revoke_reason,
        'eligibleNow', coalesce((formula_private.ai_portal_eligibility(m.normalized_email)->>'eligible')::boolean, false),
        'progress', coalesce((
          select jsonb_object_agg(p.content_id, p.max_percent)
            from formula_private.ai_portal_progress p where p.member_id = m.id
        ), '{}'::jsonb),
        'downloadCount', (select count(*) from formula_private.ai_portal_downloads d where d.member_id = m.id),
        'lastDownloadAt', (select max(d.requested_at) from formula_private.ai_portal_downloads d where d.member_id = m.id)
      ) order by m.last_seen_at desc)
      from formula_private.ai_portal_members m
    ), '[]'::jsonb),
    'approvals', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', a.id, 'email', a.normalized_email, 'displayName', a.display_name,
        'reason', a.reason, 'approvedAt', a.approved_at
      ) order by a.approved_at desc)
      from formula_private.ai_portal_approvals a where a.revoked_at is null
    ), '[]'::jsonb),
    'requests', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', r.id, 'email', r.normalized_email, 'displayName', r.display_name,
        'note', r.note, 'createdAt', r.created_at,
        'eligibleNow', coalesce((formula_private.ai_portal_eligibility(r.normalized_email)->>'eligible')::boolean, false)
      ) order by r.created_at)
      from formula_private.ai_portal_access_requests r where r.state = 'pending'
    ), '[]'::jsonb),
    'codeRequests', jsonb_build_object(
      'last24h', (select count(*) from formula_private.ai_portal_code_requests c where c.created_at > now() - interval '1 day'),
      'notEligible24h', (select count(*) from formula_private.ai_portal_code_requests c
                          where c.created_at > now() - interval '1 day' and c.outcome = 'not_eligible'),
      'sendFailed24h', (select count(*) from formula_private.ai_portal_code_requests c
                          where c.created_at > now() - interval '1 day' and c.outcome = 'send_failed')
    )
  );
$$;

create or replace function public.formula_ai_portal_admin_check_email(p_email text)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select formula_private.ai_portal_eligibility(p_email);
$$;

create or replace function public.formula_ai_portal_admin_approve(
  p_actor_id uuid, p_email text, p_name text, p_reason text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_email text := formula_private.ai_portal_normalize_email(p_email);
  v_reason text := nullif(btrim(coalesce(p_reason, '')), '');
  v_id uuid;
begin
  if p_actor_id is null or v_email is null or v_reason is null then
    raise exception 'formula_ai_portal_invalid_approval';
  end if;

  insert into formula_private.ai_portal_approvals (normalized_email, display_name, reason, approved_by)
  values (v_email, nullif(btrim(coalesce(p_name, '')), ''), v_reason, p_actor_id)
  on conflict (normalized_email) where revoked_at is null
  do update set display_name = coalesce(excluded.display_name, formula_private.ai_portal_approvals.display_name),
                reason = excluded.reason
  returning id into v_id;

  update formula_private.ai_portal_access_requests
     set state = 'approved', resolved_at = now(), resolved_by = p_actor_id
   where normalized_email = v_email and state = 'pending';

  perform formula_private.ai_portal_audit(p_actor_id, 'ai_portal_approval_granted', 'ai_portal_approval', v_id::text, 'manual_approval', '{}'::jsonb);
  return jsonb_build_object('approvalId', v_id);
end;
$$;

create or replace function public.formula_ai_portal_admin_revoke_approval(p_actor_id uuid, p_approval_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
begin
  update formula_private.ai_portal_approvals
     set revoked_at = now(), revoked_by = p_actor_id
   where id = p_approval_id and revoked_at is null;
  if not found then
    raise exception 'formula_ai_portal_approval_not_found';
  end if;
  perform formula_private.ai_portal_audit(p_actor_id, 'ai_portal_approval_revoked', 'ai_portal_approval', p_approval_id::text, 'manual_revoke', '{}'::jsonb);
  return jsonb_build_object('revoked', true);
end;
$$;

create or replace function public.formula_ai_portal_admin_dismiss_request(p_actor_id uuid, p_request_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
begin
  update formula_private.ai_portal_access_requests
     set state = 'dismissed', resolved_at = now(), resolved_by = p_actor_id
   where id = p_request_id and state = 'pending';
  if not found then
    raise exception 'formula_ai_portal_request_not_found';
  end if;
  perform formula_private.ai_portal_audit(p_actor_id, 'ai_portal_request_dismissed', 'ai_portal_access_request', p_request_id::text, 'manual_dismiss', '{}'::jsonb);
  return jsonb_build_object('dismissed', true);
end;
$$;

-- Revoke or restore one person's portal access. Revocation is keyed to the
-- email and outlives sessions: the next request from that person fails.
create or replace function public.formula_ai_portal_admin_set_member_state(
  p_actor_id uuid, p_member_id uuid, p_state text, p_reason text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_actor_id is null or p_state not in ('active', 'revoked') then
    raise exception 'formula_ai_portal_invalid_state';
  end if;
  update formula_private.ai_portal_members
     set state = p_state,
         revoked_at = case when p_state = 'revoked' then now() end,
         revoked_by = case when p_state = 'revoked' then p_actor_id end,
         revoke_reason = case when p_state = 'revoked' then nullif(btrim(coalesce(p_reason, '')), '') end
   where id = p_member_id;
  if not found then
    raise exception 'formula_ai_portal_member_not_found';
  end if;
  perform formula_private.ai_portal_audit(
    p_actor_id,
    case when p_state = 'revoked' then 'ai_portal_member_revoked' else 'ai_portal_member_restored' end,
    'ai_portal_member', p_member_id::text, 'manual_access_change', '{}'::jsonb
  );
  return jsonb_build_object('state', p_state);
end;
$$;

create or replace function public.formula_ai_portal_admin_set_sign_in(p_actor_id uuid, p_open boolean)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_actor_id is null or p_open is null then
    raise exception 'formula_ai_portal_invalid_settings';
  end if;
  update formula_private.ai_portal_settings
     set sign_in_open = p_open, updated_at = now(), updated_by = p_actor_id
   where id = 'formula-2026';
  perform formula_private.ai_portal_audit(
    p_actor_id, 'ai_portal_sign_in_changed', 'ai_portal_settings', 'formula-2026',
    case when p_open then 'sign_in_opened' else 'sign_in_closed' end, '{}'::jsonb
  );
  return jsonb_build_object('signInOpen', p_open);
end;
$$;

-- Lock everything down: tables are unreachable from the Data API, and only
-- the service role may execute the portal RPCs.
revoke all on table
  formula_private.ai_portal_settings,
  formula_private.ai_portal_approvals,
  formula_private.ai_portal_access_requests,
  formula_private.ai_portal_members,
  formula_private.ai_portal_progress,
  formula_private.ai_portal_downloads,
  formula_private.ai_portal_code_requests
from public, anon, authenticated;

alter table formula_private.ai_portal_settings enable row level security;
alter table formula_private.ai_portal_approvals enable row level security;
alter table formula_private.ai_portal_access_requests enable row level security;
alter table formula_private.ai_portal_members enable row level security;
alter table formula_private.ai_portal_progress enable row level security;
alter table formula_private.ai_portal_downloads enable row level security;
alter table formula_private.ai_portal_code_requests enable row level security;

revoke all on function formula_private.ai_portal_normalize_email(text) from public, anon, authenticated;
revoke all on function formula_private.ai_portal_eligibility(text) from public, anon, authenticated;
revoke all on function formula_private.ai_portal_active_member(uuid) from public, anon, authenticated;
revoke all on function formula_private.ai_portal_audit(uuid, text, text, text, text, jsonb) from public, anon, authenticated;

revoke all on function public.formula_ai_portal_request_code(text, text) from public, anon, authenticated;
revoke all on function public.formula_ai_portal_record_code_send(uuid, boolean) from public, anon, authenticated;
revoke all on function public.formula_ai_portal_request_access(text, text, text, text) from public, anon, authenticated;
revoke all on function public.formula_ai_portal_enter(uuid, text) from public, anon, authenticated;
revoke all on function public.formula_ai_portal_set_platform(uuid, text) from public, anon, authenticated;
revoke all on function public.formula_ai_portal_record_progress(uuid, text, integer) from public, anon, authenticated;
revoke all on function public.formula_ai_portal_record_download(uuid, text, boolean) from public, anon, authenticated;
revoke all on function public.formula_ai_portal_admin_snapshot() from public, anon, authenticated;
revoke all on function public.formula_ai_portal_admin_check_email(text) from public, anon, authenticated;
revoke all on function public.formula_ai_portal_admin_approve(uuid, text, text, text) from public, anon, authenticated;
revoke all on function public.formula_ai_portal_admin_revoke_approval(uuid, uuid) from public, anon, authenticated;
revoke all on function public.formula_ai_portal_admin_dismiss_request(uuid, uuid) from public, anon, authenticated;
revoke all on function public.formula_ai_portal_admin_set_member_state(uuid, uuid, text, text) from public, anon, authenticated;
revoke all on function public.formula_ai_portal_admin_set_sign_in(uuid, boolean) from public, anon, authenticated;

grant execute on function public.formula_ai_portal_request_code(text, text) to service_role;
grant execute on function public.formula_ai_portal_record_code_send(uuid, boolean) to service_role;
grant execute on function public.formula_ai_portal_request_access(text, text, text, text) to service_role;
grant execute on function public.formula_ai_portal_enter(uuid, text) to service_role;
grant execute on function public.formula_ai_portal_set_platform(uuid, text) to service_role;
grant execute on function public.formula_ai_portal_record_progress(uuid, text, integer) to service_role;
grant execute on function public.formula_ai_portal_record_download(uuid, text, boolean) to service_role;
grant execute on function public.formula_ai_portal_admin_snapshot() to service_role;
grant execute on function public.formula_ai_portal_admin_check_email(text) to service_role;
grant execute on function public.formula_ai_portal_admin_approve(uuid, text, text, text) to service_role;
grant execute on function public.formula_ai_portal_admin_revoke_approval(uuid, uuid) to service_role;
grant execute on function public.formula_ai_portal_admin_dismiss_request(uuid, uuid) to service_role;
grant execute on function public.formula_ai_portal_admin_set_member_state(uuid, uuid, text, text) to service_role;
grant execute on function public.formula_ai_portal_admin_set_sign_in(uuid, boolean) to service_role;
