-- Formula 2026 provider-neutral registration, identity, entitlement, and
-- projection foundation. This migration intentionally performs no backfill,
-- creates no production event row, and makes no remote Firebase call.

create extension if not exists pgcrypto with schema extensions;

create schema if not exists formula_private;
revoke all on schema formula_private from public, anon, authenticated;
grant usage on schema formula_private to service_role;

create or replace function formula_private.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create or replace function formula_private.is_sorted_unique_text_array(value text[])
returns boolean
language sql
immutable
strict
security invoker
set search_path = ''
as $$
  select value = coalesce(
    (select array_agg(item order by item)
       from (select distinct unnest(value) as item) items),
    array[]::text[]
  )
$$;

revoke execute on function formula_private.set_updated_at() from public, anon, authenticated;
revoke execute on function formula_private.is_sorted_unique_text_array(text[]) from public, anon, authenticated;
grant execute on function formula_private.set_updated_at() to service_role;
grant execute on function formula_private.is_sorted_unique_text_array(text[]) to service_role;

create table public.formula_members (
  id uuid primary key default gen_random_uuid(),
  status text not null default 'active'
    check (status in ('active', 'disabled', 'superseded')),
  superseded_by_member_id uuid null references public.formula_members(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint formula_members_supersession_shape check (
    (status = 'superseded' and superseded_by_member_id is not null and superseded_by_member_id <> id)
    or (status <> 'superseded' and superseded_by_member_id is null)
  )
);

create table public.formula_member_emails (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.formula_members(id),
  original_email text not null,
  normalized_email text not null,
  state text not null default 'candidate'
    check (state in ('candidate', 'verified', 'disputed', 'revoked')),
  is_primary boolean not null default false,
  verified_at timestamptz null,
  source_type text not null,
  source_id text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint formula_member_emails_neutral_normalization check (
    normalized_email = lower(btrim(original_email))
    and normalized_email <> ''
  ),
  constraint formula_member_emails_verification_shape check (
    (state = 'verified' and verified_at is not null)
    or (state <> 'verified' and verified_at is null)
  ),
  constraint formula_member_emails_primary_verified check (
    not is_primary or state = 'verified'
  )
);

create unique index formula_member_emails_one_primary_verified
  on public.formula_member_emails(member_id)
  where state = 'verified' and is_primary;

create unique index formula_member_emails_verified_normalized_unique
  on public.formula_member_emails(normalized_email)
  where state = 'verified';

create table public.formula_auth_identities (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.formula_members(id),
  provider text not null default 'firebase' check (provider = 'firebase'),
  provider_subject text not null check (btrim(provider_subject) <> ''),
  link_state text not null default 'candidate'
    check (link_state in ('candidate', 'active', 'revoked', 'superseded')),
  linked_at timestamptz null,
  revoked_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint formula_auth_identities_state_shape check (
    (link_state = 'active' and linked_at is not null and revoked_at is null)
    or (link_state = 'revoked' and revoked_at is not null)
    or (link_state in ('candidate', 'superseded'))
  )
);

create unique index formula_auth_identities_active_subject_unique
  on public.formula_auth_identities(provider, provider_subject)
  where link_state = 'active';

create unique index formula_auth_identities_one_active_firebase_per_member
  on public.formula_auth_identities(member_id)
  where provider = 'firebase' and link_state = 'active';

create table public.formula_agencies (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('standard', 'solo')),
  display_name text not null check (btrim(display_name) <> ''),
  status text not null default 'active' check (status in ('active', 'inactive')),
  source_type text not null,
  source_id text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (source_type, source_id)
);

create table public.formula_agency_memberships (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid not null references public.formula_agencies(id),
  member_id uuid not null references public.formula_members(id),
  membership_role text not null check (membership_role in ('owner', 'member')),
  state text not null default 'candidate'
    check (state in ('candidate', 'confirmed', 'revoked')),
  is_primary boolean not null default false,
  source_type text not null,
  source_id text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (agency_id, member_id, source_type, source_id),
  constraint formula_agency_memberships_primary_confirmed check (
    not is_primary or state = 'confirmed'
  )
);

