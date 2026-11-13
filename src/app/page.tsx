import Link from "next/link";
import { gridBg, Highlight, PublicFooter, PublicHeader } from "@/components/PublicChrome";
import { getAds, getPlans } from "@/lib/data";
import { HeroSearch, Personas, Pricing } from "./landing-parts";

export const revalidate = 300;

const tints = ["#E8F1FB", "#F4ECE4", "#EEF0F6", "#F7E9EE"];

const faq = [
  ["ما مصادر البيانات؟", "مكتبة إعلانات ميتا، وتيك توك، وريلز فيسبوك، وبنترست، وقنوات الموردين على تليجرام. تُحدَّث يوميًا."],
  ["ما النقاط؟", "كل بحث جديد يستهلك نقطة، وتتجدد النقاط شهريًا."],
  ["هل أحتاج بطاقة للتجربة؟", "لا. التجربة مجانية لمدة 3 أيام."],
  ["ما طرق الدفع؟", "البطاقات، والمحافظ الإلكترونية، وApple Pay. يُفعَّل الاشتراك فورًا."],
  ["هل يمكنني الإلغاء؟", "نعم، في أي وقت من صفحة الحساب."],
  ["هل يعمل على الجوال؟", "نعم، دون تثبيت أي تطبيق."],
];

const compare = [
  ["وقت العثور على منتج", "ساعات", "دقائق", "دقائق"],
  ["موردون في مصر", "متفرقون", "لا يوجد", "130 قناة"],
  ["السعر", "-", "من 49 دولارًا", "من 399 ج.م"],
  ["الدفع", "-", "بطاقة دولية", "بطاقة أو محفظة"],
  ["اللغة", "-", "الإنجليزية", "العربية"],
];

