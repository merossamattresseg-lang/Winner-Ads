import Link from "next/link";
import type { Metadata } from "next";
import { PublicFooter, PublicHeader } from "@/components/PublicChrome";
import { getAds } from "@/lib/data";

export const revalidate = 3600;

function weekRange() {
  const now = new Date();
  const start = new Date(now);
  start.setDate(now.getDate() - ((now.getDay() + 1) % 7));
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  const f = (d: Date) => d.toLocaleDateString("ar-EG", { day: "numeric", month: "long" });
  return `${f(start)} إلى ${f(end)} ${end.getFullYear()}`;
}

export const metadata: Metadata = {
  title: "أكثر المنتجات ربحًا في مصر هذا الأسبوع",
  description: "قائمة أسبوعية بأكثر المنتجات ربحًا في إعلانات ميتا وتيك توك في مصر، مع مدة التشغيل وعدد المعلنين.",
};

const tints = ["#E8F1FB", "#F4ECE4", "#EEF0F6", "#F7E9EE", "#FFF4DB", "#EAF5EF", "#EFEDF6", "#F1F3F5"];

export default async function TopPage() {
  const ads = (await getAds()).slice(0, 10);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "أكثر المنتجات ربحًا في مصر هذا الأسبوع",
    itemListElement: ads.slice(0, 5).map((a, i) => ({ "@type": "ListItem", position: i + 1, name: a.product })),
  };
  return (
    <div className="bg-white">
      <PublicHeader />
      <main className="mx-auto flex max-w-[1160px] flex-col gap-6 px-6 py-6">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <div>
          <span className="text-sm text-muted">{weekRange()}</span>
          <h1 className="mt-1.5 font-display text-3xl font-bold md:text-[40px]">أكثر 10 منتجات ربحًا في مصر هذا الأسبوع</h1>
        </div>
        <ol className="flex flex-col gap-2.5">
          {ads.map((a, i) => (
            <li key={a.id} className="relative flex items-center gap-4 overflow-hidden rounded-[14px] border border-line px-4 py-3">
              <span className="w-8 font-display text-2xl font-bold text-[#98A2B3]">{i + 1}</span>
              <span className="h-16 w-16 shrink-0 rounded-[10px]" style={{ background: tints[i % tints.length] }} />
              <span className="flex flex-1 flex-col"><b className="text-[17px]">{a.product}</b><span className="text-[13px] text-muted">{a.platform} · {a.days} يومًا · {a.advertisers} معلنين</span></span>
              <span className="font-display text-[22px] font-bold">{a.score}</span>
              {i >= 5 && <Link href="/login?mode=up" className="absolute inset-0 flex items-center justify-center bg-white/80 text-[15px] font-bold backdrop-blur-sm">سجّل مجانًا لعرض المنتج</Link>}
            </li>
          ))}
        </ol>
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-[18px] border border-[#CDE7D4] bg-[#F3F9F4] p-6">
          <b className="font-display text-[22px]">اعرض الموردين والإعلانات الكاملة</b>
          <Link href="/login?mode=up" className="flex h-12 items-center rounded-xl bg-lime px-6 font-bold text-ink">ابدأ مجانًا</Link>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
