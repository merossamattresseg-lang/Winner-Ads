"use client";
import { useState } from "react";

export type ProfitDefaults = { shipping: number; returnRate: number; returnCost: number; packaging: number; targetMargin: number };

const fmt = (n: number) => `${Math.round(n).toLocaleString("en-US")} ج`;

export function Calculator({ defaults, sell: sell0, cost: cost0 }: { defaults: ProfitDefaults; sell: number; cost: number }) {
  const [v, setV] = useState({ sell: sell0, cost: cost0, cpa: 120, ...defaults });
  const set = (k: keyof typeof v) => (e: React.ChangeEvent<HTMLInputElement>) => setV({ ...v, [k]: Number(e.target.value) || 0 });

  // كل الأرقام محسوبة لكل أوردر بيتطلب (مش لكل أوردر بيتسلم)، عشان تقارنها بتكلفة الأوردر في الإعلانات.
  const delivered = 1 - Math.min(v.returnRate, 100) / 100;
  const beforeAds = delivered * (v.sell - v.cost) - v.shipping - (v.returnRate / 100) * v.returnCost - v.packaging;
  const maxCpa = beforeAds;
  const targetCpa = beforeAds - (v.targetMargin / 100) * delivered * v.sell;
  const net = beforeAds - v.cpa;
  const roasBreakeven = maxCpa > 0 ? (delivered * v.sell) / maxCpa : null;

  const fields: [keyof typeof v, string][] = [
    ["sell", "سعر البيع (ج)"],
    ["cost", "سعر المورد (ج)"],
    ["shipping", "الشحن لكل أوردر (ج)"],
    ["packaging", "التغليف (ج)"],
    ["returnRate", "نسبة المرتجع (%)"],
    ["returnCost", "تكلفة المرتجع الواحد (ج)"],
    ["targetMargin", "هامش الربح المطلوب (%)"],
    ["cpa", "تكلفة الأوردر في الإعلانات (ج)"],
  ];

  return (
    <div className="flex flex-wrap items-start gap-5">
      <form className="grid min-w-0 flex-[999_1_480px] grid-cols-1 gap-3.5 rounded-2xl border border-line bg-white p-5 sm:grid-cols-2" onSubmit={(e) => e.preventDefault()}>
        {fields.map(([k, label]) => (
          <label key={k} className="flex flex-col gap-1.5 text-sm font-semibold">
            {label}
            <input type="number" inputMode="decimal" min={0} value={v[k]} onChange={set(k)} className="h-12 rounded-[10px] border border-line-2 px-3.5 text-base font-normal" />
          </label>
        ))}
      </form>
      <aside className="flex min-w-0 flex-[1_1_320px] flex-col gap-3">
        <div className={`rounded-2xl p-5 ${net >= 0 ? "bg-ink text-white" : "bg-[#FEE4E2] text-[#912018]"}`}>
          <span className={`text-sm ${net >= 0 ? "text-line-2" : ""}`}>صافي ربحك لكل أوردر</span>
          <b className={`mt-1 block font-display text-4xl ${net >= 0 ? "text-lime" : ""}`}>{fmt(net)}</b>
          <span className={`mt-1 block text-sm ${net >= 0 ? "text-line-2" : ""}`}>{net >= 0 ? "بالتكلفة دي إنت كسبان" : "بالتكلفة دي إنت خسران، قلل تكلفة الأوردر أو زود السعر"}</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-line bg-white p-4"><span className="text-[13px] text-muted">أقصى تكلفة أوردر من غير خسارة</span><b className="mt-1 block font-display text-2xl">{fmt(maxCpa)}</b></div>
          <div className="rounded-xl border border-line bg-white p-4"><span className="text-[13px] text-muted">تكلفة الأوردر عشان توصل لهامشك</span><b className="mt-1 block font-display text-2xl">{fmt(targetCpa)}</b></div>
          <div className="rounded-xl border border-line bg-white p-4"><span className="text-[13px] text-muted">الربح قبل الإعلانات</span><b className="mt-1 block font-display text-2xl">{fmt(beforeAds)}</b></div>
          <div className="rounded-xl border border-line bg-white p-4"><span className="text-[13px] text-muted">أقل ROAS من غير خسارة</span><b className="mt-1 block font-display text-2xl" dir="ltr">{roasBreakeven ? roasBreakeven.toFixed(2) : "-"}</b></div>
        </div>
        <p className="text-[13px] leading-6 text-muted">الحساب لكل أوردر بيتطلب. المرتجع بيرجع المنتج المخزن، وبتدفع الشحن وتكلفة المرتجع بس.</p>
      </aside>
    </div>
  );
}
