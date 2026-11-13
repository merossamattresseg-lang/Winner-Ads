import Link from "next/link";
import { notFound } from "next/navigation";
import { FavoriteButton } from "@/components/FavoriteButton";
import { FollowButton } from "@/components/FollowButton";
import { OfferList } from "@/components/OfferList";
import { Card, H2, PlayIcon, TierBadge } from "@/components/ui";
import { getAccess, LIMITS } from "@/lib/access";
import { getAd, getOffers, getScoreSettings } from "@/lib/data";

export default async function AdPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ad = await getAd(decodeURIComponent(id));
  if (!ad) notFound();
  const [access, { offers }, { caps }] = await Promise.all([getAccess(), getOffers(ad.product, 20), getScoreSettings()]);
  const cost = offers.map((o) => o.price).filter((p): p is number => Boolean(p)).sort((a, b) => a - b)[0] ?? null;
  const factors = [
    { label: "مدة التشغيل", pct: Math.min(ad.days / caps.days, 1), note: `${ad.days} يومًا` },
    { label: "نسخ الإعلان", pct: Math.min(ad.copies / caps.copies, 1), note: `${ad.copies} نسخة` },
    { label: "التفاعل", pct: ad.engagement, note: `${ad.views} مشاهدة` },
    { label: "معلنون على المنتج", pct: Math.min(ad.advertisers / caps.advertisers, 1), note: `${ad.advertisers}` },
    { label: "متوفر لدى مورد", pct: offers.length ? 1 : 0, note: offers.length ? "نعم" : "لا" },
  ];
  const stats = [["مدة التشغيل", `${ad.days} يومًا`], ["نسخ الإعلان", ad.copies], ["المشاهدات", ad.views], ["الإعجابات", ad.likes], ["التعليقات", ad.comments], ["المشاركات", ad.shares]];
  return (
    <>
      <Link href="/search" className="text-sm font-semibold text-[#15803D]">العودة للنتائج</Link>
      {ad.sample && <p className="rounded-xl bg-[#FEF0C7] px-4 py-2.5 text-sm font-semibold text-[#93370D]">بيانات تجريبية حتى ربط مصادر البيانات.</p>}
      <div className="flex flex-wrap items-start gap-6">
        <section aria-label="الإعلان" className="flex w-full max-w-[400px] flex-[1_1_320px] flex-col gap-3">
          <div className="relative mx-auto flex aspect-[9/16] max-h-[60vh] w-full items-center justify-center overflow-hidden rounded-2xl bg-thumb md:max-h-none">
            {ad.video ? (
              <video src={ad.video} poster={ad.thumb ?? undefined} controls playsInline className="absolute inset-0 h-full w-full object-cover" />
            ) : ad.thumb ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={ad.thumb} alt="" referrerPolicy="no-referrer" className="absolute inset-0 h-full w-full object-cover" />
            ) : (
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-ink/75"><PlayIcon size={24} /></span>
            )}
          </div>
          {ad.sample ? null : <a href={`/api/download?id=${ad.id}`} className="flex h-12 items-center justify-center rounded-[10px] bg-lime text-[15px] font-bold text-ink">تحميل الإعلان</a>}
          <div className="grid grid-cols-2 gap-2">
            <FavoriteButton adId={ad.id} />
            {ad.advertiserId ? <FollowButton advertiserId={ad.advertiserId} /> : <span />}
            {ad.landing && <a href={ad.landing} target="_blank" rel="noreferrer" className="col-span-2 flex h-11 items-center justify-center rounded-[10px] border border-line-2 bg-white text-sm font-semibold text-text">فتح صفحة الهبوط</a>}
          </div>
        </section>

        <div className="flex min-w-0 flex-[999_1_480px] flex-col gap-4">
          <Card className="flex flex-col gap-4">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2"><TierBadge tier={ad.tier} /><span className="text-[13px] text-muted">{ad.platform} · مصر</span></div>
                <h1 className="font-display text-[26px] font-bold">{ad.product}</h1>
                <span className="text-sm text-muted">
                  {ad.advertiserId ? <Link href={`/advertisers/${ad.advertiserId}`} className="font-bold text-[#15803D]">{ad.page}</Link> : ad.page} · بدأ {ad.start}
                </span>
              </div>
              <div className="flex h-[84px] w-[84px] flex-col items-center justify-center rounded-full border-[5px] border-lime-bar font-display text-2xl font-bold leading-none">
                {ad.score}<span className="font-sans text-[11px] font-medium text-muted">من 100</span>
              </div>
            </div>
            <div className="flex flex-col gap-2.5">
              <h2 className="text-base font-bold">أسباب التقييم</h2>
              {factors.map((f) => (
                <div key={f.label} className="grid grid-cols-[140px_minmax(0,1fr)_80px] items-center gap-3 text-sm">
                  <span>{f.label}</span>
                  <div className="h-2 rounded-full bg-[#F2F4F7]"><div className="h-2 rounded-full bg-lime-bar" style={{ width: `${Math.round(f.pct * 100)}%` }} /></div>
                  <span className="text-left text-muted">{f.note}</span>
                </div>
              ))}
            </div>
          </Card>

          <section className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-3">
            {stats.map(([l, v]) => (
              <div key={String(l)} className="flex flex-col gap-1 rounded-xl border border-line bg-white px-4 py-3.5">
                <span className="text-[13px] text-muted">{l}</span>
                <b className="font-display text-[22px]" dir="ltr">{v}</b>
              </div>
            ))}
          </section>

          {ad.landing && /^https?:\/\//.test(ad.landing) && (
            <Card className="flex flex-col gap-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <H2>صفحة الهبوط</H2>
                <a href={ad.landing} target="_blank" rel="noreferrer" dir="ltr" className="max-w-[60%] truncate text-[13px] text-[#15803D]">{ad.landing.replace(/^https?:\/\//, "")}</a>
              </div>
              {/* لقطة تلقائية للصفحة من خدمة mShots المجانية */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`https://s.wordpress.com/mshots/v1/${encodeURIComponent(ad.landing)}?w=800&h=1200`} alt="لقطة صفحة الهبوط" loading="lazy" className="max-h-[520px] w-full rounded-xl border border-line object-cover object-top" />
            </Card>
          )}

          {ad.copy && (
            <Card className="flex flex-col gap-3">
              <H2>نص الإعلان</H2>
              <p className="whitespace-pre-line text-[15px] leading-8 text-body">{ad.copy}</p>
              {ad.cta !== "-" && <span className="self-start rounded-md bg-[#F2F4F7] px-2.5 py-1 text-[13px]">الزر: {ad.cta}</span>}
            </Card>
          )}

          <Card className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <H2>الموردون</H2>
              <Link href={`/suppliers?q=${encodeURIComponent(ad.product)}`} className="text-sm font-semibold text-[#15803D]">كل النتائج</Link>
            </div>
            <OfferList offers={offers} loggedIn={Boolean(access.userId)} limit={access.subscribed ? 3 : LIMITS.trialSupplierOffers} />
            {cost && ad.sellPrice && access.userId && (
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-[10px] bg-lime-soft px-3.5 py-3 text-sm font-semibold text-lime-text">
                <span>الهامش التقريبي: بيع {ad.sellPrice} ج.م، وتكلفة {cost} ج.م ({Math.round((1 - cost / ad.sellPrice) * 100)}%)</span>
                <Link href={`/calculator?sell=${ad.sellPrice}&cost=${cost}`} className="rounded-lg bg-white px-3 py-1.5 text-text">احسب صافي الربح</Link>
              </div>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}
