-- Formula 2026 post-event surveys (/survey) and the reviewer-only results page.
--
-- Privacy model:
-- - Anonymous attendee responses carry no contact row, no account id, no
--   registration id, no email and no IP. submitted_at is cut to the hour so it
--   cannot be lined up with request logs.
-- - Contact details live in their own table and exist only for identified
--   attendees and partners.
-- - Rate limiting is a separate call in its own transaction, before the save.
--   It keeps only a counter per salted connection hash per 10-minute bucket,
--   so no row, timestamp or transaction id ties a connection to a response.
--   Buckets older than an hour are deleted on every check.
-- - Every table is in formula_private (not exposed over the Data API) and is
--   reached only through the service-role RPCs below.
-- - Results are readable only by a website admin whose sign-in email is on
--   formula_private.survey_reviewers. Being an admin is not enough on its own.
--
-- Responses are kept until an owner deletes them. Nothing here expires them.

create table formula_private.survey_responses (
  id uuid primary key default gen_random_uuid(),
  submission_key uuid not null unique,
  audience text not null check (audience in ('attendee', 'partner')),
  role text null check (role in ('owner', 'team_member', 'other', 'prefer_not_to_say')),
  anonymity_mode text not null check (anonymity_mode in ('anonymous', 'identified')),
  submitted_at timestamptz not null default date_trunc('hour', now()),
  structured_answers jsonb not null default '{}'::jsonb check (jsonb_typeof(structured_answers) = 'object'),
  free_text_answers jsonb not null default '{}'::jsonb check (jsonb_typeof(free_text_answers) = 'object'),
  schema_version integer not null check (schema_version > 0),
  constraint survey_partner_identified check (audience <> 'partner' or anonymity_mode = 'identified'),
  constraint survey_role_attendee_only check (audience = 'attendee' or role is null)
);

create index survey_responses_audience_time on formula_private.survey_responses(audience, submitted_at desc);

-- Identified responses only, so an exact received time here reveals nothing
-- about anonymous answers. It orders a company's repeat responses.
create table formula_private.survey_contact_details (
  response_id uuid primary key references formula_private.survey_responses(id) on delete cascade,
  full_name text not null check (length(full_name) between 1 and 120),
  email text not null check (length(email) between 3 and 254 and email = lower(email)),
  company text null check (company is null or length(company) <= 160),
  title text null check (title is null or length(title) <= 120),
  contact_permission boolean null,
  received_at timestamptz not null default now()
);

create table formula_private.survey_rate_buckets (
  client_hash text not null check (client_hash ~ '^[0-9a-f]{64}$'),
  bucket_start timestamptz not null,
  attempts integer not null default 0 check (attempts >= 0),
  primary key (client_hash, bucket_start)
);

create table formula_private.survey_reviewers (
  email text primary key check (email = lower(email) and length(email) between 3 and 254),
  added_at timestamptz not null default now()
);

create table formula_private.survey_access_log (
  id bigint generated always as identity primary key,
  reviewer_id uuid not null,
  action text not null check (action = 'results'),
  created_at timestamptz not null default now()
);

