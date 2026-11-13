"use client";
import { useMemo, useState } from "react";
import type { Platform } from "@/lib/mock-data";
import type { ScoredAd } from "@/lib/data";
import { AdCard } from "@/components/AdCard";

const modes = [
  { label: "بالكلمة", hint: "اكتب اسم المنتج، أو سيبها فاضية تشوف الأحدث" },
  { label: "باللينك", hint: "حط لينك صفحة فيسبوك أو متجر أو إعلان" },
  { label: "بالصورة", hint: "ارفع صورة المنتج أو اسحبها هنا" },
];
const platforms: ("الكل" | Platform)[] = ["الكل", "ميتا", "تيك توك", "ريلز فيسبوك", "بنترست"];
const advanced = [
  ["أول ظهور", "2026-08-01", "2026-11-13"],
  ["آخر ظهور", "2026-11-10", "2026-11-13"],
  ["اللايكات", "1000", ""],
  ["الكومنتات", "100", ""],
  ["المشاهدات", "100K", ""],
  ["مدة الفيديو (ثانية)", "10", "60"],
  ["عدد نسخ الإعلان", "3", ""],
  ["متابعين الصفحة", "5K", "500K"],
  ["سعر المنتج في صفحة الهبوط (ج)", "200", "1500"],
];

export function SearchView({ initialQuery, ads }: { initialQuery: string; ads: ScoredAd[] }) {
  const [mode, setMode] = useState(0);
  const [platform, setPlatform] = useState<(typeof platforms)[number]>("الكل");
  const [query, setQuery] = useState(initialQuery);
  const [minDays, setMinDays] = useState(0);
  const [tier, setTier] = useState("الكل");

  const results = useMemo(() => {
    const q = query.trim();
    return ads.filter(
      (a) =>
        (platform === "الكل" || a.platform === platform) &&
        a.days >= minDays &&
        (tier === "الكل" || a.tier === tier) &&
        (!q || mode !== 0 || a.product.includes(q) || a.copy.includes(q) || a.page.includes(q)),
    );
  }, [ads, query, platform, minDays, tier, mode]);

  const counts = {
    super: results.filter((a) => a.tier === "super").length,
    winner: results.filter((a) => a.tier === "winner").length,
    testing: results.filter((a) => a.tier === "testing").length,
  };

  return (
    <>
      <section className="flex flex-col gap-4 rounded-[18px] bg-ink p-6">
        <div role="tablist" aria-label="طريقة البحث" className="flex flex-wrap gap-1.5">
          {modes.map((m, i) => (
            <button key={m.label} type="button" role="tab" aria-selected={mode === i} onClick={() => setMode(i)}
              className={`h-10 rounded-[10px] px-4 text-sm ${mode === i ? "bg-white font-bold text-ink" : "border border-ink-3 font-semibold text-line-2"}`}>
              {m.label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2.5">
          <label htmlFor="term" className="sr-only">كلمة البحث</label>
          <input id="term" type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={modes[mode].hint}
            className="h-[54px] min-w-0 flex-[1_1_320px] rounded-xl bg-white px-4 text-[17px] text-text" />
          <button type="button" className="h-[54px] rounded-xl bg-lime px-7 text-[17px] font-bold text-ink">دوّر</button>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[13px] text-line-2">المنصة:</span>
          {platforms.map((p) => (
            <button key={p} type="button" aria-pressed={platform === p} onClick={() => setPlatform(p)}
              className={`h-[34px] rounded-lg px-3.5 text-[13px] ${platform === p ? "bg-lime font-bold text-ink" : "border border-ink-3 font-semibold text-white"}`}>
              {p}
            </button>
          ))}
        </div>
      </section>

      <section aria-label="الفلاتر" className="flex flex-wrap items-end gap-3">
        <label className="flex flex-[1_1_150px] flex-col gap-1.5 text-[13px] text-muted">
          <span>أيام التشغيل</span>
          <select value={minDays} onChange={(e) => setMinDays(Number(e.target.value))} className="h-[42px] rounded-[10px] border border-line-2 bg-white px-2.5 text-sm font-semibold text-text">
            <option value={0}>أي مدة</option>
            <option value={7}>أكتر من 7 أيام</option>
            <option value={30}>أكتر من 30 يوم</option>
            <option value={60}>أكتر من 60 يوم</option>
          </select>
        </label>
        <label className="flex flex-[1_1_150px] flex-col gap-1.5 text-[13px] text-muted">
          <span>التصنيف</span>
          <select value={tier} onChange={(e) => setTier(e.target.value)} className="h-[42px] rounded-[10px] border border-line-2 bg-white px-2.5 text-sm font-semibold text-text">
            <option value="الكل">الكل</option>
            <option value="super">رابح مؤكد</option>
            <option value="winner">رابح</option>
            <option value="testing">قيد الاختبار</option>
          </select>
        </label>
        {[["الدولة", "مصر"], ["نوع الكرييتيف", "فيديو وصورة"], ["زرار الإعلان", "اطلب دلوقتي"], ["الترتيب", "أعلى سكور"]].map(([l, v]) => (
          <label key={l} className="flex flex-[1_1_150px] flex-col gap-1.5 text-[13px] text-muted">
            <span>{l}</span>
            <select className="h-[42px] rounded-[10px] border border-line-2 bg-white px-2.5 text-sm font-semibold text-text"><option>{v}</option></select>
          </label>
        ))}
      </section>

      <details className="rounded-[14px] border border-line bg-white px-4 py-4">
        <summary className="cursor-pointer text-[15px] font-bold">فلاتر متقدمة</summary>
        <div className="mt-3.5 grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-3.5">
          {advanced.map(([label, from, to]) => (
            <fieldset key={label} className="flex flex-col gap-1.5 rounded-[10px] border border-line px-3 py-2.5">
              <legend className="px-1 text-[13px] text-muted">{label}</legend>
              <div className="flex gap-2">
                <input aria-label={`${label} من`} defaultValue={from} className="h-9 min-w-0 flex-1 rounded-lg border border-line-2 px-2 text-sm" />
                <input aria-label={`${label} لحد`} defaultValue={to} className="h-9 min-w-0 flex-1 rounded-lg border border-line-2 px-2 text-sm" />
              </div>
            </fieldset>
          ))}
        </div>
        <div className="mt-3.5 flex flex-wrap items-center gap-2.5 text-sm">
          <span className="text-[13px] text-muted">منصة المتجر:</span>
          {["Shopify", "EasyOrders", "YouCan", "WooCommerce"].map((s, i) => (
            <label key={s} className="flex gap-1.5"><input type="checkbox" defaultChecked={i < 2} />{s}</label>
          ))}
          <label className="ms-4 flex gap-1.5"><input type="checkbox" defaultChecked />اخفي الإعلانات المكررة</label>
          <button type="button" className="ms-auto h-[38px] rounded-[9px] border border-line-2 bg-white px-3.5 font-semibold">احفظ البحث ونبهني بالجديد</button>
        </div>
      </details>

      <div className="flex flex-wrap items-center gap-2">
        <b className="text-base">{results.length} إعلان</b>
        <span className="rounded-full bg-ink px-3 py-1 text-[13px] font-bold text-lime">رابح مؤكد {counts.super}</span>
        <span className="rounded-full border border-lime-line bg-lime-soft px-3 py-1 text-[13px] font-bold text-lime-text">رابح {counts.winner}</span>
        <span className="rounded-full border border-line-2 bg-[#F2F4F7] px-3 py-1 text-[13px] font-semibold text-body">قيد الاختبار {counts.testing}</span>
      </div>

      {results.length ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-4">
          {results.map((a) => <AdCard key={a.id} ad={a} />)}
        </div>
      ) : (
        <p className="rounded-2xl border border-line bg-white p-8 text-center text-muted">مفيش نتايج بالفلاتر دي. جرب تقلل أيام التشغيل أو تغير المنصة.</p>
      )}
    </>
  );
}
