import Link from "next/link";
import { Card, H2, Stat } from "@/components/ui";
import { getUserAndProfile } from "@/lib/supabase/server";
import { signOut } from "@/app/login/actions";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const { supabase, user, profile } = await getUserAndProfile();
  const [{ data: sub }, { data: credits }, { data: payments }] = await Promise.all([
    supabase.from("subscriptions").select("plan_id, status, current_period_end, plans(name)").eq("status", "active").order("current_period_end", { ascending: false }).limit(1).maybeSingle(),
    supabase.from("my_credits").select("balance").maybeSingle(),
    supabase.from("payments").select("id, amount_cents, status, method, created_at").order("created_at", { ascending: false }).limit(10),
  ]);
  const planName = (sub?.plans as { name?: string } | null)?.name;
  return (
    <>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-[28px] font-bold">حسابي</h1>
          <p className="mt-1.5 text-[15px] text-muted">{profile?.full_name || user?.email}</p>
        </div>
        <form action={signOut}><button className="h-[42px] rounded-[10px] border border-line-2 bg-white px-4 text-sm font-semibold">تسجيل خروج</button></form>
      </header>

      <section className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3">
        <Stat label="الباقة" value={planName ?? "مفيش اشتراك"} />
        <Stat label="بتخلص في" value={sub ? new Date(sub.current_period_end).toLocaleDateString("ar-EG") : "-"} />
        <Stat label="النقاط" value={(credits?.balance ?? 0).toLocaleString("en-US")} />
      </section>

      {!sub && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-ink p-5 text-white">
          <span>اشترك عشان تفتح البحث الكامل والموردين والتنبيهات.</span>
          <Link href="/pricing" className="rounded-[10px] bg-lime px-5 py-2.5 font-bold text-ink">شوف الباقات</Link>
        </div>
      )}

      <Card className="flex flex-col gap-3">
        <H2>المدفوعات</H2>
        {payments?.length ? (
          <ul className="flex flex-col">
            {payments.map((p) => (
              <li key={p.id} className="flex justify-between border-t border-[#F2F4F7] py-2.5 text-sm">
                <span>{new Date(p.created_at).toLocaleDateString("ar-EG")} · {p.method ?? "-"}</span>
                <b>{p.amount_cents / 100} ج · {p.status === "success" ? "ناجح" : p.status === "failed" ? "فشل" : p.status === "refunded" ? "مسترد" : "مستني"}</b>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted">مفيش مدفوعات لسه.</p>
        )}
      </Card>
    </>
  );
}
