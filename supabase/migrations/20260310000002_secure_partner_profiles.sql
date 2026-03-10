-- =============================================================
-- Secure partner_profiles: replace wide-open RLS with
-- admin-only direct access + RPC functions for partner portal
-- =============================================================

-- 1. Drop the existing permissive policies
DROP POLICY IF EXISTS "partner_profiles_insert" ON public.partner_profiles;
DROP POLICY IF EXISTS "partner_profiles_select" ON public.partner_profiles;
DROP POLICY IF EXISTS "partner_profiles_update" ON public.partner_profiles;

-- 2. Admin-only policies for direct table access (AdminSales page)
CREATE POLICY "admin_partner_profiles_select" ON public.partner_profiles
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "admin_partner_profiles_update" ON public.partner_profiles
  FOR UPDATE USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "admin_partner_profiles_insert" ON public.partner_profiles
  FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "admin_partner_profiles_delete" ON public.partner_profiles
  FOR DELETE USING (public.has_role(auth.uid(), 'admin'::public.app_role));

-- 3. RPC: get partner profile by stripe session ID
--    SECURITY DEFINER = runs as the function owner, bypassing RLS
--    Partners use their session_id as a bearer token
CREATE OR REPLACE FUNCTION public.get_partner_profile_by_session(p_session_id text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
BEGIN
  IF p_session_id IS NULL OR p_session_id = '' THEN
    RETURN NULL;
  END IF;

  SELECT to_jsonb(pp.*) INTO result
  FROM public.partner_profiles pp
  WHERE pp.stripe_session_id = p_session_id
  LIMIT 1;

  RETURN result;
END;
$$;

-- 4. RPC: save (upsert) partner profile by stripe session ID
CREATE OR REPLACE FUNCTION public.save_partner_profile(
  p_session_id text,
  p_tier text,
  p_company_name text DEFAULT NULL,
  p_company_bio text DEFAULT NULL,
  p_website_url text DEFAULT NULL,
  p_logo_url text DEFAULT NULL,
  p_video_loop_url text DEFAULT NULL,
  p_stage_file_urls jsonb DEFAULT NULL,
  p_primary_contact_name text DEFAULT NULL,
  p_primary_contact_email text DEFAULT NULL,
  p_primary_contact_phone text DEFAULT NULL,
  p_marketing_contact_name text DEFAULT NULL,
  p_marketing_contact_email text DEFAULT NULL,
  p_social_linkedin text DEFAULT NULL,
  p_social_facebook text DEFAULT NULL,
  p_social_instagram text DEFAULT NULL,
  p_social_twitter text DEFAULT NULL,
  p_attendees jsonb DEFAULT '[]'::jsonb,
  p_onboarding_completed boolean DEFAULT false
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  existing_id uuid;
  result jsonb;
BEGIN
  IF p_session_id IS NULL OR p_session_id = '' THEN
    RAISE EXCEPTION 'session_id is required';
  END IF;

  -- Check if row exists
  SELECT id INTO existing_id
  FROM public.partner_profiles
  WHERE stripe_session_id = p_session_id
  LIMIT 1;

  IF existing_id IS NOT NULL THEN
    -- Update existing row
    UPDATE public.partner_profiles SET
      tier = p_tier,
      company_name = p_company_name,
      company_bio = p_company_bio,
      website_url = p_website_url,
      logo_url = p_logo_url,
      video_loop_url = p_video_loop_url,
      stage_file_urls = p_stage_file_urls,
      primary_contact_name = p_primary_contact_name,
      primary_contact_email = p_primary_contact_email,
      primary_contact_phone = p_primary_contact_phone,
      marketing_contact_name = p_marketing_contact_name,
      marketing_contact_email = p_marketing_contact_email,
      social_linkedin = p_social_linkedin,
      social_facebook = p_social_facebook,
      social_instagram = p_social_instagram,
      social_twitter = p_social_twitter,
      attendees = p_attendees,
      onboarding_completed = p_onboarding_completed,
      updated_at = now()
    WHERE id = existing_id;

    SELECT to_jsonb(pp.*) INTO result
    FROM public.partner_profiles pp
    WHERE pp.id = existing_id;
  ELSE
    -- Insert new row (fallback if webhook didn't create one)
    INSERT INTO public.partner_profiles (
      tier, stripe_session_id, company_name, company_bio, website_url,
      logo_url, video_loop_url, stage_file_urls,
      primary_contact_name, primary_contact_email, primary_contact_phone,
      marketing_contact_name, marketing_contact_email,
      social_linkedin, social_facebook, social_instagram, social_twitter,
      attendees, onboarding_completed
    ) VALUES (
      p_tier, p_session_id, p_company_name, p_company_bio, p_website_url,
      p_logo_url, p_video_loop_url, p_stage_file_urls,
      p_primary_contact_name, p_primary_contact_email, p_primary_contact_phone,
      p_marketing_contact_name, p_marketing_contact_email,
      p_social_linkedin, p_social_facebook, p_social_instagram, p_social_twitter,
      p_attendees, p_onboarding_completed
    )
    RETURNING to_jsonb(partner_profiles.*) INTO result;
  END IF;

  RETURN result;
END;
$$;

-- Grant execute to anon and authenticated roles
GRANT EXECUTE ON FUNCTION public.get_partner_profile_by_session(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.save_partner_profile(text, text, text, text, text, text, text, jsonb, text, text, text, text, text, text, text, text, text, jsonb, boolean) TO anon, authenticated;
