import Link from "next/link";
import { advertisers, getAdvertiser } from "@/lib/mock-data";
import { getAds } from "@/lib/data";
import { Bars, Card, H2, Stat } from "@/components/ui";

export function generateStaticParams() {
  return advertisers.map((a) => ({ id: a.id }));
}

const weekLabels = ["24 أغسطس", "31", "7 سبتمبر", "14", "21", "28", "5 أكتوبر", "12", "19", "26", "2 نوفمبر", "9"];

export default async function AdvertiserPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const adv = getAdvertiser(id);
  const own = (await getAds()).filter((a) => a.advertiserId === adv.id);
  const mix = [
    { title: "نوع الكرييتيف", parts: [["فيديو", 72], ["صورة", 19], ["كاروسيل", 9]] },
    { title: "زرار الإعلان", parts: [["اطلب دلوقتي", 64], ["ابعت رسالة", 28], ["اعرف أكتر", 8]] },
    { title: "مدة الفيديو", parts: [["أقل من 15 ث", 22], ["15 لـ 45 ث", 61], ["أكتر من 45 ث", 17]] },
  ] as const;
  return (
    <>
      <Card className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-[72px] w-[72px] rounded-full bg-thumb" />
          <div className="flex flex-col gap-1">
            <h1 className="font-display text-[26px] font-bold">{adv.name}</h1>
            <span className="text-sm text-muted">{adv.category} · {adv.followers} متابع · بيعلن من {adv.since}</span>
            <span className="text-[13px]"><span dir="ltr" className="text-blue-700">{adv.domain}</span> · {adv.platform}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="h-11 rounded-[10px] bg-lime px-4 text-[15px] font-bold text-ink">تابع ونبهني</button>
          <button className="h-11 rounded-[10px] border border-line-2 bg-white px-4 text-[15px] font-semibold">قارن بمنافس</button>
        </div>
      </Card>

      <section className="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-3">
        <Stat label="إعلانات شغالة" value={adv.activeAds} />
        <Stat label="إجمالي الإعلانات" value={adv.totalAds} />
        <Stat label="متوسط أيام التشغيل" value={adv.avgDays} />
        <Stat label="منتجات بيعلن عنها" value={adv.products} />
        <Stat label="صفحات هبوط" value={adv.landings} />
      </section>

      <Card className="flex flex-col gap-3.5">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <H2>الإعلانات الجديدة كل أسبوع</H2>
          <span className="text-[13px] text-muted">آخر 4 أسابيع باللون الأخضر</span>
        </div>
        <Bars values={adv.weekly} labels={weekLabels} highlightFrom={8} height={220} />
      </Card>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-5">
        <Card className="flex flex-col gap-2.5">
          <H2>أقوى منتجاته</H2>
          {own.length === 0 && <p className="text-sm text-muted">مفيش منتجات متسجلة لسه.</p>}
          {own.map((p) => (
            <Link key={p.id} href={`/ads/${p.id}`} className="flex items-center gap-3 border-t border-[#F2F4F7] py-2.5">
              <span className="h-11 w-11 shrink-0 rounded-[9px] bg-thumb" />
              <span className="flex flex-1 flex-col"><b className="text-[15px]">{p.product}</b><span className="text-xs text-muted">{p.copies} نسخة · {p.days} يوم</span></span>
              <span className="rounded-lg bg-lime-soft px-2 py-1 font-display font-bold text-lime-text">{p.score}</span>
            </Link>
          ))}
        </Card>
        <Card className="flex flex-col gap-4">
          <H2>بيعلن إزاي</H2>
          {mix.map((m) => (
            <div key={m.title} className="flex flex-col gap-2">
              <b className="text-sm">{m.title}</b>
              {m.parts.map(([label, pct]) => (
                <div key={label} className="grid grid-cols-[110px_minmax(0,1fr)_44px] items-center gap-2.5 text-[13px]">
                  <span>{label}</span>
                  <div className="h-2.5 rounded-full bg-[#F2F4F7]"><div className="h-2.5 rounded-full bg-ink" style={{ width: `${pct}%` }} /></div>
                  <span className="text-left text-muted">{pct}%</span>
                </div>
              ))}
            </div>
          ))}
        </Card>
      </div>

      <Card className="flex flex-col gap-3">
        <H2>الزوايا والهوكات اللي بيكررها</H2>
        <div className="flex flex-wrap gap-2">
          {adv.hooks.map((h) => (
            <span key={h.text} className="rounded-[10px] bg-[#F2F4F7] px-3 py-2 text-sm">{h.text} <b className="text-lime-deep">· {h.n}</b></span>
          ))}
        </div>
      </Card>
    </>
  );
}
