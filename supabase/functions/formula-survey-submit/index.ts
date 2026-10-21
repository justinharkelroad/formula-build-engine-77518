// Public submit for the Formula 2026 post-event surveys (/survey).
//
// Three payload types:
// - a survey response (default)
// - `type: "testimonial-upload"`: returns a one-time signed upload token for
//   one video/audio file in the private testimonial bucket
// - `type: "testimonial"`: saved to its own table with no link to any
//   response; if it names a file, the file must already be uploaded
//
// Validates the payload against the shared survey definition, checks the rate
// limit, then saves through formula_survey_submit. The client sends a random
// submission key per survey attempt, so a retry after a dropped connection
// never creates a second response.
//
// The rate check and the save are two separate RPC calls on purpose: they run
// in different transactions, so the connection hash can never be matched to
// the response it came with.
//
// Log hygiene: answers, names and emails are never logged. Failures log only
// an error code.
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { corsHeaders, json, serviceClient, sha256Hex } from "../_shared/ai-portal-http.ts";
import {
  TESTIMONIAL_BUCKET,
  validateSubmission,
  validateTestimonial,
  validateUploadRequest,
} from "../_shared/formula-survey-schema.ts";

const MAX_BODY_BYTES = 64 * 1024;

function clientIp(req: Request): string {
  return req.headers.get("cf-connecting-ip")
    || req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || req.headers.get("x-real-ip")
    || "unknown";
}

/** Null when no dedicated salt is configured; the caller then refuses to save. */
async function clientHash(req: Request): Promise<string | null> {
  const salt = Deno.env.get("SURVEY_CLIENT_SALT") || Deno.env.get("AI_PORTAL_CLIENT_SALT");
  if (!salt) return null;
  return sha256Hex(`survey:${salt}:${clientIp(req)}`);
}

/** Reads at most MAX_BODY_BYTES, whatever Content-Length claims. */
async function readLimitedJson(req: Request): Promise<Record<string, unknown> | "too_large" | null> {
  if (!req.body) return null;
  const reader = req.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > MAX_BODY_BYTES) {
      await reader.cancel();
      return "too_large";
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  try {
    const body = JSON.parse(new TextDecoder().decode(bytes));
    return body && typeof body === "object" && !Array.isArray(body) ? body : null;
  } catch {
    return null;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  const body = await readLimitedJson(req);
  if (body === "too_large") return json({ error: "too_large" }, 413);
  if (!body) return json({ error: "invalid_body" }, 400);

  const kind = body.type === "testimonial" ? "testimonial" : body.type === "testimonial-upload" ? "upload" : "survey";
  const upload = kind === "upload" ? validateUploadRequest(body) : null;
  const testimonial = kind === "testimonial" ? validateTestimonial(body) : null;
  const survey = kind === "survey" ? validateSubmission(body) : null;
  const invalid = [upload, testimonial, survey].find((r) => r && !r.ok);
  if (invalid && !invalid.ok) return json({ error: invalid.error }, 400);

  const supabase = serviceClient();
  const hash = await clientHash(req);
  if (!supabase || !hash) {
    console.error("formula-survey-submit: missing configuration");
    return json({ error: "save_failed" }, 500);
  }

  const { data: rate, error: rateError } = await supabase.rpc("formula_survey_rate_check", { p_client_hash: hash });
  if (rateError) {
    console.error("formula-survey-submit: rate check failed", rateError.code ?? "unknown");
    return json({ error: "save_failed" }, 500);
  }
  if ((rate as { allowed?: boolean } | null)?.allowed !== true) return json({ error: "rate_limited" }, 429);

  if (upload?.ok) {
    // The browser builds the URL from its own backend address plus this token,
    // so the function never hands out an internal hostname.
    const { data: signed, error: signError } = await supabase.storage
      .from(TESTIMONIAL_BUCKET)
      .createSignedUploadUrl(upload.value.path);
    if (signError || !signed?.token) {
      console.error("formula-survey-submit: upload url failed");
      return json({ error: "save_failed" }, 500);
    }
    return json({ ok: true, bucket: TESTIMONIAL_BUCKET, path: upload.value.path, token: signed.token });
  }

  const { data, error } = testimonial?.ok
    ? await supabase.rpc("formula_survey_testimonial_submit", {
      p_submission_key: testimonial.value.submissionKey,
      p_audience: testimonial.value.audience,
      p_body: testimonial.value.body,
      p_media_path: testimonial.value.mediaPath,
      p_media_type: testimonial.value.mediaType,
      p_full_name: testimonial.value.fullName,
      p_company: testimonial.value.company,
      p_title: testimonial.value.title,
      p_email: testimonial.value.email,
      p_publish_consent: testimonial.value.publishConsent,
    })
    : survey?.ok
    ? await supabase.rpc("formula_survey_submit", {
      p_submission_key: survey.value.submissionKey,
      p_audience: survey.value.audience,
      p_role: survey.value.role,
      p_anonymity: survey.value.anonymity,
      p_structured: survey.value.structured,
      p_free_text: survey.value.freeText,
      p_contact: survey.value.contact,
      p_schema_version: survey.value.schemaVersion,
    })
    : { data: null, error: { code: "unreachable", message: "" } };

  if (error?.message?.includes("formula_survey_media_missing")) return json({ error: "media_missing" }, 400);
  if (error) {
    // Only the code: Postgres error details can echo row values.
    console.error("formula-survey-submit: save failed", error.code ?? "unknown");
    return json({ error: "save_failed" }, 500);
  }

  const status = (data as { status?: string } | null)?.status;
  if (status !== "created" && status !== "duplicate") {
    console.error("formula-survey-submit: unexpected status");
    return json({ error: "save_failed" }, 500);
  }
  return json({ ok: true, status });
});
