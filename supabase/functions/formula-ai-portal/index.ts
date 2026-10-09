// Signed-in attendee API for the Formula AI portal.
//
// The identity always comes from the auth service's verification of the
// bearer token. Every action re-checks access in the database, so a revoked
// or expired member fails closed on their next request.
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import {
  AI_PORTAL_BUCKET,
  AI_PORTAL_SIGNED_URL_SECONDS,
  AI_PORTAL_VIDEOS,
  findAsset,
  isVideoId,
  vimeoEmbedUrl,
} from "../_shared/ai-portal-catalog.ts";
import { corsHeaders, json, portalErrorCode, readBody, serviceClient, text, verifiedUser } from "../_shared/ai-portal-http.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const supabase = serviceClient();
  if (!supabase) return json({ error: "Missing configuration" }, 500);
  const user = await verifiedUser(req, supabase);
  if (!user?.email) return json({ error: "formula_ai_portal_signed_out" }, 401);

  const body = await readBody(req);
  if (!body) return json({ error: "Invalid request" }, 400);
  const action = text(body.action, 40);

  try {
    if (action === "status") {
      const { data, error } = await supabase.rpc("formula_ai_portal_enter", {
        p_user_id: user.id,
        p_email: user.email,
      });
      if (error) throw error;
      const result = data as { access: boolean; reason?: string };
      if (!result.access) return json({ access: false, reason: result.reason ?? "not_found" }, 403);
      return json({
        ...result,
        videos: AI_PORTAL_VIDEOS.map((video) => ({ id: video.id, embedUrl: vimeoEmbedUrl(video.vimeoId) })),
      });
    }

    if (action === "set-platform") {
      const platform = text(body.platform, 10);
      if (platform !== "claude" && platform !== "codex") return json({ error: "formula_ai_portal_invalid_platform" }, 400);
      const { data, error } = await supabase.rpc("formula_ai_portal_set_platform", {
        p_user_id: user.id,
        p_platform: platform,
      });
      if (error) throw error;
      return json(data);
    }

    if (action === "progress") {
      const contentId = body.contentId;
      const percent = typeof body.percent === "number" && Number.isFinite(body.percent) ? Math.round(body.percent) : null;
      if (!isVideoId(contentId) || percent === null) return json({ error: "formula_ai_portal_invalid_progress" }, 400);
      const { data, error } = await supabase.rpc("formula_ai_portal_record_progress", {
        p_user_id: user.id,
        p_content_id: contentId,
        p_percent: percent,
      });
      if (error) throw error;
      return json(data);
    }

    if (action === "download") {
      const asset = findAsset(body.assetId);
      if (!asset) return json({ error: "formula_ai_portal_unknown_asset" }, 400);
      // Both platform packs are part of the gift; the platform choice only
      // changes what the page shows first, so it is not checked here.
      const { data, error: signError } = await supabase.storage
        .from(AI_PORTAL_BUCKET)
        .createSignedUrl(asset.storagePath, AI_PORTAL_SIGNED_URL_SECONDS, {
          download: asset.storagePath.split("/").pop(),
        });
      // The access check and the "requested" record happen together, and the
      // URL never leaves this function unless that check passes.
      const { error } = await supabase.rpc("formula_ai_portal_record_download", {
        p_user_id: user.id,
        p_asset_id: asset.id,
        p_issued: Boolean(data?.signedUrl && !signError),
      });
      if (error) throw error;
      if (signError || !data?.signedUrl) return json({ error: "formula_ai_portal_file_unavailable" }, 503);
      return json({ url: data.signedUrl, expiresIn: AI_PORTAL_SIGNED_URL_SECONDS });
    }

    return json({ error: "Unknown action" }, 400);
  } catch (error) {
    const code = portalErrorCode(error);
    if (code === "formula_ai_portal_no_access") return json({ access: false, reason: "no_access" }, 403);
    console.error("AI portal request failed", { action, code });
    return json({ error: code }, 400);
  }
});
