// بوت تليجرام للتنبيهات. بيشتغل لما TELEGRAM_BOT_TOKEN يتحط.
const token = () => process.env.TELEGRAM_BOT_TOKEN;
export const BOT_USERNAME = process.env.NEXT_PUBLIC_TELEGRAM_BOT ?? "";
export const botReady = () => Boolean(token() && BOT_USERNAME);
export const botLink = (linkToken?: string | null) => (BOT_USERNAME ? `https://t.me/${BOT_USERNAME}${linkToken ? `?start=${linkToken}` : ""}` : null);

export async function sendTelegram(chatId: number | string, text: string) {
  const t = token();
  if (!t) return { sent: false };
  const res = await fetch(`https://api.telegram.org/bot${t}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, disable_web_page_preview: true }),
  }).catch(() => null);
  return { sent: Boolean(res?.ok) };
}

export async function setBotWebhook(siteUrl: string) {
  const t = token();
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (!t || !secret) return { ok: false, error: "TELEGRAM_BOT_TOKEN أو TELEGRAM_WEBHOOK_SECRET غير موجود" };
  const res = await fetch(`https://api.telegram.org/bot${t}/setWebhook`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url: `${siteUrl}/api/telegram/webhook`, secret_token: secret, allowed_updates: ["message"] }),
  });
  return { ok: res.ok };
}
