import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import {
  CheckoutSessionNotFoundError,
  isValidCheckoutSessionId,
  type VerificationDependencies,
  type VerificationStatus,
  verifyFormulaRegistration,
} from "./verification.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 20;
const RATE_LIMIT_MAX_CLIENTS = 5_000;
const rateLimits = new Map<string, { count: number; resetAt: number }>();

function response(
  status: VerificationStatus,
  httpStatus = 200,
  extraHeaders: Record<string, string> = {},
): Response {
  return new Response(JSON.stringify({ status }), {
    status: httpStatus,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
      ...extraHeaders,
    },
  });
}

function isRateLimited(req: Request): boolean {
  const now = Date.now();
  if (rateLimits.size >= RATE_LIMIT_MAX_CLIENTS) {
    for (const [key, value] of rateLimits) {
      if (value.resetAt <= now) rateLimits.delete(key);
    }
  }
  const forwardedClient =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("cf-connecting-ip");
  const client = forwardedClient || "unknown";
  // Supabase's gateway supplies a client IP. Keep a larger shared allowance for
  // local/direct environments where that trusted header is unavailable.
  const requestLimit = forwardedClient ? RATE_LIMIT_MAX_REQUESTS : 200;
  const current = rateLimits.get(client);
  if (!current || current.resetAt <= now) {
    if (!current && rateLimits.size >= RATE_LIMIT_MAX_CLIENTS) return true;
    rateLimits.set(client, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }
  current.count += 1;
  return current.count > requestLimit;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  if (req.method !== "POST") return response("not_found", 405);
  if (isRateLimited(req)) {
    return response("unavailable", 429, { "Retry-After": "60" });
  }

  const body = await req.json().catch(() => null) as
    | { sessionId?: unknown }
    | null;
  const sessionId = typeof body?.sessionId === "string"
    ? body.sessionId.trim()
    : "";
  if (!isValidCheckoutSessionId(sessionId)) return response("not_found", 400);

  const stripeSecret = Deno.env.get("STRIPE_SECRET_KEY");
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!stripeSecret || !supabaseUrl || !serviceKey) {
    console.error(
      "Registration verifier is missing required server configuration",
    );
    return response("unavailable", 503);
  }

  const stripe = new Stripe(stripeSecret, { apiVersion: "2024-06-20" });
  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const dependencies: VerificationDependencies = {
    async retrieveCheckoutSession(id) {
      try {
        const session = await stripe.checkout.sessions.retrieve(id);
        return { paymentStatus: session.payment_status };
      } catch (error) {
        const stripeError = error as { statusCode?: number; code?: string };
        if (
          stripeError.statusCode === 404 ||
          stripeError.code === "resource_missing"
        ) {
          throw new CheckoutSessionNotFoundError();
        }
        console.warn("Registration verifier could not reach Stripe", {
          error: error instanceof Error ? error.name : "unknown",
        });
        throw error;
      }
    },
    async listPurchases(id) {
      const { data, error } = await supabase
        .from("purchases")
        .select("id,quantity,pass_type")
        .eq("stripe_session_id", id);
      if (error) throw error;
      return data ?? [];
    },
    async listRegistrationSources(purchaseIds) {
      const { data, error } = await supabase
        .from("formula_registration_sources")
        .select("source_id,reconciliation_state,registration_id")
        .eq("event_id", "formula-2026")
        .eq("source_type", "purchase")
        .in("source_id", purchaseIds);
      if (error) throw error;
      return data ?? [];
    },
    async listRegistrations(registrationIds) {
      const { data, error } = await supabase
        .from("formula_event_registrations")
        .select("id,registration_state")
        .in("id", registrationIds);
      if (error) throw error;
      return data ?? [];
    },
    async listEntitlements(registrationIds) {
      const { data, error } = await supabase
        .from("formula_entitlements")
        .select("event_registration_id,access_state,event_attendance_allowed")
        .in("event_registration_id", registrationIds);
      if (error) throw error;
      return data ?? [];
    },
  };

  const status = await verifyFormulaRegistration(sessionId, dependencies);
  return response(status, status === "unavailable" ? 503 : 200);
});
