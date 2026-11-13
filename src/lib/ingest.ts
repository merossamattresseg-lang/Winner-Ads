import type { NormalizedAd } from "./providers";
import { scoreSettings, tierOf, winnerScore, type ScoreSettings } from "./score";
import { createAdminClient } from "./supabase/server";

const daysSince = (d?: string | null) => (d ? Math.max(0, Math.floor((Date.now() - new Date(d).getTime()) / 86400000)) : 0);

// التفاعل كرقم من 0 لـ 1 على مقياس لوغاريتمي (10 مليون مشاهدة = 1).
export const engagementOf = (views?: number | null, likes?: number | null) => {
  const v = views ?? (likes ? likes * 30 : 0);
  return v > 0 ? Math.min(1, Math.log10(v + 1) / 7) : 0;
};

export function scoreAd(a: { startDate?: string | null; copies?: number; views?: number | null; likes?: number | null }, advertisers: number, hasSupplier: boolean, s: ScoreSettings) {
  const score = winnerScore({ days: daysSince(a.startDate), copies: a.copies ?? 1, engagement: engagementOf(a.views, a.likes), advertisers, hasSupplier }, s);
  return { score, tier: tierOf(score, s) };
}

// بيحفظ الإعلانات والمعلنين في قاعدة البيانات، ويحسب التقييم. بيرجّع أرقام الإعلانات.
export async function upsertAds(list: NormalizedAd[], settings: ScoreSettings = scoreSettings): Promise<string[]> {
  const admin = createAdminClient();
  if (!admin || !list.length) return list.map((a) => a.id);
  const unique = [...new Map(list.map((a) => [a.id, a])).values()];

  const advertisers = [...new Map(unique.map((a) => [`${a.platform}:${a.pageId}`, a])).values()].map((a) => ({
    id: `${a.platform}:${a.pageId}`,
    platform: a.platform,
    name: a.pageName,
    avatar_url: a.avatar ?? null,
    followers: a.followers ?? null,
    domain: a.landing ? safeHost(a.landing) : null,
    last_seen: new Date().toISOString(),
  }));
  await admin.from("advertisers").upsert(advertisers, { onConflict: "id", ignoreDuplicates: false });

  // عدد المعلنين على نفس المنتج تقريبي بالعنوان أو أول كلمات النص.
  const keyOf = (a: NormalizedAd) => (a.title ?? a.text ?? "").split(/\s+/).slice(0, 4).join(" ").toLowerCase();
  const pagesPerKey = new Map<string, Set<string>>();
  unique.forEach((a) => {
    const k = keyOf(a);
    if (!pagesPerKey.has(k)) pagesPerKey.set(k, new Set());
    pagesPerKey.get(k)!.add(a.pageId);
  });

  const rows = unique.map((a) => {
    const { score, tier } = scoreAd(a, pagesPerKey.get(keyOf(a))?.size ?? 1, false, settings);
    return {
      id: a.id,
      platform: a.platform,
      source: a.source,
      advertiser_id: `${a.platform}:${a.pageId}`,
      page_name: a.pageName,
      ad_text: a.text ?? null,
      title: a.title ?? null,
      cta: a.cta ?? null,
      landing_url: a.landing ?? null,
      media_type: a.mediaType ?? null,
      video_url: a.video ?? null,
      thumb_url: a.thumb ?? null,
      start_date: a.startDate ?? null,
      last_seen: new Date().toISOString(),
      is_active: a.active ?? true,
      copies: a.copies ?? 1,
      views: a.views ?? null,
      likes: a.likes ?? null,
      comments: a.comments ?? null,
      shares: a.shares ?? null,
      score,
      tier,
      raw: a.raw ?? null,
    };
  });
  for (let i = 0; i < rows.length; i += 200) {
    await admin.from("ads").upsert(rows.slice(i, i + 200), { onConflict: "id" });
  }
  return rows.map((r) => r.id);
}

function safeHost(u: string) {
  try {
    return new URL(u).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}
