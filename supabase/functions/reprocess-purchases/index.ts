import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { requireAdmin } from "../_shared/admin-auth.ts";
import {
  processPurchaseEmail,
  queuePurchaseEmail,
} from "../_shared/transactional-email.ts";
import { PRICE_TIER_MAP, UNKNOWN_PASS } from "../_shared/price-tier-map.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};


function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const stripeSecret = Deno.env.get("STRIPE_SECRET_KEY");
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!stripeSecret || !supabaseUrl || !serviceKey) {
    return json({ error: "Missing configuration" }, 500);
  }

  const supabase = createClient(supabaseUrl, serviceKey);
  if (!(await requireAdmin(req, supabase))) return json({ error: "Unauthorized" }, 401);
  const stripe = new Stripe(stripeSecret, { apiVersion: "2024-06-20" });

  try {
    const { data: unknowns, error } = await supabase
      .from("purchases")
      .select("*")
      .eq("pass_type", "unknown");
    if (error) throw error;
    if (!unknowns?.length) return json({ message: "No unknown purchases to fix", fixed: 0 });

    let fixed = 0;
    let unresolved = 0;
    let failed = 0;
    let partnersCreated = 0;
    let emailsQueued = 0;
    const details: Array<Record<string, unknown>> = [];

    for (const purchase of unknowns) {
      const sessionId = purchase.stripe_session_id;
      try {
        const lineItems: Stripe.LineItem[] =
          (await stripe.checkout.sessions.listLineItems(sessionId)).data;
        if (!lineItems.length) {
          details.push({ sessionId, status: "skipped_no_items" });
          continue;
        }

        const replacementRows = lineItems.map((item: Stripe.LineItem) => {
          const info = PRICE_TIER_MAP[item.price?.unit_amount || 0] || UNKNOWN_PASS;
          return {
            amount: item.amount_total,
            pass_type: info.passType,
            tier: info.tier,
            quantity: item.quantity || 1,
          };
        });
        const first = replacementRows[0];
        const { error: updateError } = await supabase
          .from("purchases")
          .update(first)
          .eq("id", purchase.id);
        if (updateError) throw updateError;

        if (replacementRows.length > 1) {
          const additionalRows = replacementRows.slice(1).map((row: typeof first) => ({
            ...row,
            email: purchase.email,
            name: purchase.name,
            stripe_session_id: sessionId,
            stripe_payment_link_id: purchase.stripe_payment_link_id,
            currency: purchase.currency,
          }));
          const { error: insertError } = await supabase.from("purchases").insert(additionalRows);
          if (insertError) throw insertError;
        }

        if (first.pass_type === "partner") {
          const { data: existingProfile } = await supabase
            .from("partner_profiles")
            .select("id")
            .eq("stripe_session_id", sessionId)
            .maybeSingle();
          if (!existingProfile) {
            const { error: profileError } = await supabase.from("partner_profiles").insert({
              tier: first.tier,
              stripe_session_id: sessionId,
              purchase_email: purchase.email,
              purchase_name: purchase.name,
            });
            if (profileError) throw profileError;
            partnersCreated++;
          }
          const delivery = await queuePurchaseEmail(supabase, {
            stripeSessionId: sessionId,
            emailType: "partner_welcome",
            recipientEmail: purchase.email,
            recipientName: purchase.name,
            tier: first.tier,
          });
          await processPurchaseEmail(supabase, delivery.id);
          emailsQueued++;
        }

        // Rewriting "unknown" as "unknown" is not a fix. Reporting it as one is
        // how this button could say "2 purchases identified" every time while
        // the counter beside it never moved.
        if (first.pass_type === UNKNOWN_PASS.passType) {
          unresolved++;
          details.push({
            sessionId,
            status: "unresolved_price",
            amount: first.amount,
            items: replacementRows.length,
          });
        } else {
          fixed++;
          details.push({
            sessionId,
            status: "fixed",
            items: replacementRows.length,
            partner: first.pass_type === "partner",
          });
        }
      } catch (itemError) {
        failed++;
        console.error("Purchase reprocessing failed:", sessionId, itemError);
        details.push({ sessionId, status: "error" });
      }
    }

    return json({
      message: unresolved > 0
        ? `Identified ${fixed} of ${unknowns.length}; ${unresolved} had a price that matches no known pass`
        : `Reprocessed ${unknowns.length} unknown purchases`,
      fixed,
      unresolved,
      failed,
      partnersCreated,
      emailsQueued,
      details,
    });
  } catch (error) {
    console.error("Purchase reprocessing failed:", error);
    return json({ error: "Purchase reprocessing failed" }, 500);
  }
});
