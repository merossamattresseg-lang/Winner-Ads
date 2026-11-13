import Link from "next/link";
import { Bars, Card, H2, LogoMark, Stat, Wordmark } from "@/components/ui";
import { plans } from "@/lib/mock-data";
import { paymobReady } from "@/lib/paymob";
import { scoreSettings } from "@/lib/score";

// لوحة صاحب الموقع. في المرحلة الأولى الأرقام تجريبية، وفي المرحلة التانية هتتقرا من Supabase.
const subsByPlan: Record<string, number> = { basic: 61, pro: 89, agency: 22 };
const providers = [
  { name: "SearchAPI", use: "بحث ميتا المباشر", calls: "7,820", cost: "$40", on: true },
  { name: "Apify", use: "السحب الليلي", calls: "41K إعلان", cost: "$14", on: true },
  { name: "ScrapeCreators", use: "تيك توك والريلز", calls: "9,150", cost: "$11", on: true },
  { name: "Telegram", use: "الموردين", calls: "3 حسابات", cost: "$0", on: true },
  { name: "Meta Ad Library API", use: "احتياطي", calls: "0", cost: "$0", on: false },
];
const payments = [
  { who: "أحمد م.", plan: "برو", method: "كارت", amount: 599, status: "ناجح", when: "من 12 دقيقة", tone: "ok" },
  { who: "منة ع.", plan: "وكالات", method: "Apple Pay", amount: 999, status: "ناجح", when: "من ساعة", tone: "ok" },
  { who: "كريم س.", plan: "أساسي", method: "محفظة", amount: 399, status: "فشل", when: "من ساعتين", tone: "bad" },
  { who: "سارة ح.", plan: "برو", method: "كارت", amount: 599, status: "تجديد", when: "النهارده 9:00", tone: "ok" },
  { who: "محمود ف.", plan: "برو", method: "كارت", amount: 599, status: "مسترد", when: "امبارح", tone: "warn" },
];
const tone: Record<string, string> = { ok: "bg-lime-soft text-lime-text", bad: "bg-[#FEE4E2] text-[#912018]", warn: "bg-[#FEF0C7] text-[#93370D]" };
const weightLabels: Record<string, string> = { days: "أيام التشغيل", copies: "نسخ نفس الكرييتيف", engagement: "التفاعل", advertisers: "عدد المعلنين", supplier: "متاح عند مورد" };

