import { ads as mockAds, plans as mockPlans } from "./mock-data";
import { scoreSettings, tierOf, winnerScore, type ScoreSettings } from "./score";
import { createPublicClient } from "./supabase/server";

export type Plan = { id: string; name: string; price: number; points: number; popular: boolean; who: string; items: string[] };

// الباقات من قاعدة البيانات، ولو حصلت مشكلة بنرجع للباقات الافتراضية.
export async function getPlans(): Promise<Plan[]> {
  try {
    const { data, error } = await createPublicClient().from("plans").select("*").eq("active", true).order("sort");
    if (error || !data?.length) throw error;
    return data.map((p) => ({ id: p.id, name: p.name, price: p.price_egp, points: p.monthly_points, popular: p.popular, who: p.who ?? "", items: p.features ?? [] }));
  } catch {
    return mockPlans.map((p) => ({ id: p.id, name: p.name, price: p.price, points: p.points, popular: "popular" in p, who: p.who, items: [...p.items] }));
  }
}

export async function getSetting<T>(key: string, fallback: T): Promise<T> {
  try {
    const { data } = await createPublicClient().from("app_settings").select("value").eq("key", key).single();
    return (data?.value as T) ?? fallback;
  } catch {
    return fallback;
  }
}

export const getScoreSettings = () => getSetting<ScoreSettings>("score", scoreSettings);

// الإعلانات (تجريبية لحد المرحلة الجاية) بسكور محسوب بأوزان الأدمن الحالية.
export type ScoredAd = Awaited<ReturnType<typeof getAds>>[number];

export async function getAds() {
  const s = await getScoreSettings();
  return mockAds
    .map((a) => {
      const score = winnerScore({ days: a.days, copies: a.copies, engagement: a.engagement, advertisers: a.advertisers, hasSupplier: a.suppliers > 0 }, s);
      return { ...a, score, tier: tierOf(score, s) };
    })
    .sort((a, b) => b.score - a.score);
}
