import Link from "next/link";
import { ads, rivals, supplierOffers, trends } from "@/lib/mock-data";
import { Card, H2, Stat, TierBadge } from "@/components/ui";

export default function HomePage() {
  const winners = ads.filter((a) => a.score >= 60).slice(0, 4);
  return (
    <>
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-[28px] font-bold">صباح الخير</h1>
          <p className="mt-1.5 text-[15px] text-muted">ده اللي اتغير في السوق من امبارح.</p>
        </div>
        <form action="/search" className="flex min-w-[260px] flex-[0_1_520px] gap-2">
          <label htmlFor="q" className="sr-only">بحث سريع</label>
          <input id="q" name="q" type="search" placeholder="اسم منتج، أو لينك صفحة" className="h-[46px] min-w-0 flex-1 rounded-[10px] border border-line-2 bg-white px-3.5 text-[15px]" />
          <button className="h-[46px] rounded-[10px] bg-lime px-5 font-bold text-ink">دوّر</button>
        </form>
      </header>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
        <Stat label="وينر جديد النهارده" value="23" note="+6 عن امبارح" />
        <Stat label="إعلانات جديدة عند منافسينك" value="41" note="من 8 صفحات" />
        <Stat label="منتجات محفوظة" value="12" note="3 لقينالهم مورد" />
        <Stat label="متوسط سكور المحفوظات" value="71" note="وينر" />
      </div>

      <section className="flex flex-col gap-3.5">
        <div className="flex items-baseline justify-between">
          <h2 className="font-display text-[22px] font-bold">وينر النهارده</h2>
          <Link href="/search" className="text-sm font-semibold text-blue-700">شوف الكل</Link>
        </div>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(230px,1fr))] gap-4">
          {winners.map((w) => (
            <Link key={w.id} href={`/ads/${w.id}`} className="flex flex-col overflow-hidden rounded-2xl border border-line bg-white">
              <div className="relative flex h-44 items-center justify-center bg-thumb text-sm text-muted">
                {w.product}
                <span className="absolute right-2.5 top-2.5"><TierBadge score={w.score} /></span>
                <span className="absolute bottom-2.5 left-2.5 rounded-md bg-white px-2 py-0.5 text-xs font-semibold">{w.platform}</span>
              </div>
              <div className="flex items-center justify-between gap-2.5 px-4 py-3.5">
                <div className="flex min-w-0 flex-col">
                  <b className="text-[15px]">{w.product}</b>
                  <span className="text-[13px] text-muted">{w.days} يوم شغال · {w.copies} نسخة</span>
                </div>
                <span className="rounded-[10px] bg-lime-soft px-2.5 py-1.5 font-display text-lg font-bold text-lime-text">{w.score}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <div className="flex flex-wrap items-start gap-5">
        <Card className="min-w-0 flex-[999_1_520px]">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <H2>منافسينك</H2>
            <button className="h-10 rounded-[10px] border border-line-2 bg-white px-3.5 text-sm font-semibold">ضيف صفحة</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] border-collapse text-sm">
              <thead>
                <tr className="text-right text-muted">
                  {["الصفحة", "جديد آخر 24 ساعة", "إعلانات شغالة", "أقوى منتج", "تنبيه"].map((h) => (
                    <th key={h} className="border-b border-line px-2 py-2.5 font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rivals.map((r) => (
                  <tr key={r.page}>
                    <td className="border-b border-[#F2F4F7] px-2 py-3 font-semibold">{r.page}</td>
                    <td className="border-b border-[#F2F4F7] px-2 py-3"><span className="rounded-full bg-lime-soft px-2.5 py-0.5 font-bold text-lime-text">+{r.fresh}</span></td>
                    <td className="border-b border-[#F2F4F7] px-2 py-3">{r.active}</td>
                    <td className="border-b border-[#F2F4F7] px-2 py-3">{r.top}</td>
                    <td className="border-b border-[#F2F4F7] px-2 py-3"><label className="inline-flex items-center gap-1.5"><input type="checkbox" defaultChecked />تليجرام</label></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="flex min-w-0 flex-[1_1_300px] flex-col gap-5">
          <Card className="flex flex-col gap-3">
            <H2>كلمات طالعة الأسبوع ده</H2>
            <div className="flex flex-wrap gap-2">
              {trends.map((t) => (
                <Link key={t} href={`/search?q=${encodeURIComponent(t)}`} className="rounded-full bg-[#F2F4F7] px-3 py-1.5 text-sm">{t}</Link>
              ))}
            </div>
          </Card>
          <Card className="flex flex-col gap-1">
            <div className="flex items-baseline justify-between">
              <H2>آخر رسايل الموردين</H2>
              <Link href="/suppliers" className="text-sm font-semibold text-blue-700">كل الموردين</Link>
            </div>
            {supplierOffers.slice(0, 3).map((s) => (
              <div key={s.id} className="flex justify-between gap-2.5 border-t border-[#F2F4F7] py-2.5">
                <div className="flex min-w-0 flex-col">
                  <b className="text-sm">{s.text.split("،")[0]}</b>
                  <span className="text-[13px] text-muted">{s.channel} · {s.when}</span>
                </div>
                <span className="whitespace-nowrap font-bold">{s.price} ج</span>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </>
  );
}
