import { NextResponse } from "next/server";
import { fromSlug } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";

// متابعة معلن أو إلغاء متابعته.
export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "login_required" }, { status: 401 });
  const { advertiserId, follow } = (await req.json().catch(() => ({}))) as { advertiserId?: string; follow?: boolean };
  if (!advertiserId) return NextResponse.json({ error: "bad_request" }, { status: 400 });
  const id = fromSlug(advertiserId);
  const { error } = follow
    ? await supabase.from("tracked_pages").upsert({ user_id: user.id, advertiser_id: id, alert: true })
    : await supabase.from("tracked_pages").delete().eq("user_id", user.id).eq("advertiser_id", id);
  return NextResponse.json({ ok: !error });
}
