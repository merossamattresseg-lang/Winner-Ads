import { NextResponse } from "next/server";
import { getScoreSettings, getSetting } from "@/lib/data";
import { sendEmail } from "@/lib/email";
import { upsertAds } from "@/lib/ingest";
import { runApifyMeta, searchMetaSearchApi } from "@/lib/providers";
import { createAdminClient } from "@/lib/supabase/server";
import { syncAllChannels } from "@/lib/telegram";
import { sendTelegram } from "@/lib/telegramBot";
import { SITE_URL } from "@/lib/site";

export const maxDuration = 300;

// المهمة اليومية: موردو تليجرام، والسحب الليلي للكلمات، وصفحات المنافسين المتابعة، وتنبيهات المنافسين، والتذكيرات.
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) return NextResponse.json({ ok: false }, { status: 401 });
  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ ok: false, error: "service_role_missing" }, { status: 500 });
  const report: Record<string, unknown> = {};
  const settings = await getScoreSettings();
  const cfg = await getSetting<{ apify_actor?: string; nightly_keywords_limit?: number }>("providers", {});

  // 1) موردو تليجرام
  report.suppliers = await syncAllChannels(60);

  // 2) السحب الليلي للكلمات
  const { data: keywords } = await admin.from("crawl_keywords").select("id, keyword").eq("active", true).order("last_run", { ascending: true, nullsFirst: true }).limit(cfg.nightly_keywords_limit ?? 25);
  let crawled = 0;
  for (const k of keywords ?? []) {
    try {
      const found = cfg.apify_actor
        ? await runApifyMeta(cfg.apify_actor, { query: k.keyword, country: "EG", maxItems: 100 })
        : await searchMetaSearchApi(k.keyword);
      crawled += (await upsertAds(found, settings)).length;
      await admin.from("crawl_keywords").update({ last_run: new Date().toISOString() }).eq("id", k.id);
    } catch {}
  }
  report.crawled = crawled;

  // 3) صفحات المنافسين المتابعة + تنبيه بالجديد
  const { data: tracked } = await admin.from("tracked_pages").select("user_id, advertiser_id, last_alerted").eq("alert", true).limit(200);
  const pages = [...new Set((tracked ?? []).map((t) => t.advertiser_id))].filter((id) => id.startsWith("meta:"));
  for (const id of pages.slice(0, 40)) {
    try {
      await upsertAds(await searchMetaSearchApi("", { pageId: id.slice(5) }), settings);
    } catch {}
  }
  let alerts = 0;
  for (const t of tracked ?? []) {
    const since = t.last_alerted ?? new Date(Date.now() - 86400000).toISOString();
    const { count } = await admin.from("ads").select("id", { count: "exact", head: true }).eq("advertiser_id", t.advertiser_id).gt("created_at", since);
    if (count) {
      const { data: u } = await admin.auth.admin.getUserById(t.user_id);
      const { data: adv } = await admin.from("advertisers").select("name").eq("id", t.advertiser_id).single();
      const { data: prof } = await admin.from("profiles").select("telegram_chat_id").eq("id", t.user_id).single();
      if (prof?.telegram_chat_id) await sendTelegram(prof.telegram_chat_id, `${count} إعلانات جديدة من ${adv?.name ?? "منافسك"}\n${SITE_URL}/dashboard`);
      if (u.user?.email) {
        await sendEmail({ to: u.user.email, kind: "competitor", userId: t.user_id, ref: `alert:${t.advertiser_id}:${new Date().toISOString().slice(0, 10)}`, ctx: { note: `${count} إعلانات جديدة من ${adv?.name ?? "منافسك"}` } });
        alerts++;
      }
      await admin.from("tracked_pages").update({ last_alerted: new Date().toISOString() }).eq("user_id", t.user_id).eq("advertiser_id", t.advertiser_id);
    }
  }
  report.alerts = alerts;

  // 4) التقرير الأسبوعي (كل إثنين)
  if (new Date().getUTCDay() === 1) {
    const { data: top } = await admin.from("ads").select("title, ad_text, score, page_name").order("score", { ascending: false }).gt("created_at", new Date(Date.now() - 7 * 86400000).toISOString()).limit(5);
    if (top?.length) {
      const note = top.map((a, i) => `${i + 1}. ${(a.title || (a.ad_text ?? "").split("\n")[0]).slice(0, 50)} (${a.score}) · ${a.page_name ?? ""}`).join("\n");
      const { data: subscribers } = await admin.from("profiles").select("id").eq("weekly_email", true).limit(1000);
      const week = new Date().toISOString().slice(0, 10);
      let weekly = 0;
      for (const p of subscribers ?? []) {
        const { data: u } = await admin.auth.admin.getUserById(p.id);
        if (u.user?.email) { await sendEmail({ to: u.user.email, kind: "weekly", userId: p.id, ref: week, ctx: { note } }); weekly++; }
      }
      report.weekly = weekly;
    }
  }

  // 5) التذكيرات
  const origin = new URL(req.url).origin;
  const r = await fetch(`${origin}/api/cron/reminders`, { headers: { authorization: `Bearer ${secret}` } }).then((x) => x.json()).catch(() => null);
  report.reminders = r;

  return NextResponse.json({ ok: true, report });
}
