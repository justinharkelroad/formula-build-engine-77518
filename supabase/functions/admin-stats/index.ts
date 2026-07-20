// admin-stats — read-only aggregate sales numbers for external automation.
//
// Auth is a single shared secret in the `x-stats-secret` header. No JWT, no
// user session. The function never writes; it only SELECTs. All aggregation
// lives in ../_shared/computeStats.ts, mirrored from src/pages/AdminSales.tsx.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { fetchAndComputeStats } from "../_shared/computeStats.ts";
import { json, requireStatsSecret, statsCors } from "../_shared/statsAuth.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: statsCors });
  if (req.method !== "GET") return json({ error: "method_not_allowed" }, 405);

  const denied = await requireStatsSecret(req);
  if (denied) return denied;

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  try {
    return json(await fetchAndComputeStats(supabase));
  } catch (e) {
    // Log the detail, return a generic message — no internals over the wire.
    console.error("query failed:", e instanceof Error ? e.message : e);
    return json({ error: "query_failed" }, 500);
  }
});
