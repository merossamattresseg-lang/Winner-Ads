import { AdminNav } from "@/components/AdminNav";
import { waLink } from "@/lib/site";
import { createAdminClient } from "@/lib/supabase/server";
import { addPoints, extendTrial, grantSubscription, setRole } from "../actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "العملاء" };

type Row = { id: string; full_name: string | null; phone: string | null; role: string; trial_ends_at: string; created_at: string; last_seen_at: string | null; business_type: string | null; referred_by: string | null };

const input = "h-9 rounded-lg border border-line-2 px-2 text-sm";

export default async function AdminUsers({ searchParams }: { searchParams: Promise<{ q?: string; status?: string; id?: string }> }) {
  const { q, status, id } = await searchParams;
  const admin = createAdminClient();
  if (!admin) return <><AdminNav active="/admin/users" /><p className="p-8 text-center">أضف SUPABASE_SERVICE_ROLE_KEY لعرض العملاء.</p></>;

  let query = admin.from("profiles").select("id, full_name, phone, role, trial_ends_at, created_at, last_seen_at, business_type, referred_by").order("created_at", { ascending: false }).limit(200);
  if (q) query = query.or(`full_name.ilike.%${q.replace(/[,()]/g, "")}%,phone.ilike.%${q.replace(/[,()]/g, "")}%`);
  const [{ data: profiles }, { data: subs }, { data: ledger }, { data: plans }, { count: visitors }, { count: searchers }] = await Promise.all([
    query,
    admin.from("subscriptions").select("user_id, plan_id, status, current_period_end, auto_renew").order("current_period_end", { ascending: false }),
    admin.from("credits_ledger").select("user_id, delta"),
    admin.from("plans").select("id, name"),
    admin.from("searches").select("id", { count: "exact", head: true }).is("user_id", null),
    admin.from("searches").select("user_id", { count: "exact", head: true }).not("user_id", "is", null),
  ]);
  const subOf = new Map<string, { plan_id: string; current_period_end: string; auto_renew: boolean }>();
  (subs ?? []).forEach((s) => { if (s.status === "active" && new Date(s.current_period_end) > new Date() && !subOf.has(s.user_id)) subOf.set(s.user_id, s); });
  const everPaid = new Set((subs ?? []).map((s) => s.user_id));
  const credits = new Map<string, number>();
  const used = new Map<string, number>();
  (ledger ?? []).forEach((l) => { credits.set(l.user_id, (credits.get(l.user_id) ?? 0) + l.delta); if (l.delta < 0) used.set(l.user_id, (used.get(l.user_id) ?? 0) - l.delta); });

  const rows = ((profiles ?? []) as Row[]).map((p) => {
    const sub = subOf.get(p.id);
    const trial = new Date(p.trial_ends_at) > new Date();
    const st = sub ? "paid" : trial ? "trial" : everPaid.has(p.id) ? "canceled" : "ended";
    return { ...p, st, sub, credits: credits.get(p.id) ?? 0, used: used.get(p.id) ?? 0 };
  });
  const filtered = status ? rows.filter((r) => r.st === status) : rows;
  const sel = rows.find((r) => r.id === id) ?? null;
  const labels: Record<string, [string, string]> = { trial: ["تجربة", "bg-[#E8F1FB] text-[#1E3A8A]"], paid: ["مشترك", "bg-lime-soft text-lime-text"], ended: ["التجربة انتهت", "bg-[#FEF0C7] text-[#93370D]"], canceled: ["منتهي", "bg-[#FEE4E2] text-[#912018]"] };
  const total = rows.length;
  const funnel = [
    ["عمليات بحث من زوار", visitors ?? 0],
    ["عمليات بحث من مسجلين", searchers ?? 0],
    ["حسابات", total],
    ["استخدموا نقاطًا", rows.filter((r) => r.used > 0).length],
    ["مشتركون", rows.filter((r) => r.st === "paid").length],
  ] as const;
  const maxF = Math.max(1, ...funnel.map((f) => f[1]));

  return (
    <div className="min-h-screen bg-[#F7F8FA]">
      <AdminNav active="/admin/users" />
      <main className="mx-auto flex max-w-[1320px] flex-col gap-5 px-6 py-7">
        <h1 className="font-display text-[28px] font-bold">العملاء</h1>

        <section className="flex flex-col gap-2.5 rounded-[18px] border border-line bg-white p-5">
          <h2 className="font-display text-lg font-bold">مسار الاشتراك</h2>
          {funnel.map(([label, n], i) => (
            <div key={label} className="grid grid-cols-[170px_minmax(0,1fr)_60px] items-center gap-3 text-sm">
              <span className="font-semibold">{label}</span>
              <div className="h-8 overflow-hidden rounded-lg bg-[#F2F4F7]"><div className={`flex h-8 items-center rounded-lg px-3 font-bold ${i === 4 ? "bg-lime text-ink" : "bg-ink text-white"}`} style={{ width: `${Math.max(6, (n / maxF) * 100)}%` }}>{n}</div></div>
              <span className="text-left text-muted">{i > 1 && funnel[i - 1][1] ? `${Math.round((n / funnel[i - 1][1]) * 100)}%` : ""}</span>
            </div>
          ))}
        </section>

        <div className="flex flex-wrap items-start gap-5">
          <section className="flex min-w-0 flex-[999_1_640px] flex-col gap-3 rounded-[18px] border border-line bg-white p-4">
            <form className="flex flex-wrap items-center gap-2">
              <label htmlFor="uq" className="sr-only">بحث</label>
              <input id="uq" name="q" defaultValue={q} placeholder="الاسم أو رقم الجوال" className="h-10 flex-[1_1_240px] rounded-[10px] border border-line-2 px-3 text-sm" />
              <select name="status" defaultValue={status ?? ""} className="h-10 rounded-[10px] border border-line-2 px-2 text-sm">
                <option value="">الكل ({total})</option>
                {Object.entries(labels).map(([k, [l]]) => <option key={k} value={k}>{l} ({rows.filter((r) => r.st === k).length})</option>)}
              </select>
              <button className="h-10 rounded-[10px] bg-ink px-4 text-sm font-semibold text-white">تصفية</button>
            </form>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] border-collapse text-sm">
                <thead><tr className="text-right text-muted">{["العميل", "الحالة", "النقاط", "استخدم", "آخر دخول", "التسجيل"].map((h) => <th key={h} className="border-b border-line px-2 py-2.5 font-semibold">{h}</th>)}</tr></thead>
                <tbody>
                  {filtered.map((r) => (
                    <tr key={r.id} className={sel?.id === r.id ? "bg-[#F3F9F4]" : ""}>
                      <td className="border-b border-[#F2F4F7] px-2 py-2.5"><a href={`?id=${r.id}${status ? `&status=${status}` : ""}`} className="font-bold">{r.full_name || "بدون اسم"}</a><br /><span dir="ltr" className="text-xs text-muted">{r.phone}</span></td>
                      <td className="border-b border-[#F2F4F7] px-2 py-2.5"><span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${labels[r.st][1]}`}>{labels[r.st][0]}</span>{r.role === "admin" && <span className="ms-1 text-xs font-bold">· أدمن</span>}</td>
                      <td className="border-b border-[#F2F4F7] px-2 py-2.5">{r.credits}</td>
                      <td className="border-b border-[#F2F4F7] px-2 py-2.5">{r.used}</td>
                      <td className="border-b border-[#F2F4F7] px-2 py-2.5 text-muted">{r.last_seen_at ? new Date(r.last_seen_at).toLocaleDateString("ar-EG") : "-"}</td>
                      <td className="border-b border-[#F2F4F7] px-2 py-2.5 text-muted">{new Date(r.created_at).toLocaleDateString("ar-EG")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {sel && (
            <aside className="flex min-w-0 flex-[1_1_340px] flex-col gap-3 rounded-[18px] border border-line bg-white p-5">
              <b className="text-lg">{sel.full_name || "بدون اسم"}</b>
              <span className="text-sm text-muted">{sel.business_type ?? "-"} · {labels[sel.st][0]} {sel.sub ? `· ${sel.sub.plan_id} حتى ${new Date(sel.sub.current_period_end).toLocaleDateString("ar-EG")}` : ""}</span>
              {sel.phone && <a href={waLink("مرحبًا، معك فريق WinnerAds.", sel.phone.replace(/\D/g, "").replace(/^0/, "20"))} target="_blank" rel="noreferrer" className="flex h-10 items-center justify-center rounded-[10px] bg-[#25D366] font-bold text-white">مراسلة واتساب</a>}
              <form action={extendTrial} className="flex items-end gap-2"><input type="hidden" name="user_id" value={sel.id} /><label className="flex flex-1 flex-col gap-1 text-xs text-muted">تمديد التجربة (أيام)<input name="days" type="number" defaultValue={2} className={input} /></label><button className="h-9 rounded-lg bg-ink px-3 text-sm font-semibold text-white">تمديد</button></form>
              <form action={addPoints} className="flex items-end gap-2"><input type="hidden" name="user_id" value={sel.id} /><label className="flex flex-1 flex-col gap-1 text-xs text-muted">إضافة نقاط<input name="points" type="number" defaultValue={100} className={input} /></label><button className="h-9 rounded-lg bg-ink px-3 text-sm font-semibold text-white">إضافة</button></form>
              <form action={grantSubscription} className="flex flex-wrap items-end gap-2"><input type="hidden" name="user_id" value={sel.id} />
                <label className="flex flex-col gap-1 text-xs text-muted">اشتراك يدوي<select name="plan_id" className={input}>{(plans ?? []).map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></label>
                <label className="flex w-20 flex-col gap-1 text-xs text-muted">شهور<input name="months" type="number" defaultValue={1} className={input} /></label>
                <button className="h-9 rounded-lg bg-ink px-3 text-sm font-semibold text-white">تفعيل</button></form>
              <form action={setRole}><input type="hidden" name="user_id" value={sel.id} /><input type="hidden" name="role" value={sel.role === "admin" ? "user" : "admin"} /><button className="h-9 w-full rounded-lg border border-line-2 text-sm font-semibold">{sel.role === "admin" ? "إزالة صلاحية الأدمن" : "منح صلاحية الأدمن"}</button></form>
            </aside>
          )}
        </div>
      </main>
    </div>
  );
}
