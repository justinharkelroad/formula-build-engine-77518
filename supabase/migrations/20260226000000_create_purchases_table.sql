CREATE TABLE public.purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  name text,
  stripe_session_id text UNIQUE NOT NULL,
  stripe_payment_link_id text,
  amount integer NOT NULL,
  currency text NOT NULL DEFAULT 'usd',
  pass_type text NOT NULL,
  tier text NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can view purchases"
  ON public.purchases FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));
