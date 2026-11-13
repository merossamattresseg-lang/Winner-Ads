import { advertisers as mockAdvertisers, ads as mockAds, plans as mockPlans, supplierOffers as mockOffers } from "./mock-data";
import { engagementOf } from "./ingest";
import { scoreSettings, tierOf, winnerScore, type ScoreSettings, type Tier } from "./score";
import { createClient, createPublicClient } from "./supabase/server";

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

// ===== الإعلانات =====
// لو قاعدة البيانات لسه فاضية (قبل ربط مصادر الداتا) بنعرض داتا تجريبية ومعاها علامة sample.

export const PLATFORM_LABEL: Record<string, string> = { meta: "ميتا", tiktok: "تيك توك", reels: "ريلز فيسبوك", pinterest: "بنترست" };
const PLATFORM_KEY: Record<string, string> = { "ميتا": "meta", "تيك توك": "tiktok", "ريلز فيسبوك": "reels", "بنترست": "pinterest" };

import { fromSlug, toSlug } from "./slug";
export { fromSlug, toSlug };

export type ScoredAd = {
  id: string; dbId: string; product: string; page: string; advertiserId: string; platform: string; platformKey: string;
  start: string; days: number; copies: number; views: string; likes: string; comments: string; shares: string;
  engagement: number; advertisers: number; suppliers: number; copy: string; cta: string; angle: string; landing: string;
  sellPrice: number | null; score: number; tier: Tier; thumb: string | null; video: string | null; sample: boolean;
};

const compact = (n?: number | null) => (n == null ? "-" : n >= 1e6 ? `${(n / 1e6).toFixed(1)}M` : n >= 1e3 ? `${Math.round(n / 1e3)}K` : String(n));
const fmtDate = (d?: string | null) => (d ? new Date(d).toLocaleDateString("ar-EG", { day: "numeric", month: "long", year: "numeric" }) : "-");
const daysSince = (d?: string | null) => (d ? Math.max(0, Math.floor((Date.now() - new Date(d).getTime()) / 86400000)) : 0);
const productName = (title?: string | null, text?: string | null) => (title || (text ?? "").split(/[\n.!؟?]/)[0] || "إعلان").slice(0, 48);

type AdRow = {
  id: string; platform: string; advertiser_id: string | null; page_name: string | null; ad_text: string | null; title: string | null; cta: string | null;
  landing_url: string | null; video_url: string | null; thumb_url: string | null; start_date: string | null; copies: number; views: number | null;
  likes: number | null; comments: number | null; shares: number | null; score: number; tier: string; products?: { sell_price: number | null } | null;
};

function fromRow(r: AdRow): ScoredAd {
  return {
    id: toSlug(r.id), dbId: r.id, product: productName(r.title, r.ad_text), page: r.page_name ?? "-",
    advertiserId: r.advertiser_id ? toSlug(r.advertiser_id) : "", platform: PLATFORM_LABEL[r.platform] ?? r.platform, platformKey: r.platform,
    start: fmtDate(r.start_date), days: daysSince(r.start_date), copies: r.copies ?? 1, views: compact(r.views), likes: compact(r.likes),
    comments: compact(r.comments), shares: compact(r.shares), engagement: engagementOf(r.views, r.likes), advertisers: 1, suppliers: 0,
    copy: r.ad_text ?? "", cta: r.cta ?? "-", angle: "-", landing: r.landing_url ?? "", sellPrice: r.products?.sell_price ?? null,
    score: r.score, tier: (r.tier as Tier) ?? "testing", thumb: r.thumb_url, video: r.video_url, sample: false,
  };
}

const AD_COLS = "id, platform, advertiser_id, page_name, ad_text, title, cta, landing_url, video_url, thumb_url, start_date, copies, views, likes, comments, shares, score, tier, products(sell_price)";

