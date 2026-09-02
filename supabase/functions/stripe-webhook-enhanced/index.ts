import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient, type SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import {
  processPurchaseEmail,
  queuePurchaseEmail,
  type EmailType,
} from "../_shared/transactional-email.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
};

const PRICE_TIER_MAP: Record<number, { tier: string; passType: string }> = {
  69700: { tier: "earlyBird", passType: "agencyOwner" },
  39700: { tier: "earlyBird", passType: "team" },
  64700: { tier: "earlyBird", passType: "agencyOwner" },
  34700: { tier: "earlyBird", passType: "team" },
  89700: { tier: "regular", passType: "agencyOwner" },
  59700: { tier: "regular", passType: "team" },
  53800: { tier: "vip", passType: "agencyOwner" },
  35800: { tier: "vip", passType: "team" },
  44800: { tier: "vip", passType: "agencyOwner" },
  29800: { tier: "vip", passType: "team" },
  1500000: { tier: "platinum", passType: "partner" },
  1000000: { tier: "gold", passType: "partner" },
  750000: { tier: "silver", passType: "partner" },
  500000: { tier: "bronze", passType: "partner" },
};

type RuntimeGlobal = typeof globalThis & {
  EdgeRuntime?: { waitUntil(promise: Promise<unknown>): void };
};

async function startEmailDelivery(
  supabase: SupabaseClient,
  deliveryId: string,
): Promise<void> {
  const job = processPurchaseEmail(supabase, deliveryId).catch((error) => {
    console.error("Transactional email attempt failed:", error);
  });
  const runtime = globalThis as RuntimeGlobal;
  if (runtime.EdgeRuntime?.waitUntil) {
    runtime.EdgeRuntime.waitUntil(job);
    return;
  }
  await job;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }

  try {
    const stripeSecret = Deno.env.get("STRIPE_SECRET_KEY");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!stripeSecret || !webhookSecret || !supabaseUrl || !supabaseServiceKey) {
      return new Response("Missing configuration", { status: 500 });
    }

    const signature = req.headers.get("stripe-signature");
    if (!signature) return new Response("Missing signature", { status: 400 });

    const stripe = new Stripe(stripeSecret, { apiVersion: "2024-06-20" });
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const rawBody = await req.text();

    let event: Stripe.Event;
    try {
      event = await stripe.webhooks.constructEventAsync(rawBody, signature, webhookSecret);
    } catch (error) {
      console.error("Stripe webhook signature verification failed:", error);
      return new Response("Invalid signature", { status: 400 });
    }

    if (
      event.type !== "checkout.session.completed" &&
      event.type !== "checkout.session.async_payment_succeeded"
    ) {
      return new Response(JSON.stringify({ received: true, ignored: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const session = event.data.object as Stripe.Checkout.Session;
    if (session.payment_status !== "paid") {
      return new Response(JSON.stringify({ received: true, awaitingPayment: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const email = session.customer_details?.email?.trim().toLowerCase();
    if (!email) {
      console.error("Paid Stripe session is missing customer email:", session.id);
      return new Response("Paid session is missing customer email", { status: 422 });
    }

    const name = session.customer_details?.name || null;
    const paymentLinkId = typeof session.payment_link === "string" ? session.payment_link : null;
    const currency = session.currency || "usd";
    const { data: existingPurchases, error: existingError } = await supabase
      .from("purchases")
      .select("id, pass_type, tier")
      .eq("stripe_session_id", session.id);
    if (existingError) throw existingError;

    let lineItems: Stripe.LineItem[] = [];
    try {
      lineItems = (await stripe.checkout.sessions.listLineItems(session.id)).data;
    } catch (error) {
      console.error("Could not load Stripe line items. Using session total:", error);
    }

    const fallbackInfo = PRICE_TIER_MAP[session.amount_total || 0] || {
      tier: "unknown",
      passType: "unknown",
    };
    const firstUnitAmount = lineItems[0]?.price?.unit_amount || 0;
    const detected = PRICE_TIER_MAP[firstUnitAmount] ||
      (existingPurchases?.[0]
        ? { tier: existingPurchases[0].tier, passType: existingPurchases[0].pass_type }
        : fallbackInfo);

    if (!existingPurchases || existingPurchases.length === 0) {
      const items = lineItems.length > 0
        ? lineItems.map((item) => {
            const info = PRICE_TIER_MAP[item.price?.unit_amount || 0] || {
              tier: "unknown",
              passType: "unknown",
            };
            return {
              email,
              name,
              stripe_session_id: session.id,
              stripe_payment_link_id: paymentLinkId,
              amount: item.amount_total,
              currency,
              pass_type: info.passType,
              tier: info.tier,
              quantity: item.quantity || 1,
            };
          })
        : [{
            email,
            name,
            stripe_session_id: session.id,
            stripe_payment_link_id: paymentLinkId,
            amount: session.amount_total || 0,
            currency,
            pass_type: fallbackInfo.passType,
            tier: fallbackInfo.tier,
            quantity: 1,
          }];

      const { error: purchaseError } = await supabase.from("purchases").insert(items);
      if (purchaseError) throw purchaseError;

      const analyticsItems = items.map((item) => ({
        item_id: item.pass_type,
        item_name: `${item.tier} - ${item.pass_type}`,
        currency,
        price: item.amount / 100 / item.quantity,
        quantity: item.quantity,
      }));
      const { error: analyticsError } = await supabase.from("analytics_events").insert({
        event_name: "purchase",
        event_params: {
          transaction_id: session.id,
          value: (session.amount_total || 0) / 100,
          currency,
          items: analyticsItems,
        },
        page_location: "stripe_webhook",
      });
      if (analyticsError) console.error("Could not write purchase analytics:", analyticsError);
    }

    if (detected.passType === "partner") {
      const { data: profile } = await supabase
        .from("partner_profiles")
        .select("id")
        .eq("stripe_session_id", session.id)
        .maybeSingle();
      if (!profile) {
        const { error: profileError } = await supabase.from("partner_profiles").insert({
          tier: detected.tier,
          stripe_session_id: session.id,
          purchase_email: email,
          purchase_name: name,
        });
        if (profileError) throw profileError;
      }
    }

    const emailType: EmailType = detected.passType === "partner"
      ? "partner_welcome"
      : "attendee_confirmation";
    const delivery = await queuePurchaseEmail(supabase, {
      stripeSessionId: session.id,
      emailType,
      recipientEmail: email,
      recipientName: name,
      tier: detected.tier,
    });
    await startEmailDelivery(supabase, delivery.id);

    return new Response(JSON.stringify({
      received: true,
      purchaseAlreadyRecorded: Boolean(existingPurchases?.length),
      emailDeliveryStatus: delivery.status,
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Stripe webhook processing failed:", error);
    return new Response(JSON.stringify({ error: "Webhook processing failed" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
