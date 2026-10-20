// Public submit for the Formula 2026 post-event surveys (/survey).
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
import { validateSubmission } from "../_shared/formula-survey-schema.ts";

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

  const result = validateSubmission(body);
  if (!result.ok) return json({ error: result.error }, 400);
  const submission = result.value;

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

  const { data, error } = await supabase.rpc("formula_survey_submit", {
    p_submission_key: submission.submissionKey,
    p_audience: submission.audience,
    p_role: submission.role,
    p_anonymity: submission.anonymity,
    p_structured: submission.structured,
    p_free_text: submission.freeText,
    p_contact: submission.contact,
    p_schema_version: submission.schemaVersion,
  });

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
