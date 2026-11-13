import Link from "next/link";
import { Card, H2, Stat } from "@/components/ui";
import { CopyButton } from "@/components/CopyButton";
import { signOut } from "@/app/login/actions";
import { SITE_URL } from "@/lib/site";
import { getUserAndProfile } from "@/lib/supabase/server";
import { botLink } from "@/lib/telegramBot";
import { DeleteAccount } from "@/components/DeleteAccount";

export const dynamic = "force-dynamic";
export const metadata = { title: "الحساب" };

const statusAr: Record<string, string> = { success: "ناجح", failed: "فشل", refunded: "مسترد", pending: "قيد المعالجة" };

export default async function AccountPage() {
  const { supabase, user, profile } = await getUserAndProfile();
  const [{ data: sub }, { data: credits }, { data: payments }, { data: me }, { data: refStats }] = await Promise.all([
    supabase.from("subscriptions").select("plan_id, status, current_period_end, auto_renew, canceled_at, plans(name, price_egp)").eq("status", "active").order("current_period_end", { ascending: false }).limit(1).maybeSingle(),
    supabase.from("my_credits").select("balance").maybeSingle(),
    supabase.from("payments").select("id, amount_cents, status, method, created_at").order("created_at", { ascending: false }).limit(10),
    supabase.from("profiles").select("referral_code, trial_ends_at, telegram_chat_id, telegram_link_token").eq("id", user!.id).single(),
    supabase.rpc("my_referral_stats").maybeSingle(),
  ]);
  const plan = sub?.plans as { name?: string; price_egp?: number } | null;
  const refLink = `${SITE_URL}/r/${me?.referral_code ?? ""}`;
  const trialLeft = me?.trial_ends_at ? Math.ceil((new Date(me.trial_ends_at).getTime() - Date.now()) / 86400000) : 0;
  const stats = refStats as { signups?: number; subscribers?: number } | null;
  return (
    <>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-[28px] font-bold">الحساب</h1>
          <p className="mt-1.5 text-[15px] text-muted">{profile?.full_name || user?.email}</p>
        </div>
        <form action={signOut}><button className="h-[42px] rounded-[10px] border border-line-2 bg-white px-4 text-sm font-semibold">تسجيل الخروج</button></form>
      </header>

      <section className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-3">
        <Stat label="الباقة" value={plan?.name ? `${plan.name} · ${plan.price_egp} ج.م` : trialLeft > 0 ? `تجربة · ${trialLeft} يوم` : "لا يوجد اشتراك"} />
        <Stat label={sub?.auto_renew === false ? "ينتهي في" : "التجديد"} value={sub ? new Date(sub.current_period_end).toLocaleDateString("ar-EG") : "-"} />
        <Stat label="النقاط" value={(credits?.balance ?? 0).toLocaleString("en-US")} />
      </section>

      <div className="flex flex-wrap gap-2">
        <Link href="/pricing" className="flex h-11 items-center rounded-[10px] bg-ink px-5 font-bold text-white">{sub ? "تغيير الباقة" : "اشترك الآن"}</Link>
        {sub && sub.auto_renew !== false && <Link href="/account/cancel" className="flex h-11 items-center rounded-[10px] px-4 font-semibold text-[#912018]">إلغاء الاشتراك</Link>}
        {sub?.auto_renew === false && <span className="flex h-11 items-center rounded-[10px] bg-[#FEF0C7] px-4 text-sm font-semibold text-[#93370D]">تم إيقاف التجديد</span>}
      </div>

      <section className="flex flex-wrap items-center gap-6 rounded-[18px] bg-ink p-6 text-white">
        <div className="flex flex-[1_1_300px] flex-col gap-2">
          <b className="font-display text-[22px]">ادعُ زميلًا واحصلا على 1,000 نقطة</b>
          <span className="text-[15px] text-line-2">تُضاف النقاط لكما عند أول اشتراك له.</span>
        </div>
        <div className="flex flex-[1_1_320px] gap-2">
          <span dir="ltr" className="flex h-[46px] min-w-0 flex-1 items-center truncate rounded-[10px] bg-ink-2 px-3.5 text-sm">{refLink}</span>
          <CopyButton text={refLink} />
        </div>
        <div className="grid w-full grid-cols-2 gap-2.5">
          <div className="rounded-xl bg-ink-2 p-3"><span className="text-xs text-line-2">تسجيلات</span><b className="block text-xl">{stats?.signups ?? 0}</b></div>
          <div className="rounded-xl bg-ink-2 p-3"><span className="text-xs text-line-2">اشتراكات</span><b className="block text-xl text-lime">{stats?.subscribers ?? 0}</b></div>
        </div>
      </section>

      <Card className="flex flex-col gap-3">
        <H2>المدفوعات</H2>
        {payments?.length ? (
          <ul className="flex flex-col">
            {payments.map((p) => (
              <li key={p.id} className="flex justify-between border-t border-[#F2F4F7] py-2.5 text-sm">
                <span>{new Date(p.created_at).toLocaleDateString("ar-EG")} · {p.method ?? "-"}</span>
                <b>{p.amount_cents / 100} ج.م · {statusAr[p.status] ?? p.status}</b>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted">لا توجد مدفوعات.</p>
        )}
      </Card>

      <Card className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col gap-1">
          <H2>تنبيهات تليجرام</H2>
          <span className="text-sm text-muted">{me?.telegram_chat_id ? "مربوط. تصلك التنبيهات على تليجرام." : "اربط حسابك لتصلك تنبيهات المنافسين والمنتجات الرابحة."}</span>
        </div>
        {!me?.telegram_chat_id && botLink(me?.telegram_link_token) && <a href={botLink(me?.telegram_link_token)!} target="_blank" rel="noreferrer" className="flex h-11 items-center rounded-[10px] bg-[#229ED9] px-4 font-bold text-white">ربط تليجرام</a>}
      </Card>

      <Card className="flex flex-col gap-2">
        <H2>الأمان</H2>
        <p className="text-sm text-muted">يسمح كل حساب بجلسة واحدة نشطة. تسجيل الدخول من جهاز آخر يُنهي الجلسة الحالية.</p>
        <DeleteAccount />
      </Card>
    </>
  );
}
