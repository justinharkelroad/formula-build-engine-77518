import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

export type EmailType = "attendee_confirmation" | "partner_welcome";

type DeliveryRow = {
  id: string;
  stripe_session_id: string;
  email_type: EmailType;
  recipient_email: string;
  recipient_name: string | null;
  tier: string | null;
  status: string;
  idempotency_key: string;
  attempt_count: number;
  max_attempts: number;
};

const WEBSITE_URL = "https://theformulaforum.com";
const HOTEL_BOOK_URL = "https://book.passkey.com/event/51189838/owner/49980248/home";
const FACEBOOK_GROUP_URL = "https://www.facebook.com/groups/1637602806874362";
const IOS_APP_URL = "https://apps.apple.com/us/app/formula-forum/id6759879318";
const ANDROID_APP_URL = "https://play.google.com/store/apps/details?id=com.triumphboxandryde.formulaforum";
const APP_GUIDE_URL = `${WEBSITE_URL}/formula-app-guide`;
const FORMULA_FLOW_URL = "https://flow.theformulaforum.com/";
const PARTNER_HUB_GUIDE_URL = `${WEBSITE_URL}/partners/partner-hub-guide`;
const LOGO_URL = "https://koubtooblwjcwubcuhml.supabase.co/storage/v1/object/public/images//FORMULA%20GRADIENT%20WORD.png";

const PARTNER_TIER_NAMES: Record<string, string> = {
  platinum: "Platinum",
  gold: "Gold",
  silver: "Silver",
  bronze: "Bronze",
};

