CREATE OR REPLACE FUNCTION public.fix_partner_purchases()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  result jsonb;
  fixed_count integer := 0;
  partner_tiers text[] := ARRAY['platinum', 'gold', 'silver', 'bronze'];
BEGIN
  -- For each partner purchase that doesn't have a matching partner_profiles row, create one
  INSERT INTO public.partner_profiles (tier, stripe_session_id, purchase_email, purchase_name)
  SELECT DISTINCT p.tier, p.stripe_session_id, p.email, p.name
  FROM public.purchases p
  WHERE p.pass_type = 'partner'
    AND p.tier = ANY(partner_tiers)
    AND NOT EXISTS (
      SELECT 1 FROM public.partner_profiles pp
      WHERE pp.stripe_session_id = p.stripe_session_id
    );

  GET DIAGNOSTICS fixed_count = ROW_COUNT;

  result := jsonb_build_object(
    'profiles_created', fixed_count,
    'message', format('Created %s missing partner profiles', fixed_count)
  );

  RETURN result;
END;
$$;