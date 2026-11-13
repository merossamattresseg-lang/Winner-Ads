import Link from "next/link";
import { Card, H2, LogoMark, Stat, Wordmark } from "@/components/ui";
import { getSetting } from "@/lib/data";
import { paymobReady } from "@/lib/paymob";
import { scoreSettings, type ScoreSettings } from "@/lib/score";
import { createAdminClient, getUserAndProfile } from "@/lib/supabase/server";
import { saveProfitDefaults, savePlans, saveScore } from "./actions";

export const dynamic = "force-dynamic";

const weightLabels: Record<keyof ScoreSettings["weights"], string> = { days: "أيام التشغيل", copies: "نسخ نفس الكرييتيف", engagement: "التفاعل", advertisers: "عدد المعلنين", supplier: "متاح عند مورد" };
const statusLabel: Record<string, [string, string]> = {
  success: ["ناجح", "bg-lime-soft text-lime-text"],
  failed: ["فشل", "bg-[#FEE4E2] text-[#912018]"],
  refunded: ["مسترد", "bg-[#FEF0C7] text-[#93370D]"],
  pending: ["مستني", "bg-[#F2F4F7] text-body"],
};
const input = "h-[38px] rounded-lg border border-line-2 px-2 text-sm text-text";

export default async function AdminPage() {
  const { supabase } = await getUserAndProfile();
  const [{ data: plans }, score, profit, { count: users }, { data: subs }, { data: payments }] = await Promise.all([
    supabase.from("plans").select("*").order("sort"),
    getSetting<ScoreSettings>("score", scoreSettings),
    getSetting("profit_defaults", { shipping: 60, returnRate: 20, returnCost: 45, packaging: 10, targetMargin: 30 }),
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("subscriptions").select("plan_id").eq("status", "active").gt("current_period_end", new Date().toISOString()),
    supabase.from("payments").select("id, amount_cents, status, method, created_at, plan_id, profiles(full_name)").order("created_at", { ascending: false }).limit(15),
  ]);
  const subsByPlan: Record<string, number> = {};
  (subs ?? []).forEach((s) => (subsByPlan[s.plan_id] = (subsByPlan[s.plan_id] ?? 0) + 1));
  const mrr = (plans ?? []).reduce((sum, p) => sum + p.price_egp * (subsByPlan[p.id] ?? 0), 0);
  const activeSubs = subs?.length ?? 0;
  const maxSubs = Math.max(1, ...Object.values(subsByPlan));
  const nav = ["نظرة عامة", "الباقات", "معادلة التقييم", "حاسبة الربح", "المدفوعات"];
  const anchors = ["overview", "plans", "score", "profit", "payments"];

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <aside className="flex w-full flex-col gap-6 bg-ink px-4 py-6 text-white md:sticky md:top-0 md:h-screen md:w-64 md:shrink-0">
        <div className="flex flex-col gap-1.5 px-2">
          <Link href="/" className="flex items-center gap-2.5"><LogoMark /><Wordmark /></Link>
          <span className="text-xs font-bold text-lime">لوحة الإدارة</span>
        </div>
        <nav aria-label="قائمة الإدارة" className="flex flex-wrap gap-1 md:flex-col">
          {nav.map((n, i) => (
            <a key={n} href={`#${anchors[i]}`} className="flex h-[42px] items-center rounded-[10px] px-3 text-[15px] font-medium text-line-2 hover:bg-ink-2">{n}</a>
          ))}
          <a href="/admin/users" className="flex h-[42px] items-center rounded-[10px] px-3 text-[15px] font-bold text-lime hover:bg-ink-2">العملاء</a>
          <a href="/admin/data" className="flex h-[42px] items-center rounded-[10px] px-3 text-[15px] font-bold text-lime hover:bg-ink-2">مصادر البيانات</a>
        </nav>
      </aside>

      <main className="min-w-0 flex-1 px-4 py-6 md:px-10 md:py-8">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-6">
          <header id="overview">
            <h1 className="font-display text-[28px] font-bold">نظرة عامة</h1>
            <p className="mt-1.5 text-[15px] text-muted">
              الدفع: {paymobReady() ? "Paymob متوصل" : "مستني مفاتيح Paymob"} · تفعيل الاشتراكات تلقائي: {createAdminClient() ? "شغال" : "محتاج SUPABASE_SERVICE_ROLE_KEY"}
            </p>
          </header>

          <section className="grid grid-cols-[repeat(auto-fit,minmax(170px,1fr))] gap-3">
            <Stat label="الإيراد الشهري المتكرر" value={`${mrr.toLocaleString("en-US")} ج`} />
            <Stat label="مشتركين نشطين" value={activeSubs} />
            <Stat label="كل الحسابات" value={users ?? 0} />
            <Stat label="نسبة المشتركين" value={users ? `${Math.round((activeSubs / users) * 100)}%` : "0%"} />
          </section>

          <Card className="flex flex-col gap-3.5">
            <H2>المشتركين حسب الباقة</H2>
            {(plans ?? []).map((p) => (
              <div key={p.id} className="grid grid-cols-[120px_minmax(0,1fr)_150px] items-center gap-3 text-sm">
                <span><b>{p.name}</b> · {p.price_egp} ج</span>
                <div className="h-3 rounded-full bg-[#F2F4F7]"><div className="h-3 rounded-full bg-ink" style={{ width: `${((subsByPlan[p.id] ?? 0) / maxSubs) * 100}%` }} /></div>
                <span className="text-left text-muted">{subsByPlan[p.id] ?? 0} مشترك · {(p.price_egp * (subsByPlan[p.id] ?? 0)).toLocaleString("en-US")} ج</span>
              </div>
            ))}
          </Card>

          <div className="grid grid-cols-[repeat(auto-fit,minmax(380px,1fr))] gap-5">
            <Card className="flex flex-col gap-3.5">
              <span id="plans" />
              <H2>إعدادات الباقات</H2>
              <form action={savePlans} className="flex flex-col gap-3">
                {(plans ?? []).map((p) => (
                  <div key={p.id} className="grid grid-cols-[80px_repeat(2,minmax(0,1fr))_120px] items-end gap-2.5">
                    <input type="hidden" name="id" value={p.id} />
                    <b className="pb-2.5 text-[15px]">{p.name}</b>
                    <label className="flex flex-col gap-1 text-xs text-muted">السعر (ج)<input name={`price_${p.id}`} type="number" defaultValue={p.price_egp} className={input} /></label>
                    <label className="flex flex-col gap-1 text-xs text-muted">النقاط الشهرية<input name={`points_${p.id}`} type="number" defaultValue={p.monthly_points} className={input} /></label>
                    <label className="flex items-center gap-1.5 pb-2.5 text-[13px]"><input type="radio" name="popular" value={p.id} defaultChecked={p.popular} />الأكثر مبيعا</label>
                  </div>
                ))}
                <button className="h-10 self-start rounded-[10px] bg-ink px-4 text-sm font-semibold text-white">احفظ الباقات</button>
              </form>
            </Card>

            <Card className="flex flex-col gap-3.5">
              <span id="score" />
              <H2>أوزان معادلة التقييم</H2>
              <form action={saveScore} className="flex flex-col gap-3">
                {(Object.keys(weightLabels) as (keyof ScoreSettings["weights"])[]).map((k) => (
                  <label key={k} className="grid grid-cols-[150px_minmax(0,1fr)] items-center gap-3 text-sm">
                    <span>{weightLabels[k]} (%)</span>
                    <input name={`w_${k}`} type="number" min={0} max={100} defaultValue={score.weights[k]} className={input} />
                  </label>
                ))}
                <div className="grid grid-cols-3 gap-2.5">
                  <label className="flex flex-col gap-1 text-xs text-muted">أيام للدرجة الكاملة<input name="c_days" type="number" defaultValue={score.caps.days} className={input} /></label>
                  <label className="flex flex-col gap-1 text-xs text-muted">نسخ للدرجة الكاملة<input name="c_copies" type="number" defaultValue={score.caps.copies} className={input} /></label>
                  <label className="flex flex-col gap-1 text-xs text-muted">معلنين للدرجة الكاملة<input name="c_advertisers" type="number" defaultValue={score.caps.advertisers} className={input} /></label>
                  <label className="flex flex-col gap-1 text-xs text-muted">رابح من<input name="t_winner" type="number" defaultValue={score.thresholds.winner} className={input} /></label>
                  <label className="flex flex-col gap-1 text-xs text-muted">رابح مؤكد من<input name="t_super" type="number" defaultValue={score.thresholds.super} className={input} /></label>
                </div>
                <button className="h-10 self-start rounded-[10px] bg-ink px-4 text-sm font-semibold text-white">احفظ وأعد الحساب</button>
              </form>
            </Card>
          </div>

          <Card className="flex flex-col gap-3.5">
            <span id="profit" />
            <H2>الأرقام الافتراضية لحاسبة الربح</H2>
            <form action={saveProfitDefaults} className="flex flex-wrap items-end gap-3">
              {([["shipping", "الشحن (ج)"], ["packaging", "التغليف (ج)"], ["returnRate", "المرتجع (%)"], ["returnCost", "تكلفة المرتجع (ج)"], ["targetMargin", "الهامش المطلوب (%)"]] as const).map(([k, l]) => (
                <label key={k} className="flex flex-col gap-1 text-xs text-muted">{l}<input name={k} type="number" defaultValue={(profit as Record<string, number>)[k]} className={`${input} w-28`} /></label>
              ))}
              <button className="h-10 rounded-[10px] bg-ink px-4 text-sm font-semibold text-white">احفظ</button>
            </form>
          </Card>

          <Card className="flex flex-col gap-3">
            <span id="payments" />
            <H2>آخر المدفوعات</H2>
            {payments?.length ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] border-collapse text-sm">
                  <thead><tr className="text-right text-muted">{["العميل", "الباقة", "الطريقة", "المبلغ", "الحالة", "التاريخ"].map((h) => <th key={h} className="border-b border-line px-2 py-2.5 font-semibold">{h}</th>)}</tr></thead>
                  <tbody>
                    {payments.map((p) => {
                      const [label, cls] = statusLabel[p.status] ?? statusLabel.pending;
                      return (
                        <tr key={p.id}>
                          <td className="border-b border-[#F2F4F7] px-2 py-3 font-semibold">{(p.profiles as { full_name?: string } | null)?.full_name ?? "-"}</td>
                          <td className="border-b border-[#F2F4F7] px-2 py-3">{p.plan_id ?? "-"}</td>
                          <td className="border-b border-[#F2F4F7] px-2 py-3">{p.method ?? "-"}</td>
                          <td className="border-b border-[#F2F4F7] px-2 py-3">{p.amount_cents / 100} ج</td>
                          <td className="border-b border-[#F2F4F7] px-2 py-3"><span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${cls}`}>{label}</span></td>
                          <td className="border-b border-[#F2F4F7] px-2 py-3 text-muted">{new Date(p.created_at).toLocaleDateString("ar-EG")}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-muted">مفيش مدفوعات لسه. أول ما Paymob يتفعل هتظهر هنا.</p>
            )}
          </Card>
        </div>
      </main>
    </div>
  );
}
