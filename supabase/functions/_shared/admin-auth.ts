import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

export async function requireAdmin(req: Request, supabase: SupabaseClient): Promise<boolean> {
  const token = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return false;
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) return false;
  const { data: role } = await supabase
    .from("user_roles")
    .select("id")
    .eq("user_id", data.user.id)
    .eq("role", "admin")
    .maybeSingle();
  return Boolean(role);
}
