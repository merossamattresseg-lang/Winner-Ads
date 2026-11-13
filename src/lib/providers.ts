// محوّلات مصادر الداتا. كل محوّل بيرجّع إعلانات بشكل موحد (NormalizedAd).
// لو مفتاح المصدر مش موجود، المحوّل بيرجّع قايمة فاضية ومفيش حاجة بتقع.

export type PlatformKey = "meta" | "tiktok" | "reels" | "pinterest";

export type NormalizedAd = {
  id: string;
  platform: PlatformKey;
  source: string;
  pageId: string;
  pageName: string;
  avatar?: string | null;
  followers?: number | null;
  text?: string | null;
  title?: string | null;
  cta?: string | null;
  landing?: string | null;
  mediaType?: string | null;
  video?: string | null;
  thumb?: string | null;
  startDate?: string | null;
  active?: boolean;
  copies?: number;
  views?: number | null;
  likes?: number | null;
  comments?: number | null;
  shares?: number | null;
  raw?: unknown;
};

type Any = Record<string, unknown>;
const get = (o: unknown, path: string): unknown =>
  path.split(".").reduce<unknown>((v, k) => (v && typeof v === "object" ? (v as Any)[k] : undefined), o);
const str = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : null);
const num = (v: unknown) => (typeof v === "number" ? v : typeof v === "string" && v !== "" && !isNaN(Number(v)) ? Number(v) : null);
const first = (...vals: unknown[]) => vals.find((v) => v !== undefined && v !== null && v !== "") ?? null;
const toDate = (v: unknown) => {
  if (typeof v === "number") return new Date(v * (v < 1e12 ? 1000 : 1)).toISOString().slice(0, 10);
  if (typeof v === "string" && v) return new Date(v).toISOString().slice(0, 10);
  return null;
};

export const providerKeys = {
  searchapi: () => process.env.SEARCHAPI_KEY,
  scrapecreators: () => process.env.SCRAPECREATORS_KEY,
  apify: () => process.env.APIFY_TOKEN,
};

export function providerStatus() {
  return {
    searchapi: Boolean(providerKeys.searchapi()),
    scrapecreators: Boolean(providerKeys.scrapecreators()),
    apify: Boolean(providerKeys.apify()),
  };
}

// مكتبة إعلانات ميتا عن طريق SearchAPI.io
export async function searchMetaSearchApi(q: string, opts: { country?: string; pageId?: string } = {}): Promise<NormalizedAd[]> {
  const key = providerKeys.searchapi();
  if (!key) return [];
  const params = new URLSearchParams({ engine: "meta_ad_library", country: (opts.country ?? "EG").toLowerCase(), active_status: "active", sort_by: "impressions_high_to_low" });
  if (q) params.set("q", q);
  if (opts.pageId) params.set("page_id", opts.pageId);
  const res = await fetch(`https://www.searchapi.io/api/v1/search?${params}`, { headers: { Authorization: `Bearer ${key}` }, cache: "no-store" });
  if (!res.ok) throw new Error(`searchapi_${res.status}`);
  const data = (await res.json()) as { ads?: Any[] };
  return (data.ads ?? []).map((a) => {
    const s = (a.snapshot ?? {}) as Any;
    const video = (Array.isArray(s.videos) ? s.videos[0] : null) as Any | null;
    const card = (Array.isArray(s.cards) ? s.cards[0] : null) as Any | null;
    const image = (Array.isArray(s.images) ? s.images[0] : null) as Any | null;
    return {
      id: `meta:${a.ad_archive_id}`,
      platform: "meta" as const,
      source: "searchapi",
      pageId: String(first(a.page_id, s.page_id) ?? "unknown"),
      pageName: str(first(a.page_name, s.page_name)) ?? "غير معروف",
      avatar: str(s.page_profile_picture_url),
      followers: num(s.page_like_count),
      text: str(get(s, "body.text")) ?? str(card?.body),
      title: str(s.title) ?? str(card?.title),
      cta: str(s.cta_text) ?? str(card?.cta_text),
      landing: str(s.link_url) ?? str(card?.link_url),
      mediaType: video ? "video" : "image",
      video: str(first(video?.video_hd_url, video?.video_sd_url, card?.video_hd_url)),
      thumb: str(first(video?.video_preview_image_url, image?.original_image_url, card?.original_image_url, card?.resized_image_url)),
      startDate: toDate(a.start_date),
      active: a.is_active !== false,
      copies: num(a.collation_count) ?? 1,
      raw: a,
    };
  });
}

