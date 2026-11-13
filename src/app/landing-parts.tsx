"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Plan } from "@/lib/data";

const platforms = [
  ["الكل", "#C8F03C"],
  ["ميتا", "#1877F2"],
  ["تيك توك", "#111111"],
  ["ريلز فيسبوك", "#E1306C"],
  ["بنترست", "#E60023"],
] as const;

export function HeroSearch() {
  const router = useRouter();
  const [p, setP] = useState(0);
  const [q, setQ] = useState("");
  const go = (term: string) => router.push(`/search?q=${encodeURIComponent(term)}`);
  return (
    <div className="flex w-full flex-col items-center gap-4">
      <div role="tablist" aria-label="المنصة" className="flex flex-wrap justify-center gap-2">
        {platforms.map(([label, dot], i) => (
          <button key={label} type="button" role="tab" aria-selected={p === i} onClick={() => setP(i)}
            className={`flex h-[42px] items-center gap-2 rounded-[10px] px-4 text-[15px] ${p === i ? "bg-ink font-bold text-white" : "border border-line-2 bg-white font-semibold"}`}>
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: dot }} />
            {label}
          </button>
        ))}
      </div>
      <form onSubmit={(e) => { e.preventDefault(); go(q); }}
        className="flex w-full max-w-[900px] items-center gap-2 rounded-[18px] border border-line-2 bg-white p-2 shadow-[0_12px_32px_rgba(11,19,36,0.08)]">
        <label htmlFor="hq" className="sr-only">ابحث عن منتج</label>
        <input id="hq" value={q} onChange={(e) => setQ(e.target.value)} placeholder="اسم منتج أو رابط صفحة أو إعلان" className="h-14 min-w-0 flex-1 bg-transparent px-4 text-lg outline-none" />
        <button className="flex h-14 items-center gap-2 rounded-xl bg-lime px-7 text-lg font-bold text-ink">بحث</button>
      </form>
      <div className="flex flex-wrap items-center justify-center gap-2 text-sm text-muted">
        <span>جرّب:</span>
        {["جهاز تدليك", "منظم مطبخ", "مخدة طبية", "كشاف شمسي"].map((t) => (
          <button key={t} type="button" onClick={() => go(t)} className="rounded-full border border-line bg-white px-3 py-1 text-text">{t}</button>
        ))}
      </div>
    </div>
  );
}

const personas = [
  { label: "ميديا باير", headline: "اختبر منتجات أكثر بميزانية أقل", points: ["فيديوهات عالية الجودة دون علامة مائية", "نص الإعلان والزاوية جاهزان", "الحد الأقصى لتكلفة الطلب"], panel: "أسبوعك", rows: [["منتجات مختبرة", "12"], ["إعلانات محمّلة", "48"], ["وقت البحث", "40 دقيقة"], ["أقل سعر مورد", "420 ج.م"]] },
  { label: "صاحب علامة", headline: "تابع منافسيك لحظة بلحظة", points: ["تنبيه بكل إعلان جديد", "متى يزيد المنافس إنفاقه", "العروض والزوايا المتكررة"], panel: "منافسوك اليوم", rows: [["كير شوب", "+12"], ["بيت الراحة", "+9"], ["هوم ستايل مصر", "+7"], ["ستايل ستور", "+9"]] },
  { label: "دروب شيبنج", headline: "منتج ومورد وهامش في دقائق", points: ["موردون دون مخزون", "هامش محسوب من أقل سعر", "صفحات الهبوط الرابحة"], panel: "منتج اليوم", rows: [["سعر البيع", "899 ج.م"], ["أقل سعر مورد", "420 ج.م"], ["الهامش", "53%"], ["مدة التشغيل", "89 يومًا"]] },
  { label: "وكالة", headline: "كل عملائك في حساب واحد", points: ["3 مستخدمين", "متابعة 50 منافسًا", "تصدير Excel"], panel: "العملاء", rows: [["علامة ملابس", "8 منافسين"], ["علامة تجميل", "12 منافسًا"], ["أدوات منزلية", "6 منافسين"], ["عميل جديد", "إضافة"]] },
];

