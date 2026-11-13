import { NextResponse } from "next/server";
import { SITE_URL } from "@/lib/site";
import { createAdminClient } from "@/lib/supabase/server";
import { sendTelegram } from "@/lib/telegramBot";

// تليجرام بيبعت هنا رسائل البوت. /start <token> بيربط المحادثة بحساب العميل.
export async function POST(req: Request) {
  if (!process.env.TELEGRAM_WEBHOOK_SECRET || req.headers.get("x-telegram-bot-api-secret-token") !== process.env.TELEGRAM_WEBHOOK_SECRET) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const update = (await req.json().catch(() => null)) as { message?: { chat?: { id: number }; text?: string } } | null;
  const chatId = update?.message?.chat?.id;
  const text = update?.message?.text ?? "";
  if (!chatId) return NextResponse.json({ ok: true });
  const admin = createAdminClient();
  const m = text.match(/^\/start\s+([a-f0-9]{8,32})/);
  if (m && admin) {
    const { data } = await admin.from("profiles").update({ telegram_chat_id: chatId }).eq("telegram_link_token", m[1]).select("full_name").maybeSingle();
    await sendTelegram(chatId, data ? `مرحبًا ${data.full_name ?? ""}، تم ربط حسابك. ستصلك التنبيهات هنا.` : "الرابط غير صالح. افتح الرابط من صفحة الحساب في WinnerAds.");
  } else if (text.startsWith("/stop") && admin) {
    await admin.from("profiles").update({ telegram_chat_id: null }).eq("telegram_chat_id", chatId);
    await sendTelegram(chatId, "تم إيقاف التنبيهات.");
  } else {
    await sendTelegram(chatId, `للربط افتح صفحة الحساب: ${SITE_URL}/account`);
  }
  return NextResponse.json({ ok: true });
}
