import Link from "next/link";
import { notFound } from "next/navigation";
import { FollowButton } from "@/components/FollowButton";
import { getAdvertiser, getAds } from "@/lib/data";
import { fromSlug } from "@/lib/slug";
import { Bars, Card, H2, Stat } from "@/components/ui";

const weekLabels = Array.from({ length: 12 }, (_, i) => new Date(Date.now() - (11 - i) * 7 * 86400000).toLocaleDateString("ar-EG", { day: "numeric", month: "short" }));

export default async function AdvertiserPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const adv = await getAdvertiser(decodeURIComponent(id));
  if (!adv) notFound();
  const all = await getAds({ limit: 300 });
  const own = all.filter((a) => a.advertiserId === adv.id || fromSlug(a.advertiserId) === fromSlug(adv.id)).slice(0, 8);
  const pct = (list: string[]) => {
    const counts = new Map<string, number>();
    list.forEach((x) => counts.set(x, (counts.get(x) ?? 0) + 1));
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3).map(([k, n]) => [k, Math.round((n / Math.max(list.length, 1)) * 100)] as const);
  };
  const mix = [
    { title: "نوع الإعلان", parts: pct(own.map((a) => (a.video ? "فيديو" : "صورة"))) },
    { title: "زر الإعلان", parts: pct(own.map((a) => a.cta || "-")) },
    { title: "المنصة", parts: pct(own.map((a) => a.platform)) },
  ];
  return (
    <>
      <Card className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-[72px] w-[72px] rounded-full bg-thumb" />
          <div className="flex flex-col gap-1">
            <h1 className="font-display text-[26px] font-bold">{adv.name}</h1>
            <span className="text-sm text-muted">{adv.category} · {adv.followers} متابع · يعلن منذ {adv.since}</span>
            <span className="text-[13px]"><span dir="ltr" className="text-blue-700">{adv.domain}</span> · {adv.platform}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <FollowButton advertiserId={adv.id} />
        </div>
      </Card>

      <section className="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-3">
        <Stat label="إعلانات شغالة" value={adv.activeAds} />
        <Stat label="إجمالي الإعلانات" value={adv.totalAds} />
        <Stat label="متوسط أيام التشغيل" value={adv.avgDays} />
        <Stat label="منتجات معلن عنها" value={adv.products} />
        <Stat label="صفحات هبوط" value={adv.landings} />
      </section>

      <Card className="flex flex-col gap-3.5">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <H2>الإعلانات الجديدة أسبوعيًا</H2>
          <span className="text-[13px] text-muted">آخر 4 أسابيع بالأخضر</span>
        </div>
        <Bars values={adv.weekly} labels={weekLabels} highlightFrom={8} height={220} />
      </Card>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-5">
        <Card className="flex flex-col gap-2.5">
          <H2>أقوى إعلاناته</H2>
          {own.length === 0 && <p className="text-sm text-muted">لا توجد إعلانات مسجلة.</p>}
          {own.map((p) => (
            <Link key={p.id} href={`/ads/${p.id}`} className="flex items-center gap-3 border-t border-[#F2F4F7] py-2.5">
              <span className="h-11 w-11 shrink-0 rounded-[9px] bg-thumb" />
              <span className="flex flex-1 flex-col"><b className="text-[15px]">{p.product}</b><span className="text-xs text-muted">{p.copies} نسخة · {p.days} يومًا</span></span>
              <span className="rounded-lg bg-lime-soft px-2 py-1 font-display font-bold text-lime-text">{p.score}</span>
            </Link>
          ))}
        </Card>
        <Card className="flex flex-col gap-4">
          <H2>أسلوب الإعلان</H2>
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

      {adv.hooks.length > 0 && (<Card className="flex flex-col gap-3">
        <H2>الزوايا المتكررة</H2>
        <div className="flex flex-wrap gap-2">
          {adv.hooks.map((h) => (
            <span key={h.text} className="rounded-[10px] bg-[#F2F4F7] px-3 py-2 text-sm">{h.text} <b className="text-lime-deep">· {h.n}</b></span>
          ))}
        </div>
      </Card>)}
    </>
  );
}
