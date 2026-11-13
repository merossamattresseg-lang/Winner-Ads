import { NextResponse } from "next/server";
import { applyPercent, checkCoupon } from "@/lib/coupons";
import { getPlans } from "@/lib/data";
import { createIntention, paymobReady } from "@/lib/paymob";
import { createAdminClient, createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  if (!paymobReady()) {
    return NextResponse.json({ error: "payments_not_configured", message: "الدفع هيتفعل قريب" }, { status: 503 });
  }
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "login_required", message: "سجل دخول الأول" }, { status: 401 });

  const body = (await req.json().catch(() => null)) as {
    planId?: string; method?: "card" | "wallet" | "apple"; name?: string; email?: string; phone?: string; coupon?: string;
  } | null;
  const plan = (await getPlans()).find((p) => p.id === body?.planId);
  if (!plan || !body?.phone) {
    return NextResponse.json({ error: "bad_request", message: "البيانات غير مكتملة." }, { status: 400 });
  }
  let amount = plan.price;
  let couponCode: string | null = null;
  if (body.coupon) {
    const c = await checkCoupon(body.coupon, user.id, plan.id);
    if (!c.ok) return NextResponse.json({ error: "coupon", message: c.message }, { status: 400 });
    amount = applyPercent(plan.price, c.percent);
    couponCode = c.code;
  }
  const [firstName, ...rest] = (body.name ?? "عميل").trim().split(/\s+/);
  // المرجع فيه الباقة وصاحب الحساب، والـ webhook بيستخدمه يفعّل الاشتراك.
  const reference = `wa_${plan.id}_${user.id}_${Date.now()}`;
  try {
    const { clientSecret } = await createIntention({
      amountEgp: amount,
      planId: plan.id,
      planName: plan.name,
      method: body.method ?? "card",
      customer: { firstName, lastName: rest.join(" ") || firstName, email: body.email || user.email || "", phone: body.phone },
      reference,
    });
    await createAdminClient()?.from("payments").insert({
      user_id: user.id, plan_id: plan.id, amount_cents: amount * 100, method: body.method ?? "card", status: "pending", special_reference: reference,
      coupon_code: couponCode, discount_cents: (plan.price - amount) * 100,
    });
    return NextResponse.json({ clientSecret, publicKey: process.env.NEXT_PUBLIC_PAYMOB_PUBLIC_KEY });
  } catch {
    return NextResponse.json({ error: "paymob_error", message: "تعذر بدء الدفع. حاول مرة أخرى." }, { status: 502 });
  }
}
