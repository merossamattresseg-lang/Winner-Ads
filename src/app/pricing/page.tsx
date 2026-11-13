import Link from "next/link";
import { LogoMark, Wordmark } from "@/components/ui";
import { paymobReady } from "@/lib/paymob";
import { getPlans } from "@/lib/data";
import { Checkout } from "./Checkout";


export default async function PricingPage({ searchParams }: { searchParams: Promise<{ status?: string; success?: string; coupon?: string; plan?: string }> }) {
  const { status, success, coupon, plan } = await searchParams;
  const plans = await getPlans();
  const failed = status === "done" && success === "false";
  const done = status === "done" && success !== "false";
  return (
    <div className="min-h-screen px-4 py-8">
      <div className="mx-auto flex max-w-[1180px] flex-col gap-7">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <LogoMark bg="#0B1324" />
            <Wordmark dark={false} />
          </Link>
          <span className="text-sm text-muted">الدفع الآمن عبر Paymob</span>
        </header>
        {done && (
          <div className="mx-auto flex w-full max-w-[560px] flex-col items-center gap-3 rounded-[20px] border border-line bg-white p-7 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-lime"><svg width="26" height="26" viewBox="0 0 24 24" aria-hidden="true"><polyline points="4,12 10,18 20,6" fill="none" stroke="#0B1324" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg></span>
            <h1 className="font-display text-2xl font-bold">تم الدفع بنجاح</h1>
            <p className="text-[15px] text-muted">يُفعَّل الاشتراك خلال لحظات، وتصلك الفاتورة على بريدك.</p>
            <div className="flex gap-2"><Link href="/dashboard" className="flex h-11 items-center rounded-[10px] bg-ink px-5 font-bold text-white">ابدأ الآن</Link><Link href="/account" className="flex h-11 items-center rounded-[10px] border border-line-2 px-5 font-semibold">الحساب</Link></div>
          </div>
        )}
        {failed && (
          <div role="alert" className="mx-auto w-full max-w-[560px] rounded-[16px] bg-[#FEE4E2] px-5 py-4 text-center text-[#912018]">
            <b className="block text-lg">لم يكتمل الدفع</b>
            <span className="text-sm">لم يُخصم أي مبلغ. حاول مرة أخرى أو استخدم وسيلة دفع مختلفة.</span>
          </div>
        )}
        <div className="flex flex-col gap-2 text-center">
          <h2 className="font-display text-[34px] font-bold">اختر باقتك</h2>
          <p className="text-base text-muted">يُفعَّل الاشتراك فور اكتمال الدفع.</p>
        </div>
        <Checkout paymentsReady={paymobReady()} plans={plans} initialCoupon={coupon} initialPlan={plan} />
      </div>
    </div>
  );
}