-- Rate check, called by formula-survey-submit before it saves anything and as
-- its own request, so this write never shares a transaction with a response.
-- Allows 20 saves per connection per 10-minute bucket and 60 per hour.
create or replace function public.formula_survey_rate_check(p_client_hash text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_bucket timestamptz := date_bin('10 minutes', now(), timestamptz '2026-01-01');
  v_now integer;
  v_hour integer;
begin
  if p_client_hash is null or p_client_hash !~ '^[0-9a-f]{64}$' then
    raise exception 'formula_survey_invalid_client';
  end if;

  delete from formula_private.survey_rate_buckets b where b.bucket_start < v_bucket - interval '1 hour';

  insert into formula_private.survey_rate_buckets as b (client_hash, bucket_start, attempts)
  values (p_client_hash, v_bucket, 1)
  on conflict (client_hash, bucket_start) do update set attempts = b.attempts + 1
  returning attempts into v_now;

  select coalesce(sum(b.attempts), 0) into v_hour
    from formula_private.survey_rate_buckets b
   where b.client_hash = p_client_hash and b.bucket_start > v_bucket - interval '1 hour';

  return jsonb_build_object('allowed', v_now <= 20 and v_hour <= 60);
end;
$$;

-- Save, called only by formula-survey-submit after it validated the payload
-- and passed the rate check. Re-checks the privacy invariants as a backstop.
-- The same submission_key always lands once; a retry reports 'duplicate'.
create or replace function public.formula_survey_submit(
  p_submission_key uuid,
  p_audience text,
  p_role text,
  p_anonymity text,
  p_structured jsonb,
  p_free_text jsonb,
  p_contact jsonb,
  p_schema_version integer
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_id uuid;
begin
  if p_anonymity = 'anonymous' and p_contact is not null then
    raise exception 'formula_survey_anonymous_with_contact';
  end if;
  if p_anonymity = 'identified' and (
    p_contact is null
    or coalesce(trim(p_contact->>'fullName'), '') = ''
    or coalesce(trim(p_contact->>'email'), '') = ''
    or (p_audience = 'partner' and coalesce(trim(p_contact->>'company'), '') = '')
  ) then
    raise exception 'formula_survey_contact_required';
  end if;

  insert into formula_private.survey_responses (
    submission_key, audience, role, anonymity_mode, structured_answers, free_text_answers, schema_version
  )
  values (
    p_submission_key, p_audience, p_role, p_anonymity,
    coalesce(p_structured, '{}'::jsonb), coalesce(p_free_text, '{}'::jsonb), p_schema_version
  )
  on conflict (submission_key) do nothing
  returning id into v_id;

  if v_id is null then
    return jsonb_build_object('status', 'duplicate');
  end if;

  if p_anonymity = 'identified' then
    insert into formula_private.survey_contact_details (
      response_id, full_name, email, company, title, contact_permission
    )
    values (
      v_id,
      trim(p_contact->>'fullName'),
      lower(trim(p_contact->>'email')),
      nullif(trim(coalesce(p_contact->>'company', '')), ''),
      nullif(trim(coalesce(p_contact->>'title', '')), ''),
      case when p_audience = 'attendee' then coalesce((p_contact->>'contactPermission')::boolean, false) else null end
    );
  end if;

  return jsonb_build_object('status', 'created');
end;
$$;

-- Reviewer read. The function verifies the caller's token; this checks that
-- the verified user is an admin AND on the reviewer list, and logs the read.
create or replace function public.formula_survey_results(p_user_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_allowed boolean;
  v_responses jsonb;
begin
  select exists (
    select 1
      from auth.users u
      join formula_private.survey_reviewers r on r.email = lower(u.email)
      join public.user_roles ur on ur.user_id = u.id and ur.role = 'admin'
     where u.id = p_user_id
  ) into v_allowed;

  if not coalesce(v_allowed, false) then
    raise exception 'formula_survey_not_reviewer';
  end if;

  insert into formula_private.survey_access_log (reviewer_id, action) values (p_user_id, 'results');

  select coalesce(jsonb_agg(jsonb_build_object(
      'id', r.id,
      'audience', r.audience,
      'role', r.role,
      'anonymity', r.anonymity_mode,
      'submittedAt', r.submitted_at,
      'answers', r.structured_answers,
      'freeText', r.free_text_answers,
      'schemaVersion', r.schema_version,
      'contact', case when c.response_id is null then null else jsonb_build_object(
        'fullName', c.full_name,
        'email', c.email,
        'company', c.company,
        'title', c.title,
        'contactPermission', c.contact_permission,
        'receivedAt', c.received_at
      ) end
    ) order by r.submitted_at, r.id), '[]'::jsonb)
    into v_responses
    from formula_private.survey_responses r
    left join formula_private.survey_contact_details c on c.response_id = r.id;

  return jsonb_build_object('responses', v_responses, 'generatedAt', now());
end;
$$;

revoke all on table
  formula_private.survey_responses,
  formula_private.survey_contact_details,
  formula_private.survey_rate_buckets,
  formula_private.survey_reviewers,
  formula_private.survey_access_log
from public, anon, authenticated;

alter table formula_private.survey_responses enable row level security;
alter table formula_private.survey_contact_details enable row level security;
alter table formula_private.survey_rate_buckets enable row level security;
alter table formula_private.survey_reviewers enable row level security;
alter table formula_private.survey_access_log enable row level security;

revoke all on function public.formula_survey_rate_check(text) from public, anon, authenticated;
revoke all on function public.formula_survey_submit(uuid, text, text, text, jsonb, jsonb, jsonb, integer)
  from public, anon, authenticated;
revoke all on function public.formula_survey_results(uuid) from public, anon, authenticated;

grant execute on function public.formula_survey_rate_check(text) to service_role;
grant execute on function public.formula_survey_submit(uuid, text, text, text, jsonb, jsonb, jsonb, integer)
  to service_role;
grant execute on function public.formula_survey_results(uuid) to service_role;