async function mockScored(): Promise<ScoredAd[]> {
  const s = await getScoreSettings();
  return mockAds
    .map((a) => {
      const score = winnerScore({ days: a.days, copies: a.copies, engagement: a.engagement, advertisers: a.advertisers, hasSupplier: a.suppliers > 0 }, s);
      return { ...a, dbId: a.id, platformKey: PLATFORM_KEY[a.platform] ?? "meta", score, tier: tierOf(score, s), thumb: null, video: null, sample: true } as ScoredAd;
    })
    .sort((a, b) => b.score - a.score);
}

export async function hasRealData() {
  try {
    const { count } = await createPublicClient().from("ads").select("id", { count: "exact", head: true });
    return (count ?? 0) > 0;
  } catch {
    return false;
  }
}

export async function getAds(opts: { limit?: number; platform?: string; q?: string; ids?: string[] } = {}): Promise<ScoredAd[]> {
  if (!(await hasRealData())) {
    let all = await mockScored();
    if (opts.ids) all = all.filter((a) => opts.ids!.includes(a.id));
    if (opts.platform && opts.platform !== "all") all = all.filter((a) => a.platformKey === opts.platform);
    if (opts.q) all = all.filter((a) => `${a.product} ${a.copy} ${a.page}`.includes(opts.q!));
    return all;
  }
  let q = createPublicClient().from("ads").select(AD_COLS).order("score", { ascending: false }).limit(opts.limit ?? 120);
  if (opts.platform && opts.platform !== "all") q = q.eq("platform", opts.platform);
  if (opts.q) q = q.ilike("search_text", `%${opts.q}%`);
  if (opts.ids) q = q.in("id", opts.ids.map(fromSlug));
  const { data } = await q;
  return ((data ?? []) as unknown as AdRow[]).map(fromRow);
}

export async function getAd(slug: string): Promise<ScoredAd | null> {
  if (!(await hasRealData())) return (await mockScored()).find((a) => a.id === slug) ?? null;
  const { data } = await createPublicClient().from("ads").select(AD_COLS).eq("id", fromSlug(slug)).maybeSingle();
  return data ? fromRow(data as unknown as AdRow) : null;
}

// ===== الموردون =====
export type Offer = { id: string; channel: string; kind: string; text: string; when: string; price: number | null; image: string | null; link: string | null };

const ago = (d?: string | null) => {
  if (!d) return "-";
  const h = Math.floor((Date.now() - new Date(d).getTime()) / 3600000);
  return h < 1 ? "منذ دقائق" : h < 24 ? `منذ ${h} ساعة` : `منذ ${Math.floor(h / 24)} يوم`;
};

export async function getOffers(term: string, limit = 30): Promise<{ offers: Offer[]; sample: boolean }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { offers: [], sample: false };
  const { count } = await supabase.from("supplier_offers").select("id", { count: "exact", head: true });
  if (!count) {
    const words = term.split(/\s+/).filter(Boolean);
    const list = mockOffers.filter((o) => !words.length || words.some((w) => o.text.includes(w)));
    return { sample: true, offers: list.sort((a, b) => a.price - b.price).map((o) => ({ id: o.id, channel: o.channel, kind: o.kind, text: o.text, when: o.when, price: o.price, image: null, link: null })) };
  }
  let q = supabase.from("supplier_offers").select("id, text, price, image_url, posted_at, message_id, supplier_channels(username, title, kind)").order("price", { ascending: true, nullsFirst: false }).limit(limit);
  const words = term.split(/\s+/).filter((w) => w.length > 1).slice(0, 4);
  if (words.length) q = q.or(words.map((w) => `text.ilike.%${w.replace(/[,()]/g, "")}%`).join(","));
  const { data } = await q;
  return {
    sample: false,
    offers: (data ?? []).map((o) => {
      const ch = o.supplier_channels as unknown as { username: string; title: string | null; kind: string } | null;
      return { id: String(o.id), channel: ch?.title ?? ch?.username ?? "-", kind: ch?.kind ?? "جملة", text: o.text, when: ago(o.posted_at), price: o.price, image: o.image_url, link: ch ? `https://t.me/${ch.username}/${o.message_id}` : null };
    }),
  };
}

