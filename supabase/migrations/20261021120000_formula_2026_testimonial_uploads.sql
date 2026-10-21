-- Video and audio testimonials for the Formula 2026 surveys.
--
-- Files live in a private bucket with no storage policies, so only the
-- service role can read or write. The browser uploads through a one-time
-- signed URL issued by formula-survey-submit, and reviewers play files
-- through short-lived signed URLs issued by formula-survey-results.
-- Each file's name is the testimonial's own submission key, so it carries
-- nothing from any survey response.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'formula-survey-testimonials',
  'formula-survey-testimonials',
  false,
  52428800,
  array[
    'video/mp4', 'video/quicktime', 'video/webm',
    'audio/mpeg', 'audio/mp4', 'audio/x-m4a', 'audio/aac', 'audio/wav', 'audio/x-wav', 'audio/webm'
  ]
)
on conflict (id) do update
  set public = false,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

alter table formula_private.survey_testimonials
  alter column body drop not null,
  add column media_path text null check (media_path is null or media_path ~ '^testimonials/[0-9a-f-]{36}\.[a-z0-9]{2,5}$'),
  add column media_type text null,
  add column media_bytes bigint null,
  add constraint survey_testimonial_has_content check (body is not null or media_path is not null);

drop function if exists public.formula_survey_testimonial_submit(uuid, text, text, text, text, text, text, boolean);

-- Saves a testimonial. When a file is attached it must already be in the
-- bucket at exactly the path derived from this testimonial's key.
create or replace function public.formula_survey_testimonial_submit(
  p_submission_key uuid,
  p_audience text,
  p_body text,
  p_media_path text,
  p_media_type text,
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
  v_bytes bigint;
begin
  if p_media_path is not null then
    if p_media_path <> 'testimonials/' || p_submission_key::text || '.' || split_part(p_media_path, '.', 2) then
      raise exception 'formula_survey_media_missing';
    end if;
    select (o.metadata->>'size')::bigint into v_bytes
      from storage.objects o
     where o.bucket_id = 'formula-survey-testimonials' and o.name = p_media_path;
    if not found then
      raise exception 'formula_survey_media_missing';
    end if;
  end if;

  insert into formula_private.survey_testimonials (
    submission_key, audience, body, media_path, media_type, media_bytes,
    full_name, company, title, email, publish_consent
  )
  values (
    p_submission_key, p_audience, nullif(trim(coalesce(p_body, '')), ''),
    p_media_path, p_media_type, v_bytes,
    trim(p_full_name),
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

-- Same reviewer gate; testimonials now carry their file path and type.
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
      'mediaPath', t.media_path,
      'mediaType', t.media_type,
      'mediaBytes', t.media_bytes,
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

revoke all on function public.formula_survey_testimonial_submit(uuid, text, text, text, text, text, text, text, text, boolean)
  from public, anon, authenticated;
grant execute on function public.formula_survey_testimonial_submit(uuid, text, text, text, text, text, text, text, text, boolean)
  to service_role;

revoke all on function public.formula_survey_results(uuid) from public, anon, authenticated;
grant execute on function public.formula_survey_results(uuid) to service_role;
