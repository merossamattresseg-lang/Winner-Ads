import { SITE_URL } from "./site";

// نصوص الرسائل التلقائية (البريد وواتساب) في مكان واحد عشان تتعدل بسهولة.
export type MessageKind = "welcome" | "inactive" | "trial_ending" | "receipt" | "payment_failed" | "renewal" | "competitor" | "weekly";

type Ctx = { note?: string; name?: string | null; plan?: string; amount?: number; until?: string; points?: number; credits?: number };

export function buildMessage(kind: MessageKind, c: Ctx) {
  const hi = `مرحبًا ${c.name || ""}`.trim();
  switch (kind) {
    case "welcome":
      return { subject: "مرحبًا بك في WinnerAds", title: "حسابك جاهز", body: `${hi}، لديك 3 أيام و100 نقطة لتجربة كل الأدوات.`, cta: "ابدأ البحث", url: `${SITE_URL}/dashboard`, wa: `${hi}، حسابك في WinnerAds جاهز: ${SITE_URL}/dashboard` };
    case "inactive":
      return { subject: "منتجات رابحة في قسمك", title: "جهّزنا لك منتجات رابحة", body: `${hi}، اخترنا لك أبرز المنتجات الرابحة اليوم في أقسامك.`, cta: "عرض المنتجات", url: `${SITE_URL}/dashboard`, wa: `${hi}، منتجات رابحة جديدة في قسمك: ${SITE_URL}/dashboard` };
    case "trial_ending":
      return { subject: "تبقّى يوم واحد في تجربتك", title: "تبقّى يوم واحد", body: `${hi}، تنتهي تجربتك غدًا. اشترك الآن بخصم 20% بالكود WIN20.`, cta: "اشترك الآن", url: `${SITE_URL}/pricing`, wa: `${hi}، تبقّى يوم في تجربتك. خصم 20% بالكود WIN20: ${SITE_URL}/pricing` };
    case "receipt":
      return { subject: "فاتورة اشتراكك", title: `تم تفعيل اشتراك ${c.plan ?? ""}`, body: `المبلغ: ${c.amount ?? 0} ج.م · ساري حتى ${c.until ?? ""} · رصيدك ${c.points?.toLocaleString("en-US") ?? 0} نقطة.`, cta: "الذهاب للحساب", url: `${SITE_URL}/account`, wa: `${hi}، تم تفعيل اشتراك ${c.plan ?? ""} حتى ${c.until ?? ""}.` };
    case "payment_failed":
      return { subject: "لم يكتمل الدفع", title: "لم يكتمل الدفع", body: "لم يُخصم أي مبلغ. يمكنك المحاولة مرة أخرى أو استخدام وسيلة دفع مختلفة.", cta: "إعادة المحاولة", url: `${SITE_URL}/pricing`, wa: `${hi}، لم يكتمل الدفع. رابط جديد: ${SITE_URL}/pricing` };
    case "weekly":
      return { subject: "أكثر المنتجات ربحًا هذا الأسبوع", title: "تقريرك الأسبوعي", body: c.note ?? "", cta: "عرض القائمة كاملة", url: `${SITE_URL}/products`, wa: `أكثر المنتجات ربحًا هذا الأسبوع: ${SITE_URL}/products` };
    case "competitor":
      return { subject: c.note ?? "إعلانات جديدة من منافسيك", title: "إعلانات جديدة من منافسيك", body: c.note ?? "", cta: "عرض الإعلانات", url: `${SITE_URL}/dashboard`, wa: `${c.note ?? ""}: ${SITE_URL}/dashboard` };
    case "renewal":
      return { subject: "يتجدد اشتراكك بعد 3 أيام", title: "تذكير بالتجديد", body: `يتجدد اشتراك ${c.plan ?? ""} يوم ${c.until ?? ""} بقيمة ${c.amount ?? 0} ج.م.`, cta: "إدارة الاشتراك", url: `${SITE_URL}/account`, wa: `${hi}، يتجدد اشتراكك يوم ${c.until ?? ""} بقيمة ${c.amount ?? 0} ج.م.` };
  }
}

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export function emailHtml(m: ReturnType<typeof buildMessage>) {
  return `<!doctype html><html lang="ar" dir="rtl"><body style="margin:0;background:#f7f8fa;font-family:Tahoma,Arial,sans-serif;color:#0b1324">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:24px">
<table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fff;border:1px solid #e4e7ec;border-radius:16px;overflow:hidden">
<tr><td style="background:#0b1324;padding:16px 24px;font-size:20px;font-weight:bold;color:#fff" dir="ltr" align="right">Winner<span style="color:#c8f03c">Ads</span></td></tr>
<tr><td style="padding:28px 24px;text-align:right">
<h1 style="margin:0 0 12px;font-size:22px">${esc(m.title)}</h1>
<p style="margin:0 0 20px;font-size:15px;line-height:1.8;color:#344054">${esc(m.body).replace(/\n/g, "<br>")}</p>
<a href="${m.url}" style="display:inline-block;background:#c8f03c;color:#0b1324;font-weight:bold;padding:12px 22px;border-radius:10px;text-decoration:none">${m.cta}</a>
<p style="margin:24px 0 0;font-size:12px;color:#98a2b3">لإيقاف الرسائل الدورية: إعدادات الحساب.</p>
</td></tr></table></td></tr></table></body></html>`;
}
