-- Formula 2026 testimonial uploads: enforce the file type in the database.
--
-- Lovable Cloud could not apply allowed_mime_types to the
-- formula-survey-testimonials bucket (bucket changes are blocked in SQL and
-- its storage tool has no type setting), so a one-time upload token could
-- store any content type at a .mp4/.mov/... path. This makes the save step
-- refuse a testimonial unless the stored object's type is exactly the
-- declared video/audio type. A mismatched file stays an orphan in the
-- private bucket: never referenced, never linked, never shown to reviewers.

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
  v_stored_type text;
begin
  if p_media_path is not null then
    if p_media_path <> 'testimonials/' || p_submission_key::text || '.' || split_part(p_media_path, '.', 2) then
      raise exception 'formula_survey_media_missing';
    end if;
    select (o.metadata->>'size')::bigint, o.metadata->>'mimetype' into v_bytes, v_stored_type
      from storage.objects o
     where o.bucket_id = 'formula-survey-testimonials' and o.name = p_media_path;
    if not found then
      raise exception 'formula_survey_media_missing';
    end if;
    -- The bucket cannot enforce a type list on this platform, so check here:
    -- the stored file must be exactly the video/audio type the form declared.
    if v_stored_type is distinct from p_media_type
       or p_media_type not in (
         'video/mp4', 'video/quicktime', 'video/webm',
         'audio/mpeg', 'audio/mp4', 'audio/x-m4a', 'audio/aac', 'audio/wav', 'audio/x-wav', 'audio/webm'
       ) then
      raise exception 'formula_survey_media_type_mismatch';
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

revoke all on function public.formula_survey_testimonial_submit(uuid, text, text, text, text, text, text, text, text, boolean)
  from public, anon, authenticated;
grant execute on function public.formula_survey_testimonial_submit(uuid, text, text, text, text, text, text, text, text, boolean)
  to service_role;
