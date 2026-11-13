import { createAdminClient } from "./supabase/server";

// سحب رسائل قنوات الموردين العامة من صفحة المعاينة t.me/s/<channel>، من غير أي مفتاح.
// بيشتغل مع القنوات العامة بس. القنوات الخاصة محتاجة حساب تليجرام (المرحلة الجاية).

const AR_DIGITS = "٠١٢٣٤٥٦٧٨٩";
const normDigits = (s: string) => s.replace(/[٠-٩]/g, (d) => String(AR_DIGITS.indexOf(d)));

export function extractPrice(text: string): number | null {
  const t = normDigits(text);
  const m =
    t.match(/(?:السعر|سعر|بسعر|الجملة|جملة)\s*[:：-]?\s*(\d{2,6})/) ??
    t.match(/(\d{2,6})\s*(?:ج\.?م|جنيه|ج\b|جم|le|egp)/i);
  if (!m) return null;
  const n = Number(m[1]);
  return n >= 5 && n <= 200000 ? n : null;
}

const decode = (s: string) =>
  s.replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&nbsp;/g, " ").trim();

export type ParsedMessage = { id: number; text: string; date: string | null; image: string | null };

export function parseChannelPage(html: string): ParsedMessage[] {
  const out: ParsedMessage[] = [];
  const blocks = html.split('class="tgme_widget_message_wrap').slice(1);
  for (const b of blocks) {
    const post = b.match(/data-post="[^"/]+\/(\d+)"/);
    if (!post) continue;
    const textM = b.match(/class="tgme_widget_message_text[^"]*"[^>]*>([\s\S]*?)<\/div>/);
    const text = textM ? decode(textM[1]) : "";
    if (!text) continue;
    const date = b.match(/<time[^>]*datetime="([^"]+)"/)?.[1] ?? null;
    const image = b.match(/tgme_widget_message_photo_wrap[^>]*background-image:url\('([^']+)'\)/)?.[1] ?? null;
    out.push({ id: Number(post[1]), text, date, image });
  }
  return out;
}

export async function syncChannel(channel: { id: number; username: string }) {
  const admin = createAdminClient();
  if (!admin) return { ok: false, error: "service_role_missing" };
  try {
    const res = await fetch(`https://t.me/s/${encodeURIComponent(channel.username)}`, { headers: { "User-Agent": "Mozilla/5.0" }, cache: "no-store" });
    if (!res.ok) throw new Error(`http_${res.status}`);
    const html = await res.text();
    const title = decode(html.match(/<meta property="og:title" content="([^"]+)"/)?.[1] ?? "") || null;
    const msgs = parseChannelPage(html);
    if (msgs.length) {
      await admin.from("supplier_offers").upsert(
        msgs.map((m) => ({ channel_id: channel.id, message_id: m.id, text: m.text.slice(0, 2000), price: extractPrice(m.text), image_url: m.image, posted_at: m.date })),
        { onConflict: "channel_id,message_id" },
      );
    }
    await admin.from("supplier_channels").update({ last_synced: new Date().toISOString(), last_error: null, ...(title ? { title } : {}) }).eq("id", channel.id);
    return { ok: true, count: msgs.length };
  } catch (e) {
    await admin.from("supplier_channels").update({ last_error: String(e).slice(0, 200) }).eq("id", channel.id);
    return { ok: false, error: String(e) };
  }
}

export async function syncAllChannels(limit = 40) {
  const admin = createAdminClient();
  if (!admin) return { synced: 0 };
  const { data } = await admin.from("supplier_channels").select("id, username").eq("active", true).order("last_synced", { ascending: true, nullsFirst: true }).limit(limit);
  let synced = 0;
  for (const c of data ?? []) {
    const r = await syncChannel(c);
    if (r.ok) synced++;
  }
  return { synced };
}
