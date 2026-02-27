-- Drop the UNIQUE constraint on stripe_session_id to allow multiple
-- purchase records per checkout session (one per line item).
-- Idempotency is handled in the webhook by checking for existing records.
ALTER TABLE public.purchases DROP CONSTRAINT purchases_stripe_session_id_key;
