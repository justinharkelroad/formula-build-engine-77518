-- Add video/stage file columns to partner_profiles
ALTER TABLE public.partner_profiles
  ADD COLUMN IF NOT EXISTS video_loop_url text,
  ADD COLUMN IF NOT EXISTS stage_file_urls jsonb DEFAULT '[]'::jsonb;

-- Storage bucket for partner video loops and stage files
INSERT INTO storage.buckets (id, name, public)
VALUES ('partner-files', 'partner-files', true)
ON CONFLICT DO NOTHING;

CREATE POLICY "Anyone can upload partner files"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'partner-files');

CREATE POLICY "Anyone can view partner files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'partner-files');
