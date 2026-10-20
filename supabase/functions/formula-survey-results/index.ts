// Reviewer-only results for the Formula 2026 post-event surveys
// (/admin/survey-results). The caller must be a website admin AND have their
// sign-in email on formula_private.survey_reviewers; the RPC enforces the
// second half so a new admin account cannot read responses by default.
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { requireAdmin } from "../_shared/admin-auth.ts";
import { corsHeaders, json, serviceClient, verifiedUser } from "../_shared/ai-portal-http.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  const supabase = serviceClient();
  if (!supabase) return json({ error: "missing_configuration" }, 500);
  if (!(await requireAdmin(req, supabase))) return json({ error: "unauthorized" }, 401);
  const reviewer = await verifiedUser(req, supabase);
  if (!reviewer) return json({ error: "unauthorized" }, 401);

  const { data, error } = await supabase.rpc("formula_survey_results", { p_user_id: reviewer.id });
  if (error) {
    if (error.message?.includes("formula_survey_not_reviewer")) return json({ error: "not_reviewer" }, 403);
    console.error("formula-survey-results: read failed", error.code ?? "unknown");
    return json({ error: "read_failed" }, 500);
  }
  return json(data);
});
