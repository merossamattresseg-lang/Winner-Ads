"use client";
import Link from "next/link";
import { useState } from "react";
import { TrackOnMount } from "@/components/Tracking";
import { saveOnboarding } from "./actions";

const roles = [["media_buyer", "ميديا باير", "أختبر منتجات لي أو لعملائي"], ["brand", "صاحب علامة", "لدي متجر ومنتجات"], ["dropshipping", "دروب شيبنج", "أبيع دون مخزون"], ["agency", "وكالة", "فريق يدير عدة علامات"]] as const;
const cats = ["صحة", "منزل ومطبخ", "تجميل", "ملابس", "إلكترونيات", "أطفال", "رياضة", "إكسسوارات"];
const steps = ["العمل", "الأقسام", "التنبيهات"];

export function Onboarding({ regId, telegramBot }: { regId?: string; telegramBot?: string }) {
  const [step, setStep] = useState(1);
  const [role, setRole] = useState<string>("media_buyer");
  const [picked, setPicked] = useState<string[]>(["صحة", "منزل ومطبخ"]);
  return (
    <form action={saveOnboarding} className="flex w-full max-w-[760px] flex-col gap-7">
      {regId && <TrackOnMount event="CompleteRegistration" eventId={`reg_${regId}`} />}
      <input type="hidden" name="business_type" value={role} />
      {picked.map((c) => <input key={c} type="hidden" name="categories" value={c} />)}
      <div className="grid grid-cols-3 gap-2">
        {steps.map((label, i) => (
          <div key={label} className="flex flex-col gap-1.5">
            <div className={`h-1.5 rounded-full ${step > i ? "bg-[#15803D]" : "bg-line"}`} />
            <span className={`text-[13px] font-semibold ${step > i ? "text-text" : "text-[#98A2B3]"}`}>{label}</span>
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-5 rounded-[22px] border border-line bg-white p-6 md:p-9">
        {step === 1 && (
          <>
            <div><h1 className="font-display text-3xl font-bold">ما طبيعة عملك؟</h1><p className="mt-2 text-muted">لتخصيص الصفحة الرئيسية.</p></div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {roles.map(([id, label, hint]) => (
                <button key={id} type="button" aria-pressed={role === id} onClick={() => setRole(id)}
                  className={`flex flex-col gap-1 rounded-2xl p-4 text-right ${role === id ? "border-2 border-[#15803D] bg-[#F3F9F4]" : "border border-line bg-white"}`}>
                  <b className="text-lg">{label}</b><span className="text-sm text-muted">{hint}</span>
                </button>
              ))}
            </div>
          </>
        )}
        {step === 2 && (
          <>
            <div><h1 className="font-display text-3xl font-bold">ما الأقسام التي تبيع فيها؟</h1><p className="mt-2 text-muted">اختر قسمًا أو أكثر.</p></div>
            <div className="flex flex-wrap gap-2.5">
              {cats.map((c) => {
                const on = picked.includes(c);
                return (
                  <button key={c} type="button" aria-pressed={on} onClick={() => setPicked(on ? picked.filter((x) => x !== c) : [...picked, c])}
                    className={`h-[46px] rounded-full px-4 text-[15px] font-semibold ${on ? "bg-ink text-white" : "border border-line-2 bg-white"}`}>{c}</button>
                );
              })}
            </div>
            <fieldset className="flex flex-col gap-2.5">
              <legend className="mb-2 text-[15px] font-bold">أين تعلن غالبًا؟</legend>
              <div className="flex flex-wrap gap-2.5">
                {[["meta", "فيسبوك وإنستجرام"], ["tiktok", "تيك توك"], ["none", "لم أبدأ بعد"]].map(([v, l], i) => (
                  <label key={v} className="flex items-center gap-2 rounded-xl border border-line-2 px-3.5 py-2.5 text-[15px]"><input type="checkbox" name="ad_platforms" value={v} defaultChecked={i === 0} />{l}</label>
                ))}
              </div>
            </fieldset>
          </>
        )}
        {step === 3 && (
          <>
            <div><h1 className="font-display text-3xl font-bold">كيف تصلك التنبيهات؟</h1><p className="mt-2 text-muted">المنتجات الرابحة وإعلانات المنافسين الجديدة.</p></div>
            <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-line p-4">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#229ED9]"><svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true"><path d="M21 4L3 11l5 2 2 6 3-4 5 4z" fill="#FFFFFF" /></svg></span>
              <span className="flex flex-[1_1_220px] flex-col"><b className="text-[17px]">بوت WinnerAds على تليجرام</b><span className="text-sm text-muted">{telegramBot ? "يُربط حسابك تلقائيًا عند بدء المحادثة" : "قريبًا"}</span></span>
              {telegramBot && <a href={`https://t.me/${telegramBot}`} target="_blank" rel="noreferrer" className="flex h-11 items-center rounded-[10px] bg-[#229ED9] px-4 font-bold text-white">ربط تليجرام</a>}
            </div>
            <label className="flex items-center gap-2.5 text-[15px]"><input type="checkbox" name="weekly_email" defaultChecked />تقرير أسبوعي عبر البريد الإلكتروني</label>
          </>
        )}
        <div className="flex items-center justify-between gap-3 border-t border-[#F2F4F7] pt-4">
          {step > 1 ? <button type="button" onClick={() => setStep(step - 1)} className="h-12 rounded-xl border border-line-2 bg-white px-5 font-semibold">رجوع</button> : <Link href="/dashboard" className="text-sm text-muted">لاحقًا</Link>}
          {step < 3
            ? <button type="button" onClick={() => setStep(step + 1)} className="h-12 rounded-xl bg-ink px-7 font-bold text-white">التالي</button>
            : <button className="h-12 rounded-xl bg-lime px-7 font-bold text-ink">ابدأ التجربة</button>}
        </div>
      </div>
    </form>
  );
}