// تيك توك عن طريق ScrapeCreators
export async function searchTikTok(q: string): Promise<NormalizedAd[]> {
  const key = providerKeys.scrapecreators();
  if (!key || !q) return [];
  const res = await fetch(`https://api.scrapecreators.com/v1/tiktok/search/keyword?query=${encodeURIComponent(q)}&region=EG`, { headers: { "x-api-key": key }, cache: "no-store" });
  if (!res.ok) throw new Error(`scrapecreators_${res.status}`);
  const data = (await res.json()) as { search_item_list?: Any[] };
  return (data.search_item_list ?? []).map((it) => (it.aweme_info ?? it) as Any).filter((a) => a.aweme_id).map((a) => {
    const v = (a.video ?? {}) as Any;
    const urls = (p: string) => (get(v, p) as string[] | undefined)?.[0] ?? null;
    return {
      id: `tiktok:${a.aweme_id}`,
      platform: "tiktok" as const,
      source: "scrapecreators",
      pageId: String(get(a, "author.unique_id") ?? get(a, "author.uid") ?? "unknown"),
      pageName: str(get(a, "author.nickname")) ?? str(get(a, "author.unique_id")) ?? "غير معروف",
      avatar: (get(a, "author.avatar_thumb.url_list") as string[] | undefined)?.[0] ?? null,
      followers: num(get(a, "author.follower_count")),
      text: str(a.desc),
      mediaType: "video",
      video: urls("download_no_watermark_addr.url_list") ?? urls("play_addr.url_list") ?? ((get(v, "bit_rate") as Any[] | undefined)?.[0] ? ((get((get(v, "bit_rate") as Any[])[0], "play_addr.url_list") as string[])?.[0] ?? null) : null),
      thumb: urls("cover.url_list") ?? urls("origin_cover.url_list") ?? urls("animated_cover.url_list"),
      startDate: toDate(a.create_time),
      landing: str(a.share_url),
      views: num(get(a, "statistics.play_count")),
      likes: num(get(a, "statistics.digg_count")),
      comments: num(get(a, "statistics.comment_count")),
      shares: num(get(a, "statistics.share_count")),
      raw: a,
    };
  });
}

// تشغيل Apify actor بشكل متزامن للسحب الليلي الكبير (اسم الـ actor من الإعدادات).
export async function runApifyMeta(actor: string, input: Record<string, unknown>): Promise<NormalizedAd[]> {
  const token = providerKeys.apify();
  if (!token || !actor) return [];
  const res = await fetch(`https://api.apify.com/v2/acts/${encodeURIComponent(actor)}/run-sync-get-dataset-items?token=${token}&timeout=240`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`apify_${res.status}`);
  const items = (await res.json()) as Any[];
  return items.map((a) => {
    const s = (a.snapshot ?? a) as Any;
    const video = (Array.isArray(s.videos) ? s.videos[0] : null) as Any | null;
    const image = (Array.isArray(s.images) ? s.images[0] : null) as Any | null;
    return {
      id: `meta:${first(a.ad_archive_id, a.adArchiveID, a.adArchiveId, a.id)}`,
      platform: "meta" as const,
      source: "apify",
      pageId: String(first(a.page_id, a.pageID, a.pageId, s.page_id) ?? "unknown"),
      pageName: str(first(a.page_name, a.pageName, s.page_name)) ?? "غير معروف",
      avatar: str(s.page_profile_picture_url),
      followers: num(s.page_like_count),
      text: str(first(get(s, "body.text"), get(s, "body.markup.__html"), a.adText)),
      title: str(s.title),
      cta: str(s.cta_text),
      landing: str(s.link_url),
      mediaType: video ? "video" : "image",
      video: str(first(video?.video_hd_url, video?.video_sd_url)),
      thumb: str(first(video?.video_preview_image_url, image?.original_image_url)),
      startDate: toDate(first(a.start_date, a.startDate)),
      active: a.is_active !== false && a.isActive !== false,
      copies: num(first(a.collation_count, a.collationCount)) ?? 1,
      raw: a,
    };
  }).filter((a) => !a.id.endsWith(":null"));
}
