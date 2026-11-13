import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getAccess, LIMITS } from "@/lib/access";
import { getAds, getScoreSettings, getSetting, toSlug } from "@/lib/data";
import { upsertAds } from "@/lib/ingest";
import { searchMetaSearchApi, searchTikTok, type NormalizedAd } from "@/lib/providers";
import { createAdminClient } from "@/lib/supabase/server";

type ProviderSettings = { cache_hours: number; guest_searches_per_day: number };

// البحث: كاش أولًا، وبعدين المصدر المباشر. البحث الجديد بيخصم نقطة، والمتكرر من الكاش ببلاش.
export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = (url.searchParams.get("q") ?? "").trim().slice(0, 80);
  const platform = ["meta", "tiktok", "all"].includes(url.searchParams.get("platform") ?? "") ? url.searchParams.get("platform")! : "all";
  const settings = await getSetting<ProviderSettings>("providers", { cache_hours: 12, guest_searches_per_day: 3 });
  const access = await getAccess();
  const admin = createAdminClient();
  const jar = await cookies();
  const today = new Date().toISOString().slice(0, 10);

  // الزائر: عدد محدود من عمليات البحث يوميًا.
  let guestCount = 0;
  if (!access.userId && q) {
    const [d, c] = (jar.get("wa_gs")?.value ?? "").split(":");
    guestCount = d === today ? Number(c) || 0 : 0;
    if (guestCount >= settings.guest_searches_per_day) return NextResponse.json({ error: "login_required", message: "سجّل مجانًا لمتابعة البحث." }, { status: 401 });
  }
  if (access.userId && !access.subscribed && !access.trial && access.credits <= 0 && q) {
    return NextResponse.json({ error: "upgrade_required", message: "انتهت التجربة المجانية. اشترك لمتابعة البحث." }, { status: 402 });
  }

  // حد أقصى 20 عملية بحث في الدقيقة لكل حساب، لمنع الاستهلاك غير الطبيعي.
  if (access.userId && q && admin) {
    const { count } = await admin.from("searches").select("id", { count: "exact", head: true }).eq("user_id", access.userId).gt("created_at", new Date(Date.now() - 60000).toISOString());
    if ((count ?? 0) >= 20) return NextResponse.json({ error: "rate_limited", message: "عمليات بحث كثيرة. انتظر دقيقة." }, { status: 429 });
  }

  let ids: string[] | null = null;
  let cached = false;
  let charged = false;
  let error: string | null = null;

  if (q && admin) {
    const key = `${platform}|${q.toLowerCase()}|EG`;
    const { data: hit } = await admin.from("search_cache").select("ad_ids, fetched_at").eq("key", key).maybeSingle();
    if (hit && Date.now() - new Date(hit.fetched_at).getTime() < settings.cache_hours * 3600000) {
      ids = hit.ad_ids;
      cached = true;
    } else {
      try {
        const jobs: Promise<NormalizedAd[]>[] = [];
        if (platform !== "tiktok") jobs.push(searchMetaSearchApi(q));
        if (platform !== "meta") jobs.push(searchTikTok(q));
        const found = (await Promise.allSettled(jobs)).flatMap((r) => (r.status === "fulfilled" ? r.value : []));
        if (found.length) {
          if (access.userId) {
            const { data: ok } = await admin.rpc("spend_credit", { p_user: access.userId, p_reason: `بحث: ${q}` });
            if (!ok) return NextResponse.json({ error: "no_credits", message: "انتهى رصيد النقاط." }, { status: 402 });
            charged = true;
          }
          ids = await upsertAds(found, await getScoreSettings());
          await admin.from("search_cache").upsert({ key, ad_ids: ids, provider: platform, fetched_at: new Date().toISOString() });
        }
      } catch (e) {
        error = String(e);
      }
    }
    await admin.from("searches").insert({ user_id: access.userId, query: q, platform, cached, results: ids?.length ?? 0 });
  }

  // لو مفيش مصدر متاح أو مفيش نتايج، بندوّر في قاعدة البيانات نفسها.
  let ads = ids ? await getAds({ ids: ids.map(toSlug), limit: 200 }) : await getAds({ q: q || undefined, platform, limit: 120 });
  if (ids && platform !== "all") ads = ads.filter((a) => a.platformKey === platform);
  ads.sort((a, b) => b.score - a.score);

  const total = ads.length;
  const cap = !access.userId ? LIMITS.guestResults : access.subscribed ? total : LIMITS.trialResults;
  const res = NextResponse.json({ ads: ads.slice(0, cap), total, locked: Math.max(0, total - cap), cached, charged, sample: ads[0]?.sample ?? false, error });
  if (!access.userId && q) res.cookies.set("wa_gs", `${today}:${guestCount + 1}`, { maxAge: 86400, path: "/", sameSite: "lax", httpOnly: true });
  return res;
}
