// داتا تجريبية للمرحلة الأولى. هتتبدل بداتا حقيقية من قاعدة البيانات ومصادر السحب.
import { winnerScore } from "./score";

export type Platform = "ميتا" | "تيك توك" | "ريلز فيسبوك" | "بنترست";

export type Ad = {
  id: string;
  product: string;
  page: string;
  advertiserId: string;
  platform: Platform;
  start: string;
  days: number;
  copies: number;
  views: string;
  likes: string;
  comments: string;
  shares: string;
  engagement: number;
  advertisers: number;
  suppliers: number;
  copy: string;
  cta: string;
  angle: string;
  landing: string;
  sellPrice: number;
  score: number;
};

const rawAds: Omit<Ad, "score">[] = [
  { id: "knee-massager", product: "جهاز تدليك الركبة", page: "كير شوب", advertiserId: "care-shop", platform: "ميتا", start: "15 أغسطس 2026", days: 89, copies: 14, views: "2.1M", likes: "38K", comments: "4.6K", shares: "2.9K", engagement: 0.82, advertisers: 4, suppliers: 4, copy: "ركبتك بتوجعك مع كل خطوة؟\nجهاز التدليك بالحرارة والاهتزاز بيريح المفصل في 15 دقيقة بس.\n3 درجات حرارة، وبيشحن بالـ USB، ومناسب للركبة والكوع.\nالدفع عند الاستلام والشحن لكل المحافظات.", cta: "اطلب دلوقتي", angle: "الألم", landing: "careshop-eg.com/knee", sellPrice: 899 },
  { id: "drawer-organizer", product: "منظم أدراج المطبخ", page: "هوم ستايل مصر", advertiserId: "home-style", platform: "تيك توك", start: "12 سبتمبر 2026", days: 61, copies: 9, views: "3.4M", likes: "61K", comments: "2.2K", shares: "5.1K", engagement: 0.95, advertisers: 5, suppliers: 6, copy: "المطبخ هيبقى مترتب في دقيقة. 6 قطع بمقاسات مختلفة تناسب أي درج.", cta: "اطلب دلوقتي", angle: "الترتيب", landing: "homestyle-eg.com/organizer", sellPrice: 349 },
  { id: "foam-mattress", product: "مرتبة طبية فوم", page: "بيت الراحة", advertiserId: "rest-home", platform: "ميتا", start: "27 سبتمبر 2026", days: 47, copies: 6, views: "640K", likes: "9.8K", comments: "1.1K", shares: "640", engagement: 0.55, advertisers: 4, suppliers: 2, copy: "نوم مريح لضهرك. مرتبة فوم طبية بضمان 10 سنين وتوصيل لحد البيت.", cta: "ابعت رسالة", angle: "النوم المريح", landing: "resthome-eg.com/foam", sellPrice: 2499 },
  { id: "hot-brush", product: "فرشاة شعر حرارية", page: "ستايل ستور", advertiserId: "style-store", platform: "ريلز فيسبوك", start: "6 أكتوبر 2026", days: 38, copies: 5, views: "1.2M", likes: "22K", comments: "3.4K", shares: "1.8K", engagement: 0.7, advertisers: 6, suppliers: 5, copy: "شعرك مفرود ولامع من غير سشوار. الفرشاة بتسخن في 30 ثانية.", cta: "اطلب دلوقتي", angle: "توفير الوقت", landing: "stylestore-eg.com/brush", sellPrice: 449 },
  { id: "solar-light", product: "كشاف طاقة شمسية", page: "سمارت هوم", advertiserId: "smart-home", platform: "تيك توك", start: "20 أكتوبر 2026", days: 24, copies: 3, views: "890K", likes: "14K", comments: "900", shares: "1.2K", engagement: 0.6, advertisers: 3, suppliers: 3, copy: "نور الجنينة من غير كهربا. بيشحن بالنهار ويشتغل لوحده بالليل.", cta: "اطلب دلوقتي", angle: "توفير الكهربا", landing: "smarthome-eg.com/solar", sellPrice: 299 },
  { id: "laptop-bag", product: "شنطة لابتوب ضد المية", page: "باك مصر", advertiserId: "bag-masr", platform: "ميتا", start: "1 نوفمبر 2026", days: 12, copies: 2, views: "210K", likes: "3.1K", comments: "240", shares: "180", engagement: 0.35, advertisers: 2, suppliers: 1, copy: "شنطة واحدة للشغل والسفر. ضد المية وفيها شاحن USB.", cta: "اعرف أكتر", angle: "العملية", landing: "bagmasr.com/laptop", sellPrice: 549 },
  { id: "smart-watch", product: "ساعة ذكية رياضية", page: "تك زون", advertiserId: "tech-zone", platform: "بنترست", start: "3 نوفمبر 2026", days: 10, copies: 1, views: "95K", likes: "1.4K", comments: "90", shares: "60", engagement: 0.3, advertisers: 3, suppliers: 0, copy: "تابع نبضك وخطواتك ونومك. بطارية بتقعد 7 أيام.", cta: "اطلب دلوقتي", angle: "الصحة", landing: "techzone-eg.com/watch", sellPrice: 799 },
  { id: "neck-pillow", product: "مخدة طبية للرقبة", page: "بيت الراحة", advertiserId: "rest-home", platform: "ميتا", start: "8 نوفمبر 2026", days: 5, copies: 2, views: "48K", likes: "820", comments: "140", shares: "40", engagement: 0.4, advertisers: 4, suppliers: 2, copy: "صحيت ورقبتك وجعاك؟ المخدة الطبية بتسند رقبتك طول الليل.", cta: "اطلب دلوقتي", angle: "الألم", landing: "resthome-eg.com/pillow", sellPrice: 399 },
];