create unique index formula_agency_memberships_one_primary_confirmed
  on public.formula_agency_memberships(member_id)
  where state = 'confirmed' and is_primary;

create table public.formula_events (
  id text primary key,
  slug text not null unique,
  display_name text not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  timezone text not null,
  state text not null default 'draft' check (state in ('draft', 'active', 'closed')),
  registry_version integer not null check (registry_version >= 0),
  registry_hash text not null check (registry_hash ~ '^[0-9a-f]{64}$'),
  capture_write_from timestamptz null,
  capture_write_until timestamptz null,
  dashboard_read_until timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint formula_events_time_order check (
    starts_at < ends_at
    and (capture_write_from is null or capture_write_until is null or capture_write_from < capture_write_until)
  )
);

create table public.formula_registration_sources (
  id uuid primary key default gen_random_uuid(),
  event_id text not null references public.formula_events(id),
  source_type text not null
    check (source_type in ('purchase', 'partner_profile', 'manual', 'legacy_registration')),
  source_id text not null,
  source_ordinal integer not null check (source_ordinal > 0),
  source_payload_hash text not null check (source_payload_hash ~ '^[0-9a-f]{64}$'),
  invited_name text null,
  invited_email text null,
  normalized_email text null,
  reconciliation_state text not null check (reconciliation_state in (
    'named_ready', 'quantity_without_names', 'missing_email', 'duplicate_email',
    'conflicting_source', 'unclassified_pass_type', 'partner_roster_missing_email',
    'already_registered', 'manual_review', 'resolved'
  )),
  review_reason text null,
  registration_id uuid null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (event_id, source_type, source_id, source_ordinal),
  constraint formula_registration_sources_neutral_normalization check (
    normalized_email is null
    or (invited_email is not null and normalized_email = lower(btrim(invited_email)))
  )
);

create table public.formula_event_registrations (
  id uuid primary key default gen_random_uuid(),
  event_id text not null references public.formula_events(id),
  member_id uuid null references public.formula_members(id),
  agency_id uuid null references public.formula_agencies(id),
  source_record_id uuid not null unique references public.formula_registration_sources(id),
  invited_name text null,
  invited_email text null,
  normalized_email text null,
  seat_type text not null check (btrim(seat_type) <> ''),
  event_role text not null check (btrim(event_role) <> ''),
  registration_state text not null default 'invited'
    check (registration_state in ('invited', 'claimed', 'checked_in', 'suspended', 'revoked')),
  claim_state text not null default 'unclaimed'
    check (claim_state in ('unclaimed', 'claim_sent', 'verification_pending', 'linked', 'active', 'manual_review')),
  checked_in_at timestamptz null,
  claimed_at timestamptz null,
  revoked_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint formula_event_registrations_neutral_normalization check (
    normalized_email is null
    or (invited_email is not null and normalized_email = lower(btrim(invited_email)))
  ),
  constraint formula_event_registrations_state_shape check (
    (registration_state <> 'checked_in' or checked_in_at is not null)
    and (registration_state not in ('claimed', 'checked_in') or claimed_at is not null)
    and (registration_state <> 'revoked' or revoked_at is not null)
    and (claim_state not in ('linked', 'active') or member_id is not null)
  )
);

alter table public.formula_registration_sources
  add constraint formula_registration_sources_registration_fk
  foreign key (registration_id) references public.formula_event_registrations(id);

create unique index formula_event_registrations_one_active_member_event
  on public.formula_event_registrations(event_id, member_id)
  where member_id is not null and registration_state in ('invited', 'claimed', 'checked_in');

