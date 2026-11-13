import crypto from "node:crypto";

// كل مفاتيح Paymob بتتحط في Environment Variables على Vercel، ومفيش أي مفتاح في الكود.
// لحد ما المفاتيح تتحط، الدفع بيفضل مقفول والصفحة بتقول "الدفع هيتفعل قريب".
export const paymobEnv = {
  secretKey: process.env.PAYMOB_SECRET_KEY,
  hmacSecret: process.env.PAYMOB_HMAC_SECRET,
  publicKey: process.env.NEXT_PUBLIC_PAYMOB_PUBLIC_KEY,
  cardIntegrationId: process.env.PAYMOB_CARD_INTEGRATION_ID,
  walletIntegrationId: process.env.PAYMOB_WALLET_INTEGRATION_ID,
  applePayIntegrationId: process.env.PAYMOB_APPLE_PAY_INTEGRATION_ID,
  baseUrl: process.env.PAYMOB_BASE_URL ?? "https://accept.paymob.com",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
};

export const paymobReady = () => Boolean(paymobEnv.secretKey && paymobEnv.publicKey && paymobEnv.hmacSecret && paymobEnv.cardIntegrationId);

type Customer = { firstName: string; lastName: string; email: string; phone: string };

// بيعمل Payment Intention ويرجّع client_secret اللي الـ Pixel بيحتاجه في الصفحة.
export async function createIntention(opts: { amountEgp: number; planId: string; planName: string; method: "card" | "wallet" | "apple"; customer: Customer; reference: string }) {
  const integration =
    opts.method === "wallet" ? paymobEnv.walletIntegrationId : opts.method === "apple" ? paymobEnv.applePayIntegrationId : paymobEnv.cardIntegrationId;
  if (!integration) throw new Error("integration_missing");
  const amount = Math.round(opts.amountEgp * 100);
  const res = await fetch(`${paymobEnv.baseUrl}/v1/intention/`, {
    method: "POST",
    headers: { Authorization: `Token ${paymobEnv.secretKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      amount,
      currency: "EGP",
      payment_methods: [Number(integration)],
      items: [{ name: `WinnerAds ${opts.planName}`, amount, description: `اشتراك شهري ${opts.planName}`, quantity: 1 }],
      billing_data: {
        first_name: opts.customer.firstName,
        last_name: opts.customer.lastName,
        email: opts.customer.email,
        phone_number: opts.customer.phone,
        country: "EG",
      },
      special_reference: opts.reference,
      notification_url: `${paymobEnv.siteUrl}/api/paymob/webhook`,
      redirection_url: `${paymobEnv.siteUrl}/pricing?status=done`,
      extras: { plan_id: opts.planId },
    }),
  });
  if (!res.ok) throw new Error(`paymob_${res.status}`);
  const data = (await res.json()) as { client_secret: string; id: string };
  return { clientSecret: data.client_secret, intentionId: data.id };
}

// التحقق من توقيع إشعار Paymob (Transaction processed callback).
// الاشتراك بيتفعل من هنا بس، مش من رجوع المتصفح.
const HMAC_FIELDS = [
  "amount_cents", "created_at", "currency", "error_occured", "has_parent_transaction", "id", "integration_id",
  "is_3d_secure", "is_auth", "is_capture", "is_refunded", "is_standalone_payment", "is_voided", "order.id",
  "owner", "pending", "source_data.pan", "source_data.sub_type", "source_data.type", "success",
];

function pick(obj: Record<string, unknown>, path: string): string {
  const v = path.split(".").reduce<unknown>((o, k) => (o && typeof o === "object" ? (o as Record<string, unknown>)[k] : undefined), obj);
  return v === undefined || v === null ? "" : String(v);
}

export function verifyHmac(obj: Record<string, unknown>, received: string | null): boolean {
  if (!paymobEnv.hmacSecret || !received) return false;
  const concatenated = HMAC_FIELDS.map((f) => pick(obj, f)).join("");
  const expected = crypto.createHmac("sha512", paymobEnv.hmacSecret).update(concatenated).digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(received);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
