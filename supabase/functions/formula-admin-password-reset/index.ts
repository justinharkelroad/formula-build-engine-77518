// Admin "Forgot password?" (/admin/auth).
//
// Lovable Cloud's built-in auth mailer did not deliver reset emails, so this
// mints the recovery link with the auth admin API (which sends nothing and
// changes no password) and emails it through Resend from the same sender as
// ticket emails. Only website admins get a link; every other outcome except
// "rate limited" gets the same reply after the same minimum delay, so the
// endpoint cannot be used to test who has an admin account.
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { corsHeaders, json, readBody, serviceClient, sha256Hex, text } from "../_shared/ai-portal-http.ts";

const MIN_RESPONSE_MS = 1200;

function siteUrl(): string {
  return (Deno.env.get("FORMULA_SITE_URL") || "https://theformulaforum.com").replace(/\/+$/, "");
}

function clientIp(req: Request): string {
  return req.headers.get("cf-connecting-ip")
    || req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || req.headers.get("x-real-ip")
    || "unknown";
}

async function clientHash(req: Request): Promise<string> {
  const salt = Deno.env.get("AI_PORTAL_CLIENT_SALT") || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
  return sha256Hex(`admin-reset:${salt}:${clientIp(req)}`);
}

function escapeHtml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function resetEmail(link: string) {
  const subject = "Reset your Formula admin password";
  const text = [
    "Someone asked to reset the password for your Formula admin account.",
    "",
    "Choose a new password here (the link works once and expires within an hour):",
    link,
    "",
    "Didn't ask for this? Ignore this email. Your password stays the same.",
  ].join("\n");
  const safe = escapeHtml(link);
  const html = `<!doctype html><html><body style="margin:0;background:#f3f0e9;font-family:Arial,Helvetica,sans-serif;color:#111">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px 16px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#fff;border-radius:16px">
<tr><td style="padding:32px">
<p style="margin:0 0 8px;font-size:12px;font-weight:bold;letter-spacing:.16em;text-transform:uppercase;color:#666">Formula admin</p>
<p style="margin:0 0 20px;font-size:16px;line-height:1.5">Someone asked to reset the password for your Formula admin account.</p>
<p style="margin:0 0 24px"><a href="${safe}" style="display:inline-block;background:#111;color:#fff;text-decoration:none;font-weight:bold;padding:12px 22px;border-radius:999px">Choose a new password</a></p>
<p style="margin:0 0 20px;font-size:14px;line-height:1.5;color:#444">The link works once and expires within an hour.</p>
<p style="margin:0;font-size:13px;line-height:1.5;color:#666">Didn't ask for this? Ignore this email. Your password stays the same.</p>
</td></tr></table></td></tr></table></body></html>`;
  return { subject, text, html };
}

async function sendReset(email: string, link: string, requestId: string): Promise<boolean> {
  const apiKey = Deno.env.get("RESEND_API_KEY");
  if (!apiKey) {
    console.error("Admin reset not sent: RESEND_API_KEY is not configured");
    return false;
  }
  const content = resetEmail(link);
  const response = await fetch(Deno.env.get("FORMULA_RESEND_API_URL") || "https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "Idempotency-Key": `formula-admin-reset:${requestId}`,
    },
    body: JSON.stringify({
      from: Deno.env.get("FORMULA_EMAIL_FROM") || "FORMULA <tickets@theformulaforum.com>",
      to: [email],
      reply_to: Deno.env.get("FORMULA_EMAIL_REPLY_TO") || "info@f3florida.com",
      subject: content.subject,
      html: content.html,
      text: content.text,
      tags: [{ name: "email_type", value: "admin_password_reset" }],
    }),
  });
  if (!response.ok) {
    console.error("Admin reset not sent", { status: response.status });
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
  const email = body ? text(body.email, 254) : null;
  if (!email) return settle({ error: "invalid_email" }, 400);

  try {
    const { data, error } = await supabase.rpc("formula_admin_reset_request", {
      p_email: email,
      p_client_hash: await clientHash(req),
    });
    if (error) throw error;
    const gate = data as { send: boolean; outcome: string; requestId?: string; email?: string };

    if (gate.outcome === "invalid_email") return settle({ error: "invalid_email" }, 400);
    if (gate.outcome === "rate_limited") return settle({ error: "rate_limited" }, 429);

    if (gate.send && gate.requestId && gate.email) {
      let sent = false;
      const { data: link, error: linkError } = await supabase.auth.admin.generateLink({
        type: "recovery",
        email: gate.email,
        options: { redirectTo: `${siteUrl()}/admin/set-password` },
      });
      const actionLink = link?.properties?.action_link;
      if (linkError || !actionLink) {
        console.error("Admin reset link could not be issued", { code: linkError?.status ?? "missing_link" });
      } else {
        sent = await sendReset(gate.email, actionLink, gate.requestId);
      }
      await supabase.rpc("formula_admin_reset_record", { p_request_id: gate.requestId, p_sent: sent });
    }
    return settle({ ok: true });
  } catch (error) {
    console.error("Admin reset request failed", {
      message: error instanceof Error ? error.message.slice(0, 200) : "unknown",
    });
    return settle({ error: "unavailable" }, 503);
  }
});
