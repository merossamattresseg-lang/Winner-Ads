import crypto from "node:crypto";
import { META_PIXEL_ID, SITE_URL } from "./site";

// Meta Conversions API: بيبعت أحداث التسجيل والشراء من السيرفر، ومعاها event_id لمنع التكرار مع البيكسل.
const sha = (v?: string | null) => (v ? crypto.createHash("sha256").update(v.trim().toLowerCase()).digest("hex") : undefined);
const normPhone = (p?: string | null) => (p ? p.replace(/\D/g, "").replace(/^0/, "20") : undefined);

export async function sendCapiEvent(opts: {
  name: "CompleteRegistration" | "Purchase" | "StartTrial";
  eventId: string;
  email?: string | null;
  phone?: string | null;
  userId?: string;
  value?: number;
  ip?: string | null;
  userAgent?: string | null;
  path?: string;
}) {
  const token = process.env.META_CAPI_TOKEN;
  if (!token || !META_PIXEL_ID) return { sent: false };
  const body = {
    data: [{
      event_name: opts.name,
      event_time: Math.floor(Date.now() / 1000),
      event_id: opts.eventId,
      action_source: "website",
      event_source_url: `${SITE_URL}${opts.path ?? "/"}`,
      user_data: {
        em: sha(opts.email) ? [sha(opts.email)] : undefined,
        ph: sha(normPhone(opts.phone)) ? [sha(normPhone(opts.phone))] : undefined,
        external_id: sha(opts.userId) ? [sha(opts.userId)] : undefined,
        client_ip_address: opts.ip ?? undefined,
        client_user_agent: opts.userAgent ?? undefined,
      },
      custom_data: opts.value ? { currency: "EGP", value: opts.value } : undefined,
    }],
    ...(process.env.META_TEST_EVENT_CODE ? { test_event_code: process.env.META_TEST_EVENT_CODE } : {}),
  };
  try {
    const res = await fetch(`https://graph.facebook.com/v21.0/${META_PIXEL_ID}/events?access_token=${token}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return { sent: res.ok };
  } catch {
    return { sent: false };
  }
}
