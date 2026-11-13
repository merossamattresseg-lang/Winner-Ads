import { createAdminClient } from "./supabase/server";

export type CouponCheck = { ok: true; code: string; percent: number } | { ok: false; message: string };

// التحقق من كود الخصم لعميل وباقة معينين.
export async function checkCoupon(rawCode: string, userId: string, planId: string): Promise<CouponCheck> {
  const code = rawCode.trim().toUpperCase();
  if (!code) return { ok: false, message: "اكتب كود الخصم." };
  const admin = createAdminClient();
  if (!admin) return { ok: false, message: "أكواد الخصم غير متاحة حاليًا." };
  const { data: c } = await admin.from("coupons").select("*").eq("code", code).maybeSingle();
  if (!c || !c.active) return { ok: false, message: "الكود غير صحيح." };
  if (c.expires_at && new Date(c.expires_at) < new Date()) return { ok: false, message: "انتهت صلاحية الكود." };
  if (c.max_uses != null && c.used >= c.max_uses) return { ok: false, message: "تم استخدام الكود بالكامل." };
  if (c.plan_ids?.length && !c.plan_ids.includes(planId)) return { ok: false, message: "الكود لا ينطبق على هذه الباقة." };
  const { count: used } = await admin.from("coupon_redemptions").select("id", { count: "exact", head: true }).eq("code", code).eq("user_id", userId);
  if (used) return { ok: false, message: "استخدمت هذا الكود من قبل." };
  if (c.first_payment_only) {
    const { count } = await admin.from("payments").select("id", { count: "exact", head: true }).eq("user_id", userId).eq("status", "success");
    if (count) return { ok: false, message: "الكود للاشتراك الأول فقط." };
  }
  return { ok: true, code, percent: c.percent };
}

export const applyPercent = (price: number, percent: number) => Math.max(1, Math.round(price * (1 - percent / 100)));

export async function redeemCoupon(code: string, userId: string, paymentRef: string) {
  const admin = createAdminClient();
  if (!admin) return;
  const { error } = await admin.from("coupon_redemptions").insert({ code, user_id: userId, payment_ref: paymentRef });
  if (!error) {
    const { data } = await admin.from("coupons").select("used").eq("code", code).single();
    await admin.from("coupons").update({ used: (data?.used ?? 0) + 1 }).eq("code", code);
  }
}
