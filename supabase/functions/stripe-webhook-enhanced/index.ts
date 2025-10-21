import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
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
      
      console.log("Checkout session completed:", {
        sessionId: session.id,
        customerEmail: session.customer_details?.email,
        amountTotal: session.amount_total,
        passType: session.metadata?.passType,
        quantity: session.metadata?.quantity,
      });

      // Store registration in database
      if (session.customer_details?.email && session.amount_total) {
        const { error: insertError } = await supabase
          .from('registrations')
          .insert({
            email: session.customer_details.email,
            stripe_session_id: session.id,
            amount: session.amount_total,
            currency: session.currency || 'usd',
            pass_type: session.metadata?.passType || 'unknown',
            quantity: parseInt(session.metadata?.quantity || '1'),
          });

        if (insertError) {
          console.error("Error inserting registration:", insertError);
        } else {
          console.log("Registration stored successfully");
        }
      }

      // Log analytics event
      const { error: analyticsError } = await supabase
        .from('analytics_events')
        .insert({
          event_name: 'purchase',
          event_params: {
            transaction_id: session.id,
            value: session.amount_total ? session.amount_total / 100 : 0,
            currency: session.currency || 'usd',
            items: [{
              item_id: session.metadata?.passType || 'unknown',
              item_name: `${session.metadata?.passType || 'Unknown'} Pass`,
              currency: session.currency || 'usd',
              price: session.amount_total ? session.amount_total / 100 : 0,
              quantity: parseInt(session.metadata?.quantity || '1')
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