export default function AdminPage() {
  const revenue = plans.reduce((s, p) => s + p.price * subsByPlan[p.id], 0);
  const maxSubs = Math.max(...Object.values(subsByPlan));
  const nav = ["نظرة عامة", "المشتركين", "المدفوعات", "الباقات والخصومات", "مصادر الداتا", "معادلة الوينر", "الموردين", "الإعدادات"];
  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <aside className="flex w-full flex-col gap-6 bg-ink px-4 py-6 text-white md:sticky md:top-0 md:h-screen md:w-64 md:shrink-0">
        <div className="flex flex-col gap-1.5 px-2">
          <Link href="/" className="flex items-center gap-2.5"><LogoMark /><Wordmark /></Link>
          <span className="text-xs font-bold text-lime">لوحة الإدارة</span>
        </div>
        <nav aria-label="قائمة الإدارة" className="flex flex-wrap gap-1 md:flex-col">
          {nav.map((n, i) => (
            <span key={n} className={`flex h-[42px] items-center rounded-[10px] px-3 text-[15px] ${i === 0 ? "bg-lime font-bold text-ink" : "font-medium text-line-2"}`}>{n}</span>
          ))}
        </nav>
      </aside>

      <main className="min-w-0 flex-1 px-4 py-6 md:px-10 md:py-8">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-6">
          <div className="rounded-xl border border-[#FEC84B] bg-[#FFFAEB] px-4 py-3 text-sm font-semibold text-[#93370D]">
            الأرقام هنا تجريبية لحد ما نوصّل قاعدة البيانات. حالة الدفع: {paymobReady() ? "Paymob متوصل" : "مستني مفاتيح Paymob"}
          </div>
          <header>
            <h1 className="font-display text-[28px] font-bold">نظرة عامة</h1>
            <p className="mt-1.5 text-[15px] text-muted">الشهر ده</p>
          </header>

          <section className="grid grid-cols-[repeat(auto-fit,minmax(170px,1fr))] gap-3">
            <Stat label="الإيراد الشهري" value={`${revenue.toLocaleString("en-US")} ج`} note="+25% عن الشهر اللي فات" />
            <Stat label="مشتركين نشطين" value={Object.values(subsByPlan).reduce((a, b) => a + b, 0)} note="46 جديد الشهر ده" />
            <Stat label="نسبة الإلغاء" value="4.1%" note="7 مشتركين" />
            <Stat label="تكلفة الداتا" value="$68" note="حوالي 3,400 ج" />
            <Stat label="عمولة الدفع" value="2,890 ج" note="تقديري" />
          </section>

          <div className="grid grid-cols-[repeat(auto-fit,minmax(380px,1fr))] gap-5">
            <Card className="flex flex-col gap-3">
              <H2>الإيراد الشهري المتكرر (ألف جنيه)</H2>
              <Bars values={[12.4, 28.9, 41.7, 58.2, 79.6, Math.round(revenue / 100) / 10]} labels={["يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر"]} highlightFrom={5} />
            </Card>
            <Card className="flex flex-col gap-3.5">
              <H2>المشتركين حسب الباقة</H2>
              {plans.map((p) => (
                <div key={p.id} className="grid grid-cols-[120px_minmax(0,1fr)_150px] items-center gap-3 text-sm">
                  <span><b>{p.name}</b> · {p.price} ج</span>
                  <div className="h-3 rounded-full bg-[#F2F4F7]"><div className="h-3 rounded-full bg-ink" style={{ width: `${(subsByPlan[p.id] / maxSubs) * 100}%` }} /></div>
                  <span className="text-left text-muted">{subsByPlan[p.id]} مشترك · {(p.price * subsByPlan[p.id]).toLocaleString("en-US")} ج</span>
                </div>
              ))}
            </Card>
          </div>

          <Card className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center justify-between gap-3"><H2>مصادر الداتا والتكلفة</H2><span className="text-sm text-muted">الكاش وفّر 71% من الطلبات</span></div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] border-collapse text-sm">
                <thead><tr className="text-right text-muted">{["المصدر", "بيستخدم في", "طلبات الشهر", "التكلفة", "مفعّل"].map((h) => <th key={h} className="border-b border-line px-2 py-2.5 font-semibold">{h}</th>)}</tr></thead>
                <tbody>
                  {providers.map((p) => (
                    <tr key={p.name}>
                      <td dir="ltr" className="border-b border-[#F2F4F7] px-2 py-3 text-right font-bold">{p.name}</td>
                      <td className="border-b border-[#F2F4F7] px-2 py-3">{p.use}</td>
                      <td className="border-b border-[#F2F4F7] px-2 py-3">{p.calls}</td>
                      <td className="border-b border-[#F2F4F7] px-2 py-3">{p.cost}</td>
                      <td className="border-b border-[#F2F4F7] px-2 py-3"><input type="checkbox" aria-label={`تفعيل ${p.name}`} defaultChecked={p.on} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <div className="grid grid-cols-[repeat(auto-fit,minmax(380px,1fr))] gap-5">
            <Card className="flex flex-col gap-3.5">
              <H2>أوزان معادلة الوينر</H2>
              {Object.entries(scoreSettings.weights).map(([k, v]) => (
                <label key={k} className="grid grid-cols-[150px_minmax(0,1fr)_48px] items-center gap-3 text-sm">
                  <span>{weightLabels[k]}</span>
                  <input type="range" min={0} max={50} defaultValue={v} className="w-full accent-lime-deep" />
                  <b className="text-left">{v}%</b>
                </label>
              ))}
              <div className="flex flex-wrap gap-3">
                <label className="flex flex-col gap-1 text-[13px] text-muted">وينر من<input type="number" defaultValue={scoreSettings.thresholds.winner} className="h-[38px] w-[90px] rounded-lg border border-line-2 px-2 text-sm text-text" /></label>
                <label className="flex flex-col gap-1 text-[13px] text-muted">سوبر وينر من<input type="number" defaultValue={scoreSettings.thresholds.super} className="h-[38px] w-[90px] rounded-lg border border-line-2 px-2 text-sm text-text" /></label>
                <button type="button" className="h-10 self-end rounded-[10px] bg-ink px-4 text-sm font-semibold text-white">احفظ وأعد الحساب</button>
              </div>
            </Card>
            <Card className="flex flex-col gap-3.5">
              <H2>إعدادات الباقات</H2>
              {plans.map((p) => (
                <div key={p.id} className="grid grid-cols-[80px_repeat(2,minmax(0,1fr))_120px] items-end gap-2.5">
                  <b className="pb-2.5 text-[15px]">{p.name}</b>
                  <label className="flex flex-col gap-1 text-xs text-muted">السعر (ج)<input type="number" defaultValue={p.price} className="h-[38px] rounded-lg border border-line-2 px-2 text-sm text-text" /></label>
                  <label className="flex flex-col gap-1 text-xs text-muted">النقاط الشهرية<input type="number" defaultValue={p.points} className="h-[38px] rounded-lg border border-line-2 px-2 text-sm text-text" /></label>
                  <label className="flex items-center gap-1.5 pb-2.5 text-[13px]"><input type="radio" name="popular" defaultChecked={"popular" in p} />الأكثر مبيعا</label>
                </div>
              ))}
              <div className="flex flex-wrap gap-2.5">
                <button type="button" className="h-10 rounded-[10px] bg-ink px-4 text-sm font-semibold text-white">احفظ</button>
                <button type="button" className="h-10 rounded-[10px] border border-line-2 bg-white px-4 text-sm font-semibold">كود خصم جديد</button>
              </div>
            </Card>
          </div>

          <Card className="flex flex-col gap-3">
            <H2>آخر المدفوعات من Paymob</H2>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] border-collapse text-sm">
                <thead><tr className="text-right text-muted">{["العميل", "الباقة", "الطريقة", "المبلغ", "الحالة", "الوقت"].map((h) => <th key={h} className="border-b border-line px-2 py-2.5 font-semibold">{h}</th>)}</tr></thead>
                <tbody>
                  {payments.map((p, i) => (
                    <tr key={i}>
                      <td className="border-b border-[#F2F4F7] px-2 py-3 font-semibold">{p.who}</td>
                      <td className="border-b border-[#F2F4F7] px-2 py-3">{p.plan}</td>
                      <td className="border-b border-[#F2F4F7] px-2 py-3">{p.method}</td>
                      <td className="border-b border-[#F2F4F7] px-2 py-3">{p.amount} ج</td>
                      <td className="border-b border-[#F2F4F7] px-2 py-3"><span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${tone[p.tone]}`}>{p.status}</span></td>
                      <td className="border-b border-[#F2F4F7] px-2 py-3 text-muted">{p.when}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
