import type { SupabaseClient } from "@supabase/supabase-js";

// رقم الجلسة من توكن الدخول. بنستخدمه عشان كل حساب يبقى ليه جلسة واحدة شغالة.
export function sessionIdFromToken(token?: string | null): string | null {
  if (!token) return null;
  try {
    const payload = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = JSON.parse(Buffer.from(payload, "base64").toString("utf8"));
    return typeof json.session_id === "string" ? json.session_id : null;
  } catch {
    return null;
  }
}

// بعد أي تسجيل دخول: الجلسة دي بقت هي الوحيدة المسموح بيها.
export async function claimSession(supabase: SupabaseClient) {
  const { data } = await supabase.auth.getSession();
  const sid = sessionIdFromToken(data.session?.access_token);
  const uid = data.session?.user.id;
  if (sid && uid) await supabase.from("profiles").update({ active_session: sid, last_seen_at: new Date().toISOString() }).eq("id", uid);
  return { sid, user: data.session?.user ?? null };
}
