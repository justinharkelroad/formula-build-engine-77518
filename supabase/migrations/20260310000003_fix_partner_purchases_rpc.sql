-- RPC function to fix misclassified partner purchases.
-- Runs as SECURITY DEFINER so it can UPDATE purchases (which has no admin UPDATE policy).
-- Admin-only: checks has_role before executing.

CREATE OR REPLACE FUNCTION public.fix_partner_purchases()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  updated_count integer;
  profiles_created integer;
BEGIN
  -- Only allow admins
  IF NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    RAISE EXCEPTION 'Admin access required';
  END IF;

  -- 1. Fix misclassified partner purchases (unknown → correct tier)
  WITH updated AS (
    UPDATE purchases SET
      pass_type = 'partner',
      tier = CASE
        WHEN amount = 1500000 THEN 'platinum'
        WHEN amount = 1000000 THEN 'gold'
        WHEN amount = 750000 THEN 'silver'
        WHEN amount = 500000 THEN 'bronze'
      END
    WHERE pass_type = 'unknown'
      AND amount IN (1500000, 1000000, 750000, 500000)
    RETURNING *
  )
  SELECT count(*) INTO updated_count FROM updated;

  -- 2. Create partner_profiles for any partner purchase missing a profile
  WITH inserted AS (
    INSERT INTO partner_profiles (tier, stripe_session_id, purchase_email, purchase_name)
    SELECT
      p.tier,
      p.stripe_session_id,
      p.email,
      p.name
    FROM purchases p
    WHERE p.pass_type = 'partner'
      AND NOT EXISTS (
        SELECT 1 FROM partner_profiles pp
        WHERE pp.stripe_session_id = p.stripe_session_id
      )
    RETURNING *
  )
  SELECT count(*) INTO profiles_created FROM inserted;

  RETURN jsonb_build_object(
    'purchases_fixed', updated_count,
    'profiles_created', profiles_created
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.fix_partner_purchases() TO authenticated;
