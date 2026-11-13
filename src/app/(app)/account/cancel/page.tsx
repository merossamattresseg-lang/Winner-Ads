"use client";
import Link from "next/link";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { waLink } from "@/lib/site";

const reasons = ["السعر مرتفع", "لم أجد منتجات مناسبة", "سأتوقف عن الإعلان مؤقتًا", "أستخدم أداة أخرى", "سبب آخر"];
const offers = [
  { id: "discount_30", title: "خصم 30% لثلاثة أشهر", text: "يُطبق على التجديد القادم.", cta: "تطبيق الخصم" },
  { id: "setup_call", title: "جلسة إعداد مجانية", text: "نحدد معك أقسامك ومنافسيك خلال 15 دقيقة.", cta: "احجز عبر واتساب" },
  { id: "pause_month", title: "تجميد الاشتراك شهرًا", text: "تحتفظ بمحفوظاتك ونقاطك دون دفع.", cta: "تجميد شهر" },
  { id: "discount_30", title: "خصم 30% لثلاثة أشهر", text: "يُطبق على التجديد القادم.", cta: "تطبيق الخصم" },
  { id: "contact", title: "هل يمكننا المساعدة؟", text: "أخبرنا بما تحتاجه.", cta: "تواصل معنا" },
];

export default function CancelPage() {
  const [reason, setReason] = useState(0);
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [busy, setBusy] = useState(false);
  const offer = offers[reason];

  async function submit(accept: boolean) {
    setBusy(true);
    const sb = createClient();
    const { error } = await sb.rpc("cancel_my_subscription", { p_reason: reasons[reason], p_offer: offer.id, p_accept: accept });
    setBusy(false);
    if (error) return alertStep();
    if (accept && (offer.id === "setup_call" || offer.id === "contact")) window.open(waLink(`طلب: ${offer.title}`), "_blank");
    setStep(accept ? 4 : 3);
  }
  const alertStep = () => setStep(1);

  return (
    <div className="mx-auto w-full max-w-[560px] rounded-[22px] border border-line bg-white p-7">
      {step === 1 && (
        <div className="flex flex-col gap-4">
          <h1 className="font-display text-2xl font-bold">ما سبب الإلغاء؟</h1>
          <div className="flex flex-col gap-2">
            {reasons.map((r, i) => (
              <button key={r} type="button" onClick={() => setReason(i)} aria-pressed={reason === i}
                className={`h-12 rounded-xl px-3.5 text-right text-[15px] font-semibold ${reason === i ? "border-2 border-[#15803D] bg-[#F3F9F4]" : "border border-line"}`}>{r}</button>
            ))}
          </div>
          <div className="flex justify-between">
            <Link href="/account" className="flex h-[46px] items-center rounded-[10px] border border-line-2 px-4 font-semibold">رجوع</Link>
            <button type="button" onClick={() => setStep(2)} className="h-[46px] rounded-[10px] bg-ink px-5 font-bold text-white">متابعة</button>
          </div>
        </div>
      )}
      {step === 2 && (
        <div className="flex flex-col gap-4">
          <h1 className="font-display text-2xl font-bold">{offer.title}</h1>
          <p className="text-[15px] text-muted">{offer.text}</p>
          <button type="button" disabled={busy} onClick={() => submit(true)} className="h-[50px] rounded-xl bg-lime font-bold text-ink disabled:opacity-60">{offer.cta}</button>
          <button type="button" disabled={busy} onClick={() => submit(false)} className="h-[46px] rounded-[10px] font-semibold text-[#912018] disabled:opacity-60">تأكيد الإلغاء</button>
        </div>
      )}
      {step === 3 && (
        <div className="flex flex-col gap-4">
          <h1 className="font-display text-2xl font-bold">تم إيقاف التجديد</h1>
          <p className="text-[15px] text-muted">يبقى اشتراكك فعالًا حتى نهاية الفترة المدفوعة.</p>
          <Link href="/account" className="flex h-[46px] items-center justify-center rounded-[10px] bg-ink font-bold text-white">العودة للحساب</Link>
        </div>
      )}
      {step === 4 && (
        <div className="flex flex-col gap-4">
          <h1 className="font-display text-2xl font-bold">تم تسجيل طلبك</h1>
          <p className="text-[15px] text-muted">سنتواصل معك لتأكيد التفاصيل. اشتراكك مستمر.</p>
          <Link href="/account" className="flex h-[46px] items-center justify-center rounded-[10px] bg-ink font-bold text-white">العودة للحساب</Link>
        </div>
      )}
    </div>
  );
}