const Check = ({ color }: { color: string }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><polyline points="4,12 10,18 20,6" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>
);

export function Personas() {
  const [i, setI] = useState(0);
  const p = personas[i];
  return (
    <div className="flex flex-col items-center gap-7">
      <div role="tablist" aria-label="من يستخدمه" className="flex flex-wrap justify-center gap-1 rounded-[14px] bg-[#F2F4F7] p-1.5">
        {personas.map((x, k) => (
          <button key={x.label} type="button" role="tab" aria-selected={i === k} onClick={() => setI(k)}
            className={`h-11 rounded-[10px] px-5 text-[15px] ${i === k ? "bg-white font-bold shadow-sm" : "font-semibold text-muted"}`}>{x.label}</button>
        ))}
      </div>
      <div className="grid w-full grid-cols-1 items-center gap-6 rounded-3xl bg-ink p-8 text-white md:grid-cols-2 md:p-10">
        <div className="flex flex-col gap-4">
          <span className="text-[15px] font-bold text-lime">{p.label}</span>
          <h3 className="font-display text-3xl font-bold leading-snug">{p.headline}</h3>
          <div className="flex flex-col gap-2.5 text-[15px]">
            {p.points.map((pt) => <span key={pt} className="flex items-center gap-2.5"><Check color="#C8F03C" />{pt}</span>)}
          </div>
        </div>
        <div className="flex flex-col gap-2.5 rounded-[18px] bg-ink-2 p-5">
          <span className="text-[13px] text-line-2">{p.panel}</span>
          {p.rows.map(([a, b]) => (
            <div key={a} className="flex justify-between gap-3 rounded-[10px] bg-ink px-3.5 py-3 text-[15px]"><span>{a}</span><b className="text-lime">{b}</b></div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function Pricing({ plans }: { plans: Plan[] }) {
  const [yearly, setYearly] = useState(false);
  return (
    <div className="flex w-full flex-col items-center gap-7">
      <div role="tablist" aria-label="مدة الاشتراك" className="flex gap-1 rounded-xl bg-[#F2F4F7] p-1">
        {[false, true].map((y) => (
          <button key={String(y)} type="button" role="tab" aria-selected={yearly === y} onClick={() => setYearly(y)}
            className={`h-10 rounded-[9px] px-4 text-sm ${yearly === y ? "bg-white font-bold" : "font-semibold text-muted"}`}>
            {y ? <>سنوي <span className="text-[#15803D]">شهران مجانًا</span></> : "شهري"}
          </button>
        ))}
      </div>
      <div className="grid w-full grid-cols-1 gap-5 md:grid-cols-3">
        {plans.map((p) => {
          const dark = p.popular;
          const price = yearly ? Math.round((p.price * 10) / 12) : p.price;
          return (
            <div key={p.id} className={`relative flex flex-col gap-4 rounded-[22px] p-7 ${dark ? "border-2 border-ink bg-ink text-white" : "border border-line bg-white"}`}>
              {dark && <span className="absolute -top-3.5 right-6 rounded-full bg-lime px-3.5 py-1 text-[13px] font-bold text-ink">الأكثر مبيعًا</span>}
              <b className="font-display text-[22px]">{p.name}</b>
              <div className="flex items-baseline gap-2"><span className="font-display text-[46px] font-bold">{price}</span><span className="text-[15px] opacity-80">ج.م / شهريًا</span></div>
              <span className="min-h-5 text-[13px] opacity-80">{yearly ? `${(p.price * 10).toLocaleString("en-US")} ج.م سنويًا` : ""}</span>
              <Link href="/login?mode=up" className={`flex h-[50px] items-center justify-center rounded-xl text-base font-bold ${dark ? "bg-lime text-ink" : "bg-ink text-white"}`}>ابدأ مجانًا</Link>
              <div className="flex flex-col gap-2.5 text-[15px]">
                {p.items.map((it) => <span key={it} className="flex items-center gap-2.5"><Check color={dark ? "#C8F03C" : "#15803D"} />{it}</span>)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
