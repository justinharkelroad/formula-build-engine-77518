// Public sign-in for the Formula AI portal (/ai-portal).
//
// `request-code`: if the email is eligible and sign-in is open, the auth
// service issues a one-time 6-digit code and we email it. Every outcome other
// than "closed" or "rate limited" gets the same reply after the same minimum
// delay, so the endpoint cannot be used to test who is on the roster.
// No password is ever created or changed here.
//
// `request-access`: someone not on the roster asks Mary to review them.
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { corsHeaders, json, readBody, serviceClient, sha256Hex, text } from "../_shared/ai-portal-http.ts";

const MIN_RESPONSE_MS = 1200;
const PORTAL_URL = "https://theformulaforum.com/ai-portal";

function clientIp(req: Request): string {
  return req.headers.get("cf-connecting-ip")
    || req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || req.headers.get("x-real-ip")
    || "unknown";
}

async function clientHash(req: Request): Promise<string> {
  const salt = Deno.env.get("AI_PORTAL_CLIENT_SALT") || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
  return sha256Hex(`${salt}:${clientIp(req)}`);
}

function codeEmail(code: string) {
  const subject = "Your Formula AI portal code";
  const text = [
    `Your Formula AI portal code is ${code}`,
    "",
    "Enter it on the portal page to open your replays, guides, and starter files.",
    "It works once and expires shortly. If it stops working, request a new one.",
    "",
    PORTAL_URL,
    "",
    "Didn't ask for this? Ignore this email. Nobody can sign in without the code.",
  ].join("\n");
  const html = `<!doctype html><html><body style="margin:0;background:#f3f0e9;font-family:Arial,Helvetica,sans-serif;color:#111">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px 16px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#fff;border-radius:16px">
<tr><td style="padding:32px">
<p style="margin:0 0 8px;font-size:12px;font-weight:bold;letter-spacing:.16em;text-transform:uppercase;color:#666">Formula AI portal</p>
<p style="margin:0 0 20px;font-size:16px;line-height:1.5">Your sign-in code:</p>
<p style="margin:0 0 24px;font-size:36px;font-weight:bold;letter-spacing:.3em;font-family:'Courier New',monospace">${code}</p>
<p style="margin:0 0 20px;font-size:15px;line-height:1.5">Enter it on the portal page to open your replays, guides, and starter files. It works once and expires shortly.</p>
<p style="margin:0 0 24px"><a href="${PORTAL_URL}" style="color:#111;font-weight:bold">${PORTAL_URL.replace("https://", "")}</a></p>
<p style="margin:0;font-size:13px;line-height:1.5;color:#666">Didn't ask for this? Ignore this email. Nobody can sign in without the code.</p>
</td></tr></table></td></tr></table></body></html>`;
  return { subject, text, html };
}

async function sendCode(email: string, code: string, requestId: string): Promise<boolean> {
  const apiKey = Deno.env.get("RESEND_API_KEY");
  if (!apiKey) {
    console.error("AI portal code not sent: RESEND_API_KEY is not configured");
    return false;
  }
  const content = codeEmail(code);
  const response = await fetch(Deno.env.get("FORMULA_RESEND_API_URL") || "https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "Idempotency-Key": `formula-ai-portal-code:${requestId}`,
    },
    body: JSON.stringify({
      from: Deno.env.get("FORMULA_EMAIL_FROM") || "FORMULA <tickets@theformulaforum.com>",
      to: [email],
      reply_to: Deno.env.get("FORMULA_EMAIL_REPLY_TO") || "info@f3florida.com",
      subject: content.subject,
      html: content.html,
      text: content.text,
      tags: [{ name: "email_type", value: "ai_portal_code" }],
    }),
  });
  if (!response.ok) {
    console.error("AI portal code not sent", { status: response.status });
    return false;
  }
  return true;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const started = Date.now();
  const settle = async (body: unknown, status = 200) => {
    const wait = MIN_RESPONSE_MS - (Date.now() - started);
    if (wait > 0) await new Promise((resolve) => setTimeout(resolve, wait));
    return json(body, status);
  };

  const supabase = serviceClient();
  if (!supabase) return json({ error: "Missing configuration" }, 500);
  const body = await readBody(req);
  if (!body) return json({ error: "Invalid request" }, 400);
  const action = text(body.action, 40);

  try {
    if (action === "request-code") {
      const email = text(body.email, 254);
      if (!email) return settle({ error: "formula_ai_portal_invalid_email" }, 400);

      const { data, error } = await supabase.rpc("formula_ai_portal_request_code", {
        p_email: email,
        p_client_hash: await clientHash(req),
      });
      if (error) throw error;
      const gate = data as { send: boolean; outcome: string; requestId?: string; email?: string };

      if (gate.outcome === "invalid_email") return settle({ error: "formula_ai_portal_invalid_email" }, 400);
      if (gate.outcome === "closed") return settle({ state: "closed" });
      if (gate.outcome === "rate_limited") return settle({ state: "rate_limited" });

      if (gate.send && gate.requestId && gate.email) {
        let sent = false;
        // magiclink + email_otp: the auth service mints a single-use code without
        // sending anything itself and without touching any existing password.
        const { data: link, error: linkError } = await supabase.auth.admin.generateLink({
          type: "magiclink",
          email: gate.email,
        });
        const code = link?.properties?.email_otp;
        if (linkError || !code) {
          console.error("AI portal code could not be issued", { code: linkError?.status ?? "missing_otp" });
        } else {
          sent = await sendCode(gate.email, code, gate.requestId);
        }
        await supabase.rpc("formula_ai_portal_record_code_send", { p_request_id: gate.requestId, p_sent: sent });
      }
      return settle({ state: "check_email" });
    }

    if (action === "request-access") {
      const email = text(body.email, 254);
      const name = text(body.name, 120);
      const note = body.note == null || body.note === "" ? null : text(body.note, 500);
      if (!email || !name || (body.note != null && body.note !== "" && !note)) {
        return settle({ error: "formula_ai_portal_invalid_request" }, 400);
      }
      const { error } = await supabase.rpc("formula_ai_portal_request_access", {
        p_email: email,
        p_name: name,
        p_note: note,
        p_client_hash: await clientHash(req),
      });
      if (error) {
        const invalid = /formula_ai_portal_invalid_request/.test(error.message);
        if (invalid) return settle({ error: "formula_ai_portal_invalid_request" }, 400);
        throw error;
      }
      return settle({ state: "received" });
    }

    return json({ error: "Unknown action" }, 400);
  } catch (error) {
    console.error("AI portal sign-in request failed", {
      action,
      message: error instanceof Error ? error.message.slice(0, 200) : "unknown",
    });
    return settle({ error: "formula_ai_portal_unavailable" }, 503);
  }
});
