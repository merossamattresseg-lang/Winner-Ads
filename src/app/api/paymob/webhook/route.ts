import { NextResponse } from "next/server";
import { verifyHmac } from "@/lib/paymob";
import { createAdminClient } from "@/lib/supabase/server";

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
  }
  return NextResponse.json({ ok: true });
}