export default async function LandingPage() {
  const [plans, ads] = await Promise.all([getPlans(), getAds()]);
  const preview = ads.slice(0, 4);
  return (
    <div className="bg-white">
      <div className="flex flex-wrap items-center justify-center gap-3 bg-ink px-4 py-2.5 text-center text-sm text-white">
        <span className="rounded-full bg-lime px-2.5 py-0.5 text-xs font-bold text-ink">عرض الإطلاق</span>
        <span>خصم 20% على الشهر الأول لأول 100 مشترك · الكود <b dir="ltr" className="text-lime">WIN20</b></span>
      </div>
      <PublicHeader />

      <section className="border-y border-[#E3F0E6]" style={gridBg}>
        <div className="mx-auto flex max-w-[1100px] flex-col items-center gap-6 px-6 pb-14 pt-16 text-center md:pt-20">
          <span className="rounded-full border border-[#CDE7D4] bg-white px-3.5 py-1.5 text-sm font-semibold text-[#14532D]">إعلانات ميتا وتيك توك وموردو تليجرام في منصة واحدة</span>
          <h1 className="font-display text-4xl font-bold leading-tight md:text-[62px] md:leading-[1.25]">
            اكتشف المنتج <Highlight>الرابح</Highlight>
            <br />
            قبل أن تنفق على الإعلان
          </h1>
          <p className="max-w-[720px] text-lg leading-8 text-body">ابحث بالكلمة أو الرابط أو الصورة، واعرف مدة تشغيل الإعلان والمورد والسعر.</p>
          <HeroSearch />
        </div>
        <div className="mx-auto max-w-[1160px] px-6 pb-16">
          <div className="rounded-[20px] border border-line bg-white p-4 shadow-[0_24px_60px_rgba(11,19,36,0.10)]">
            <div className="grid grid-cols-2 gap-3.5 md:grid-cols-4">
              {preview.map((a, i) => (
                <Link key={a.id} href={`/ads/${a.id}`} className="overflow-hidden rounded-[14px] border border-line text-right">
                  <div className="relative flex h-44 items-end p-3" style={{ background: tints[i % 4] }}>
                    <span className={`absolute right-2.5 top-2.5 rounded-full px-2.5 py-0.5 text-xs font-bold ${a.tier === "super" ? "bg-ink text-lime" : "bg-lime-soft text-lime-text"}`}>{a.tier === "super" ? "رابح مؤكد" : "رابح"}</span>
                    <span className="absolute left-2.5 top-2.5 rounded-md bg-white px-2 py-0.5 text-[11px] font-semibold">{a.platform}</span>
                    <b className="rounded-md bg-white/85 px-2 py-1 text-[15px]">{a.product}</b>
                  </div>
                  <div className="flex items-center justify-between p-3 text-[13px] text-muted">
                    <span>{a.days} يومًا · {a.copies} نسخة</span>
                    <b className="font-display text-lg text-text">{a.score}</b>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto flex max-w-[1160px] flex-wrap items-center justify-center gap-x-10 gap-y-3 px-6 py-9 text-muted">
        <span className="font-semibold">المصادر:</span>
        {["Meta Ad Library", "TikTok", "Facebook Reels", "Pinterest", "Telegram"].map((s) => (
          <span key={s} dir="ltr" className="font-display text-lg font-semibold text-body">{s}</span>
        ))}
      </section>

      <section id="how" className="bg-[#F7F8FA] px-6 py-20">
        <div className="mx-auto flex max-w-[1160px] flex-col gap-10">
          <div className="text-center">
            <h2 className="font-display text-4xl font-bold">من البحث إلى المورد في ثلاث خطوات</h2>
            <p className="mt-2.5 text-[17px] text-muted">خمس دقائق بدلًا من يوم كامل.</p>
          </div>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {[["1", "ابحث", "بالكلمة أو الرابط أو الصورة."], ["2", "اختر الرابح", "رتّب حسب التقييم وحمّل الإعلان."], ["3", "تواصل مع المورد", "السعر والتواصل عبر واتساب."]].map(([n, t, d]) => (
              <div key={n} className="flex flex-col gap-3 rounded-[18px] border border-line bg-white p-6">
                <span className="font-display text-[44px] font-bold leading-none text-lime" style={{ WebkitTextStroke: "1.5px #0B1324" }}>{n}</span>
                <b className="font-display text-xl">{t}</b>
                <p className="text-base text-muted">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-20">
        <div className="mx-auto flex max-w-[1160px] flex-col gap-8">
          <h2 className="text-center font-display text-4xl font-bold">مصمم لطبيعة عملك</h2>
          <Personas />
        </div>
      </section>

      <section id="features" className="px-6 pb-20">
        <div className="mx-auto flex max-w-[1160px] flex-col gap-7">
          <h2 className="text-center font-display text-4xl font-bold">كل ما تحتاجه في مكان واحد</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-6">
            <div className="flex flex-wrap items-center gap-6 rounded-[20px] border border-[#CDE7D4] bg-[#F3F9F4] p-7 md:col-span-4">
              <div className="flex flex-[1_1_240px] flex-col gap-2.5">
                <b className="font-display text-2xl">تقييم واضح لكل إعلان</b>
                <p className="text-base text-body">مدة التشغيل، وعدد النسخ، والتفاعل، وتوفر المورد.</p>
              </div>
              <div className="flex flex-[1_1_240px] flex-col gap-2.5 rounded-[14px] bg-white p-4">
                {[["أيام التشغيل", 100, "89"], ["نسخ الإعلان", 100, "14"], ["التفاعل", 82, "2.1M"], ["معلنون آخرون", 80, "4"]].map(([l, p, v]) => (
                  <div key={String(l)} className="grid grid-cols-[110px_minmax(0,1fr)_40px] items-center gap-2.5 text-[13px]">
                    <span>{l}</span>
                    <div className="h-2 rounded-full bg-[#F2F4F7]"><div className="h-2 rounded-full bg-[#16A34A]" style={{ width: `${p}%` }} /></div>
                    <b className="text-left">{v}</b>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex flex-col justify-between gap-2.5 rounded-[20px] bg-ink p-7 text-white md:col-span-2">
              <b className="font-display text-2xl">130 قناة مورد</b>
              <p className="text-[15px] text-line-2">أسعار الجملة مرتبة من الأرخص، مع تواصل مباشر عبر واتساب.</p>
              <div className="rounded-xl bg-ink-2 p-3 text-sm leading-7"><b className="text-lime">موردين العتبة · 420 ج.م</b><br />جهاز تدليك الركبة · متوفر</div>
            </div>
            {[["التنبيهات", "إعلانات المنافسين الجديدة على تليجرام.", "9 إعلانات جديدة من كير شوب"], ["حاسبة الربح", "الحد الأقصى لتكلفة الطلب.", "الحد الأقصى: 182 ج.م"], ["صفحات الهبوط", "صفحات الإعلانات الرابحة وأسعارها.", "899 ج.م بدلًا من 1,299"]].map(([t, d, s]) => (
              <div key={t} className="flex flex-col gap-2.5 rounded-[20px] border border-line p-6 md:col-span-2">
                <b className="font-display text-xl">{t}</b>
                <p className="text-[15px] text-muted">{d}</p>
                <span className="mt-auto rounded-[10px] bg-[#F7F8FA] px-3 py-2.5 text-sm font-semibold">{s}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#F7F8FA] px-6 py-20">
        <div className="mx-auto flex max-w-[1000px] flex-col gap-6">
          <h2 className="text-center font-display text-4xl font-bold">لماذا WinnerAds؟</h2>
          <div className="overflow-x-auto rounded-[18px] border border-line bg-white">
            <table className="w-full min-w-[620px] border-collapse text-[15px]">
              <thead>
                <tr>
                  <th className="p-4" />
                  <th className="p-4 font-semibold text-muted">البحث اليدوي</th>
                  <th className="p-4 font-semibold text-muted">الأدوات الأجنبية</th>
                  <th className="rounded-t-xl bg-ink p-4 font-bold text-lime">WinnerAds</th>
                </tr>
              </thead>
              <tbody>
                {compare.map(([r, a, b, c]) => (
                  <tr key={r} className="border-t border-[#F2F4F7]">
                    <td className="px-4 py-3.5 font-semibold">{r}</td>
                    <td className="px-4 py-3.5 text-center text-muted">{a}</td>
                    <td className="px-4 py-3.5 text-center text-muted">{b}</td>
                    <td className="bg-[#F3F9F4] px-4 py-3.5 text-center font-bold">{c}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section id="pricing" className="px-6 py-20">
        <div className="mx-auto flex max-w-[1160px] flex-col items-center gap-7">
          <div className="text-center">
            <h2 className="font-display text-4xl font-bold">الأسعار</h2>
            <p className="mt-2.5 text-[17px] text-muted">تجربة مجانية 3 أيام دون بطاقة.</p>
          </div>
          <Pricing plans={plans} />
          <div className="flex w-full flex-wrap items-center gap-4 rounded-[18px] border-2 border-dashed border-[#CDE7D4] bg-[#F3F9F4] px-6 py-5">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#15803D" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 3l8 3v6c0 4.5-3.4 8.3-8 9-4.6-.7-8-4.5-8-9V6z" /><polyline points="8.5,12 11,14.5 15.5,10" /></svg>
            <div><b className="text-lg">ضمان 7 أيام</b><p className="text-[15px] text-body">استرداد كامل خلال أول 7 أيام. <Link href="/refund" className="font-semibold text-[#15803D]">التفاصيل</Link></p></div>
          </div>
        </div>
      </section>

      <section id="faq" className="bg-[#F7F8FA] px-6 py-20">
        <div className="mx-auto flex max-w-[820px] flex-col gap-3.5">
          <h2 className="mb-3 text-center font-display text-4xl font-bold">الأسئلة الشائعة</h2>
          {faq.map(([q, a], i) => (
            <details key={q} open={i === 0} className="group rounded-[14px] border border-line bg-white">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 text-[17px] font-bold">
                {q}<span className="text-xl text-muted group-open:rotate-45">+</span>
              </summary>
              <p className="px-5 pb-4 text-base leading-8 text-body">{a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="px-6 py-16">
        <div className="mx-auto flex max-w-[1160px] flex-col items-center gap-4 rounded-[28px] bg-ink px-8 py-14 text-center text-white">
          <h2 className="font-display text-3xl font-bold leading-snug md:text-[42px]">المنتج الرابح القادم<br /><span className="text-lime">اكتشفه قبل منافسيك</span></h2>
          <p className="text-[17px] text-line-2">تجربة مجانية 3 أيام.</p>
          <Link href="/login?mode=up" className="flex h-14 items-center rounded-[14px] bg-lime px-9 text-lg font-bold text-ink">ابدأ الآن</Link>
        </div>
      </section>
      <PublicFooter />
    </div>
  );
}
