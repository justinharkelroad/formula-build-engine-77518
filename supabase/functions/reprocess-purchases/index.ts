import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { requireAdmin } from "../_shared/admin-auth.ts";
import {
  processPurchaseEmail,
  queuePurchaseEmail,
} from "../_shared/transactional-email.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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
    let failed = 0;
    let partnersCreated = 0;
    let emailsQueued = 0;
    const details: Array<Record<string, unknown>> = [];

    for (const purchase of unknowns) {
      const sessionId = purchase.stripe_session_id;
      try {
        const lineItems = (await stripe.checkout.sessions.listLineItems(sessionId)).data;
        if (!lineItems.length) {
          details.push({ sessionId, status: "skipped_no_items" });
          continue;
        }

        const replacementRows = lineItems.map((item: Stripe.LineItem) => {
          const info = PRICE_TIER_MAP[item.price?.unit_amount || 0] || {
            tier: "unknown",
            passType: "unknown",
          };
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
          const additionalRows = replacementRows.slice(1).map((row) => ({
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

        fixed++;
        details.push({
          sessionId,
          status: "fixed",
          items: replacementRows.length,
          partner: first.pass_type === "partner",
        });
      } catch (itemError) {
        failed++;
        console.error("Purchase reprocessing failed:", sessionId, itemError);
        details.push({ sessionId, status: "error" });
      }
    }

    return json({
      message: `Reprocessed ${unknowns.length} unknown purchases`,
      fixed,
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