// ===== المعلنون =====
export type AdvertiserView = { id: string; name: string; category: string; followers: string; since: string; domain: string; platform: string; activeAds: number; totalAds: number; avgDays: number; products: number; landings: number; weekly: number[]; hooks: { text: string; n: number }[]; sample: boolean };

export async function getAdvertiser(slug: string): Promise<AdvertiserView | null> {
  if (!(await hasRealData())) {
    const m = mockAdvertisers.find((a) => a.id === slug) ?? mockAdvertisers[0];
    return { ...m, sample: true };
  }
  const id = fromSlug(slug);
  const sb = createPublicClient();
  const [{ data: adv }, { data: rows }] = await Promise.all([
    sb.from("advertisers").select("*").eq("id", id).maybeSingle(),
    sb.from("ads").select("start_date, is_active, landing_url, title, ad_text, created_at").eq("advertiser_id", id).limit(500),
  ]);
  if (!adv) return null;
  const list = rows ?? [];
  const weekly = Array.from({ length: 12 }, (_, i) => {
    const end = Date.now() - (11 - i) * 7 * 86400000;
    return list.filter((r) => r.start_date && new Date(r.start_date).getTime() <= end && new Date(r.start_date).getTime() > end - 7 * 86400000).length;
  });
  const active = list.filter((r) => r.is_active);
  return {
    id: slug, name: adv.name, category: adv.category ?? "-", followers: compact(adv.followers), since: fmtDate(adv.first_seen), domain: adv.domain ?? "-",
    platform: PLATFORM_LABEL[adv.platform] ?? adv.platform, activeAds: active.length, totalAds: list.length,
    avgDays: active.length ? Math.round(active.reduce((s, r) => s + daysSince(r.start_date), 0) / active.length) : 0,
    products: new Set(list.map((r) => productName(r.title, r.ad_text))).size, landings: new Set(list.map((r) => r.landing_url).filter(Boolean)).size,
    weekly, hooks: [], sample: false,
  };
}

// ===== المنتجات =====
// تجميع الإعلانات اللي بتبيع نفس المنتج (بالكلمات الأولى من الاسم) عند أكتر من معلن.
export type ProductRow = { key: string; name: string; slug: string; advertisers: number; ads: number; copies: number; score: number; first: string; trend: number[]; sellPrice: number | null; platform: string };

const productKey = (name: string) => name.replace(/[^\p{L}\p{N}\s]/gu, " ").split(/\s+/).filter((w) => w.length > 1).slice(0, 3).join(" ").toLowerCase();

export async function getProducts(limit = 50): Promise<{ rows: ProductRow[]; sample: boolean }> {
  const real = await hasRealData();
  const list = real ? await getAds({ limit: 600 }) : await mockScored();
  const groups = new Map<string, ScoredAd[]>();
  list.forEach((a) => {
    const k = productKey(a.product) || a.id;
    groups.set(k, [...(groups.get(k) ?? []), a]);
  });
  const now = Date.now();
  const rows = [...groups.entries()].map(([key, ads]) => {
    const best = ads.reduce((m, a) => (a.score > m.score ? a : m), ads[0]);
    const trend = Array.from({ length: 10 }, (_, i) => {
      const end = now - (9 - i) * 7 * 86400000;
      return ads.filter((a) => {
        const started = now - a.days * 86400000;
        return started <= end;
      }).length;
    });
    return {
      key, name: best.product, slug: best.id, advertisers: new Set(ads.map((a) => a.page)).size, ads: ads.length,
      copies: ads.reduce((s, a) => s + a.copies, 0), score: Math.max(...ads.map((a) => a.score)),
      first: ads.reduce((m, a) => (a.days > m.days ? a : m), ads[0]).start, trend, sellPrice: best.sellPrice, platform: best.platform,
    };
  });
  rows.sort((a, b) => b.score + b.advertisers * 3 - (a.score + a.advertisers * 3));
  return { rows: rows.slice(0, limit), sample: !real };
}
