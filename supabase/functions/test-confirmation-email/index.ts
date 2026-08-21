import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
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

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceKey) return new Response("Missing configuration", { status: 500 });
  const supabase = createClient(supabaseUrl, serviceKey);
  if (!(await requireAdmin(req, supabase))) return new Response("Unauthorized", { status: 401 });

  try {
    const body = await req.json() as { email?: string; name?: string | null };
    if (!body.email) return new Response("email is required", { status: 400 });
    const delivery = await queuePurchaseEmail(supabase, {
      stripeSessionId: `test_${crypto.randomUUID()}`,
      emailType: "attendee_confirmation",
      recipientEmail: body.email,
      recipientName: body.name || "Test Attendee",
      tier: "test",
    });
    const result = await processPurchaseEmail(supabase, delivery.id);
    return new Response(JSON.stringify({ success: true, deliveryId: delivery.id, ...result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Test confirmation email failed:", error);
    return new Response(JSON.stringify({ error: "Test confirmation email failed" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
