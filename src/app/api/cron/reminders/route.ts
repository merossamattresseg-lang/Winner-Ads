import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";
import { createAdminClient } from "@/lib/supabase/server";

// بيشتغل مرة كل يوم من Vercel Cron. بيبعت: تذكير قبل نهاية التجربة، وتذكير قبل التجديد، ورسالة لمن سجل ولم يبحث.
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) return NextResponse.json({ ok: false }, { status: 401 });
  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ ok: false, error: "service_role_missing" }, { status: 500 });

  const now = Date.now();
  const iso = (ms: number) => new Date(ms).toISOString();
  const emailOf = async (id: string) => (await admin.auth.admin.getUserById(id)).data.user?.email;
  let sent = 0;

  // التجربة تنتهي خلال 24 ساعة، ولا يوجد اشتراك.
  const { data: ending } = await admin.from("profiles").select("id, full_name").gt("trial_ends_at", iso(now)).lt("trial_ends_at", iso(now + 86400000));
  for (const p of ending ?? []) {
    const { count } = await admin.from("subscriptions").select("id", { count: "exact", head: true }).eq("user_id", p.id);
    const email = !count ? await emailOf(p.id) : null;
    if (email) { await sendEmail({ to: email, kind: "trial_ending", userId: p.id, ctx: { name: p.full_name } }); sent++; }
  }

  // اشتراك يتجدد خلال 3 أيام.
  const { data: renewals } = await admin.from("subscriptions").select("id, user_id, current_period_end, plans(name, price_egp)").eq("status", "active").eq("auto_renew", true).gt("current_period_end", iso(now + 2 * 86400000)).lt("current_period_end", iso(now + 3 * 86400000));
  for (const s of renewals ?? []) {
    const plan = s.plans as { name?: string; price_egp?: number } | null;
    const email = await emailOf(s.user_id);
    if (email) { await sendEmail({ to: email, kind: "renewal", userId: s.user_id, ref: s.current_period_end, ctx: { plan: plan?.name, amount: plan?.price_egp, until: new Date(s.current_period_end).toLocaleDateString("ar-EG") } }); sent++; }
  }

  // سجّل منذ يوم أو أكثر ولم يستخدم أي نقطة.
  const { data: fresh } = await admin.from("profiles").select("id, full_name").lt("created_at", iso(now - 86400000)).gt("created_at", iso(now - 2 * 86400000));
  for (const p of fresh ?? []) {
    const { count } = await admin.from("credits_ledger").select("id", { count: "exact", head: true }).eq("user_id", p.id).lt("delta", 0);
    const email = !count ? await emailOf(p.id) : null;
    if (email) { await sendEmail({ to: email, kind: "inactive", userId: p.id, ctx: { name: p.full_name } }); sent++; }
  }

  return NextResponse.json({ ok: true, sent });
}
