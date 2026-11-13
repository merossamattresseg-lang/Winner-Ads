import Link from "next/link";
import { Sidebar } from "@/components/Sidebar";
import { createClient } from "@/lib/supabase/server";

async function getAccountState() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const [{ data: profile }, { data: sub }, { data: credits }] = await Promise.all([
    supabase.from("profiles").select("trial_ends_at").eq("id", user.id).single(),
    supabase.from("subscriptions").select("current_period_end, plans(monthly_points)").eq("status", "active").gt("current_period_end", new Date().toISOString()).limit(1).maybeSingle(),
    supabase.from("my_credits").select("balance").maybeSingle(),
  ]);
  const quota = (sub?.plans as { monthly_points?: number } | null)?.monthly_points ?? 100;
  const trialMs = profile?.trial_ends_at ? new Date(profile.trial_ends_at).getTime() - Date.now() : 0;
  return { subscribed: Boolean(sub), trialDays: Math.max(0, Math.ceil(trialMs / 86400000)), credits: credits?.balance ?? 0, quota };
}

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const state = await getAccountState();
  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <Sidebar credits={state?.credits ?? null} quota={state?.quota ?? 0} loggedIn={Boolean(state)} />
      <main className="min-w-0 flex-1 pb-20 md:pb-0">
        {state && !state.subscribed && (
          <div className={`flex flex-wrap items-center justify-center gap-3 px-4 py-2.5 text-sm ${state.trialDays > 0 ? "bg-ink text-white" : "bg-[#FEF0C7] text-[#93370D]"}`}>
            {state.trialDays > 0
              ? <span>متبقٍ في التجربة: <b className="text-lime">{state.trialDays} {state.trialDays === 1 ? "يوم" : "أيام"} · {state.credits} نقطة</b></span>
              : <span className="font-semibold">انتهت التجربة المجانية. خصم 15% على الشهر الأول لمدة 48 ساعة.</span>}
            <Link href="/pricing" className="rounded-lg bg-lime px-3 py-1 text-[13px] font-bold text-ink">اشترك الآن</Link>
          </div>
        )}
        <div className="mx-auto flex max-w-[1200px] flex-col gap-6 px-4 py-6 md:px-10 md:py-8">{children}</div>
      </main>
    </div>
  );
}
