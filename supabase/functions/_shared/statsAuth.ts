// Shared x-stats-secret gate for the Formula stats functions.
// One implementation so admin-stats and snapshot-stats cannot drift apart.

export const statsCors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type, x-stats-secret",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

export const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...statsCors, "content-type": "application/json" },
  });

// Length-independent constant-time comparison. Hashing first keeps the compare
// fixed-width so the loop leaks nothing about the real secret's length.
async function secretMatches(provided: string, expected: string) {
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

/**
 * Returns null when the caller is authorised, or the Response to return when
 * they are not. Fails closed: a missing STATS_SECRET denies everyone.
 */
export async function requireStatsSecret(req: Request): Promise<Response | null> {
  const expected = Deno.env.get("STATS_SECRET");
  if (!expected) {
    console.error("STATS_SECRET is not configured");
    return json({ error: "unauthorized" }, 401);
  }
  const provided = req.headers.get("x-stats-secret");
  if (!provided || !(await secretMatches(provided, expected))) {
    return json({ error: "unauthorized" }, 401);
  }
  return null;
}
