// إعدادات عامة للموقع من Environment Variables، بقيم افتراضية آمنة.
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
export const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? ""; // بالصيغة الدولية من غير +، مثال 2010xxxxxxxx
export const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID ?? "";

export const waLink = (text?: string, phone = WHATSAPP_NUMBER) =>
  `https://wa.me/${phone}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
