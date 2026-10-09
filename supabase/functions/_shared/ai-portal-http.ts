import { createClient, type SupabaseClient, type User } from "https://esm.sh/@supabase/supabase-js@2.45.0";

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

export function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

export function text(value: unknown, max = 500): string | null {
  return typeof value === "string" && value.trim() && value.trim().length <= max ? value.trim() : null;
}

export function serviceClient(): SupabaseClient | null {
  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

export function bearer(req: Request): string | null {
  return req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") || null;
}

/** The user the auth service verified for this request's token, never a client claim. */
export async function verifiedUser(req: Request, supabase: SupabaseClient): Promise<User | null> {
  const token = bearer(req);
  if (!token) return null;
  const { data, error } = await supabase.auth.getUser(token);
  return error || !data.user ? null : data.user;
}

export async function readBody(req: Request): Promise<Record<string, unknown> | null> {
  try {
    const body = await req.json();
    return body && typeof body === "object" && !Array.isArray(body) ? body as Record<string, unknown> : null;
  } catch {
    return null;
  }
}

/** First `formula_ai_portal_*` token raised by an RPC, safe to return to the client. */
export function portalErrorCode(error: unknown, fallback = "formula_ai_portal_request_failed"): string {
  const message = error && typeof error === "object" && "message" in error && typeof error.message === "string"
    ? error.message
    : "";
  return message.match(/formula_ai_portal_[a-z0-9_]+/)?.[0] ?? fallback;
}

export async function sha256Hex(data: string | Uint8Array<ArrayBuffer>): Promise<string> {
  const bytes = typeof data === "string" ? new TextEncoder().encode(data) : data;
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");
}
