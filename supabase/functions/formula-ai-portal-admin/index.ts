// Admin API for the Formula AI portal (/admin/ai-portal).
// Verifies the caller's admin role server-side, then passes the verified
// admin id to each RPC for the audit trail.
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { requireAdmin } from "../_shared/admin-auth.ts";
import { AI_PORTAL_ASSETS, AI_PORTAL_BUCKET } from "../_shared/ai-portal-catalog.ts";
import {
  corsHeaders,
  json,
  portalErrorCode,
  readBody,
  serviceClient,
  sha256Hex,
  text,
  verifiedUser,
} from "../_shared/ai-portal-http.ts";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const MAX_UPLOAD_BYTES = Math.max(...AI_PORTAL_ASSETS.map((asset) => asset.bytes));

function uuid(value: unknown): string | null {
  const candidate = text(value, 36);
  return candidate && UUID.test(candidate) ? candidate : null;
}

function decodeBase64(value: string): Uint8Array<ArrayBuffer> | null {
  try {
    const binary = atob(value);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes;
  } catch {
    return null;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const supabase = serviceClient();
  if (!supabase) return json({ error: "Missing configuration" }, 500);
  if (!(await requireAdmin(req, supabase))) return json({ error: "Unauthorized" }, 401);
  const admin = await verifiedUser(req, supabase);
  if (!admin) return json({ error: "Unauthorized" }, 401);

  const body = await readBody(req);
  if (!body) return json({ error: "Invalid request" }, 400);
  const action = text(body.action, 40);

  try {
    if (action === "snapshot") {
      const { data, error } = await supabase.rpc("formula_ai_portal_admin_snapshot");
      if (error) throw error;
      return json(data);
    }

    if (action === "check-email") {
      const email = text(body.email, 254);
      if (!email) return json({ error: "formula_ai_portal_invalid_email" }, 400);
      const { data, error } = await supabase.rpc("formula_ai_portal_admin_check_email", { p_email: email });
      if (error) throw error;
      return json(data);
    }

    if (action === "approve") {
      const email = text(body.email, 254);
      const reason = text(body.reason, 500);
      if (!email || !reason) return json({ error: "formula_ai_portal_invalid_approval" }, 400);
      const { data, error } = await supabase.rpc("formula_ai_portal_admin_approve", {
        p_actor_id: admin.id,
        p_email: email,
        p_name: text(body.name, 120),
        p_reason: reason,
      });
      if (error) throw error;
      return json(data);
    }

    if (action === "revoke-approval") {
      const approvalId = uuid(body.approvalId);
      if (!approvalId) return json({ error: "formula_ai_portal_approval_not_found" }, 400);
      const { data, error } = await supabase.rpc("formula_ai_portal_admin_revoke_approval", {
        p_actor_id: admin.id,
        p_approval_id: approvalId,
      });
      if (error) throw error;
      return json(data);
    }

    if (action === "dismiss-request") {
      const requestId = uuid(body.requestId);
      if (!requestId) return json({ error: "formula_ai_portal_request_not_found" }, 400);
      const { data, error } = await supabase.rpc("formula_ai_portal_admin_dismiss_request", {
        p_actor_id: admin.id,
        p_request_id: requestId,
      });
      if (error) throw error;
      return json(data);
    }

    if (action === "set-member-state") {
      const memberId = uuid(body.memberId);
      const state = text(body.state, 10);
      if (!memberId || (state !== "active" && state !== "revoked")) {
        return json({ error: "formula_ai_portal_invalid_state" }, 400);
      }
      const { data, error } = await supabase.rpc("formula_ai_portal_admin_set_member_state", {
        p_actor_id: admin.id,
        p_member_id: memberId,
        p_state: state,
        p_reason: text(body.reason, 500),
      });
      if (error) throw error;
      return json(data);
    }

    if (action === "set-sign-in") {
      if (typeof body.open !== "boolean") return json({ error: "formula_ai_portal_invalid_settings" }, 400);
      const { data, error } = await supabase.rpc("formula_ai_portal_admin_set_sign_in", {
        p_actor_id: admin.id,
        p_open: body.open,
      });
      if (error) throw error;
      return json(data);
    }

    if (action === "asset-status") {
      const assets = [];
      for (const asset of AI_PORTAL_ASSETS) {
        const { data, error } = await supabase.storage.from(AI_PORTAL_BUCKET).download(asset.storagePath);
        if (error || !data) {
          assets.push({ id: asset.id, storagePath: asset.storagePath, state: "missing" });
          continue;
        }
        const bytes = new Uint8Array(await data.arrayBuffer());
        const matches = bytes.length === asset.bytes && (await sha256Hex(bytes)) === asset.sha256;
        assets.push({ id: asset.id, storagePath: asset.storagePath, state: matches ? "ready" : "mismatch" });
      }
      return json({ assets });
    }

    // Accepts a file only if its bytes match a catalog entry exactly, and
    // stores it at that entry's path. File names from the browser are ignored.
    if (action === "upload-asset") {
      const encoded = typeof body.contentBase64 === "string" ? body.contentBase64 : null;
      if (!encoded || encoded.length > Math.ceil(MAX_UPLOAD_BYTES / 3) * 4 + 8) {
        return json({ error: "formula_ai_portal_unrecognized_file" }, 400);
      }
      const bytes = decodeBase64(encoded);
      if (!bytes) return json({ error: "formula_ai_portal_unrecognized_file" }, 400);
      const hash = await sha256Hex(bytes);
      const asset = AI_PORTAL_ASSETS.find((entry) => entry.sha256 === hash && entry.bytes === bytes.length);
      if (!asset) return json({ error: "formula_ai_portal_unrecognized_file" }, 400);
      const { error } = await supabase.storage.from(AI_PORTAL_BUCKET).upload(asset.storagePath, bytes, {
        contentType: asset.contentType,
        upsert: true,
      });
      if (error) throw error;
      return json({ id: asset.id, storagePath: asset.storagePath, state: "ready" });
    }

    return json({ error: "Unknown action" }, 400);
  } catch (error) {
    const code = portalErrorCode(error);
    console.error("AI portal admin request failed", { action, code });
    return json({ error: code }, 400);
  }
});
