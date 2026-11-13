import { getAccess } from "@/lib/access";
import { fromSlug } from "@/lib/data";
import { createPublicClient } from "@/lib/supabase/server";

// تحميل فيديو الإعلان من خلال السيرفر (للمسجلين فقط). الفيديو مش بيتخزن عندنا.
export async function GET(req: Request) {
  const access = await getAccess();
  if (!access.userId) return new Response("سجّل الدخول للتحميل.", { status: 401 });
  const id = new URL(req.url).searchParams.get("id") ?? "";
  const { data } = await createPublicClient().from("ads").select("video_url, thumb_url, platform").eq("id", fromSlug(id)).maybeSingle();
  const src = data?.video_url ?? data?.thumb_url;
  if (!data || !src) return new Response("لا يوجد ملف لهذا الإعلان.", { status: 404 });
  const upstream = await fetch(src, { headers: { "User-Agent": "Mozilla/5.0", Referer: data.platform === "tiktok" ? "https://www.tiktok.com/" : "https://www.facebook.com/" } });
  if (!upstream.ok || !upstream.body) return new Response("تعذر تحميل الملف. قد تكون صلاحية الرابط انتهت، أعد البحث.", { status: 502 });
  const ext = data.video_url ? "mp4" : "jpg";
  return new Response(upstream.body, {
    headers: {
      "Content-Type": upstream.headers.get("content-type") ?? (ext === "mp4" ? "video/mp4" : "image/jpeg"),
      "Content-Disposition": `attachment; filename="winnerads-${id}.${ext}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