create table public.formula_entitlements (
  id uuid primary key default gen_random_uuid(),
  event_registration_id uuid not null unique references public.formula_event_registrations(id),
  access_state text not null default 'pending'
    check (access_state in ('pending', 'active', 'suspended', 'revoked')),
  personal_module_slugs text[] not null default array[]::text[],
  agency_business_module_slugs text[] not null default array[]::text[],
  publisher_module_slugs text[] not null default array[]::text[],
  event_attendance_allowed boolean not null default false,
  ai_capture_allowed boolean not null default false,
  dashboard_read_allowed boolean not null default false,
  partner_hub_allowed boolean not null default false,
  capture_write_from timestamptz null,
  capture_write_until timestamptz null,
  dashboard_read_until timestamptz null,
  projection_version bigint not null default 0 check (projection_version >= 0),
  revocation_version bigint not null default 0 check (revocation_version >= 0),
  revoked_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint formula_entitlements_personal_modules_deterministic check (
    formula_private.is_sorted_unique_text_array(personal_module_slugs)
  ),
  constraint formula_entitlements_agency_modules_deterministic check (
    formula_private.is_sorted_unique_text_array(agency_business_module_slugs)
  ),
  constraint formula_entitlements_publisher_modules_deterministic check (
    formula_private.is_sorted_unique_text_array(publisher_module_slugs)
  ),
  constraint formula_entitlements_publisher_subset check (
    publisher_module_slugs <@ agency_business_module_slugs
  ),
  constraint formula_entitlements_revoked_shape check (
    (access_state = 'revoked' and revoked_at is not null)
    or (access_state <> 'revoked' and revoked_at is null)
  )
);

