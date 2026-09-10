import Stripe from "https://esm.sh/stripe@14.21.0";

type StripeObject = Record<string, unknown>;

export interface StripeCouponRedemption {
  stripe_session_id: string;
  stripe_promotion_code_id: string | null;
  promotion_code: string | null;
  stripe_coupon_id: string;
  coupon_name: string | null;
  customer_email: string;
  customer_name: string | null;
  discount_amount: number;
  currency: string;
  quantity: number;
  redeemed_at: string;
  updated_at: string;
}

function objectValue(value: unknown): StripeObject | null {
  return value !== null && typeof value === "object" ? value as StripeObject : null;
}

function expandableId(value: unknown): string | null {
  if (typeof value === "string") return value;
  const object = objectValue(value);
  return typeof object?.id === "string" ? object.id : null;
}

async function loadPromotionCode(
  stripe: Stripe,
  value: unknown,
): Promise<StripeObject | null> {
  const expanded = objectValue(value);
  if (expanded && typeof expanded.code === "string") return expanded;
  const id = expandableId(value);
  if (!id) return expanded;
  try {
    return await stripe.promotionCodes.retrieve(id) as unknown as StripeObject;
  } catch (error) {
    console.error("Could not retrieve Stripe promotion code:", id, error);
    return expanded ?? { id };
  }
}

async function loadCoupon(
  stripe: Stripe,
  value: unknown,
): Promise<StripeObject | null> {
  const expanded = objectValue(value);
  if (expanded && typeof expanded.name === "string") return expanded;
  const id = expandableId(value);
  if (!id) return expanded;
  try {
    return await stripe.coupons.retrieve(id) as unknown as StripeObject;
  } catch (error) {
    console.error("Could not retrieve Stripe coupon:", id, error);
    return expanded ?? { id };
  }
}

/**
 * Load the single coupon/promotion-code redemption attached to a Checkout
 * Session. Stripe Checkout currently applies at most one promotion code to a
 * session, so Formula stores one normalized record per session.
 *
 * The compatibility reads support both the 2024 API shape (`discount.coupon`)
 * and the newer Basil-era shape (`discount.source.coupon`).
 */
export async function getCouponRedemption(
  stripe: Stripe,
  session: Stripe.Checkout.Session,
  customer: { email: string; name: string | null },
  quantity: number,
): Promise<StripeCouponRedemption | null> {
  const discountAmount = session.total_details?.amount_discount ?? 0;
  if (discountAmount <= 0 && !session.discounts?.length) return null;

  let hydrated = session;
  try {
    hydrated = await stripe.checkout.sessions.retrieve(session.id, {
      expand: ["discounts.promotion_code"],
    });
  } catch (error) {
    // The webhook payload normally contains the discount object already. A
    // retrieve failure should not prevent a paid purchase from being recorded.
    console.error("Could not expand Stripe Checkout discounts:", session.id, error);
  }

  const rawDiscount = objectValue(hydrated.discounts?.[0]);
  if (!rawDiscount) return null;

  const promotion = await loadPromotionCode(stripe, rawDiscount.promotion_code);
  const source = objectValue(rawDiscount.source);
  const promotionDefinition = objectValue(promotion?.promotion);
  const promotionCoupon = promotion?.coupon ?? promotionDefinition?.coupon ?? null;
  const rawCoupon = rawDiscount.coupon ?? source?.coupon ?? promotionCoupon;
  const coupon = await loadCoupon(stripe, rawCoupon);
  const couponId = expandableId(rawCoupon) ?? expandableId(coupon);
  if (!couponId) return null;

  return {
    stripe_session_id: session.id,
    stripe_promotion_code_id: expandableId(promotion),
    promotion_code: typeof promotion?.code === "string" ? promotion.code : null,
    stripe_coupon_id: couponId,
    coupon_name: typeof coupon?.name === "string" ? coupon.name : null,
    customer_email: customer.email,
    customer_name: customer.name,
    discount_amount: hydrated.total_details?.amount_discount ?? discountAmount,
    currency: hydrated.currency || session.currency || "usd",
    quantity: Math.max(1, quantity),
    redeemed_at: new Date(session.created * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  };
}
