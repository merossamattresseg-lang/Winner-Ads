import Link from "next/link";
import { Card, H2, Stat, TierBadge } from "@/components/ui";
import { getAccess } from "@/lib/access";
import { getAds, getOffers } from "@/lib/data";
import { toSlug } from "@/lib/slug";
import { createAdminClient, createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const metadata = { title: "الرئيسية" };

const greeting = () => {
  const h = Number(new Date().toLocaleString("en-US", { hour: "numeric", hour12: false, timeZone: "Africa/Cairo" }));
  return h < 12 ? "صباح الخير" : "مساء الخير";
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const admin = createAdminClient();
  const dayAgo = new Date(Date.now() - 86400000).toISOString();
  const [access, ads, { offers }, { data: tracked }, { count: savedCount }, trending] = await Promise.all([
    getAccess(),
    getAds({ limit: 60 }),
    getOffers("", 3),
    supabase.from("tracked_pages").select("advertiser_id, advertisers(name)").limit(10),
    supabase.from("favorites").select("ad_id", { count: "exact", head: true }),
    admin
      ? admin.from("searches").select("query").gt("created_at", new Date(Date.now() - 7 * 86400000).toISOString()).not("query", "is", null).limit(1000)
      : Promise.resolve({ data: [] as { query: string | null }[] }),
  ]);

  const winners = ads.filter((a) => a.tier !== "testing").slice(0, 4);
  const rivals = await Promise.all(
    (tracked ?? []).map(async (t) => {
      const [{ count: fresh }, { count: active }] = await Promise.all([
        supabase.from("ads").select("id", { count: "exact", head: true }).eq("advertiser_id", t.advertiser_id).gt("created_at", dayAgo),
        supabase.from("ads").select("id", { count: "exact", head: true }).eq("advertiser_id", t.advertiser_id).eq("is_active", true),
      ]);
      return { id: toSlug(t.advertiser_id), name: (t.advertisers as unknown as { name: string } | null)?.name ?? "-", fresh: fresh ?? 0, active: active ?? 0 };
    }),
  );
  const counts = new Map<string, number>();
  (trending.data ?? []).forEach((r) => r.query && counts.set(r.query, (counts.get(r.query) ?? 0) + 1));
  const topQueries = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8).map(([q]) => q);
  const newWinners = ads.filter((a) => a.tier !== "testing" && a.days <= 7).length;

  return (
    <>
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-[28px] font-bold">{greeting()}</h1>
          <p className="mt-1.5 text-[15px] text-muted">أبرز التغييرات في السوق.</p>
        </div>
        <form action="/search" className="flex min-w-[260px] flex-[0_1_520px] gap-2">
          <label htmlFor="q" className="sr-only">بحث سريع</label>
          <input id="q" name="q" type="search" placeholder="اسم منتج" className="h-[46px] min-w-0 flex-1 rounded-[10px] border border-line-2 bg-white px-3.5 text-[15px]" />
          <button className="h-[46px] rounded-[10px] bg-lime px-5 font-bold text-ink">بحث</button>
        </form>
      </header>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
        <Stat label="منتجات رابحة بدأت هذا الأسبوع" value={newWinners} />
        <Stat label="إعلانات جديدة لمنافسيك (24 ساعة)" value={rivals.reduce((s, r) => s + r.fresh, 0)} />
        <Stat label="المحفوظات" value={savedCount ?? 0} />
        <Stat label="رصيد النقاط" value={access.credits.toLocaleString("en-US")} />
      </div>

      <section className="flex flex-col gap-3.5">
        <div className="flex items-baseline justify-between">
          <h2 className="font-display text-[22px] font-bold">الأكثر ربحًا الآن</h2>
          <Link href="/search" className="text-sm font-semibold text-[#15803D]">عرض الكل</Link>
        </div>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(230px,1fr))] gap-4">
          {winners.map((w) => (
            <Link key={w.id} href={`/ads/${w.id}`} className="flex flex-col overflow-hidden rounded-2xl border border-line bg-white">
              <div className="relative flex h-44 items-center justify-center overflow-hidden bg-thumb text-sm text-muted">
                {w.thumb ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={w.thumb} alt="" referrerPolicy="no-referrer" className="absolute inset-0 h-full w-full object-cover" />
                ) : w.product}
                <span className="absolute right-2.5 top-2.5"><TierBadge tier={w.tier} /></span>
                <span className="absolute bottom-2.5 left-2.5 rounded-md bg-white px-2 py-0.5 text-xs font-semibold">{w.platform}</span>
              </div>
              <div className="flex items-center justify-between gap-2.5 px-4 py-3.5">
                <div className="flex min-w-0 flex-col">
                  <b className="truncate text-[15px]">{w.product}</b>
                  <span className="text-[13px] text-muted">{w.days} يومًا · {w.copies} نسخة</span>
                </div>
                <span className="rounded-[10px] bg-lime-soft px-2.5 py-1.5 font-display text-lg font-bold text-lime-text">{w.score}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <div className="flex flex-wrap items-start gap-5">
        <Card className="min-w-0 flex-[999_1_520px]">
          <div className="mb-3 flex items-center justify-between"><H2>منافسوك</H2></div>
          {rivals.length ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[460px] border-collapse text-sm">
                <thead><tr className="text-right text-muted">{["الصفحة", "جديد خلال 24 ساعة", "إعلانات نشطة"].map((h) => <th key={h} className="border-b border-line px-2 py-2.5 font-semibold">{h}</th>)}</tr></thead>
                <tbody>
                  {rivals.map((r) => (
                    <tr key={r.id}>
                      <td className="border-b border-[#F2F4F7] px-2 py-3 font-semibold"><Link href={`/advertisers/${r.id}`}>{r.name}</Link></td>
                      <td className="border-b border-[#F2F4F7] px-2 py-3"><span className="rounded-full bg-lime-soft px-2.5 py-0.5 font-bold text-lime-text">+{r.fresh}</span></td>
                      <td className="border-b border-[#F2F4F7] px-2 py-3">{r.active}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-muted">لا تتابع أي منافس بعد. افتح صفحة أي معلن واضغط &quot;متابعة المعلن&quot;.</p>
          )}
        </Card>

        <div className="flex min-w-0 flex-[1_1_300px] flex-col gap-5">
          {topQueries.length > 0 && (
            <Card className="flex flex-col gap-3">
              <H2>الأكثر بحثًا هذا الأسبوع</H2>
              <div className="flex flex-wrap gap-2">
                {topQueries.map((t) => <Link key={t} href={`/search?q=${encodeURIComponent(t)}`} className="rounded-full bg-[#F2F4F7] px-3 py-1.5 text-sm">{t}</Link>)}
              </div>
            </Card>
          )}
          <Card className="flex flex-col gap-1">
            <div className="flex items-baseline justify-between"><H2>أحدث عروض الموردين</H2><Link href="/suppliers" className="text-sm font-semibold text-[#15803D]">الكل</Link></div>
            {offers.length ? offers.map((s) => (
              <div key={s.id} className="flex justify-between gap-2.5 border-t border-[#F2F4F7] py-2.5">
                <div className="flex min-w-0 flex-col"><b className="truncate text-sm">{s.text.split("\n")[0]}</b><span className="text-[13px] text-muted">{s.channel} · {s.when}</span></div>
                <span className="whitespace-nowrap font-bold">{s.price ? `${s.price} ج.م` : "-"}</span>
              </div>
            )) : <p className="text-sm text-muted">لا توجد عروض بعد.</p>}
          </Card>
        </div>
      </div>
    </>
  );
}
