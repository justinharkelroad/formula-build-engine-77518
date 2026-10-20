-- Formula 2026 survey testimonials, and the 2027 date question's results.
--
-- A testimonial is left after the survey is submitted and is saved on its
-- own: no response id, no shared transaction, submitted_at cut to the hour.
-- Leaving one never identifies an anonymous survey response.
-- The 2027 date answers need no schema change: they are stored in
-- survey_responses.structured_answers like every other answer.

create table formula_private.survey_testimonials (
  id uuid primary key default gen_random_uuid(),
  submission_key uuid not null unique,
  audience text not null check (audience in ('attendee', 'partner')),
  body text not null check (length(body) between 1 and 1500),
  full_name text not null check (length(full_name) between 1 and 120),
  company text null check (company is null or length(company) <= 160),
  title text null check (title is null or length(title) <= 120),
  email text null check (email is null or (length(email) between 3 and 254 and email = lower(email))),
  publish_consent boolean not null,
  submitted_at timestamptz not null default date_trunc('hour', now())
);

create or replace function public.formula_survey_testimonial_submit(
  p_submission_key uuid,
  p_audience text,
  p_body text,
  p_full_name text,
  p_company text,
  p_title text,
  p_email text,
  p_publish_consent boolean
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_id uuid;
begin
  insert into formula_private.survey_testimonials (
    submission_key, audience, body, full_name, company, title, email, publish_consent
  )
  values (
    p_submission_key, p_audience, trim(p_body), trim(p_full_name),
    nullif(trim(coalesce(p_company, '')), ''),
    nullif(trim(coalesce(p_title, '')), ''),
    nullif(lower(trim(coalesce(p_email, ''))), ''),
    p_publish_consent
  )
  on conflict (submission_key) do nothing
  returning id into v_id;

  return jsonb_build_object('status', case when v_id is null then 'duplicate' else 'created' end);
end;
$$;

-- Same reviewer gate as before; now also returns testimonials.
create or replace function public.formula_survey_results(p_user_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_allowed boolean;
  v_responses jsonb;
  v_testimonials jsonb;
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

  select coalesce(jsonb_agg(jsonb_build_object(
      'id', t.id,
      'audience', t.audience,
      'body', t.body,
      'fullName', t.full_name,
      'company', t.company,
      'title', t.title,
      'email', t.email,
      'publishConsent', t.publish_consent,
      'submittedAt', t.submitted_at
    ) order by t.submitted_at desc, t.id), '[]'::jsonb)
    into v_testimonials
    from formula_private.survey_testimonials t;

  return jsonb_build_object('responses', v_responses, 'testimonials', v_testimonials, 'generatedAt', now());
end;
$$;

revoke all on table formula_private.survey_testimonials from public, anon, authenticated;
alter table formula_private.survey_testimonials enable row level security;

revoke all on function public.formula_survey_testimonial_submit(uuid, text, text, text, text, text, text, boolean)
  from public, anon, authenticated;
grant execute on function public.formula_survey_testimonial_submit(uuid, text, text, text, text, text, text, boolean)
  to service_role;

revoke all on function public.formula_survey_results(uuid) from public, anon, authenticated;
grant execute on function public.formula_survey_results(uuid) to service_role;
