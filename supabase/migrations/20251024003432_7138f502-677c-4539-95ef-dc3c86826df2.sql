-- Create waitlist table
CREATE TABLE public.waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT NOT NULL,
  attended_2025 BOOLEAN NOT NULL,
  agency_state TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

-- Allow anyone to join the waitlist (public inserts)
CREATE POLICY "Anyone can join waitlist" ON public.waitlist
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Only authenticated users can view waitlist entries
CREATE POLICY "Authenticated users can view waitlist" ON public.waitlist
  FOR SELECT
  TO authenticated
  USING (true);

-- Create index on email for faster duplicate checks
CREATE INDEX idx_waitlist_email ON public.waitlist(email);