"use client";
import { useActionState, useState } from "react";
import { resetPassword, signIn, signInWithGoogle, signUp, type AuthState } from "./actions";

const input = "h-12 rounded-[10px] border border-line-2 bg-white px-3.5 text-[15px] font-normal";
type Mode = "in" | "up" | "forgot";

export function LoginForm({ next, initialMode, notice }: { next: string; initialMode: Mode; notice?: string }) {
  const [mode, setMode] = useState<Mode>(initialMode);
  const [inState, inAction, inPending] = useActionState<AuthState, FormData>(signIn, {});
  const [upState, upAction, upPending] = useActionState<AuthState, FormData>(signUp, {});
  const [fState, fAction, fPending] = useActionState<AuthState, FormData>(resetPassword, {});
  const state = mode === "in" ? inState : mode === "up" ? upState : fState;
  const pending = inPending || upPending || fPending;
  const action = mode === "in" ? inAction : mode === "up" ? upAction : fAction;
  const titles: Record<Mode, [string, string]> = {
    up: ["ابدأ تجربتك المجانية", "3 أيام و100 نقطة، دون بطاقة."],
    in: ["مرحبًا بعودتك", "سجّل الدخول للمتابعة."],
    forgot: ["نسيت كلمة المرور؟", "سنرسل رابط إعادة التعيين إلى بريدك."],
  };
  return (
    <div className="flex w-full max-w-[440px] flex-col gap-5">
      <div>
        <h1 className="font-display text-[32px] font-bold">{titles[mode][0]}</h1>
        <p className="mt-2 text-base text-muted">{titles[mode][1]}</p>
      </div>
      {notice && <p role="status" className="rounded-[10px] bg-[#E8F1FB] px-3.5 py-2.5 text-sm font-semibold text-[#1E3A8A]">{notice}</p>}
      {mode !== "forgot" && (
        <>
          <div role="tablist" className="grid grid-cols-2 gap-1 rounded-xl bg-[#F2F4F7] p-1">
            {(["up", "in"] as const).map((m) => (
              <button key={m} type="button" role="tab" aria-selected={mode === m} onClick={() => setMode(m)}
                className={`h-[42px] rounded-[9px] text-[15px] ${mode === m ? "bg-white font-bold shadow-sm" : "font-semibold text-muted"}`}>
                {m === "up" ? "حساب جديد" : "تسجيل الدخول"}
              </button>
            ))}
          </div>
          <form action={signInWithGoogle}>
            <input type="hidden" name="next" value={next} />
            <button className="flex h-[50px] w-full items-center justify-center gap-2.5 rounded-xl border border-line-2 bg-white text-base font-semibold">
              <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.5l6.7-6.7C35.6 2.4 30.2 0 24 0 14.6 0 6.6 5.4 2.7 13.3l7.8 6C12.4 13.7 17.7 9.5 24 9.5z" /><path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4 7.1-10 7.1-17.5z" /><path fill="#FBBC05" d="M10.5 28.7c-.5-1.4-.8-3-.8-4.7s.3-3.3.8-4.7l-7.8-6C1 16.6 0 20.2 0 24s1 7.4 2.7 10.7l7.8-6z" /><path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.5-5.8c-2.1 1.4-4.8 2.3-8.4 2.3-6.3 0-11.6-4.2-13.5-9.9l-7.8 6C6.6 42.6 14.6 48 24 48z" /></svg>
              المتابعة باستخدام Google
            </button>
          </form>
          <div className="flex items-center gap-3 text-[13px] text-[#98A2B3]"><span className="h-px flex-1 bg-line" />أو بالبريد الإلكتروني<span className="h-px flex-1 bg-line" /></div>
        </>
      )}
      <form action={action} className="flex flex-col gap-3.5">
        <input type="hidden" name="next" value={next} />
        {mode === "up" && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5 text-sm font-semibold">الاسم<input name="name" required className={input} /></label>
            <label className="flex flex-col gap-1.5 text-sm font-semibold">رقم الجوال (واتساب)<input name="phone" type="tel" dir="ltr" placeholder="01xxxxxxxxx" className={input} /></label>
          </div>
        )}
        <label className="flex flex-col gap-1.5 text-sm font-semibold">البريد الإلكتروني<input name="email" type="email" required dir="ltr" autoComplete="email" className={input} /></label>
        {mode !== "forgot" && (
          <label className="flex flex-col gap-1.5 text-sm font-semibold">
            <span className="flex justify-between">كلمة المرور{mode === "in" && <button type="button" onClick={() => setMode("forgot")} className="text-[13px] font-semibold text-[#15803D]">نسيت؟</button>}</span>
            <input name="password" type="password" required minLength={mode === "up" ? 8 : undefined} dir="ltr" autoComplete={mode === "in" ? "current-password" : "new-password"} className={input} />
          </label>
        )}
        {mode === "up" && <span className="text-[13px] text-muted">8 أحرف على الأقل. بإنشاء الحساب فإنك توافق على <a href="/terms" className="text-[#15803D]">الشروط</a> و<a href="/privacy" className="text-[#15803D]">الخصوصية</a>.</span>}
        {state.error && <p role="alert" className="rounded-[10px] bg-[#FEE4E2] px-3.5 py-2.5 text-sm font-semibold text-[#912018]">{state.error}</p>}
        {state.info && <p role="status" className="rounded-[10px] bg-lime-soft px-3.5 py-2.5 text-sm font-semibold text-lime-text">{state.info}</p>}
        <button disabled={pending} className="h-[52px] rounded-xl bg-lime text-[17px] font-bold text-ink disabled:opacity-60">
          {pending ? "جارٍ التنفيذ..." : mode === "up" ? "إنشاء الحساب" : mode === "in" ? "تسجيل الدخول" : "إرسال الرابط"}
        </button>
        {mode === "forgot" && <button type="button" onClick={() => setMode("in")} className="text-[15px] font-semibold text-body">العودة لتسجيل الدخول</button>}
      </form>
    </div>
  );
}