export const ads: Ad[] = rawAds
  .map((a) => ({ ...a, score: winnerScore({ days: a.days, copies: a.copies, engagement: a.engagement, advertisers: a.advertisers, hasSupplier: a.suppliers > 0 }) }))
  .sort((a, b) => b.score - a.score);

export const getAd = (id: string) => ads.find((a) => a.id === id);

export type SupplierOffer = { id: string; adId: string; channel: string; kind: "جملة" | "مستورد" | "دروب شيبنج"; text: string; when: string; moq: string; price: number; match: number };

export const supplierOffers: SupplierOffer[] = [
  { id: "s1", adId: "knee-massager", channel: "موردين العتبة", kind: "جملة", text: "جهاز تدليك ركبة بالحرارة والاهتزاز، 3 درجات، شاحن USB. متاح كميات", when: "من ساعة", moq: "10 قطع", price: 420, match: 96 },
  { id: "s2", adId: "knee-massager", channel: "مستورد مباشر", kind: "مستورد", text: "Knee massager أصلي بالكرتونة، صور حقيقية في الرسالة", when: "من يومين", moq: "20 قطعة", price: 445, match: 91 },
  { id: "s3", adId: "knee-massager", channel: "جملة الموسكي", kind: "جملة", text: "مدلك ركبة بشاحن، لونين أبيض ورمادي", when: "من 5 أيام", moq: "20 قطعة", price: 470, match: 84 },
  { id: "s4", adId: "knee-massager", channel: "بضاعة الصين مصر", kind: "مستورد", text: "جهاز مساج للركبة والكوع، شحن لكل المحافظات", when: "من 6 أيام", moq: "5 قطع", price: 490, match: 80 },
  { id: "s5", adId: "knee-massager", channel: "دروب مصر", kind: "دروب شيبنج", text: "متاح دروب شيبنج من غير مخزون، بنشحن باسمك", when: "من 6 أيام", moq: "قطعة واحدة", price: 560, match: 78 },
  { id: "s6", adId: "drawer-organizer", channel: "جملة الموسكي", kind: "جملة", text: "منظم أدراج 6 قطع بلاستيك مقوى", when: "من 3 ساعات", moq: "12 طقم", price: 95, match: 93 },
  { id: "s7", adId: "hot-brush", channel: "مستورد مباشر", kind: "مستورد", text: "فرشاة شعر حرارية سيراميك", when: "امبارح", moq: "10 قطع", price: 160, match: 90 },
];

export const offersFor = (adId: string) => supplierOffers.filter((s) => s.adId === adId);
export const cheapestCost = (adId: string) => {
  const o = offersFor(adId);
  return o.length ? Math.min(...o.map((x) => x.price)) : null;
};

export type Advertiser = { id: string; name: string; category: string; followers: string; since: string; domain: string; platform: string; activeAds: number; totalAds: number; avgDays: number; products: number; landings: number; weekly: number[]; hooks: { text: string; n: number }[] };

