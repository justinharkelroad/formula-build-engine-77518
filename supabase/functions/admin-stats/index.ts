// admin-stats — read-only aggregate sales numbers for external automation.
//
// Auth is a single shared secret in the `x-stats-secret` header. No JWT, no
// user session. The function never writes; it only SELECTs. All aggregation
// lives in ./stats.ts, mirrored from src/pages/AdminSales.tsx.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { computeStats } from "./stats.ts";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type, x-stats-secret",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "content-type": "application/json" },
  });

// Length-independent constant-time comparison. Hashing first keeps the compare
// fixed-width so the loop leaks nothing about the real secret's length.
async function secretMatches(provided: string | null, expected: string) {
  if (!provided) return false;
  const enc = new TextEncoder();
  const [a, b] = await Promise.all([
    crypto.subtle.digest("SHA-256", enc.encode(provided)),
    crypto.subtle.digest("SHA-256", enc.encode(expected)),
  ]);
  const x = new Uint8Array(a);
  const y = new Uint8Array(b);
  let diff = 0;
  for (let i = 0; i < x.length; i++) diff |= x[i] ^ y[i];
  return diff === 0;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "GET") return json({ error: "method_not_allowed" }, 405);

  const expected = Deno.env.get("STATS_SECRET");
  if (!expected) {
    // Fail closed. A missing secret must never mean "open to everyone".
    console.error("STATS_SECRET is not configured");
    return json({ error: "unauthorized" }, 401);
  }
  if (!(await secretMatches(req.headers.get("x-stats-secret"), expected))) {
    return json({ error: "unauthorized" }, 401);
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  // PostgREST caps rows at 1000 by default. These tables are small today but
  // grow with every sale — an explicit range keeps a silent truncation from
  // quietly under-reporting revenue later.
  const [purchasesRes, profilesRes] = await Promise.all([
    supabase.from("purchases").select("amount,pass_type,tier,quantity").range(0, 49999),
    supabase.from("partner_profiles").select("tier,onboarding_completed").range(0, 49999),
  ]);

  if (purchasesRes.error || profilesRes.error) {
    // Log the detail, return a generic message — no internals over the wire.
    console.error("query failed:", purchasesRes.error?.message ?? profilesRes.error?.message);
    return json({ error: "query_failed" }, 500);
  }

  return json(computeStats(purchasesRes.data ?? [], profilesRes.data ?? []));
});
