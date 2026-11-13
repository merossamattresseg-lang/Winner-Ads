import { NextResponse } from "next/server";
import { verifyHmac } from "@/lib/paymob";
import { sendEmail } from "@/lib/email";
import { sendCapiEvent } from "@/lib/meta";
import { createAdminClient } from "@/lib/supabase/server";

const REFERRAL_POINTS = 1000;

// Paymob بيبعت هنا نتيجة كل عملية دفع. الاشتراك بيتفعل من هنا بس.
export async function POST(req: Request) {
  const url = new URL(req.url);
  const payload = (await req.json().catch(() => null)) as { type?: string; obj?: Record<string, unknown> } | null;
  const obj = payload?.obj;
  if (!obj || !verifyHmac(obj, url.searchParams.get("hmac"))) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ ok: false, error: "service_role_missing" }, { status: 500 });

  const order = (obj.order ?? {}) as Record<string, unknown>;
  const reference = String(obj.special_reference ?? order.merchant_order_id ?? "");
  const match = reference.match(/^wa_([a-z0-9_-]+?)_([0-9a-f-]{36})_\d+$/);
  const txId = String(obj.id);
  const success = obj.success === true && obj.pending !== true;
  const refunded = obj.is_refunded === true;
  const status = refunded ? "refunded" : success ? "success" : obj.pending === true ? "pending" : "failed";

  // الدفعة بتتسجل مرة واحدة بس حتى لو Paymob بعت الإشعار أكتر من مرة.
  const { data: existing } = await admin.from("payments").select("id, status").eq("paymob_transaction_id", txId).maybeSingle();
  if (existing?.status === "success" && status === "success") return NextResponse.json({ ok: true, duplicate: true });

  const row = {
    paymob_transaction_id: txId,
    status,
    amount_cents: Number(obj.amount_cents ?? 0),
    method: String(((obj.source_data ?? {}) as Record<string, unknown>).type ?? ""),
    raw: obj,
    ...(match ? { plan_id: match[1], user_id: match[2] } : {}),
  };
  const { data: pending } = await admin.from("payments").select("id").eq("special_reference", reference).is("paymob_transaction_id", null).maybeSingle();
  if (pending) await admin.from("payments").update(row).eq("id", pending.id);
  else await admin.from("payments").insert({ ...row, special_reference: reference });

  if (status === "success" && match) {
    const [, planId, userId] = match;
    const { data: plan } = await admin.from("plans").select("monthly_points").eq("id", planId).single();
    const { data: current } = await admin.from("subscriptions").select("id, current_period_end").eq("user_id", userId).eq("status", "active").order("current_period_end", { ascending: false }).limit(1).maybeSingle();
    const base = current && new Date(current.current_period_end) > new Date() ? new Date(current.current_period_end) : new Date();
    const end = new Date(base.getTime() + 30 * 24 * 3600 * 1000).toISOString();
    if (current) await admin.from("subscriptions").update({ plan_id: planId, current_period_end: end }).eq("id", current.id);
    else await admin.from("subscriptions").insert({ user_id: userId, plan_id: planId, status: "active", current_period_end: end });
    if (plan?.monthly_points) await admin.from("credits_ledger").insert({ user_id: userId, delta: plan.monthly_points, reason: `اشتراك ${planId} ${txId}` });

    // مكافأة الإحالة: مرة واحدة عند أول اشتراك للعميل المُحال.
    const { data: prof } = await admin.from("profiles").select("full_name, phone, referred_by, referral_rewarded").eq("id", userId).single();
    if (prof?.referred_by && !prof.referral_rewarded) {
      await admin.from("profiles").update({ referral_rewarded: true }).eq("id", userId);
      await admin.from("credits_ledger").insert([
        { user_id: userId, delta: REFERRAL_POINTS, reason: "مكافأة إحالة" },
        { user_id: prof.referred_by, delta: REFERRAL_POINTS, reason: "مكافأة إحالة" },
      ]);
    }

    const { data: authUser } = await admin.auth.admin.getUserById(userId);
    const email = authUser.user?.email;
    const { data: planRow } = await admin.from("plans").select("name").eq("id", planId).single();
    const amount = Number(obj.amount_cents ?? 0) / 100;
    if (email) await sendEmail({ to: email, kind: "receipt", userId, ref: txId, ctx: { name: prof?.full_name, plan: planRow?.name ?? planId, amount, until: new Date(end).toLocaleDateString("ar-EG"), points: plan?.monthly_points } });
    await sendCapiEvent({ name: "Purchase", eventId: `pay_${txId}`, email, phone: prof?.phone, userId, value: amount, path: "/pricing" });
  }

  if (status === "failed" && match) {
    const userId = match[2];
    const admin2 = createAdminClient();
    const { data: authUser } = await admin2!.auth.admin.getUserById(userId);
    if (authUser.user?.email) await sendEmail({ to: authUser.user.email, kind: "payment_failed", userId, ref: txId });
  }
  return NextResponse.json({ ok: true });
}
