import { buildMessage, emailHtml, type MessageKind } from "./messages";
import { createAdminClient } from "./supabase/server";

// الإرسال عن طريق Resend. لو RESEND_API_KEY مش موجود، الرسالة بتتسجل في اللوج بس ومفيش حاجة بتقع.
const FROM = process.env.EMAIL_FROM ?? "WinnerAds <onboarding@resend.dev>";

export async function sendEmail(opts: { to: string; kind: MessageKind; userId?: string; ref?: string; ctx?: Parameters<typeof buildMessage>[1] }) {
  const admin = createAdminClient();
  // منع تكرار نفس الرسالة لنفس العميل.
  if (admin && opts.userId) {
    const { error } = await admin.from("email_log").insert({ user_id: opts.userId, kind: opts.kind, ref: opts.ref ?? "once" });
    if (error) return { skipped: true };
  }
  const m = buildMessage(opts.kind, opts.ctx ?? {});
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.log("email_not_configured", opts.kind, opts.to);
    return { sent: false };
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: FROM, to: opts.to, subject: m.subject, html: emailHtml(m) }),
  });
  return { sent: res.ok };
}
