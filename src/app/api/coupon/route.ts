import { NextResponse } from "next/server";
import { applyPercent, checkCoupon } from "@/lib/coupons";
import { getPlans } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";

// معاينة كود الخصم قبل الدفع.
export async function GET(req: Request) {
  const url = new URL(req.url);
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ ok: false, message: "سجّل الدخول لاستخدام الكود." }, { status: 401 });
  const plan = (await getPlans()).find((p) => p.id === url.searchParams.get("plan"));
  if (!plan) return NextResponse.json({ ok: false, message: "اختر باقة." }, { status: 400 });
  const r = await checkCoupon(url.searchParams.get("code") ?? "", user.id, plan.id);
  if (!r.ok) return NextResponse.json(r);
  return NextResponse.json({ ...r, total: applyPercent(plan.price, r.percent) });
}