const PARTNER_PASSES: Record<string, number> = {
  platinum: 8,
  gold: 6,
  silver: 4,
  bronze: 2,
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function firstName(name: string | null): string {
  return name?.trim() ? escapeHtml(name.trim().split(/\s+/)[0]) : "there";
}

function layout(body: string, preheader: string): string {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>FORMULA 2026</title>
</head>
<body style="margin:0;background:#18181b;font-family:Arial,Helvetica,sans-serif;color:#27272a">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0">${escapeHtml(preheader)}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#18181b;padding:28px 12px">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:#fff;border-radius:12px;overflow:hidden">
        <tr><td style="background:#18181b;padding:34px 28px;text-align:center">
          <a href="${WEBSITE_URL}"><img src="${LOGO_URL}" width="390" alt="FORMULA" style="display:block;width:100%;max-width:390px;height:auto;margin:0 auto"></a>
        </td></tr>
        <tr><td style="height:5px;background:linear-gradient(90deg,#f53214 0 33%,#fa9c27 33% 66%,#48b4d1 66% 100%)"></td></tr>
        <tr><td style="padding:34px 30px">${body}</td></tr>
        <tr><td style="height:5px;background:linear-gradient(90deg,#f53214 0 33%,#fa9c27 33% 66%,#48b4d1 66% 100%)"></td></tr>
        <tr><td style="background:#18181b;padding:22px 28px;text-align:center;color:#a1a1aa;font-size:12px;line-height:1.6">
          FORMULA &middot; October 14 to 16, 2026 &middot; Orlando, Florida<br>
          JW Marriott Orlando Bonnet Creek
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function button(url: string, label: string, color = "#f53214"): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="background:${color};border-radius:7px">
    <a href="${url}" style="display:inline-block;padding:13px 22px;color:#fff;text-decoration:none;font-size:15px;font-weight:700">${label}</a>
  </td></tr></table>`;
}

function attendeeEmail(name: string | null) {
  const body = `
    <h1 style="margin:0 0 10px;color:#f53214;font-size:31px;line-height:1.15">You are in.</h1>
    <p style="margin:0 0 26px;color:#52525b;font-size:16px">Your FORMULA 2026 registration is confirmed.</p>
    <p style="margin:0 0 16px;font-size:16px;line-height:1.65">Hey ${firstName(name)},</p>
    <p style="margin:0 0 24px;font-size:16px;line-height:1.65">Your payment is confirmed and your seat is locked in. Save this email. It has the links you need for the event.</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;background:#f4f4f5;border-left:4px solid #f53214;border-radius:8px">
      <tr><td style="padding:20px 22px;font-size:15px;line-height:1.7">
        <strong>October 14 to 16, 2026</strong><br>
        JW Marriott Orlando Bonnet Creek<br>
        14900 Chelonia Parkway, Orlando, FL 32821
      </td></tr>
    </table>
    <div style="margin:0 0 24px;padding:20px 22px;background:#eff6ff;border:1px solid #48b4d1;border-radius:8px">
      <p style="margin:0 0 8px;font-size:16px;font-weight:700">Set up every named attendee</p>
      <p style="margin:0;font-size:14px;line-height:1.6">Each owner or team member uses the email assigned to their own named attendee seat and creates their own FORMULA account. Verify the email before a first ticket claim. Use the same account credentials in Formula Flow.</p>
    </div>
    <p style="margin:0 0 12px;font-size:16px;line-height:1.6"><strong>Do these next:</strong></p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr><td style="padding:0 0 12px">${button(HOTEL_BOOK_URL, "Reserve your hotel room", "#fa9c27")}</td></tr>
      <tr><td style="padding:0 0 12px">${button(IOS_APP_URL, "Download the FORMULA iPhone app", "#48b4d1")}</td></tr>
      <tr><td style="padding:0 0 12px">${button(ANDROID_APP_URL, "Download the FORMULA Android app", "#48b4d1")}</td></tr>
      <tr><td style="padding:0 0 12px">${button(APP_GUIDE_URL, "Follow the app setup guide", "#27272a")}</td></tr>
      <tr><td style="padding:0 0 12px">${button(FORMULA_FLOW_URL, "Open Formula Flow", "#27272a")}</td></tr>
      <tr><td style="padding:0 0 12px">${button(FACEBOOK_GROUP_URL, "Join the attendee Facebook group", "#27272a")}</td></tr>
      <tr><td style="padding:0 0 24px">${button(WEBSITE_URL, "View event details")}</td></tr>
    </table>
    <p style="margin:0 0 18px;font-size:14px;line-height:1.6;color:#52525b">After each session, photograph or upload all three completed Formula workbook pages: the assessment and Mirror scores, the written reflection and discussion, and the Domino through declaration. Each attendee's plan is private to their account. Team members can download or copy business actions for an agency owner; personal Body, Balance and Being work stays private.</p>
    <p style="margin:0 0 6px;font-size:15px;line-height:1.6">Questions? Reply to this email or contact <a href="mailto:info@f3florida.com" style="color:#f53214">info@f3florida.com</a>.</p>
    <p style="margin:22px 0 0;font-size:17px;font-weight:700;color:#f53214">We will see you in Orlando.</p>`;

  return {
    subject: "Your FORMULA 2026 registration is confirmed",
    html: layout(body, "Payment confirmed. Your FORMULA 2026 links are inside."),
    text: `Hey ${name?.trim().split(/\s+/)[0] || "there"},

Your payment is confirmed and your seat for FORMULA 2026 is locked in.

October 14 to 16, 2026
JW Marriott Orlando Bonnet Creek
14900 Chelonia Parkway, Orlando, FL 32821

Reserve your room: ${HOTEL_BOOK_URL}
Download the iPhone app: ${IOS_APP_URL}
Download the Android app: ${ANDROID_APP_URL}
App setup guide: ${APP_GUIDE_URL}
Formula Flow: ${FORMULA_FLOW_URL}
Join the attendee Facebook group: ${FACEBOOK_GROUP_URL}
Event details: ${WEBSITE_URL}

Each named owner or team attendee uses the email assigned to their own seat and creates their own FORMULA account. Verify the email before a first ticket claim, then use the same account credentials in Formula Flow.

After each session, photograph or upload all three completed Formula workbook pages: the assessment and Mirror scores, the written reflection and discussion, and the Domino through declaration.

Each attendee's plan is private to their account. Team members can download or copy business actions for an agency owner; personal Body, Balance and Being work stays private.

Questions? Reply to this email or contact info@f3florida.com.

We will see you in Orlando.
FORMULA`,
  };
}

function partnerEmail(name: string | null, tier: string | null, sessionId: string) {
  const normalizedTier = tier || "partner";
  const tierName = PARTNER_TIER_NAMES[normalizedTier] || normalizedTier;
  const passes = PARTNER_PASSES[normalizedTier] || 2;
  const onboardingUrl = `${WEBSITE_URL}/partner-welcome/${encodeURIComponent(normalizedTier)}?session_id=${encodeURIComponent(sessionId)}`;
  const body = `
    <h1 style="margin:0 0 10px;color:#f53214;font-size:29px;line-height:1.15">Welcome to FORMULA.</h1>
    <p style="margin:0 0 26px;color:#52525b;font-size:16px">Your ${escapeHtml(tierName)} partnership is confirmed.</p>
    <p style="margin:0 0 16px;font-size:16px;line-height:1.65">Hey ${firstName(name)},</p>
    <p style="margin:0 0 24px;font-size:16px;line-height:1.65">Your payment is confirmed. Your partnership includes ${passes} full access passes. Complete the onboarding form so the FORMULA team can begin preparing your brand assets.</p>
    <div style="margin:0 0 24px;padding:22px;background:#fff7ed;border:1px solid #fa9c27;border-radius:8px">
      <p style="margin:0 0 14px;font-size:16px;font-weight:700">Complete your partner onboarding</p>
      ${button(onboardingUrl, "Set up my partner profile")}
    </div>
    <div style="margin:0 0 24px;padding:20px 22px;background:#eff6ff;border:1px solid #48b4d1;border-radius:8px">
      <p style="margin:0 0 8px;font-size:16px;font-weight:700">Set up your sponsor team</p>
      <p style="margin:0;font-size:14px;line-height:1.6">Approved partner owners and staff use the email connected to their approved partner organization. Each person uses their own FORMULA account and signs in with those same credentials in Formula Flow. Complete any verification prompt shown by the app. Do not share the partner owner's password.</p>
    </div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr><td style="padding:0 0 12px">${button(HOTEL_BOOK_URL, "Reserve your hotel room", "#fa9c27")}</td></tr>
      <tr><td style="padding:0 0 12px">${button(IOS_APP_URL, "Download the FORMULA iPhone app", "#48b4d1")}</td></tr>
      <tr><td style="padding:0 0 12px">${button(ANDROID_APP_URL, "Download the FORMULA Android app", "#48b4d1")}</td></tr>
      <tr><td style="padding:0 0 12px">${button(APP_GUIDE_URL, "Follow the app setup guide", "#27272a")}</td></tr>
      <tr><td style="padding:0 0 12px">${button(PARTNER_HUB_GUIDE_URL, "Complete Partner Hub setup", "#27272a")}</td></tr>
      <tr><td style="padding:0 0 24px">${button(FORMULA_FLOW_URL, "Open Formula Flow", "#27272a")}</td></tr>
    </table>
    <p style="margin:0 0 18px;font-size:14px;line-height:1.6;color:#52525b">After each session, photograph or upload all three completed Formula workbook pages: the assessment and Mirror scores, the written reflection and discussion, and the Domino through declaration. Partner owners and staff each receive a private plan in their own account. Organization page and lead work belongs in Partner Hub; personal Body, Balance and Being work stays private.</p>
    <p style="margin:0;font-size:15px;line-height:1.6">Questions? Reply to this email or contact <a href="mailto:info@f3florida.com" style="color:#f53214">info@f3florida.com</a>.</p>`;

  return {
    subject: `Welcome, ${tierName} Partner: FORMULA 2026`,
    html: layout(body, "Your FORMULA partnership is confirmed. Complete your onboarding."),
    text: `Hey ${name?.trim().split(/\s+/)[0] || "there"},

Your ${tierName} partnership payment is confirmed. Your partnership includes ${passes} full access passes.

Complete partner onboarding: ${onboardingUrl}
Reserve your room: ${HOTEL_BOOK_URL}
Download the iPhone app: ${IOS_APP_URL}
Download the Android app: ${ANDROID_APP_URL}
App setup guide: ${APP_GUIDE_URL}
Partner Hub setup guide: ${PARTNER_HUB_GUIDE_URL}
Formula Flow: ${FORMULA_FLOW_URL}

Approved partner owners and staff use the email connected to their approved partner organization. Each person uses their own FORMULA account and signs in with those same credentials in Formula Flow. Complete any verification prompt shown by the app. Do not share the partner owner's password.

After each session, photograph or upload all three completed Formula workbook pages: the assessment and Mirror scores, the written reflection and discussion, and the Domino through declaration.

Partner owners and staff each receive a private plan in their own account. Organization page and lead work belongs in Partner Hub; personal Body, Balance and Being work stays private.

October 14 to 16, 2026
JW Marriott Orlando Bonnet Creek

Questions? Reply to this email or contact info@f3florida.com.

FORMULA`,
  };
}

function emailContent(delivery: DeliveryRow) {
  return delivery.email_type === "partner_welcome"
    ? partnerEmail(delivery.recipient_name, delivery.tier, delivery.stripe_session_id)
    : attendeeEmail(delivery.recipient_name);
}

function retryAt(attemptCount: number): string {
  const minutes = Math.min(12 * 60, 5 * Math.pow(2, Math.max(0, attemptCount - 1)));
  return new Date(Date.now() + minutes * 60_000).toISOString();
}

export async function queuePurchaseEmail(
  supabase: SupabaseClient,
  input: {
    stripeSessionId: string;
    emailType: EmailType;
    recipientEmail: string;
    recipientName: string | null;
    tier: string | null;
  },
): Promise<DeliveryRow> {
  const values = {
    stripe_session_id: input.stripeSessionId,
    email_type: input.emailType,
    recipient_email: input.recipientEmail.trim().toLowerCase(),
    recipient_name: input.recipientName,
    tier: input.tier,
    idempotency_key: `formula:${input.stripeSessionId}:${input.emailType}:v1`,
  };

  const { data, error } = await supabase
    .from("purchase_email_deliveries")
    .insert(values)
    .select("*")
    .single();

  if (!error && data) return data as DeliveryRow;
  if (error?.code !== "23505") throw new Error(`Could not queue email: ${error?.message || "unknown error"}`);

  const { data: existing, error: existingError } = await supabase
    .from("purchase_email_deliveries")
    .select("*")
    .eq("stripe_session_id", input.stripeSessionId)
    .eq("email_type", input.emailType)
    .single();

  if (existingError || !existing) {
    throw new Error(`Could not load queued email: ${existingError?.message || "not found"}`);
  }
  return existing as DeliveryRow;
}

export async function resetPurchaseEmail(
  supabase: SupabaseClient,
  input: {
    stripeSessionId: string;
    emailType: EmailType;
    recipientEmail?: string;
    recipientName?: string | null;
    tier?: string | null;
  },
): Promise<DeliveryRow> {
  const changes: Record<string, unknown> = {
    status: "queued",
    idempotency_key: `formula:${input.stripeSessionId}:${input.emailType}:${crypto.randomUUID()}`,
    attempt_count: 0,
    next_attempt_at: new Date().toISOString(),
    last_error: null,
    failed_at: null,
    provider_email_id: null,
    sent_at: null,
    delivered_at: null,
    updated_at: new Date().toISOString(),
  };
  if (input.recipientEmail) changes.recipient_email = input.recipientEmail.trim().toLowerCase();
  if (input.recipientName !== undefined) changes.recipient_name = input.recipientName;
  if (input.tier !== undefined) changes.tier = input.tier;

  const { data, error } = await supabase
    .from("purchase_email_deliveries")
    .update(changes)
    .eq("stripe_session_id", input.stripeSessionId)
    .eq("email_type", input.emailType)
    .select("*")
    .single();

  if (error || !data) throw new Error(`Could not reset email: ${error?.message || "not found"}`);
  return data as DeliveryRow;
}

export async function processPurchaseEmail(
  supabase: SupabaseClient,
  deliveryId: string,
): Promise<{ status: string; providerEmailId?: string }> {
  const { data, error } = await supabase
    .from("purchase_email_deliveries")
    .select("*")
    .eq("id", deliveryId)
    .single();

  if (error || !data) throw new Error(`Could not load email: ${error?.message || "not found"}`);
  const delivery = data as DeliveryRow;
  if (["sent", "delivered", "bounced", "complained", "suppressed"].includes(delivery.status)) {
    return { status: delivery.status };
  }
  if (delivery.attempt_count >= delivery.max_attempts) return { status: "failed" };

  const attemptCount = delivery.attempt_count + 1;
  const now = new Date().toISOString();
  const { data: claimed, error: claimError } = await supabase
    .from("purchase_email_deliveries")
    .update({
      status: "sending",
      attempt_count: attemptCount,
      last_attempt_at: now,
      updated_at: now,
    })
    .eq("id", delivery.id)
    .in("status", ["queued", "failed"])
    .select("id")
    .maybeSingle();

  if (claimError) throw new Error(`Could not claim email: ${claimError.message}`);
  if (!claimed) return { status: delivery.status };

  const apiKey = Deno.env.get("RESEND_API_KEY");
  if (!apiKey) {
    await supabase.from("purchase_email_deliveries").update({
      status: "failed",
      failed_at: now,
      last_error: "RESEND_API_KEY is not configured",
      next_attempt_at: retryAt(attemptCount),
      updated_at: now,
    }).eq("id", delivery.id);
    throw new Error("RESEND_API_KEY is not configured");
  }

  const content = emailContent(delivery);
  const from = Deno.env.get("FORMULA_EMAIL_FROM") || "FORMULA <tickets@theformulaforum.com>";
  const replyTo = Deno.env.get("FORMULA_EMAIL_REPLY_TO") || "info@f3florida.com";

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": delivery.idempotency_key,
      },
      body: JSON.stringify({
        from,
        to: [delivery.recipient_email],
        reply_to: replyTo,
        subject: content.subject,
        html: content.html,
        text: content.text,
        tags: [
          { name: "email_type", value: delivery.email_type },
          { name: "stripe_session", value: delivery.stripe_session_id },
        ],
      }),
    });
    const responseBody = await response.text();

    if (!response.ok) {
      throw new Error(`Resend returned ${response.status}: ${responseBody.slice(0, 500)}`);
    }

    const result = JSON.parse(responseBody) as { id?: string };
    if (!result.id) throw new Error("Resend response did not include an email id");

    await supabase.from("purchase_email_deliveries").update({
      status: "sent",
      provider_email_id: result.id,
      sent_at: now,
      last_error: null,
      updated_at: now,
    }).eq("id", delivery.id);

    return { status: "sent", providerEmailId: result.id };
  } catch (sendError) {
    const message = sendError instanceof Error ? sendError.message : String(sendError);
    await supabase.from("purchase_email_deliveries").update({
      status: "failed",
      failed_at: now,
      last_error: message.slice(0, 1000),
      next_attempt_at: retryAt(attemptCount),
      updated_at: now,
    }).eq("id", delivery.id);
    throw sendError;
  }
}
