import Link from "next/link";
import { LogoMark, Wordmark } from "@/components/ui";
import { paymobReady } from "@/lib/paymob";
import { getPlans } from "@/lib/data";
import { Checkout } from "./Checkout";

export const revalidate = 60;

export default async function PricingPage() {
  const plans = await getPlans();
  return (
    <div className="min-h-screen px-4 py-8">
      <div className="mx-auto flex max-w-[1180px] flex-col gap-7">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2.5">
            <LogoMark bg="#0B1324" />
            <Wordmark dark={false} />
          </Link>
          <span className="text-sm text-muted">الدفع آمن عن طريق Paymob</span>
        </header>
        <div className="flex flex-col gap-2 text-center">
          <h1 className="font-display text-[34px] font-bold">اختار باقتك</h1>
          <p className="text-base text-muted">الاشتراك بيتفعل أول ما الدفع يخلص، ومن غير ما تبعت أي سكرين.</p>
        </div>
        <Checkout paymentsReady={paymobReady()} plans={plans} />
      </div>
    </div>
  );
}
