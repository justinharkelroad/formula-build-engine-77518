-- Drop the existing overly permissive policy
DROP POLICY IF EXISTS "Authenticated users can view downloads" ON public.gallery_downloads;

-- Create new admin-only policy
CREATE POLICY "Only admins can view downloads"
ON public.gallery_downloads
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));