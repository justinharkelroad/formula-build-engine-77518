import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Function invoked, method:", req.method);
    
    const stripeSecret = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeSecret) {
      console.error("Stripe secret key not configured");
      return new Response(
        JSON.stringify({ error: "Stripe secret key not configured" }),
        { 
          status: 500, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    const stripe = new Stripe(stripeSecret, {
      apiVersion: "2024-06-20",
    });

    const { passType, quantity = 1 } = await req.json();

    if (!passType || !["agent", "team"].includes(passType)) {
      return new Response(
        JSON.stringify({ error: "Invalid passType" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Get Price IDs from environment
    const agentPriceId = Deno.env.get("AGENT_PRICE_ID");
    const teamPriceId = Deno.env.get("TEAM_PRICE_ID");

    const priceId = passType === "agent" ? agentPriceId : teamPriceId;

    if (!priceId) {
      console.error(`Missing ${passType.toUpperCase()}_PRICE_ID environment variable`);
      return new Response(
        JSON.stringify({ error: `Missing ${passType.toUpperCase()}_PRICE_ID environment variable` }),
        { 
          status: 500, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Get domain from request headers or use default
    const origin = req.headers.get("origin") || "https://f3florida.com";
    
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price: priceId,
          quantity: quantity > 0 ? quantity : 1,
        },
      ],
      success_url: `${origin}/thank-you?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/register?canceled=1`,
      
      // Enable promo/discount codes and digital wallets
      allow_promotion_codes: true,
      
      // Required fields: first name, last name, email, company, role
      customer_creation: "always",
      billing_address_collection: "required",
      
      // Custom fields for business information
      custom_fields: [
        {
          key: "company",
          label: { type: "custom", custom: "Company" },
          type: "text",
          optional: false,
        },
        {
          key: "role",
          label: { type: "custom", custom: "Job Title/Role" },
          type: "text",
          optional: false,
        },
      ],
      
      submit_type: "pay",
      metadata: { 
        passType,
        quantity: String(quantity),
      },
    });

    return new Response(
      JSON.stringify({ url: session.url, sessionId: session.id }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Checkout session creation failed:", error);
    
    // Return fallback signal so client can use Payment Links
    return new Response(
      JSON.stringify({ 
        fallback: true, 
        reason: error.message || "Stripe checkout failed" 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  }
});