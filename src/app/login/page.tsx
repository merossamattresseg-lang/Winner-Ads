import Link from "next/link";
import { gridBg, Highlight } from "@/components/PublicChrome";
import { LogoMark, Wordmark } from "@/components/ui";
import { getAds } from "@/lib/data";
import { LoginForm } from "./LoginForm";

export const metadata = { title: "تسجيل الدخول" };

const notices: Record<string, string> = {
  other_device: "تم تسجيل الدخول إلى حسابك من جهاز آخر. يسمح كل حساب بجلسة واحدة نشطة.",
  google: "تعذر تسجيل الدخول باستخدام Google. استخدم البريد الإلكتروني.",
};

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; mode?: string; reason?: string; error?: string }> }) {
  const { next, mode, reason, error } = await searchParams;
  const today = (await getAds()).slice(0, 3);
  const tints = ["#F4ECE4", "#EEF0F6", "#E8F1FB"];
  return (
    <div className="flex min-h-screen bg-white">
      <section className="flex flex-1 flex-col px-6 py-8 md:px-16">
        <Link href="/" className="flex items-center gap-2.5"><LogoMark bg="#0B1324" /><Wordmark dark={false} /></Link>
        <div className="my-auto flex justify-center py-10">
          <LoginForm next={next ?? (mode === "up" ? "/welcome" : "/dashboard")} initialMode={mode === "up" ? "up" : "in"} notice={notices[reason ?? error ?? ""]} />
        </div>
        <span className="text-[13px] text-[#98A2B3]">تحتاج مساعدة؟ تواصل عبر زر واتساب.</span>
      </section>
      <aside className="hidden w-[560px] shrink-0 flex-col justify-center gap-7 border-r border-[#E3F0E6] p-14 lg:flex" style={gridBg}>
        <h2 className="font-display text-[34px] font-bold leading-snug">ما ينتظرك<br /><Highlight>بعد التسجيل</Highlight></h2>
        <div className="flex flex-col gap-3 rounded-[18px] border border-line bg-white p-4 shadow-[0_18px_40px_rgba(11,19,36,0.08)]">
          <div className="flex items-center justify-between"><b>الأكثر ربحًا اليوم</b><span className="text-[13px] text-muted">تحديث 4:00 ص</span></div>
          {today.map((a, i) => (
            <div key={a.id} className="flex items-center gap-3 border-t border-[#F2F4F7] pt-3">
              <span className="h-12 w-12 shrink-0 rounded-[10px]" style={{ background: tints[i] }} />
              <span className="flex flex-1 flex-col"><b className="text-[15px]">{a.product}</b><span className="text-[13px] text-muted">{a.days} يومًا · {a.copies} نسخة</span></span>
              <span className="rounded-lg bg-lime-soft px-2 py-1 font-display font-bold text-lime-text">{a.score}</span>
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-3 text-base">
          {["دون بطاقة أو التزام", "100 نقطة للبحث في جميع المنصات", "أول موردَين لكل منتج"].map((t) => (
            <span key={t} className="flex items-center gap-2.5"><svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><polyline points="4,12 10,18 20,6" fill="none" stroke="#15803D" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>{t}</span>
          ))}
        </div>
      </aside>
    </div>
  );
}
