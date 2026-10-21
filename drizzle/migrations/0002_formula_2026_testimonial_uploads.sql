-- Video and audio testimonials for the Formula 2026 surveys.
-- Bucket 'formula-survey-testimonials' (private, 50MB) was created via the
-- storage tool because INSERT/UPDATE on storage.buckets is rejected in migrations.

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
    p_submission_key, p_submission_key is not null and p_audience,
    null, null, null, null, null, null, null, null, null
  );
end;
$$;