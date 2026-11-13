import { NextResponse } from "next/server";
import { plans } from "@/lib/mock-data";
import { createIntention, paymobReady } from "@/lib/paymob";

export async function POST(req: Request) {
  if (!paymobReady()) {
    return NextResponse.json({ error: "payments_not_configured", message: "الدفع هيتفعل قريب" }, { status: 503 });
  }
  const body = (await req.json().catch(() => null)) as {
    planId?: string; method?: "card" | "wallet" | "apple"; name?: string; email?: string; phone?: string;
  } | null;
  const plan = plans.find((p) => p.id === body?.planId);
  if (!plan || !body?.email || !body?.phone) {
    return NextResponse.json({ error: "bad_request", message: "البيانات ناقصة" }, { status: 400 });
  }
  const [firstName, ...rest] = (body.name ?? "عميل").trim().split(/\s+/);
  try {
    const { clientSecret } = await createIntention({
      amountEgp: plan.price,
      planId: plan.id,
      planName: plan.name,
      method: body.method ?? "card",
      customer: { firstName, lastName: rest.join(" ") || firstName, email: body.email, phone: body.phone },
      reference: `wa_${plan.id}_${Date.now()}`,
    });
    return NextResponse.json({ clientSecret, publicKey: process.env.NEXT_PUBLIC_PAYMOB_PUBLIC_KEY });
  } catch {
    return NextResponse.json({ error: "paymob_error", message: "حصلت مشكلة في بدء الدفع، جرب تاني" }, { status: 502 });
  }
}
