import { NextResponse } from "next/server";
import { verifyHmac } from "@/lib/paymob";

// Paymob بيبعت هنا نتيجة كل عملية دفع.
// المرحلة الجاية: لو success = true نفعّل الاشتراك ونضيف النقاط في Supabase.
export async function POST(req: Request) {
  const url = new URL(req.url);
  const payload = (await req.json().catch(() => null)) as { type?: string; obj?: Record<string, unknown> } | null;
  if (!payload?.obj || !verifyHmac(payload.obj, url.searchParams.get("hmac"))) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const success = payload.obj.success === true;
  // TODO (المرحلة التالتة): حفظ العملية في جدول payments وتفعيل subscriptions.
  console.log("paymob_transaction", { id: payload.obj.id, success });
  return NextResponse.json({ ok: true });
}
