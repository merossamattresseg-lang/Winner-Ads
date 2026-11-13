import { getSetting } from "@/lib/data";
import { Calculator, type ProfitDefaults } from "./Calculator";

const fallback: ProfitDefaults = { shipping: 60, returnRate: 20, returnCost: 45, packaging: 10, targetMargin: 30 };

export default async function CalculatorPage({ searchParams }: { searchParams: Promise<{ sell?: string; cost?: string }> }) {
  const { sell, cost } = await searchParams;
  const defaults = await getSetting<ProfitDefaults>("profit_defaults", fallback);
  return (
    <>
      <header>
        <h1 className="font-display text-[28px] font-bold">حاسبة الربح</h1>
        <p className="mt-1.5 text-[15px] text-muted">اعرف أقصى تكلفة أوردر تقدر تدفعها في الإعلانات قبل ما تبدأ تخسر.</p>
      </header>
      <Calculator defaults={defaults} sell={Number(sell) || 899} cost={Number(cost) || 420} />
    </>
  );
}
