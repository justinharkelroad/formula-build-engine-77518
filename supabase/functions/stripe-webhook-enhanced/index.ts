import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
};

// Price (unit_amount in cents) → tier + pass type lookup
// We match on each line item's unit_amount, not the session total
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
      event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return new Response("Invalid signature", { status: 400 });
    }

    console.log("Processing webhook event:", event.type);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      console.log("Checkout session completed:", {
        sessionId: session.id,
        customerEmail: session.customer_details?.email,
        customerName: session.customer_details?.name,
        amountTotal: session.amount_total,
        paymentLink: session.payment_link,
      });

      if (session.customer_details?.email && (session.amount_total || 0) > 0) {
        const email = session.customer_details.email;
        const name = session.customer_details.name || null;
        const paymentLinkId = typeof session.payment_link === 'string' ? session.payment_link : null;
        const currency = session.currency || 'usd';

        // Idempotency: skip if we already have records for this session
        const { data: existing } = await supabase
          .from('purchases')
          .select('id')
          .eq('stripe_session_id', session.id)
          .limit(1);

        if (existing && existing.length > 0) {
          console.log("Session already processed, skipping:", session.id);
          return new Response(JSON.stringify({ received: true, skipped: true }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          });
        }

        // Fetch actual line items to get per-unit prices and quantities
        let lineItems: Stripe.LineItem[] = [];
        try {
          const lineItemsResponse = await stripe.checkout.sessions.listLineItems(session.id);
          lineItems = lineItemsResponse.data;
          console.log("Fetched line items:", lineItems.length);
        } catch (err) {
          console.error("Failed to fetch line items, falling back to amount_total:", err);
        }

        if (lineItems.length > 0) {
          // Insert one purchase record per line item
          const analyticsItems: Array<Record<string, unknown>> = [];

          for (const item of lineItems) {
            const unitAmount = item.price?.unit_amount || 0;
            const qty = item.quantity || 1;
            const tierInfo = PRICE_TIER_MAP[unitAmount] || { tier: "unknown", passType: "unknown" };

            console.log("Processing line item:", {
              unitAmount,
              quantity: qty,
              itemTotal: item.amount_total,
              detectedTier: tierInfo.tier,
              detectedPassType: tierInfo.passType,
            });

            const { error: insertError } = await supabase
              .from('purchases')
              .insert({
                email,
                name,
                stripe_session_id: session.id,
                stripe_payment_link_id: paymentLinkId,
                amount: item.amount_total,
                currency,
                pass_type: tierInfo.passType,
                tier: tierInfo.tier,
                quantity: qty,
              });

            if (insertError) {
              console.error("Error inserting purchase for line item:", insertError);
            } else {
              console.log("Purchase stored for line item:", tierInfo.passType, qty);
            }

            analyticsItems.push({
              item_id: tierInfo.passType,
              item_name: `${tierInfo.tier} - ${tierInfo.passType}`,
              currency,
              price: unitAmount / 100,
              quantity: qty,
            });
          }

          // Log analytics event with all items
          const { error: analyticsError } = await supabase
            .from('analytics_events')
            .insert({
              event_name: 'purchase',
              event_params: {
                transaction_id: session.id,
                value: (session.amount_total || 0) / 100,
                currency,
                items: analyticsItems,
              },
              page_location: 'stripe_webhook',
            });

          if (analyticsError) {
            console.error("Error logging analytics event:", analyticsError);
          }
        } else {
          // Fallback: use amount_total when line items unavailable
          const amount = session.amount_total || 0;
          const tierInfo = PRICE_TIER_MAP[amount] || { tier: "unknown", passType: "unknown" };

          console.log("Fallback: using amount_total for tier detection:", {
            amount,
            detectedTier: tierInfo.tier,
            detectedPassType: tierInfo.passType,
          });

          const { error: insertError } = await supabase
            .from('purchases')
            .insert({
              email,
              name,
              stripe_session_id: session.id,
              stripe_payment_link_id: paymentLinkId,
              amount,
              currency,
              pass_type: tierInfo.passType,
              tier: tierInfo.tier,
              quantity: 1,
            });

          if (insertError) {
            console.error("Error inserting purchase:", insertError);
          }

          const { error: analyticsError } = await supabase
            .from('analytics_events')
            .insert({
              event_name: 'purchase',
              event_params: {
                transaction_id: session.id,
                value: amount / 100,
                currency,
                items: [{
                  item_id: tierInfo.passType,
                  item_name: `${tierInfo.tier} - ${tierInfo.passType}`,
                  currency,
                  price: amount / 100,
                  quantity: 1,
                }]
              },
              page_location: 'stripe_webhook',
            });

          if (analyticsError) {
            console.error("Error logging analytics event:", analyticsError);
          }
        }

        console.log("Purchase processing completed successfully");
      }
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
