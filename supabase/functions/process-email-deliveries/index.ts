import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient, type SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import {
  processPurchaseEmail,
  queuePurchaseEmail,
  resetPurchaseEmail,
  type EmailType,
} from "../_shared/transactional-email.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-email-worker-secret",
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function isAdmin(req: Request, supabase: SupabaseClient): Promise<boolean> {
  const token = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return false;
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) return false;
  const { data: role } = await supabase
    .from("user_roles")
    .select("id")
    .eq("user_id", data.user.id)
    .eq("role", "admin")
    .maybeSingle();
  return Boolean(role);
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (!["GET", "POST"].includes(req.method)) return json({ error: "Method not allowed" }, 405);

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceKey) return json({ error: "Missing configuration" }, 500);
  const supabase = createClient(supabaseUrl, serviceKey);

  const workerSecret = Deno.env.get("EMAIL_WORKER_SECRET");
  const cronAuthorized = Boolean(
    workerSecret && req.headers.get("x-email-worker-secret") === workerSecret,
  );
  const adminAuthorized = cronAuthorized ? false : await isAdmin(req, supabase);
  if (!cronAuthorized && !adminAuthorized) return json({ error: "Unauthorized" }, 401);

  try {
    if (req.method === "POST" && adminAuthorized) {
      const body = await req.json() as {
        action?: string;
        stripeSessionId?: string;
        emailType?: EmailType;
        recipientEmail?: string;
        recipientName?: string | null;
        tier?: string | null;
      };
      if (
        body.action !== "resend" ||
        !body.stripeSessionId ||
        !body.emailType ||
        !body.recipientEmail
      ) {
        return json({ error: "Invalid resend request" }, 400);
      }
      if (!["attendee_confirmation", "partner_welcome"].includes(body.emailType)) {
        return json({ error: "Invalid email type" }, 400);
      }

      const queued = await queuePurchaseEmail(supabase, {
        stripeSessionId: body.stripeSessionId,
        emailType: body.emailType,
        recipientEmail: body.recipientEmail,
        recipientName: body.recipientName || null,
        tier: body.tier || null,
      });
      const delivery = await resetPurchaseEmail(supabase, {
        stripeSessionId: body.stripeSessionId,
        emailType: body.emailType,
        recipientEmail: body.recipientEmail,
        recipientName: body.recipientName,
        tier: body.tier,
      });
      const result = await processPurchaseEmail(supabase, delivery.id);
      return json({ success: true, deliveryId: queued.id, ...result });
    }

    if (!cronAuthorized) return json({ error: "Worker secret required" }, 401);
    const staleCutoff = new Date(Date.now() - 15 * 60_000).toISOString();
    const { error: staleError } = await supabase
      .from("purchase_email_deliveries")
      .update({
        status: "failed",
        next_attempt_at: new Date().toISOString(),
        last_error: "Recovered an interrupted sending attempt",
        updated_at: new Date().toISOString(),
      })
      .eq("status", "sending")
      .lt("last_attempt_at", staleCutoff);
    if (staleError) throw staleError;

    const { data, error } = await supabase
      .from("purchase_email_deliveries")
      .select("id, attempt_count, max_attempts")
      .in("status", ["queued", "failed"])
      .lte("next_attempt_at", new Date().toISOString())
      .order("next_attempt_at", { ascending: true })
      .limit(25);
    if (error) throw error;

    const due = (data || []).filter((row) => row.attempt_count < row.max_attempts);
    const results = await Promise.allSettled(
      due.map((row) => processPurchaseEmail(supabase, row.id)),
    );
    return json({
      success: true,
      attempted: due.length,
      sent: results.filter((result) => result.status === "fulfilled").length,
      failed: results.filter((result) => result.status === "rejected").length,
    });
  } catch (error) {
    console.error("Email delivery worker failed:", error);
    return json({ error: "Email delivery worker failed" }, 500);
  }
});
