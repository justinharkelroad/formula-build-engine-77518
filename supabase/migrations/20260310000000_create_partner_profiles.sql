-- Partner profiles: stores onboarding info submitted by partners after purchase
CREATE TABLE public.partner_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tier text NOT NULL,
  stripe_session_id text,
  purchase_email text,
  purchase_name text,

  -- Company info
  company_name text,
  company_bio text,
  website_url text,
  logo_url text,

  -- Primary contact
  primary_contact_name text,
  primary_contact_email text,
  primary_contact_phone text,

  -- Marketing contact
  marketing_contact_name text,
  marketing_contact_email text,

  -- Attendees (JSON array of {name, email})
  attendees jsonb DEFAULT '[]'::jsonb,

  -- Social media
  social_linkedin text,
  social_facebook text,
  social_instagram text,
  social_twitter text,

  onboarding_completed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.partner_profiles ENABLE ROW LEVEL SECURITY;

-- Public access policies (no auth required for partner onboarding)
CREATE POLICY "partner_profiles_insert" ON public.partner_profiles
  FOR INSERT WITH CHECK (true);

CREATE POLICY "partner_profiles_select" ON public.partner_profiles
  FOR SELECT USING (true);

CREATE POLICY "partner_profiles_update" ON public.partner_profiles
  FOR UPDATE USING (true);

-- Storage bucket for partner logos
INSERT INTO storage.buckets (id, name, public)
VALUES ('partner-logos', 'partner-logos', true)
ON CONFLICT DO NOTHING;

CREATE POLICY "Anyone can upload partner logos"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'partner-logos');

CREATE POLICY "Anyone can view partner logos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'partner-logos');