create table formula_private.claim_tokens (
  id uuid primary key default gen_random_uuid(),
  event_registration_id uuid not null references public.formula_event_registrations(id),
  token_hash text not null unique check (token_hash ~ '^[0-9a-f]{64}$'),
  state text not null default 'issued'
    check (state in ('issued', 'presented', 'consumed', 'expired', 'revoked')),
  invited_email_normalized text not null check (invited_email_normalized = lower(btrim(invited_email_normalized))),
  expires_at timestamptz not null,
  consumed_at timestamptz null,
  consumed_by_firebase_uid text null,
  attempt_count integer not null default 0 check (attempt_count >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint formula_claim_tokens_consumed_shape check (
    (state = 'consumed' and consumed_at is not null and consumed_by_firebase_uid is not null)
    or state <> 'consumed'
  )
);

create table formula_private.projection_outbox (
  id uuid primary key default gen_random_uuid(),
  aggregate_type text not null default 'formula_event_registration'
    check (aggregate_type = 'formula_event_registration'),
  aggregate_id uuid not null,
  event_registration_id uuid not null references public.formula_event_registrations(id),
  projection_version bigint not null check (projection_version >= 0),
  revocation_version bigint not null check (revocation_version >= 0),
  target_path text not null check (target_path ~ '^formulaEvents/[^/]+/access/[^/]+$'),
  payload jsonb not null check (jsonb_typeof(payload) = 'object'),
  payload_sha256 text not null check (payload_sha256 ~ '^[0-9a-f]{64}$'),
  state text not null default 'pending'
    check (state in ('pending', 'processing', 'processed', 'failed', 'dead_letter')),
  attempt_count integer not null default 0 check (attempt_count >= 0),
  next_attempt_at timestamptz not null default now(),
  last_error_code text null,
  created_at timestamptz not null default now(),
  processed_at timestamptz null,
  updated_at timestamptz not null default now(),
  unique (event_registration_id, projection_version),
  constraint formula_projection_outbox_aggregate_match check (aggregate_id = event_registration_id),
  constraint formula_projection_outbox_no_pii check (
    not (payload ?| array[
      'email', 'invitedEmail', 'normalizedEmail', 'displayName', 'name',
      'sourcePayload', 'stripeCustomerId', 'stripeSessionId', 'claimToken'
    ])
  ),
  constraint formula_projection_outbox_processed_shape check (
    (state = 'processed' and processed_at is not null)
    or state <> 'processed'
  )
);

create table formula_private.audit_events (
  id uuid primary key default gen_random_uuid(),
  actor_type text not null check (actor_type in ('service', 'admin', 'system')),
  actor_id text not null,
  event_type text not null check (event_type ~ '^[a-z0-9_]{1,80}$'),
  entity_type text not null check (entity_type ~ '^[a-z0-9_]{1,80}$'),
  entity_id text not null,
  reason_code text not null check (reason_code ~ '^[a-z0-9_]{1,80}$'),
  correlation_id uuid not null,
  state_summary jsonb not null default '{}'::jsonb check (jsonb_typeof(state_summary) = 'object'),
  created_at timestamptz not null default now(),
  constraint formula_audit_events_bounded_summary check (
    not (state_summary ?| array[
      'email', 'name', 'token', 'idToken', 'workbook', 'pageImage',
      'prompt', 'content', 'stripeCustomerId', 'stripeSessionId'
    ])
  )
);

create or replace function formula_private.validate_formula_entitlement()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  registration record;
  has_confirmed_membership boolean;
begin
  select r.member_id, r.agency_id
    into registration
    from public.formula_event_registrations r
   where r.id = new.event_registration_id;

  if not found then
    raise exception using errcode = '23503', message = 'formula_registration_not_found';
  end if;

  select exists (
    select 1
      from public.formula_agency_memberships m
      join public.formula_agencies a on a.id = m.agency_id
     where m.member_id = registration.member_id
       and m.agency_id = registration.agency_id
       and m.state = 'confirmed'
       and a.status = 'active'
  ) into has_confirmed_membership;

  if cardinality(new.agency_business_module_slugs) > 0
     and (registration.member_id is null or registration.agency_id is null or not has_confirmed_membership) then
    raise exception using errcode = '23514', message = 'formula_confirmed_agency_membership_required';
  end if;

  if tg_op = 'UPDATE' then
    if new.projection_version < old.projection_version then
      raise exception using errcode = '23514', message = 'formula_projection_version_cannot_decrease';
    end if;
    if new.revocation_version < old.revocation_version then
      raise exception using errcode = '23514', message = 'formula_revocation_version_cannot_decrease';
    end if;
    if old.access_state = 'revoked' and new.access_state <> 'revoked' then
      raise exception using errcode = '23514', message = 'formula_revoked_access_cannot_reactivate';
    end if;
  end if;

  return new;
end;
$$;

create trigger formula_entitlements_validate
before insert or update on public.formula_entitlements
for each row execute function formula_private.validate_formula_entitlement();

create or replace function formula_private.prevent_processed_projection_mutation()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if old.state = 'processed' and (
    new.aggregate_type is distinct from old.aggregate_type
    or new.aggregate_id is distinct from old.aggregate_id
    or new.event_registration_id is distinct from old.event_registration_id
    or new.projection_version is distinct from old.projection_version
    or new.revocation_version is distinct from old.revocation_version
    or new.target_path is distinct from old.target_path
    or new.payload is distinct from old.payload
    or new.payload_sha256 is distinct from old.payload_sha256
  ) then
    raise exception using errcode = '23514', message = 'formula_processed_projection_is_immutable';
  end if;
  return new;
end;
$$;

create trigger formula_projection_outbox_immutable
before update on formula_private.projection_outbox
for each row execute function formula_private.prevent_processed_projection_mutation();

create or replace function formula_private.build_event_access_projection(p_event_registration_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  registration record;
  identity_subject text;
  entitlement record;
  event_record record;
  member_status text;
  confirmed_agency_id uuid;
  computed_access_state text;
  allowed_modules text[];
  source_updated_at timestamptz;
begin
  select r.*
    into registration
    from public.formula_event_registrations r
   where r.id = p_event_registration_id;

  if not found then
    raise exception using errcode = 'P0001', message = 'formula_registration_not_found';
  end if;

  if registration.member_id is null then
    raise exception using errcode = 'P0001', message = 'formula_missing_member_identity';
  end if;

  select m.status into member_status
    from public.formula_members m
   where m.id = registration.member_id;

  select i.provider_subject into identity_subject
    from public.formula_auth_identities i
   where i.member_id = registration.member_id
     and i.provider = 'firebase'
     and i.link_state = 'active';

  if identity_subject is null then
    raise exception using errcode = 'P0001', message = 'formula_missing_firebase_identity';
  end if;

  select e.* into entitlement
    from public.formula_entitlements e
   where e.event_registration_id = registration.id;

  if not found then
    raise exception using errcode = 'P0001', message = 'formula_missing_entitlement';
  end if;

  select e.* into event_record
    from public.formula_events e
   where e.id = registration.event_id;

  if member_status <> 'active' and entitlement.access_state = 'active' then
    raise exception using errcode = 'P0001', message = 'formula_member_not_active';
  end if;

  computed_access_state := entitlement.access_state;
  if registration.registration_state = 'revoked' then
    computed_access_state := 'revoked';
  elsif registration.registration_state = 'suspended' then
    computed_access_state := 'suspended';
  elsif registration.registration_state not in ('claimed', 'checked_in')
     or registration.claim_state not in ('linked', 'active') then
    computed_access_state := 'pending';
  end if;

  select m.agency_id into confirmed_agency_id
    from public.formula_agency_memberships m
    join public.formula_agencies a on a.id = m.agency_id
   where m.member_id = registration.member_id
     and m.agency_id = registration.agency_id
     and m.state = 'confirmed'
     and a.status = 'active'
   order by m.is_primary desc, m.created_at
   limit 1;

  if cardinality(entitlement.agency_business_module_slugs) > 0 and confirmed_agency_id is null then
    raise exception using errcode = 'P0001', message = 'formula_confirmed_agency_membership_required';
  end if;

  select coalesce(array_agg(module_slug order by module_slug), array[]::text[])
    into allowed_modules
    from (
      select distinct unnest(entitlement.personal_module_slugs) as module_slug
      union
      select distinct unnest(entitlement.agency_business_module_slugs)
       where confirmed_agency_id is not null
    ) modules;

  source_updated_at := greatest(
    registration.updated_at,
    entitlement.updated_at,
    event_record.updated_at
  );

  return jsonb_build_object(
    'accessContractVersion', 1,
    'eventId', event_record.id,
    'firebaseUid', identity_subject,
    'memberId', registration.member_id::text,
    'registrationId', registration.id::text,
    'accessState', computed_access_state,
    'captureWriteAllowed', computed_access_state = 'active' and entitlement.ai_capture_allowed,
    'captureWriteFrom', coalesce(entitlement.capture_write_from, event_record.capture_write_from),
    'captureWriteUntil', coalesce(entitlement.capture_write_until, event_record.capture_write_until),
    'dashboardReadAllowed', computed_access_state = 'active' and entitlement.dashboard_read_allowed,
    'dashboardReadUntil', coalesce(entitlement.dashboard_read_until, event_record.dashboard_read_until),
    'revokedAt', case when computed_access_state = 'revoked' then coalesce(entitlement.revoked_at, registration.revoked_at) else null end,
    'revocationVersion', entitlement.revocation_version,
    'projectionVersion', entitlement.projection_version,
    'registryVersion', event_record.registry_version,
    'registryHash', event_record.registry_hash,
    'allowedModuleSlugs', to_jsonb(allowed_modules),
    'agencyId', confirmed_agency_id::text,
    'agencyWorkspaceId', confirmed_agency_id::text,
    'publisherModuleSlugs', to_jsonb(entitlement.publisher_module_slugs),
    'seatType', registration.seat_type,
    'eventRole', registration.event_role,
    'sourceUpdatedAt', source_updated_at
  );
end;
$$;

create or replace function formula_private.enqueue_event_access_projection(p_event_registration_id uuid)
returns uuid
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  projection_payload jsonb;
  projection_hash text;
  projection_target text;
  requested_projection_version bigint;
  requested_revocation_version bigint;
  existing_record formula_private.projection_outbox%rowtype;
  inserted_id uuid;
begin
  projection_payload := formula_private.build_event_access_projection(p_event_registration_id);
  requested_projection_version := (projection_payload ->> 'projectionVersion')::bigint;
  requested_revocation_version := (projection_payload ->> 'revocationVersion')::bigint;
  projection_hash := encode(extensions.digest(convert_to(projection_payload::text, 'UTF8'), 'sha256'), 'hex');
  projection_target := format(
    'formulaEvents/%s/access/%s',
    projection_payload ->> 'eventId',
    projection_payload ->> 'firebaseUid'
  );

  if exists (
    select 1 from formula_private.projection_outbox o
     where o.event_registration_id = p_event_registration_id
       and o.projection_version > requested_projection_version
  ) then
    raise exception using errcode = 'P0001', message = 'formula_projection_version_regression';
  end if;

  if exists (
    select 1 from formula_private.projection_outbox o
     where o.event_registration_id = p_event_registration_id
       and o.revocation_version > requested_revocation_version
  ) then
    raise exception using errcode = 'P0001', message = 'formula_revocation_version_regression';
  end if;

  insert into formula_private.projection_outbox (
    aggregate_id,
    event_registration_id,
    projection_version,
    revocation_version,
    target_path,
    payload,
    payload_sha256
  ) values (
    p_event_registration_id,
    p_event_registration_id,
    requested_projection_version,
    requested_revocation_version,
    projection_target,
    projection_payload,
    projection_hash
  )
  on conflict (event_registration_id, projection_version) do nothing
  returning id into inserted_id;

  if inserted_id is not null then
    return inserted_id;
  end if;

  select * into existing_record
    from formula_private.projection_outbox o
   where o.event_registration_id = p_event_registration_id
     and o.projection_version = requested_projection_version;

  if existing_record.payload_sha256 <> projection_hash
     or existing_record.payload <> projection_payload
     or existing_record.revocation_version <> requested_revocation_version
     or existing_record.target_path <> projection_target then
    raise exception using errcode = 'P0001', message = 'formula_projection_version_conflict';
  end if;

  return existing_record.id;
end;
$$;

revoke execute on function formula_private.validate_formula_entitlement() from public, anon, authenticated;
revoke execute on function formula_private.prevent_processed_projection_mutation() from public, anon, authenticated;
revoke execute on function formula_private.build_event_access_projection(uuid) from public, anon, authenticated;
revoke execute on function formula_private.enqueue_event_access_projection(uuid) from public, anon, authenticated;
grant execute on function formula_private.build_event_access_projection(uuid) to service_role;
grant execute on function formula_private.enqueue_event_access_projection(uuid) to service_role;

alter table public.formula_members enable row level security;
alter table public.formula_member_emails enable row level security;
alter table public.formula_auth_identities enable row level security;
alter table public.formula_agencies enable row level security;
alter table public.formula_agency_memberships enable row level security;
alter table public.formula_events enable row level security;
alter table public.formula_registration_sources enable row level security;
alter table public.formula_event_registrations enable row level security;
alter table public.formula_entitlements enable row level security;

revoke all on table
  public.formula_members,
  public.formula_member_emails,
  public.formula_auth_identities,
  public.formula_agencies,
  public.formula_agency_memberships,
  public.formula_events,
  public.formula_registration_sources,
  public.formula_event_registrations,
  public.formula_entitlements
from anon, authenticated;

grant select on table
  public.formula_members,
  public.formula_member_emails,
  public.formula_auth_identities,
  public.formula_agencies,
  public.formula_agency_memberships,
  public.formula_events,
  public.formula_registration_sources,
  public.formula_event_registrations,
  public.formula_entitlements
to authenticated;

grant all on table
  public.formula_members,
  public.formula_member_emails,
  public.formula_auth_identities,
  public.formula_agencies,
  public.formula_agency_memberships,
  public.formula_events,
  public.formula_registration_sources,
  public.formula_event_registrations,
  public.formula_entitlements
to service_role;

grant all on table
  formula_private.claim_tokens,
  formula_private.projection_outbox,
  formula_private.audit_events
to service_role;

revoke all on table
  formula_private.claim_tokens,
  formula_private.projection_outbox,
  formula_private.audit_events
from public, anon, authenticated;

create policy "Formula admins can read members"
  on public.formula_members for select to authenticated
  using (public.has_role((select auth.uid()), 'admin'));
create policy "Formula admins can read member emails"
  on public.formula_member_emails for select to authenticated
  using (public.has_role((select auth.uid()), 'admin'));
create policy "Formula admins can read auth identities"
  on public.formula_auth_identities for select to authenticated
  using (public.has_role((select auth.uid()), 'admin'));
create policy "Formula admins can read agencies"
  on public.formula_agencies for select to authenticated
  using (public.has_role((select auth.uid()), 'admin'));
create policy "Formula admins can read agency memberships"
  on public.formula_agency_memberships for select to authenticated
  using (public.has_role((select auth.uid()), 'admin'));
create policy "Formula admins can read events"
  on public.formula_events for select to authenticated
  using (public.has_role((select auth.uid()), 'admin'));
create policy "Formula admins can read registration sources"
  on public.formula_registration_sources for select to authenticated
  using (public.has_role((select auth.uid()), 'admin'));
create policy "Formula admins can read event registrations"
  on public.formula_event_registrations for select to authenticated
  using (public.has_role((select auth.uid()), 'admin'));
create policy "Formula admins can read entitlements"
  on public.formula_entitlements for select to authenticated
  using (public.has_role((select auth.uid()), 'admin'));

create trigger formula_members_updated_at before update on public.formula_members
for each row execute function formula_private.set_updated_at();
create trigger formula_member_emails_updated_at before update on public.formula_member_emails
for each row execute function formula_private.set_updated_at();
create trigger formula_auth_identities_updated_at before update on public.formula_auth_identities
for each row execute function formula_private.set_updated_at();
create trigger formula_agencies_updated_at before update on public.formula_agencies
for each row execute function formula_private.set_updated_at();
create trigger formula_agency_memberships_updated_at before update on public.formula_agency_memberships
for each row execute function formula_private.set_updated_at();
create trigger formula_events_updated_at before update on public.formula_events
for each row execute function formula_private.set_updated_at();
create trigger formula_registration_sources_updated_at before update on public.formula_registration_sources
for each row execute function formula_private.set_updated_at();
create trigger formula_event_registrations_updated_at before update on public.formula_event_registrations
for each row execute function formula_private.set_updated_at();
create trigger formula_entitlements_updated_at before update on public.formula_entitlements
for each row execute function formula_private.set_updated_at();
create trigger formula_claim_tokens_updated_at before update on formula_private.claim_tokens
for each row execute function formula_private.set_updated_at();
create trigger formula_projection_outbox_updated_at before update on formula_private.projection_outbox
for each row execute function formula_private.set_updated_at();

comment on schema formula_private is 'Non-exposed Formula claim, projection, and audit data.';
comment on function formula_private.build_event_access_projection(uuid) is
  'Service-only deterministic Increment 6 Firestore access payload builder; contains no PII.';
comment on function formula_private.enqueue_event_access_projection(uuid) is
  'Service-only idempotent projection outbox enqueue; performs no remote call.';