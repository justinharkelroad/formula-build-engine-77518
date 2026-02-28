import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const HOTEL_BOOK_URL = "https://book.passkey.com/event/51189838/owner/49980248/home";
const FACEBOOK_GROUP_URL = "https://www.facebook.com/groups/1637602806874362";
const WEBSITE_URL = "https://theformulaforum.com";

function buildConfirmationEmailHtml(name: string | null): string {
  const firstName = name ? name.split(" ")[0] : "there";
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>You're In — FORMULA 2026</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:Arial,Helvetica,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;padding:32px 16px;">
<tr><td align="center">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;max-width:600px;width:100%;">

  <!-- Header -->
  <tr>
    <td style="background: linear-gradient(135deg, #1e3a5f 0%, #0f2440 100%); padding:40px 32px; text-align:center;">
      <h1 style="color:#ffffff;font-size:28px;margin:0 0 8px;">BOOM — You're In!</h1>
      <p style="color:#94b8d4;font-size:16px;margin:0;">Your registration for the FORMULA is confirmed.</p>
    </td>
  </tr>

  <!-- Body -->
  <tr>
    <td style="padding:32px;">

      <p style="font-size:16px;color:#333;line-height:1.6;margin:0 0 24px;">
        Hey ${firstName},
      </p>
      <p style="font-size:16px;color:#333;line-height:1.6;margin:0 0 24px;">
        We are fired up to have you locked in. The FORMULA is going to be unlike anything you've experienced — real strategies, real connections, and a room full of agency owners who are serious about growth.
      </p>

      <!-- Event Details Card -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8fafc;border-radius:8px;border-left:4px solid #1e3a5f;margin-bottom:24px;">
        <tr><td style="padding:20px 24px;">
          <p style="font-size:14px;color:#64748b;text-transform:uppercase;letter-spacing:1px;margin:0 0 12px;font-weight:bold;">Event Details</p>
          <p style="font-size:16px;color:#1e293b;margin:0 0 6px;"><strong>Dates:</strong> October 14–16, 2026</p>
          <p style="font-size:16px;color:#1e293b;margin:0 0 6px;"><strong>Location:</strong> Orlando, Florida</p>
          <p style="font-size:16px;color:#1e293b;margin:0;"><strong>Venue:</strong> JW Marriott Orlando Bonnet Creek</p>
        </td></tr>
      </table>

      <!-- Hotel CTA -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
        <tr><td style="padding:20px 24px;background-color:#fef9c3;border-radius:8px;">
          <p style="font-size:16px;color:#713f12;margin:0 0 12px;">
            <strong>Secure Your Hotel Room</strong><br/>
            We've locked in discounted group rates just for attendees — but they won't last forever. Book now before the block fills up.
          </p>
          <table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="background-color:#1e3a5f;border-radius:6px;">
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
            <table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="background-color:#1e3a5f;border-radius:6px;">
              <a href="${WEBSITE_URL}" target="_blank" style="display:inline-block;padding:12px 28px;color:#ffffff;font-size:15px;font-weight:bold;text-decoration:none;">
                Visit theformulaforum.com
              </a>
            </td></tr></table>
          </td>
        </tr>
        <tr>
          <td align="center">
            <table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="border:2px solid #1e3a5f;border-radius:6px;">
              <a href="${FACEBOOK_GROUP_URL}" target="_blank" style="display:inline-block;padding:12px 28px;color:#1e3a5f;font-size:15px;font-weight:bold;text-decoration:none;">
                Join Our Facebook Group
              </a>
            </td></tr></table>
          </td>
        </tr>
      </table>

      <!-- Questions -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
        <tr><td style="padding:16px 24px;background-color:#f0f9ff;border-radius:8px;">
          <p style="font-size:15px;color:#1e40af;margin:0;">
            <strong>Questions?</strong> Just reply to this email or reach out directly at
            <a href="mailto:Gregg@f3florida.com" style="color:#1e40af;">Gregg@f3florida.com</a> or
            <a href="mailto:Justin@f3florida.com" style="color:#1e40af;">Justin@f3florida.com</a>
          </p>
        </td></tr>
      </table>

      <p style="font-size:16px;color:#333;line-height:1.6;margin:0 0 4px;">
        We can't wait to see you there.
      </p>
      <p style="font-size:18px;color:#1e3a5f;font-weight:bold;margin:0;">
        Let's get to work,<br/>FORMULA
      </p>

    </td>
  </tr>

  <!-- Footer -->
  <tr>
    <td style="background-color:#0f2440;padding:24px 32px;text-align:center;">
      <p style="color:#94b8d4;font-size:13px;margin:0 0 4px;">FORMULA &middot; October 14–16, 2026 &middot; Orlando, FL</p>
      <p style="color:#64748b;font-size:12px;margin:0;">JW Marriott Orlando Bonnet Creek &middot; 14900 Chelonia Pkwy, Orlando, FL 32821</p>
    </td>
  </tr>

</table>
</td></tr>
</table>
</body>
</html>`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const brevoApiKey = Deno.env.get("BREVO_API_KEY");
  if (!brevoApiKey) {
    return new Response(JSON.stringify({ error: "BREVO_API_KEY not set" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Allow overriding name/email via request body, with defaults for quick testing
  let testEmail = "justin@hfiagencies.com";
  let testName = "Justin";

  try {
    const body = await req.json();
    if (body.email) testEmail = body.email;
    if (body.name) testName = body.name;
  } catch {
    // Use defaults
  }

  const htmlContent = buildConfirmationEmailHtml(testName);

  const payload = {
    sender: { name: "FORMULA", email: "justin@f3florida.com" },
    to: [{ email: testEmail, name: testName }],
    replyTo: { email: "justin@f3florida.com", name: "Justin" },
    subject: "[TEST] You're In — FORMULA 2026 Registration Confirmed",
    htmlContent,
  };

  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": brevoApiKey,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });

  const responseBody = await res.text();

  if (!res.ok) {
    console.error("Brevo API error:", res.status, responseBody);
    return new Response(JSON.stringify({ error: "Brevo send failed", status: res.status, details: responseBody }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  console.log("Test email sent to", testEmail);
  return new Response(JSON.stringify({ success: true, sentTo: testEmail, brevoResponse: JSON.parse(responseBody) }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
