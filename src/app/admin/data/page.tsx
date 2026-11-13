import { AdminNav } from "@/components/AdminNav";
import { getSetting } from "@/lib/data";
import { paymobReady } from "@/lib/paymob";
import { providerStatus } from "@/lib/providers";
import { META_PIXEL_ID } from "@/lib/site";
import { createAdminClient } from "@/lib/supabase/server";
import { addChannels, addKeyword, saveProviderSettings, syncChannelsNow, syncOneChannel, toggleChannel, toggleKeyword } from "../actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "مصادر البيانات" };

const card = "flex flex-col gap-3 rounded-[18px] border border-line bg-white p-5";
const input = "h-10 rounded-[10px] border border-line-2 px-3 text-sm";

export default async function AdminData() {
  const admin = createAdminClient();
  const status = providerStatus();
  const cfg = await getSetting<{ cache_hours?: number; guest_searches_per_day?: number; apify_actor?: string; nightly_keywords_limit?: number }>("providers", {});
  const [ads, cache, channels, keywords, offers] = admin
    ? await Promise.all([
        admin.from("ads").select("id", { count: "exact", head: true }),
        admin.from("searches").select("cached"),
        admin.from("supplier_channels").select("id, username, title, kind, active, last_synced, last_error").order("id"),
        admin.from("crawl_keywords").select("id, keyword, active, last_run").order("id"),
        admin.from("supplier_offers").select("id", { count: "exact", head: true }),
      ])
    : [null, null, null, null, null];
  const searches = cache?.data ?? [];
  const hitRate = searches.length ? Math.round((searches.filter((s) => s.cached).length / searches.length) * 100) : 0;
  const integrations = [
    ["SearchAPI (ميتا)", status.searchapi, "SEARCHAPI_KEY"],
    ["ScrapeCreators (تيك توك)", status.scrapecreators, "SCRAPECREATORS_KEY"],
    ["Apify (السحب الليلي)", status.apify, "APIFY_TOKEN"],
    ["Supabase (صلاحيات السيرفر)", Boolean(admin), "SUPABASE_SERVICE_ROLE_KEY"],
    ["Paymob", paymobReady(), "PAYMOB_*"],
    ["Resend (البريد)", Boolean(process.env.RESEND_API_KEY), "RESEND_API_KEY"],
    ["Meta Pixel", Boolean(META_PIXEL_ID), "NEXT_PUBLIC_META_PIXEL_ID"],
    ["Conversions API", Boolean(process.env.META_CAPI_TOKEN), "META_CAPI_TOKEN"],
    ["المهام اليومية", Boolean(process.env.CRON_SECRET), "CRON_SECRET"],
  ] as const;

  return (
    <div className="min-h-screen bg-[#F7F8FA]">
      <AdminNav active="/admin/data" />
      <main className="mx-auto flex max-w-[1320px] flex-col gap-5 px-6 py-7">
        <h1 className="font-display text-[28px] font-bold">مصادر البيانات</h1>

        <section className={card}>
          <h2 className="font-display text-lg font-bold">حالة الربط</h2>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-2.5">
            {integrations.map(([name, ok, key]) => (
              <div key={name} className="flex items-center justify-between gap-2 rounded-xl border border-line px-3.5 py-2.5 text-sm">
                <span className="flex flex-col"><b>{name}</b><span dir="ltr" className="text-right text-xs text-muted">{key}</span></span>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${ok ? "bg-lime-soft text-lime-text" : "bg-[#FEF0C7] text-[#93370D]"}`}>{ok ? "متصل" : "غير متصل"}</span>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-6 text-sm text-muted">
            <span>الإعلانات المخزنة: <b className="text-text">{ads?.count ?? 0}</b></span>
            <span>عروض الموردين: <b className="text-text">{offers?.count ?? 0}</b></span>
            <span>عمليات البحث: <b className="text-text">{searches.length}</b></span>
            <span>من الكاش: <b className="text-text">{hitRate}%</b></span>
          </div>
        </section>

        <section className={card}>
          <h2 className="font-display text-lg font-bold">إعدادات البحث</h2>
          <form action={saveProviderSettings} className="flex flex-wrap items-end gap-3">
            <label className="flex flex-col gap-1 text-xs text-muted">مدة الكاش (ساعات)<input name="cache_hours" type="number" defaultValue={cfg.cache_hours ?? 12} className={`${input} w-28`} /></label>
            <label className="flex flex-col gap-1 text-xs text-muted">بحث الزائر يوميًا<input name="guest_searches_per_day" type="number" defaultValue={cfg.guest_searches_per_day ?? 3} className={`${input} w-28`} /></label>
            <label className="flex flex-col gap-1 text-xs text-muted">كلمات السحب الليلي في اليوم<input name="nightly_keywords_limit" type="number" defaultValue={cfg.nightly_keywords_limit ?? 25} className={`${input} w-28`} /></label>
            <label className="flex flex-1 flex-col gap-1 text-xs text-muted">Apify actor (اختياري)<input name="apify_actor" dir="ltr" defaultValue={cfg.apify_actor ?? ""} placeholder="username~actor-name" className={input} /></label>
            <button className="h-10 rounded-[10px] bg-ink px-4 text-sm font-semibold text-white">حفظ</button>
          </form>
        </section>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <section className={card}>
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-bold">قنوات الموردين ({channels?.data?.length ?? 0})</h2>
              <form action={syncChannelsNow}><button className="h-9 rounded-lg bg-ink px-3 text-sm font-semibold text-white">مزامنة الآن</button></form>
            </div>
            <form action={addChannels} className="flex flex-col gap-2">
              <textarea name="channels" rows={3} dir="ltr" placeholder="@channel1 https://t.me/channel2" className="rounded-[10px] border border-line-2 p-3 text-sm" />
              <div className="flex gap-2">
                <select name="kind" className={input}><option>جملة</option><option>مستورد</option><option>دروب شيبنج</option></select>
                <button className="h-10 rounded-[10px] bg-ink px-4 text-sm font-semibold text-white">إضافة</button>
              </div>
              <span className="text-xs text-muted">القنوات العامة فقط. اكتب اسم القناة أو رابطها، كل قناة في سطر أو بينهم مسافة.</span>
            </form>
            <div className="flex max-h-[420px] flex-col overflow-y-auto">
              {(channels?.data ?? []).map((c) => (
                <div key={c.id} className="flex items-center justify-between gap-2 border-t border-[#F2F4F7] py-2 text-sm">
                  <span className="flex min-w-0 flex-col"><b className="truncate">{c.title ?? c.username}</b><span className="text-xs text-muted" dir="ltr">@{c.username} · {c.kind}</span>{c.last_error && <span className="text-xs text-[#912018]">{c.last_error}</span>}</span>
                  <span className="text-xs text-muted">{c.last_synced ? new Date(c.last_synced).toLocaleString("ar-EG") : "لم تُزامن"}</span>
                  <div className="flex gap-1">
                    <form action={syncOneChannel}><input type="hidden" name="id" value={c.id} /><input type="hidden" name="username" value={c.username} /><button className="h-8 rounded-md border border-line-2 px-2 text-xs">مزامنة</button></form>
                    <form action={toggleChannel}><input type="hidden" name="id" value={c.id} /><input type="hidden" name="active" value={String(!c.active)} /><button className={`h-8 rounded-md px-2 text-xs font-semibold ${c.active ? "bg-lime-soft text-lime-text" : "bg-[#F2F4F7]"}`}>{c.active ? "مفعلة" : "متوقفة"}</button></form>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className={card}>
            <h2 className="font-display text-lg font-bold">كلمات السحب الليلي ({keywords?.data?.length ?? 0})</h2>
            <form action={addKeyword} className="flex flex-col gap-2">
              <textarea name="keywords" rows={3} placeholder="جهاز تدليك، منظم مطبخ، مخدة طبية" className="rounded-[10px] border border-line-2 p-3 text-sm" />
              <button className="h-10 self-start rounded-[10px] bg-ink px-4 text-sm font-semibold text-white">إضافة</button>
            </form>
            <div className="flex max-h-[420px] flex-wrap gap-2 overflow-y-auto">
              {(keywords?.data ?? []).map((k) => (
                <form key={k.id} action={toggleKeyword}>
                  <input type="hidden" name="id" value={k.id} /><input type="hidden" name="active" value={String(!k.active)} />
                  <button title={k.last_run ? `آخر تشغيل ${new Date(k.last_run).toLocaleDateString("ar-EG")}` : "لم تُشغل"} className={`rounded-full px-3 py-1.5 text-sm ${k.active ? "bg-ink text-white" : "bg-[#F2F4F7] text-muted line-through"}`}>{k.keyword}</button>
                </form>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
