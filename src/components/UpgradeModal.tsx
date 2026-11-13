"use client";
import Link from "next/link";

// تظهر عند انتهاء النقاط أو التجربة، أو عند الضغط على نتائج مقفولة.
export function UpgradeModal({ open, onClose, reason }: { open: boolean; onClose: () => void; reason?: string }) {
  if (!open) return null;
  const plans = [["basic", "أساسي", 399], ["pro", "برو", 599], ["agency", "وكالات", 999]] as const;
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-ink/55 px-4 pt-24" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label="الترقية" onClick={(e) => e.stopPropagation()} className="relative flex w-full max-w-[600px] flex-col gap-4 rounded-[22px] bg-white p-7">
        <button type="button" onClick={onClose} aria-label="إغلاق" className="absolute left-4 top-4 h-9 w-9 rounded-full bg-[#F2F4F7] text-lg">×</button>
        <span className="self-start rounded-full bg-lime-soft px-3 py-1 text-[13px] font-bold text-lime-text">خصم 20% على الشهر الأول</span>
        <h2 className="font-display text-2xl font-bold leading-snug">{reason ?? "اشترك لعرض جميع النتائج والموردين"}</h2>
        <div className="grid grid-cols-3 gap-2.5">
          {plans.map(([id, name, price]) => (
            <Link key={id} href={`/pricing?plan=${id}&coupon=WIN20`} className={`flex flex-col gap-1 rounded-2xl p-3.5 ${id === "pro" ? "border-2 border-[#15803D] bg-[#F3F9F4]" : "border border-line"}`}>
              <b>{name}</b>
              <span className="text-[13px] text-muted line-through">{price} ج.م</span>
              <span className="font-display text-xl font-bold">{Math.round(price * 0.8)} ج.م</span>
            </Link>
          ))}
        </div>
        <Link href="/pricing?coupon=WIN20" className="flex h-[52px] items-center justify-center rounded-xl bg-lime text-[17px] font-bold text-ink">عرض الباقات</Link>
        <span className="text-center text-[13px] text-muted">بطاقة · محفظة · Apple Pay · ضمان استرداد 7 أيام</span>
      </div>
    </div>
  );
}
