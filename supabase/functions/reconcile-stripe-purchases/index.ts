import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { requireAdmin } from "../_shared/admin-auth.ts";
import { getCouponRedemption } from "../_shared/stripe-coupons.ts";
import { PRICE_TIER_MAP } from "../_shared/price-tier-map.ts";
import { invoiceToPurchase } from "../_shared/invoice-purchases.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};


type RecognizedLineItem = {
  item: Stripe.LineItem;
  info: { tier: string; passType: string };
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
    const body = await req.json().catch(() => ({}));
    const requestedFrom = typeof body?.from === "string" ? Date.parse(body.from) : NaN;
    const fromTimestamp = Math.floor(
      (Number.isFinite(requestedFrom) ? requestedFrom : Date.parse("2026-01-01T00:00:00Z")) / 1000,
    );

    let startingAfter: string | undefined;
    let scanned = 0;
    let formulaSessions = 0;
    let purchasesAdded = 0;
    let redemptionsSynced = 0;
    let failed = 0;
    const errors: Array<{ sessionId: string; message: string }> = [];

    // A bounded manual pagination loop makes the work predictable inside the
    // Edge Function runtime while covering up to 2,000 completed checkouts.
    for (let page = 0; page < 20; page++) {
      const sessions = await stripe.checkout.sessions.list({
        created: { gte: fromTimestamp },
        limit: 100,
        status: "complete",
        ...(startingAfter ? { starting_after: startingAfter } : {}),
      });

      for (const session of sessions.data) {
        scanned++;
        if (session.payment_status !== "paid" && session.payment_status !== "no_payment_required") {
          continue;
        }

        try {
          const email = session.customer_details?.email?.trim().toLowerCase();
          if (!email) continue;

          const lineItems: Stripe.LineItem[] = (
            await stripe.checkout.sessions.listLineItems(session.id, { limit: 100 })
          ).data;
          const recognizedItems: RecognizedLineItem[] = lineItems.flatMap((item: Stripe.LineItem) => {
            const info = PRICE_TIER_MAP[item.price?.unit_amount || 0];
            return info ? [{ item, info }] : [];
          });
          if (!recognizedItems.length) continue;

          formulaSessions++;
          const name = session.customer_details?.name || null;
          const purchasedAt = new Date(session.created * 1000).toISOString();
          const paymentLinkId = typeof session.payment_link === "string" ? session.payment_link : null;
          const currency = session.currency || "usd";
          const { data: existing, error: existingError } = await supabase
            .from("purchases")
            .select("id")
            .eq("stripe_session_id", session.id);
          if (existingError) throw existingError;

          if (!existing?.length) {
            const rows = recognizedItems.map(({ item, info }) => ({
              email,
              name,
              stripe_session_id: session.id,
              stripe_payment_link_id: paymentLinkId,
              amount: item.amount_total,
              currency,
              pass_type: info.passType,
              tier: info.tier,
              quantity: item.quantity || 1,
              purchased_at: purchasedAt,
            }));
            const { error: insertError } = await supabase.from("purchases").insert(rows);
            if (insertError) throw insertError;
            purchasesAdded += rows.length;
          } else {
            const { error: updateError } = await supabase
              .from("purchases")
              .update({ purchased_at: purchasedAt })
              .eq("stripe_session_id", session.id);
            if (updateError) throw updateError;
          }

          const quantity = recognizedItems.reduce(
            (sum: number, { item }: RecognizedLineItem) => sum + (item.quantity || 1),
            0,
          );
          const redemption = await getCouponRedemption(
            stripe,
            session,
            { email, name },
            quantity,
          );
          if (redemption) {
            const { error: redemptionError } = await supabase
              .from("coupon_redemptions")
              .upsert(redemption, { onConflict: "stripe_session_id" });
            if (redemptionError) throw redemptionError;
            redemptionsSynced++;
          }
        } catch (error) {
          failed++;
          const message = error instanceof Error ? error.message : "Unknown reconciliation error";
          console.error("Stripe session reconciliation failed:", session.id, error);
          if (errors.length < 20) errors.push({ sessionId: session.id, message });
        }
      }

      if (!sessions.has_more || sessions.data.length === 0) break;
      startingAfter = sessions.data[sessions.data.length - 1].id;
    }

    // Second pass: invoiced sponsorships. These never appear in the checkout
    // session list above, so partners who paid by check or bank transfer were
    // invisible to this reconciler and to the dashboard. Backfilling them here
    // is what repairs the existing records; the webhook keeps new ones current.
    let invoicesScanned = 0;
    let invoicePurchasesAdded = 0;
    let invoiceStartingAfter: string | undefined;

    for (let page = 0; page < 20; page++) {
      const invoices = await stripe.invoices.list({
        created: { gte: fromTimestamp },
        limit: 100,
        status: "paid",
        ...(invoiceStartingAfter ? { starting_after: invoiceStartingAfter } : {}),
      });

      for (const invoice of invoices.data) {
        invoicesScanned++;
        try {
          const row = invoiceToPurchase(invoice);
          if (!row) continue;

          const { data: existing, error: existingError } = await supabase
            .from("purchases")
            .select("id")
            .eq("stripe_session_id", row.stripe_session_id);
          if (existingError) throw existingError;
          if (existing?.length) continue;

          const { error: insertError } = await supabase.from("purchases").insert([row]);
          if (insertError) throw insertError;
          invoicePurchasesAdded++;
        } catch (error) {
          failed++;
          const message = error instanceof Error ? error.message : "Unknown reconciliation error";
          console.error("Stripe invoice reconciliation failed:", invoice.id, error);
          if (errors.length < 20) errors.push({ sessionId: invoice.id, message });
        }
      }

      if (!invoices.has_more || invoices.data.length === 0) break;
      invoiceStartingAfter = invoices.data[invoices.data.length - 1].id;
    }

    return json({
      message: `Synced ${redemptionsSynced} coupon redemption${redemptionsSynced === 1 ? "" : "s"}` +
        `; added ${invoicePurchasesAdded} invoiced partner purchase${invoicePurchasesAdded === 1 ? "" : "s"}`,
      scanned,
      formulaSessions,
      purchasesAdded,
      redemptionsSynced,
      invoicesScanned,
      invoicePurchasesAdded,
      failed,
      errors,
    });
  } catch (error) {
    console.error("Stripe reconciliation failed:", error);
    return json({ error: "Stripe reconciliation failed" }, 500);
  }
});
