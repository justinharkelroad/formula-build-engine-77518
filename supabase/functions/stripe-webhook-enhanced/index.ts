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

// --- Confirmation Email via Brevo ---

const HOTEL_BOOK_URL = "https://book.passkey.com/event/51189838/owner/49980248/home";
const FACEBOOK_GROUP_URL = "https://www.facebook.com/groups/1637602806874362";
const WEBSITE_URL = "https://theformulaforum.com";
const LOGO_URL = "https://koubtooblwjcwubcuhml.supabase.co/storage/v1/object/public/images//FORMULA%20GRADIENT%20WORD.png";

function buildConfirmationEmailHtml(name: string | null): string {
  const firstName = name ? name.split(" ")[0] : "there";
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>You're In — FORMULA 2026</title>
</head>
<body style="margin:0;padding:0;background-color:#1a1a1a;font-family:Arial,Helvetica,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#1a1a1a;padding:32px 16px;">
<tr><td align="center">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;max-width:600px;width:100%;">

  <!-- Logo Header -->
  <tr>
    <td style="background-color:#1a1a1a;padding:40px 32px 20px;text-align:center;">
      <a href="${WEBSITE_URL}" target="_blank">
        <img src="${LOGO_URL}" alt="FORMULA" width="400" style="display:block;margin:0 auto;max-width:400px;width:100%;height:auto;" />
      </a>
    </td>
  </tr>

  <!-- Accent Bar -->
  <tr>
    <td style="font-size:0;line-height:0;height:4px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
        <td width="33%" style="background-color:#f53214;height:4px;"></td>
        <td width="34%" style="background-color:#fa9c27;height:4px;"></td>
        <td width="33%" style="background-color:#48b4d1;height:4px;"></td>
      </tr></table>
    </td>
  </tr>

  <!-- Hero -->
  <tr>
    <td style="padding:36px 32px 20px;text-align:center;">
      <h1 style="color:#f53214;font-size:32px;margin:0 0 8px;font-weight:900;">BOOM — You're In!</h1>
      <p style="color:#555;font-size:16px;margin:0;">Your registration for the FORMULA is confirmed.</p>
    </td>
  </tr>

  <!-- Body -->
  <tr>
    <td style="padding:0 32px 32px;">

      <p style="font-size:16px;color:#333;line-height:1.6;margin:0 0 24px;">
        Hey ${firstName},
      </p>
      <p style="font-size:16px;color:#333;line-height:1.6;margin:0 0 24px;">
        We are fired up to have you locked in. The FORMULA is going to be unlike anything you've experienced — real strategies, real connections, and a room full of agency owners who are serious about growth.
      </p>

      <!-- Event Details Card -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8f8f8;border-radius:8px;border-left:4px solid #f53214;margin-bottom:24px;">
        <tr><td style="padding:20px 24px;">
          <p style="font-size:14px;color:#f53214;text-transform:uppercase;letter-spacing:1px;margin:0 0 12px;font-weight:bold;">Event Details</p>
          <p style="font-size:16px;color:#1e293b;margin:0 0 6px;"><strong>Dates:</strong> October 14–16, 2026</p>
          <p style="font-size:16px;color:#1e293b;margin:0 0 6px;"><strong>Location:</strong> Orlando, Florida</p>
          <p style="font-size:16px;color:#1e293b;margin:0;"><strong>Venue:</strong> JW Marriott Orlando Bonnet Creek</p>
        </td></tr>
      </table>

      <!-- Hotel CTA -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
        <tr><td style="padding:20px 24px;background-color:#fff7ed;border-radius:8px;border:1px solid #fa9c27;">
          <p style="font-size:16px;color:#7c4a03;margin:0 0 12px;">
            <strong>Secure Your Hotel Room</strong><br/>
            We've locked in discounted group rates just for attendees — but they won't last forever. Book now before the block fills up.
          </p>
          <table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="background-color:#fa9c27;border-radius:6px;">
            <a href="${HOTEL_BOOK_URL}" target="_blank" style="display:inline-block;padding:12px 28px;color:#ffffff;font-size:15px;font-weight:bold;text-decoration:none;">
              Reserve Your Room &rarr;
            </a>
          </td></tr></table>
        </td></tr>
      </table>

      <!-- Stay in the Loop -->
      <p style="font-size:16px;color:#333;line-height:1.6;margin:0 0 8px;">
        <strong>Stay in the Loop</strong>
      </p>
      <p style="font-size:16px;color:#333;line-height:1.6;margin:0 0 24px;">
        As we get closer, we'll be dropping speaker reveals, session details, and exclusive content. Keep an eye on your inbox and check the website for the latest.
      </p>

      <!-- Action Buttons -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
        <tr>
          <td align="center" style="padding:0 0 12px;">
            <table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="background-color:#f53214;border-radius:6px;">
              <a href="${WEBSITE_URL}" target="_blank" style="display:inline-block;padding:12px 28px;color:#ffffff;font-size:15px;font-weight:bold;text-decoration:none;">
                Visit theformulaforum.com
              </a>
            </td></tr></table>
          </td>
        </tr>
        <tr>
          <td align="center">
            <table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="background-color:#48b4d1;border-radius:6px;">
              <a href="${FACEBOOK_GROUP_URL}" target="_blank" style="display:inline-block;padding:12px 28px;color:#ffffff;font-size:15px;font-weight:bold;text-decoration:none;">
                Join Our Facebook Group
              </a>
            </td></tr></table>
          </td>
        </tr>
      </table>

      <!-- Questions -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
        <tr><td style="padding:16px 24px;background-color:#edf8fb;border-radius:8px;">
          <p style="font-size:15px;color:#2a7d93;margin:0;">
            <strong>Questions?</strong> Just reply to this email or reach out directly at
            <a href="mailto:Gregg@f3florida.com" style="color:#48b4d1;">Gregg@f3florida.com</a> or
            <a href="mailto:Justin@f3florida.com" style="color:#48b4d1;">Justin@f3florida.com</a>
          </p>
        </td></tr>
      </table>

      <p style="font-size:16px;color:#333;line-height:1.6;margin:0 0 4px;">
        We can't wait to see you there.
      </p>
      <p style="font-size:18px;color:#f53214;font-weight:bold;margin:0;">
        Let's get to work,<br/>FORMULA
      </p>

    </td>
  </tr>

  <!-- Footer -->
  <tr>
    <td style="font-size:0;line-height:0;height:4px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
        <td width="33%" style="background-color:#f53214;height:4px;"></td>
        <td width="34%" style="background-color:#fa9c27;height:4px;"></td>
        <td width="33%" style="background-color:#48b4d1;height:4px;"></td>
      </tr></table>
    </td>
  </tr>
  <tr>
    <td style="background-color:#1a1a1a;padding:24px 32px;text-align:center;">
      <p style="color:#999;font-size:13px;margin:0 0 4px;">FORMULA &middot; October 14–16, 2026 &middot; Orlando, FL</p>
      <p style="color:#666;font-size:12px;margin:0;">JW Marriott Orlando Bonnet Creek &middot; 14900 Chelonia Pkwy, Orlando, FL 32821</p>
    </td>
  </tr>

</table>
</td></tr>
</table>
</body>
</html>`;
}

async function sendConfirmationEmail(email: string, name: string | null): Promise<void> {
  const brevoApiKey = Deno.env.get("BREVO_API_KEY");
  if (!brevoApiKey) {
    console.error("BREVO_API_KEY not set — skipping confirmation email");
    return;
  }

  const htmlContent = buildConfirmationEmailHtml(name);
  const recipientName = name || email.split("@")[0];

  const payload = {
    sender: { name: "FORMULA", email: "justin@f3florida.com" },
    to: [{ email, name: recipientName }],
    replyTo: { email: "justin@f3florida.com", name: "Justin" },
    subject: "You're In — FORMULA 2026 Registration Confirmed",
    htmlContent,
  };

  try {
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": brevoApiKey,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const body = await res.text();
      console.error("Brevo API error:", res.status, body);
    } else {
      console.log("Confirmation email sent to", email);
    }
  } catch (err) {
    console.error("Failed to send confirmation email:", err);
  }
}

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

        // Send confirmation email (non-blocking — don't fail the webhook if this errors)
        await sendConfirmationEmail(email, name);
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
