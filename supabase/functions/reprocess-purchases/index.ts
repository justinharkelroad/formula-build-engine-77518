import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Same price map as the webhook
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
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!stripeSecret || !supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ error: "Missing configuration" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const stripe = new Stripe(stripeSecret, { apiVersion: "2024-06-20" });
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch all unknown purchases
    const { data: unknowns, error: fetchError } = await supabase
      .from("purchases")
      .select("*")
      .eq("pass_type", "unknown");

    if (fetchError) {
      throw new Error(`Failed to fetch unknown purchases: ${fetchError.message}`);
    }

    if (!unknowns || unknowns.length === 0) {
      return new Response(
        JSON.stringify({ message: "No unknown purchases to fix", fixed: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Found ${unknowns.length} unknown purchases to reprocess`);

    let fixed = 0;
    let failed = 0;
    const details: Array<{ sessionId: string; status: string; items?: number }> = [];

    for (const purchase of unknowns) {
      const sessionId = purchase.stripe_session_id;
      try {
        const lineItems = await stripe.checkout.sessions.listLineItems(sessionId);

        if (!lineItems.data || lineItems.data.length === 0) {
          console.log(`No line items found for session ${sessionId}, skipping`);
          details.push({ sessionId, status: "skipped_no_items" });
          continue;
        }

        // Delete the old unknown record
        const { error: deleteError } = await supabase
          .from("purchases")
          .delete()
          .eq("id", purchase.id);

        if (deleteError) {
          console.error(`Failed to delete purchase ${purchase.id}:`, deleteError);
          details.push({ sessionId, status: "delete_failed" });
          failed++;
          continue;
        }

        // Insert correct records — one per line item
        let insertedCount = 0;
        for (const item of lineItems.data) {
          const unitAmount = item.price?.unit_amount || 0;
          const qty = item.quantity || 1;
          const tierInfo = PRICE_TIER_MAP[unitAmount] || { tier: "unknown", passType: "unknown" };

          const { error: insertError } = await supabase
            .from("purchases")
            .insert({
              email: purchase.email,
              name: purchase.name,
              stripe_session_id: sessionId,
              stripe_payment_link_id: purchase.stripe_payment_link_id,
              amount: item.amount_total,
              currency: purchase.currency,
              pass_type: tierInfo.passType,
              tier: tierInfo.tier,
              quantity: qty,
            });

          if (insertError) {
            console.error(`Failed to insert line item for session ${sessionId}:`, insertError);
          } else {
            insertedCount++;
          }
        }

        fixed++;
        details.push({ sessionId, status: "fixed", items: insertedCount });
        console.log(`Fixed session ${sessionId}: inserted ${insertedCount} records`);
      } catch (err) {
        console.error(`Error reprocessing session ${sessionId}:`, err);
        details.push({ sessionId, status: "error" });
        failed++;
      }
    }

    return new Response(
      JSON.stringify({
        message: `Reprocessed ${unknowns.length} unknown purchases`,
        fixed,
        failed,
        details,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Reprocess failed:", error);
    return new Response(
      JSON.stringify({ error: "Reprocess failed", details: String(error) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
