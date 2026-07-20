// snapshot-stats — pushes the Formula stats payload into the F3formula sink.
//
// The Cowork automation cannot reach this app's host (allowlisted outbound), so
// instead of Cowork pulling from admin-stats, this function pushes one row into
// `formula_snapshots` in a separate Supabase project that Cowork can already
// read. Triggered on a schedule by pg_cron + pg_net.
//
// Reads the Formula data read-only; the single write is one insert into the
// external sink. Same numbers as admin-stats by construction — both call
// fetchAndComputeStats from ../_shared/computeStats.ts.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { fetchAndComputeStats } from "../_shared/computeStats.ts";
import { json, requireStatsSecret, statsCors } from "../_shared/statsAuth.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: statsCors });
  // pg_net calls this with POST; GET is allowed so it can be probed by hand.
  if (req.method !== "POST" && req.method !== "GET") {
    return json({ error: "method_not_allowed" }, 405);
  }

  const denied = await requireStatsSecret(req);
  if (denied) return denied;

  const sinkUrl = Deno.env.get("SINK_URL");
  const sinkKey = Deno.env.get("SINK_SERVICE_KEY");
  if (!sinkUrl || !sinkKey) {
    console.error("SINK_URL or SINK_SERVICE_KEY is not configured");
    return json({ error: "sink_not_configured" }, 500);
  }

  // Source project — read-only.
  const source = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  let p: Awaited<ReturnType<typeof fetchAndComputeStats>>;
  try {
    p = await fetchAndComputeStats(source);
  } catch (e) {
    console.error("stats query failed:", e instanceof Error ? e.message : e);
    return json({ error: "query_failed" }, 500);
  }

  // Destination project — insert only. The flat columns mirror the payload so
  // the reader can filter/sort in SQL without unpacking jsonb; `payload` keeps
  // the full object (including the partners[] breakdown) for anything else.
  const sink = createClient(sinkUrl, sinkKey);
  const { data, error } = await sink
    .from("formula_snapshots")
    .insert({
      source: "snapshot-stats",
      payload: p,
      total_revenue: p.total_revenue,
      attendee_revenue: p.attendee_revenue,
      partner_revenue: p.partner_revenue,
      attendee_tickets: p.attendee_tickets,
      agency_owners: p.agency_owners,
      team_members: p.team_members,
      partner_passes: p.partner_passes,
      seats_filled: p.seats_filled,
      seats_total: p.seats_total,
      partners_total: p.partners_total,
      partners_onboarded: p.partners_onboarded,
      unknown_pass_types: p.unknown_pass_types ?? 0,
    })
    .select("id,captured_at")
    .single();

  if (error) {
    // Log the detail, return a generic message — the sink error text can carry
    // schema internals and this response is reachable by anyone with the secret.
    console.error("sink insert failed:", error.message);
    return json({ error: "sink_insert_failed" }, 500);
  }

  return json({
    ok: true,
    id: data?.id,
    captured_at: data?.captured_at,
    wrote: p.total_revenue,
    seats_filled: p.seats_filled,
  });
});
