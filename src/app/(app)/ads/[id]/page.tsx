import Link from "next/link";
import { notFound } from "next/navigation";
import { ads, cheapestCost, offersFor } from "@/lib/mock-data";
import { getAds, getScoreSettings } from "@/lib/data";
import { FavoriteButton } from "@/components/FavoriteButton";
import { Card, H2, PlayIcon, TierBadge } from "@/components/ui";

export function generateStaticParams() {
  return ads.map((a) => ({ id: a.id }));
}

export default async function AdPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ad = (await getAds()).find((a) => a.id === id);
  if (!ad) notFound();
  const offers = offersFor(ad.id);
  const cost = cheapestCost(ad.id);
  const { caps } = await getScoreSettings();
  const factors = [
    { label: "أيام التشغيل", pct: Math.min(ad.days / caps.days, 1), note: `${ad.days} يوم` },
    { label: "نسخ نفس الكرييتيف", pct: Math.min(ad.copies / caps.copies, 1), note: `${ad.copies} نسخة` },
    { label: "التفاعل", pct: ad.engagement, note: `${ad.views} مشاهدة` },
    { label: "معلنين على نفس المنتج", pct: Math.min(ad.advertisers / caps.advertisers, 1), note: `${ad.advertisers} صفحات` },
    { label: "متاح عند مورد", pct: ad.suppliers ? 1 : 0, note: ad.suppliers ? "أيوه" : "لأ" },
  ];
  const stats = [
    ["أيام التشغيل", ad.days],
    ["نسخ الإعلان", ad.copies],
    ["المشاهدات", ad.views],
    ["اللايكات", ad.likes],
    ["الكومنتات", ad.comments],
    ["الشير", ad.shares],
  ];
  return (
    <>
      <Link href="/search" className="text-sm font-semibold text-blue-700">رجوع للنتايج</Link>
      <div className="flex flex-wrap items-start gap-6">
        <section aria-label="الكرييتيف" className="flex w-full max-w-[400px] flex-[1_1_320px] flex-col gap-3">
          <div className="relative flex aspect-[9/16] items-center justify-center rounded-2xl bg-thumb text-[15px] text-muted">
            فيديو الإعلان 9:16
            <span className="absolute flex h-16 w-16 items-center justify-center rounded-full bg-ink/75"><PlayIcon size={24} /></span>
          </div>
          <button className="h-12 rounded-[10px] bg-lime text-[15px] font-bold text-ink">تحميل الفيديو بجودة عالية</button>
          <div className="grid grid-cols-2 gap-2">
            <FavoriteButton adId={ad.id} />
            <button className="h-11 rounded-[10px] border border-line-2 bg-white text-sm font-semibold">تفريغ الكلام</button>
            <a href="https://www.facebook.com/ads/library/" target="_blank" rel="noreferrer" className="col-span-2 flex h-11 items-center justify-center rounded-[10px] border border-line-2 bg-white text-sm font-semibold text-text">افتح في مكتبة إعلانات ميتا</a>
          </div>
        </section>

        <div className="flex min-w-0 flex-[999_1_480px] flex-col gap-4">
          <Card className="flex flex-col gap-4">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2"><TierBadge tier={ad.tier} /><span className="text-[13px] text-muted">{ad.platform} · مصر</span></div>
                <h1 className="font-display text-[26px] font-bold">{ad.product}</h1>
                <span className="text-sm text-muted">صفحة <Link href={`/advertisers/${ad.advertiserId}`} className="font-bold text-blue-700">{ad.page}</Link> · بدأ {ad.start} · لسه شغال</span>
              </div>
              <div className="flex h-[84px] w-[84px] flex-col items-center justify-center rounded-full border-[5px] border-lime-bar font-display text-2xl font-bold leading-none">
                {ad.score}<span className="font-sans text-[11px] font-medium text-muted">من 100</span>
              </div>
            </div>
            <div className="flex flex-col gap-2.5">
              <h2 className="text-base font-bold">ليه السكور {ad.score}؟</h2>
              {factors.map((f) => (
                <div key={f.label} className="grid grid-cols-[150px_minmax(0,1fr)_90px] items-center gap-3 text-sm">
                  <span>{f.label}</span>
                  <div className="h-2 rounded-full bg-[#F2F4F7]"><div className="h-2 rounded-full bg-lime-bar" style={{ width: `${Math.round(f.pct * 100)}%` }} /></div>
                  <span className="text-left text-muted">{f.note}</span>
                </div>
              ))}
            </div>
          </Card>

          <section className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-3">
            {stats.map(([l, v]) => (
              <div key={l} className="flex flex-col gap-1 rounded-xl border border-line bg-white px-4 py-3.5">
                <span className="text-[13px] text-muted">{l}</span>
                <b className="font-display text-[22px]" dir="ltr">{v}</b>
              </div>
            ))}
          </section>

          <Card className="flex flex-col gap-3">
            <div className="flex items-center justify-between"><H2>نص الإعلان</H2></div>
            <p className="whitespace-pre-line text-[15px] leading-8 text-body">{ad.copy}</p>
            <div className="flex flex-wrap gap-2 text-[13px]">
              <span className="rounded-md bg-[#F2F4F7] px-2.5 py-1">زرار: {ad.cta}</span>
              <span className="rounded-md bg-[#F2F4F7] px-2.5 py-1">الزاوية: {ad.angle}</span>
            </div>
          </Card>

          <Card className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <H2>صفحة الهبوط</H2>
              <span dir="ltr" className="text-[13px] text-blue-700">{ad.landing}</span>
            </div>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(120px,1fr))] gap-2.5">
              {["أول الصفحة", "المميزات", "آراء العملاء", "فورم الطلب"].map((s) => (
                <div key={s} className="flex h-48 items-center justify-center rounded-[10px] bg-thumb text-[13px] text-muted">{s}</div>
              ))}
            </div>
            <span className="text-[13px] text-muted">السعر على الصفحة: {ad.sellPrice} ج</span>
          </Card>

          <Card className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <H2>موردين عندهم المنتج</H2>
              <Link href={`/suppliers?product=${ad.id}`} className="text-sm font-semibold text-blue-700">كل النتايج</Link>
            </div>
            {offers.length === 0 && <p className="py-3 text-sm text-muted">لسه ملقيناش مورد للمنتج ده. هنبلغك أول ما يظهر.</p>}
            {offers.slice(0, 3).map((s) => (
              <div key={s.id} className="flex flex-wrap items-center gap-3.5 border-t border-[#F2F4F7] py-3">
                <div className="h-14 w-14 shrink-0 rounded-[10px] bg-thumb" />
                <div className="flex min-w-0 flex-[1_1_200px] flex-col gap-0.5">
                  <b className="text-[15px]">{s.channel}</b>
                  <span className="text-[13px] text-muted">{s.text}</span>
                  <span className="text-xs text-muted">{s.when} · تطابق الصورة {s.match}%</span>
                </div>
                <b className="whitespace-nowrap text-lg">{s.price} ج</b>
                <a href="https://wa.me/" target="_blank" rel="noreferrer" className="flex h-10 items-center rounded-[9px] bg-ink px-4 text-sm font-semibold text-white">واتساب</a>
              </div>
            ))}
            {cost && (
              <div className="mt-2 flex flex-wrap items-center justify-between gap-2 rounded-[10px] bg-lime-soft px-3.5 py-3 text-sm font-semibold text-lime-text">
                <span>هامش الربح التقريبي: بيع {ad.sellPrice} ج، وتكلفة {cost} ج من أرخص مورد ({Math.round((1 - cost / ad.sellPrice) * 100)}%)</span>
                <Link href={`/calculator?sell=${ad.sellPrice}&cost=${cost}`} className="rounded-lg bg-white px-3 py-1.5 text-text">احسب الربح الصافي</Link>
              </div>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}
