"use client";
import { useActionState, useState } from "react";
import { signIn, signUp, type AuthState } from "./actions";

const input = "h-12 rounded-[10px] border border-line-2 bg-white px-3.5 text-[15px] font-normal";

export function LoginForm({ next }: { next: string }) {
  const [tab, setTab] = useState<"in" | "up">("in");
  const [inState, inAction, inPending] = useActionState<AuthState, FormData>(signIn, {});
  const [upState, upAction, upPending] = useActionState<AuthState, FormData>(signUp, {});
  const state = tab === "in" ? inState : upState;
  return (
    <div className="flex flex-col gap-5">
      <div role="tablist" className="grid grid-cols-2 gap-1 rounded-xl bg-[#F2F4F7] p-1">
        {(["in", "up"] as const).map((t) => (
          <button key={t} type="button" role="tab" aria-selected={tab === t} onClick={() => setTab(t)}
            className={`h-11 rounded-[9px] text-[15px] ${tab === t ? "bg-white font-bold shadow-sm" : "font-semibold text-muted"}`}>
            {t === "in" ? "تسجيل دخول" : "حساب جديد"}
          </button>
        ))}
      </div>
      <form action={tab === "in" ? inAction : upAction} className="flex flex-col gap-3.5">
        <input type="hidden" name="next" value={next} />
        {tab === "up" && (
          <>
            <label className="flex flex-col gap-1.5 text-sm font-semibold">الاسم<input name="name" required className={input} /></label>
            <label className="flex flex-col gap-1.5 text-sm font-semibold">الموبايل<input name="phone" type="tel" dir="ltr" placeholder="01xxxxxxxxx" className={input} /></label>
          </>
        )}
        <label className="flex flex-col gap-1.5 text-sm font-semibold">الإيميل<input name="email" type="email" required dir="ltr" autoComplete="email" className={input} /></label>
        <label className="flex flex-col gap-1.5 text-sm font-semibold">كلمة السر<input name="password" type="password" required minLength={tab === "up" ? 8 : undefined} dir="ltr" autoComplete={tab === "in" ? "current-password" : "new-password"} className={input} /></label>
        {state.error && <p role="alert" className="rounded-[10px] bg-[#FEE4E2] px-3.5 py-2.5 text-sm font-semibold text-[#912018]">{state.error}</p>}
        {state.info && <p role="status" className="rounded-[10px] bg-lime-soft px-3.5 py-2.5 text-sm font-semibold text-lime-text">{state.info}</p>}
        <button disabled={inPending || upPending} className="h-12 rounded-xl bg-lime text-base font-bold text-ink disabled:opacity-60">
          {inPending || upPending ? "استنى ثانية..." : tab === "in" ? "دخول" : "اعمل الحساب"}
        </button>
      </form>
    </div>
  );
}
