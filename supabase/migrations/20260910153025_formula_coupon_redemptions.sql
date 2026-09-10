-- Preserve Stripe's checkout timestamp separately from the time a row was
-- inserted into Formula. This keeps historical reconciliations on the date the
-- customer actually checked out.
ALTER TABLE public.purchases
  ADD COLUMN purchased_at timestamptz;

UPDATE public.purchases
SET purchased_at = created_at
WHERE purchased_at IS NULL;

ALTER TABLE public.purchases
  ALTER COLUMN purchased_at SET DEFAULT now(),
  ALTER COLUMN purchased_at SET NOT NULL;

CREATE TABLE public.coupon_redemptions (
  stripe_session_id text PRIMARY KEY,
  stripe_promotion_code_id text,
  promotion_code text,
  stripe_coupon_id text NOT NULL,
  coupon_name text,
  customer_email text NOT NULL,
  customer_name text,
  discount_amount integer NOT NULL DEFAULT 0 CHECK (discount_amount >= 0),
  currency text NOT NULL DEFAULT 'usd',
  quantity integer NOT NULL DEFAULT 1 CHECK (quantity > 0),
  redeemed_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.coupon_redemptions IS
  'One normalized Stripe coupon redemption per Formula checkout session.';
COMMENT ON COLUMN public.coupon_redemptions.redeemed_at IS
  'Stripe Checkout Session created timestamp; this is the date the code was used.';

CREATE INDEX coupon_redemptions_code_redeemed_at_idx
  ON public.coupon_redemptions (promotion_code, redeemed_at DESC);

ALTER TABLE public.coupon_redemptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can view coupon redemptions"
  ON public.coupon_redemptions
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));