export const advertisers: Advertiser[] = [
  { id: "care-shop", name: "كير شوب", category: "صحة وعناية", followers: "182K", since: "مارس 2025", domain: "careshop-eg.com", platform: "Shopify", activeAds: 91, totalAds: 412, avgDays: 23, products: 17, landings: 9, weekly: [4, 6, 5, 7, 6, 8, 9, 8, 14, 19, 24, 27], hooks: [{ text: "بتوجعك مع كل خطوة", n: 11 }, { text: "الدفع عند الاستلام", n: 38 }, { text: "خصم لفترة محدودة", n: 22 }, { text: "آراء عملاء بالفيديو", n: 9 }, { text: "مقارنة قبل وبعد", n: 7 }] },
  { id: "home-style", name: "هوم ستايل مصر", category: "بيت ومطبخ", followers: "96K", since: "يناير 2026", domain: "homestyle-eg.com", platform: "EasyOrders", activeAds: 38, totalAds: 150, avgDays: 19, products: 11, landings: 6, weekly: [2, 3, 3, 4, 5, 5, 6, 7, 9, 10, 12, 13], hooks: [{ text: "المطبخ في دقيقة", n: 8 }, { text: "الدفع عند الاستلام", n: 20 }] },
  { id: "rest-home", name: "بيت الراحة", category: "بيت ومطبخ", followers: "240K", since: "2024", domain: "resthome-eg.com", platform: "Shopify", activeAds: 64, totalAds: 380, avgDays: 27, products: 14, landings: 8, weekly: [6, 6, 7, 7, 8, 8, 9, 9, 10, 11, 12, 12], hooks: [{ text: "ضمان 10 سنين", n: 14 }, { text: "تقسيط", n: 9 }] },
];

export const getAdvertiser = (id: string) => advertisers.find((a) => a.id === id) ?? advertisers[0];

export const rivals = [
  { page: "بيت الراحة", fresh: 9, active: 64, top: "مخدة طبية" },
  { page: "هوم ستايل مصر", fresh: 7, active: 38, top: "منظم أدراج" },
  { page: "كير شوب", fresh: 12, active: 91, top: "جهاز تدليك" },
  { page: "سمارت هوم", fresh: 4, active: 22, top: "لمبة حساس" },
  { page: "ستايل ستور", fresh: 9, active: 57, top: "فرشاة حرارية" },
];

export const trends = ["جهاز تدليك", "مخدة طبية", "منظم مطبخ", "كشاف طاقة شمسية", "مرتبة فوم", "فرشاة حرارية", "شنطة لابتوب", "ساعة ذكية"];

export const productTrend: Record<string, number[]> = {
  "knee-massager": [2, 3, 3, 5, 6, 6, 8, 9, 11, 12],
  "drawer-organizer": [1, 2, 4, 4, 5, 7, 7, 9, 10, 10],
  "foam-mattress": [3, 3, 4, 4, 4, 5, 5, 6, 6, 7],
  "hot-brush": [1, 1, 2, 3, 5, 6, 8, 9, 9, 11],
  "solar-light": [1, 1, 1, 2, 2, 3, 4, 5, 6, 7],
  "neck-pillow": [0, 0, 0, 0, 1, 2, 3, 5, 7, 9],
  "laptop-bag": [0, 0, 0, 1, 1, 2, 2, 3, 3, 4],
  "smart-watch": [0, 0, 1, 1, 2, 2, 2, 3, 3, 3],
};

export const plans = [
  { id: "basic", name: "أساسي", price: 399, points: 3000, who: "لو لسه بتبدأ وبتدوّر على أول منتج", items: ["بحث في ميتا وتيك توك", "سكور الوينر وتحميل الكرييتيف", "بحث الموردين", "3,000 نقطة في الشهر"] },
  { id: "pro", name: "برو", price: 599, points: 10000, popular: true, who: "للميديا باير اللي بيختبر منتجات كل أسبوع", items: ["كل اللي في الأساسي", "البحث بالصورة", "متابعة 10 منافسين بتنبيهات", "10,000 نقطة في الشهر"] },
  { id: "agency", name: "وكالات", price: 999, points: 40000, who: "لفريق شغال على أكتر من براند", items: ["كل اللي في برو", "3 مستخدمين", "متابعة 50 منافس", "40,000 نقطة في الشهر"] },
] as const;

export type PlanId = (typeof plans)[number]["id"];
