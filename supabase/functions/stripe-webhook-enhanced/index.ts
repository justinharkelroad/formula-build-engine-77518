import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
};

// Price (amount in cents) → tier + pass type lookup
// Each Stripe Payment Link has a unique price, so we match on amount_total
const PRICE_TIER_MAP: Record<number, { tier: string; passType: string }> = {
  64700: { tier: "earlyBird", passType: "agencyOwner" },
  34700: { tier: "earlyBird", passType: "team" },
  44800: { tier: "vip", passType: "agencyOwner" },
  29800: { tier: "vip", passType: "team" },
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripeSecret = Deno.env.get("STRIPE_SECRET_KEY");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!stripeSecret || !webhookSecret || !supabaseUrl || !supabaseServiceKey) {
      console.error("Missing required environment variables");
      return new Response("Missing configuration", { status: 500 });
    }

    const stripe = new Stripe(stripeSecret, {
      apiVersion: "2024-06-20",
    });

    // Initialize Supabase client with service role key
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
      console.error("No signature provided");
      return new Response("No signature", { status: 400 });
    }

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return new Response("Invalid signature", { status: 400 });
    }

    console.log("Processing webhook event:", event.type);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      const amount = session.amount_total || 0;
      const tierInfo = PRICE_TIER_MAP[amount] || { tier: "unknown", passType: "unknown" };

      console.log("Checkout session completed:", {
        sessionId: session.id,
        customerEmail: session.customer_details?.email,
        customerName: session.customer_details?.name,
        amountTotal: amount,
        paymentLink: session.payment_link,
        detectedTier: tierInfo.tier,
        detectedPassType: tierInfo.passType,
      });

      // Store purchase in database
      if (session.customer_details?.email && amount > 0) {
        const { error: insertError } = await supabase
          .from('purchases')
          .insert({
            email: session.customer_details.email,
            name: session.customer_details.name || null,
            stripe_session_id: session.id,
            stripe_payment_link_id: typeof session.payment_link === 'string' ? session.payment_link : null,
            amount: amount,
            currency: session.currency || 'usd',
            pass_type: tierInfo.passType,
            tier: tierInfo.tier,
            quantity: 1,
          });

        if (insertError) {
          console.error("Error inserting purchase:", insertError);
        } else {
          console.log("Purchase stored successfully");
        }
      }

      // Log analytics event
      const { error: analyticsError } = await supabase
        .from('analytics_events')
        .insert({
          event_name: 'purchase',
          event_params: {
            transaction_id: session.id,
            value: amount / 100,
            currency: session.currency || 'usd',
            items: [{
              item_id: tierInfo.passType,
              item_name: `${tierInfo.tier} - ${tierInfo.passType}`,
              currency: session.currency || 'usd',
              price: amount / 100,
              quantity: 1,
            }]
          },
          page_location: 'stripe_webhook',
        });

      if (analyticsError) {
        console.error("Error logging analytics event:", analyticsError);
      }

      console.log("Purchase processing completed successfully");
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Webhook processing failed:", error);
    return new Response(
      JSON.stringify({ error: "Webhook processing failed" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
