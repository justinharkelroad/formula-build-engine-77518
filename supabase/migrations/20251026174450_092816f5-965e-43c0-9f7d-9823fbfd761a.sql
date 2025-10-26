-- Create gallery_downloads table to track photo downloads and collect lead data
CREATE TABLE gallery_downloads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  download_type TEXT NOT NULL CHECK (download_type IN ('all', 'selected')),
  photo_count INTEGER NOT NULL,
  selected_photos JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add index for email lookups
CREATE INDEX idx_gallery_downloads_email ON gallery_downloads(email);

-- Add index for created_at for analytics
CREATE INDEX idx_gallery_downloads_created_at ON gallery_downloads(created_at DESC);

-- Enable RLS
ALTER TABLE gallery_downloads ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can insert (public form submission)
CREATE POLICY "Anyone can submit download data" 
  ON gallery_downloads 
  FOR INSERT 
  WITH CHECK (true);

-- Policy: Only authenticated users can read (for admin dashboard later)
CREATE POLICY "Authenticated users can view downloads" 
  ON gallery_downloads 
  FOR SELECT 
  USING (auth.role() = 'authenticated');