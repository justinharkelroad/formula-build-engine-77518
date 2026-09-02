import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { Webhook } from "npm:svix@1.65.0";

type ResendEvent = {
  type: string;
  created_at?: string;
  data?: {
    email_id?: string;
    error?: { message?: string } | string;
  };
};

const statusByEvent: Record<string, string> = {
  "email.sent": "sent",
  "email.delivered": "delivered",
  "email.delivery_delayed": "delivery_delayed",
  "email.bounced": "bounced",
  "email.complained": "complained",
  "email.suppressed": "suppressed",
  "email.failed": "failed",
};

serve(async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  const webhookSecret = Deno.env.get("RESEND_WEBHOOK_SECRET");
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!webhookSecret || !supabaseUrl || !serviceKey) {
    return new Response("Missing configuration", { status: 500 });
  }

  const svixId = req.headers.get("svix-id");
  const svixTimestamp = req.headers.get("svix-timestamp");
  const svixSignature = req.headers.get("svix-signature");
  if (!svixId || !svixTimestamp || !svixSignature) {
    return new Response("Missing signature headers", { status: 400 });
  }

  const rawBody = await req.text();
  let event: ResendEvent;
  try {
    event = new Webhook(webhookSecret).verify(rawBody, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as ResendEvent;
  } catch (error) {
    console.error("Resend webhook signature verification failed:", error);
    return new Response("Invalid signature", { status: 400 });
  }

  const supabase = createClient(supabaseUrl, serviceKey);
  const providerEmailId = event.data?.email_id || null;
  const { error: eventError } = await supabase
    .from("purchase_email_delivery_events")
    .insert({
      svix_id: svixId,
      provider_email_id: providerEmailId,
      event_type: event.type,
      event_created_at: event.created_at || null,
      payload: event,
    });
  if (eventError && eventError.code !== "23505") {
    console.error("Could not store Resend event:", eventError);
    return new Response("Could not store event", { status: 500 });
  }
  if (eventError?.code === "23505") return new Response("Already processed", { status: 200 });

  const status = statusByEvent[event.type];
  if (status && providerEmailId) {
    const now = event.created_at || new Date().toISOString();
    const errorMessage = typeof event.data?.error === "string"
      ? event.data.error
      : event.data?.error?.message;
    const changes: Record<string, unknown> = {
      status,
      updated_at: now,
    };
    if (status === "delivered") changes.delivered_at = now;
    if (["failed", "bounced", "complained", "suppressed"].includes(status)) {
      changes.failed_at = now;
      changes.last_error = errorMessage || `Resend reported ${event.type}`;
    }
    if (status === "delivery_delayed") {
      changes.last_error = errorMessage || "Resend reported a delivery delay";
    }
    const allowedCurrentStatuses: Record<string, string[]> = {
      sent: ["sending", "sent"],
      delivered: ["sending", "sent", "delivery_delayed", "delivered"],
      delivery_delayed: ["sending", "sent", "delivery_delayed"],
      bounced: ["sending", "sent", "delivered", "delivery_delayed", "bounced"],
      complained: ["sending", "sent", "delivered", "delivery_delayed", "complained"],
      suppressed: ["sending", "sent", "delivery_delayed", "suppressed"],
      failed: ["sending", "sent", "delivery_delayed", "failed"],
    };
    const { error: updateError } = await supabase
      .from("purchase_email_deliveries")
      .update(changes)
      .eq("provider_email_id", providerEmailId)
      .in("status", allowedCurrentStatuses[status]);
    if (updateError) {
      console.error("Could not update email delivery:", updateError);
      return new Response("Could not update delivery", { status: 500 });
    }
  }

  return new Response("ok", { status: 200 });
});
