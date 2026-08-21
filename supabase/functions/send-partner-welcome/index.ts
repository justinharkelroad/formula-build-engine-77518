import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { requireAdmin } from "../_shared/admin-auth.ts";
import {
  processPurchaseEmail,
  queuePurchaseEmail,
  resetPurchaseEmail,
} from "../_shared/transactional-email.ts";

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

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceKey) return json({ error: "Missing configuration" }, 500);
  const supabase = createClient(supabaseUrl, serviceKey);
  if (!(await requireAdmin(req, supabase))) return json({ error: "Unauthorized" }, 401);

  try {
    const body = await req.json() as {
      email?: string;
      name?: string | null;
      tier?: string;
      sessionId?: string;
    };
    if (!body.email || !body.tier || !body.sessionId) {
      return json({ error: "email, tier, and sessionId are required" }, 400);
    }
    await queuePurchaseEmail(supabase, {
      stripeSessionId: body.sessionId,
      emailType: "partner_welcome",
      recipientEmail: body.email,
      recipientName: body.name || null,
      tier: body.tier,
    });
    const delivery = await resetPurchaseEmail(supabase, {
      stripeSessionId: body.sessionId,
      emailType: "partner_welcome",
      recipientEmail: body.email,
      recipientName: body.name,
      tier: body.tier,
    });
    const result = await processPurchaseEmail(supabase, delivery.id);
    return json({ success: true, deliveryId: delivery.id, ...result });
  } catch (error) {
    console.error("Partner welcome email failed:", error);
    return json({ error: "Partner welcome email failed" }, 500);
  }
});
