import { AdminNav } from "@/components/AdminNav";
import { createAdminClient } from "@/lib/supabase/server";
import { createCoupon, toggleCoupon } from "../actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "أكواد الخصم" };

const input = "h-10 rounded-[10px] border border-line-2 px-3 text-sm";

export default async function CouponsPage() {
  const admin = createAdminClient();
  const [{ data: coupons }, { data: plans }] = admin
    ? await Promise.all([admin.from("coupons").select("*").order("created_at", { ascending: false }), admin.from("plans").select("id, name").order("sort")])
    : [{ data: [] }, { data: [] }];
  return (
    <div className="min-h-screen bg-[#F7F8FA]">
      <AdminNav active="/admin/coupons" />
      <main className="mx-auto flex max-w-[1100px] flex-col gap-5 px-6 py-7">
        <h1 className="font-display text-[28px] font-bold">أكواد الخصم</h1>
        <form action={createCoupon} className="flex flex-wrap items-end gap-3 rounded-[18px] border border-line bg-white p-5">
          <label className="flex flex-col gap-1 text-xs text-muted">الكود<input name="code" required dir="ltr" placeholder="RAMADAN25" className={`${input} w-36 uppercase`} /></label>
          <label className="flex flex-col gap-1 text-xs text-muted">الخصم %<input name="percent" type="number" min={1} max={100} defaultValue={20} className={`${input} w-24`} /></label>
          <label className="flex flex-col gap-1 text-xs text-muted">أقصى استخدام<input name="max_uses" type="number" placeholder="بلا حد" className={`${input} w-28`} /></label>
          <label className="flex flex-col gap-1 text-xs text-muted">ينتهي في<input name="expires_at" type="date" className={input} /></label>
          <fieldset className="flex flex-col gap-1 text-xs text-muted"><legend>الباقات (فارغ = الكل)</legend>
            <div className="flex gap-2 text-sm text-text">{(plans ?? []).map((p) => <label key={p.id} className="flex items-center gap-1"><input type="checkbox" name="plan_ids" value={p.id} />{p.name}</label>)}</div>
          </fieldset>
          <label className="flex items-center gap-1.5 text-sm"><input type="checkbox" name="first_payment_only" />للاشتراك الأول فقط</label>
          <label className="flex flex-1 flex-col gap-1 text-xs text-muted">ملاحظة<input name="note" className={input} /></label>
          <button className="h-10 rounded-[10px] bg-ink px-4 text-sm font-semibold text-white">إنشاء</button>
        </form>
        <div className="overflow-x-auto rounded-[18px] border border-line bg-white">
          <table className="w-full min-w-[720px] border-collapse text-sm">
            <thead><tr className="text-right text-muted">{["الكود", "الخصم", "الاستخدام", "ينتهي", "شروط", "ملاحظة", "الحالة"].map((h) => <th key={h} className="border-b border-line px-3 py-3 font-semibold">{h}</th>)}</tr></thead>
            <tbody>
              {(coupons ?? []).map((c) => (
                <tr key={c.code}>
                  <td dir="ltr" className="border-b border-[#F2F4F7] px-3 py-3 text-right font-bold">{c.code}</td>
                  <td className="border-b border-[#F2F4F7] px-3 py-3">{c.percent}%</td>
                  <td className="border-b border-[#F2F4F7] px-3 py-3">{c.used}{c.max_uses ? ` / ${c.max_uses}` : ""}</td>
                  <td className="border-b border-[#F2F4F7] px-3 py-3 text-muted">{c.expires_at ? new Date(c.expires_at).toLocaleDateString("ar-EG") : "-"}</td>
                  <td className="border-b border-[#F2F4F7] px-3 py-3 text-muted">{[c.first_payment_only ? "أول اشتراك" : "", c.plan_ids?.length ? c.plan_ids.join("، ") : ""].filter(Boolean).join(" · ") || "-"}</td>
                  <td className="border-b border-[#F2F4F7] px-3 py-3 text-muted">{c.note ?? "-"}</td>
                  <td className="border-b border-[#F2F4F7] px-3 py-3">
                    <form action={toggleCoupon}><input type="hidden" name="code" value={c.code} /><input type="hidden" name="active" value={String(!c.active)} />
                      <button className={`rounded-full px-3 py-1 text-xs font-bold ${c.active ? "bg-lime-soft text-lime-text" : "bg-[#F2F4F7] text-muted"}`}>{c.active ? "مفعّل" : "متوقف"}</button></form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
