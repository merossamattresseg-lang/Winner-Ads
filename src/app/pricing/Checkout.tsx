"use client";
import { useState } from "react";
import type { Plan } from "@/lib/data";

const methods = [
  { id: "card", label: "كارت" },
  { id: "wallet", label: "محفظة" },
  { id: "apple", label: "Apple Pay" },
] as const;

type PixelCtor = new (opts: Record<string, unknown>) => unknown;

function loadPixel(src: string) {
  return new Promise<void>((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) return resolve();
    const s = document.createElement("script");
    s.src = src;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("pixel_load"));
    document.head.appendChild(s);
  });
}

export function Checkout({ paymentsReady, plans }: { paymentsReady: boolean; plans: Plan[] }) {
  const [planId, setPlanId] = useState(plans.find((p) => p.popular)?.id ?? plans[0]?.id);
  const [method, setMethod] = useState<(typeof methods)[number]["id"]>("card");
  const [status, setStatus] = useState<"idle" | "loading" | "pixel" | "error">("idle");
  const [message, setMessage] = useState("");
  const plan = plans.find((p) => p.id === planId) ?? plans[0];

  async function startPayment(form: FormData) {
    setStatus("loading");
    setMessage("");
    const res = await fetch("/api/paymob/intention", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planId, method, name: form.get("name"), email: form.get("email"), phone: form.get("phone") }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.status === 401) {
      window.location.href = "/login?next=/pricing";
      return;
    }
    if (!res.ok) {
      setStatus("error");
      setMessage(data.message ?? "حصلت مشكلة، جرب تاني");
      return;
    }
    try {
      const src = process.env.NEXT_PUBLIC_PAYMOB_PIXEL_SRC;
      if (!src) throw new Error("pixel_src");
      await loadPixel(src);
      const Pixel = (window as unknown as { Pixel?: PixelCtor }).Pixel;
      if (!Pixel) throw new Error("pixel_missing");
      new Pixel({
        publicKey: data.publicKey,
        clientSecret: data.clientSecret,
        paymentMethods: method === "apple" ? ["apple-pay"] : method === "wallet" ? ["wallet"] : ["card"],
        elementId: "paymob-pixel",
        disablePay: false,
        afterPaymentComplete: () => (window.location.href = "/pricing?status=done"),
      });
      setStatus("pixel");
    } catch {
      setStatus("error");
      setMessage("مقدرناش نفتح خانات الدفع، كلمنا على واتساب");
    }
  }

  return (
    <>
      <div role="radiogroup" aria-label="الباقات" className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-4">
        {plans.map((p) => {
          const on = p.id === planId;
          return (
            <button key={p.id} type="button" role="radio" aria-checked={on} onClick={() => setPlanId(p.id)}
              className={`flex flex-col gap-3.5 rounded-[18px] p-6 text-right ${on ? "border-2 border-lime bg-ink text-white" : "border border-line bg-white text-text"}`}>
              <span className="flex w-full items-center justify-between">
                <b className="font-display text-xl">{p.name}</b>
                {p.popular && <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${on ? "bg-lime text-ink" : "bg-ink text-lime"}`}>الأكثر مبيعا</span>}
              </span>
              <span className="font-display text-3xl font-bold">{p.price} <span className={`text-[15px] font-medium ${on ? "text-line-2" : "text-muted"}`}>ج في الشهر</span></span>
              <span className={`text-sm ${on ? "text-line-2" : "text-muted"}`}>{p.who}</span>
              <span className="flex flex-col gap-2 text-sm">
                {p.items.map((it) => (
                  <span key={it} className="flex items-center gap-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><polyline points="4,12 10,18 20,6" fill="none" stroke={on ? "#C8F03C" : "#3F6212"} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    {it}
                  </span>
                ))}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap items-start gap-5">
        <form action={startPayment} aria-label="الدفع" className="flex min-w-0 flex-[999_1_480px] flex-col gap-4 rounded-[18px] border border-line bg-white p-6">
          <h2 className="font-display text-xl font-bold">ادفع إزاي؟</h2>
          <div role="tablist" aria-label="طريقة الدفع" className="grid grid-cols-3 gap-2">
            {methods.map((m) => (
              <button key={m.id} type="button" role="tab" aria-selected={method === m.id} onClick={() => setMethod(m.id)}
                className={`h-12 rounded-[10px] bg-white text-sm ${method === m.id ? "border-2 border-ink font-bold text-ink" : "border border-line-2 font-semibold text-muted"}`}>
                {m.label}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <label className="flex flex-col gap-1.5 text-sm font-semibold">الاسم<input name="name" required className="h-12 rounded-[10px] border border-line-2 px-3.5 font-normal" /></label>
            <label className="flex flex-col gap-1.5 text-sm font-semibold">الإيميل<input name="email" type="email" required dir="ltr" className="h-12 rounded-[10px] border border-line-2 px-3.5 font-normal" /></label>
            <label className="flex flex-col gap-1.5 text-sm font-semibold">الموبايل<input name="phone" type="tel" required dir="ltr" placeholder="01xxxxxxxxx" className="h-12 rounded-[10px] border border-line-2 px-3.5 font-normal" /></label>
          </div>

          <div id="paymob-pixel" className={status === "pixel" ? "min-h-40" : "hidden"} />
          {status !== "pixel" && (
            <div className="flex min-h-28 items-center justify-center rounded-xl border border-dashed border-line-2 bg-[#F9FAFB] p-4 text-center text-sm text-muted">
              {paymentsReady
                ? method === "wallet"
                  ? "هيوصلك كود على الموبايل من المحفظة، وهتكتبه هنا من غير ما تخرج من الموقع."
                  : "خانات الكارت هتظهر هنا بعد ما تدوس ادفع، وبتروح لـ Paymob مباشرة."
                : "الدفع أونلاين هيتفعل قريب. لحد كده كلمنا على واتساب ونفعّلك الاشتراك."}
            </div>
          )}

          {status === "error" && <p role="alert" className="rounded-[10px] bg-[#FEE4E2] px-3.5 py-2.5 text-sm font-semibold text-[#912018]">{message}</p>}
          {status !== "pixel" && (
            <button disabled={status === "loading"} className="h-[54px] rounded-xl bg-lime text-[17px] font-bold text-ink disabled:opacity-60">
              {status === "loading" ? "استنى ثانية..." : `ادفع ${plan.price} ج وفعّل الاشتراك`}
            </button>
          )}
          <span className="text-center text-[13px] text-muted">بيانات الكارت بتروح لـ Paymob مباشرة ومش بتتخزن عندنا</span>
        </form>

        <aside aria-label="ملخص الطلب" className="flex min-w-0 flex-[1_1_300px] flex-col gap-3.5 rounded-[18px] border border-line bg-white p-6">
          <h2 className="font-display text-lg font-bold">ملخص الطلب</h2>
          <div className="flex justify-between text-[15px]"><span>باقة {plan.name}</span><b>{plan.price} ج</b></div>
          <div className="flex gap-2">
            <label htmlFor="coupon" className="sr-only">كود الخصم</label>
            <input id="coupon" placeholder="كود خصم" className="h-[42px] min-w-0 flex-1 rounded-[9px] border border-line-2 px-3 text-sm" />
            <button type="button" className="h-[42px] rounded-[9px] border border-line-2 bg-white px-3.5 text-sm font-semibold">طبّق</button>
          </div>
          <div className="h-px bg-line" />
          <div className="flex justify-between text-[17px]"><b>الإجمالي</b><b>{plan.price} ج</b></div>
        </aside>
      </div>
    </>
  );
}
