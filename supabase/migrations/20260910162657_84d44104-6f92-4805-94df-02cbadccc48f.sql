REVOKE ALL ON public.coupon_redemptions FROM anon, authenticated, service_role;

GRANT SELECT ON public.coupon_redemptions TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.coupon_redemptions TO service_role;