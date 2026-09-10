import { assertEquals } from "https://deno.land/std@0.190.0/testing/asserts.ts";
import type Stripe from "https://esm.sh/stripe@14.21.0";
import { getCouponRedemption } from "./stripe-coupons.ts";

function checkoutSession(discount: Record<string, unknown>): Stripe.Checkout.Session {
  return {
    id: "cs_test_formula",
    created: 1_788_975_919,
    currency: "usd",
    discounts: [discount],
    total_details: { amount_discount: 69_700, amount_shipping: 0, amount_tax: 0 },
  } as unknown as Stripe.Checkout.Session;
}

Deno.test("reads the current nested promotion coupon shape", async () => {
  const session = checkoutSession({
    coupon: null,
    promotion_code: {
      id: "promo_justin",
      code: "JUSTIN2026",
      promotion: { type: "coupon", coupon: "coupon_justin" },
    },
  });
  const stripe = {
    checkout: { sessions: { retrieve: async () => session } },
    promotionCodes: { retrieve: async () => null },
    coupons: { retrieve: async () => ({ id: "coupon_justin", name: "JUSTIN" }) },
  } as unknown as Stripe;

  const result = await getCouponRedemption(
    stripe,
    session,
    { email: "kevin@example.com", name: "Kevin Baker" },
    1,
  );

  assertEquals(result?.promotion_code, "JUSTIN2026");
  assertEquals(result?.stripe_coupon_id, "coupon_justin");
  assertEquals(result?.coupon_name, "JUSTIN");
});

Deno.test("reads the legacy direct discount coupon shape", async () => {
  const session = checkoutSession({
    coupon: { id: "coupon_founder", name: "FOUNDER FREE" },
    promotion_code: "promo_founder",
  });
  const stripe = {
    checkout: { sessions: { retrieve: async () => session } },
    promotionCodes: {
      retrieve: async () => ({
        id: "promo_founder",
        code: "FOUNDERFREE",
        coupon: { id: "coupon_founder", name: "FOUNDER FREE" },
      }),
    },
    coupons: { retrieve: async () => null },
  } as unknown as Stripe;

  const result = await getCouponRedemption(
    stripe,
    session,
    { email: "founder@example.com", name: "Founder" },
    4,
  );

  assertEquals(result?.promotion_code, "FOUNDERFREE");
  assertEquals(result?.quantity, 4);
  assertEquals(result?.coupon_name, "FOUNDER FREE");
});
