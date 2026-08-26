import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { requireAdmin } from "../_shared/admin-auth.ts";

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

function text(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function uuid(value: unknown): string | null {
  const candidate = text(value);
  return candidate && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(candidate)
    ? candidate
    : null;
}

function errorCode(error: unknown): string {
  if (!error || typeof error !== "object") return "formula_admin_request_failed";
  const message = "message" in error && typeof error.message === "string" ? error.message : "";
  const match = message.match(/formula_[a-z0-9_]+/);
  return match?.[0] ?? "formula_admin_request_failed";
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceKey) return json({ error: "Missing configuration" }, 500);

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  if (!(await requireAdmin(req, supabase))) return json({ error: "Unauthorized" }, 401);

  const token = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  const { data: authData, error: authError } = await supabase.auth.getUser(token);
  if (authError || !authData.user) return json({ error: "Unauthorized" }, 401);

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid request" }, 400);
  }

  const action = text(body.action);
  try {
    if (action === "snapshot") {
      const { data, error } = await supabase.rpc("formula_admin_roster_snapshot");
      if (error) throw error;
      return json(data);
    }

    if (action === "upsert") {
      const name = text(body.name);
      const email = text(body.email);
      const seatType = text(body.seatType);
      if (!name || !email || !seatType) return json({ error: "Required attendee fields are missing" }, 400);

      const sourceOrdinal = typeof body.sourceOrdinal === "number" && Number.isInteger(body.sourceOrdinal)
        ? body.sourceOrdinal
        : null;
      const { data, error } = await supabase.rpc("formula_admin_upsert_attendee", {
        p_actor_id: authData.user.id,
        p_name: name,
        p_email: email,
        p_seat_type: seatType,
        p_registration_id: uuid(body.registrationId),
        p_agency_id: uuid(body.agencyId),
        p_agency_display_name: text(body.agencyDisplayName),
        p_purchase_id: uuid(body.purchaseId),
        p_source_ordinal: sourceOrdinal,
      });
      if (error) throw error;
      return json(data);
    }

    if (action === "set-access") {
      const registrationId = uuid(body.registrationId);
      const accessAction = text(body.accessAction);
      if (!registrationId || !accessAction) return json({ error: "Invalid access request" }, 400);
      const { data, error } = await supabase.rpc("formula_admin_set_attendee_access", {
        p_actor_id: authData.user.id,
        p_registration_id: registrationId,
        p_action: accessAction,
      });
      if (error) throw error;
      return json(data);
    }

    return json({ error: "Unknown action" }, 400);
  } catch (error) {
    const code = errorCode(error);
    console.error("Formula attendee admin request failed", { action, code });
    return json({ error: code }, 400);
  }
});
