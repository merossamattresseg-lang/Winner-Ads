import Link from "next/link";
import { cheapestCost, productTrend } from "@/lib/mock-data";
import { getAds } from "@/lib/data";

function sparkPoints(vals: number[]) {
  const max = Math.max(...vals, 1);
  return vals.map((v, i) => `${((i * 110) / (vals.length - 1)).toFixed(1)},${(30 - (v / max) * 26).toFixed(1)}`).join(" ");
}

export default async function ProductsPage() {
  const ads = await getAds();
  const rows = ads.map((a, i) => {
    const vals = productTrend[a.id] ?? [0, 0];
    const cost = cheapestCost(a.id);
    const change = Math.round(((vals[vals.length - 1] - vals[4]) / Math.max(vals[4], 1)) * 100);
    return { ...a, rank: i + 1, vals, cost, change };
  });
  return (
    <>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-[28px] font-bold">أفضل المنتجات</h1>
          <p className="mt-1.5 text-[15px] text-muted">المنتجات مجمّعة من كل الإعلانات بالبحث بالصورة، يعني نفس المنتج عند أكتر من معلن بيظهر مرة واحدة.</p>
        </div>
        <button className="h-[42px] rounded-[10px] border border-line-2 bg-white px-4 text-sm font-semibold">تصدير Excel</button>
      </header>

      <div className="overflow-x-auto rounded-2xl border border-line bg-white">
        <table className="w-full min-w-[980px] border-collapse text-sm">
          <thead>
            <tr className="bg-[#F9FAFB] text-right text-muted">
              {["#", "المنتج", "السكور", "معلنين", "نسخ الإعلان", "سعر البيع", "سعر المورد", "الهامش", "إعلانات جديدة 30 يوم"].map((h) => (
                <th key={h} className="px-3.5 py-3 font-semibold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-[#F2F4F7]">
                <td className="px-3.5 py-3 font-semibold text-muted">{r.rank}</td>
                <td className="px-3.5 py-3">
                  <Link href={`/ads/${r.id}`} className="flex items-center gap-3">
                    <span className="h-12 w-12 shrink-0 rounded-[9px] bg-thumb" />
                    <span className="flex flex-col"><b>{r.product}</b><span className="text-xs text-muted">أول ظهور {r.start}</span></span>
                  </Link>
                </td>
                <td className="px-3.5 py-3"><span className="rounded-lg bg-lime-soft px-2 py-1 font-display font-bold text-lime-text">{r.score}</span></td>
                <td className="px-3.5 py-3">{r.advertisers}</td>
                <td className="px-3.5 py-3">{r.copies}</td>
                <td className="px-3.5 py-3">{r.sellPrice} ج</td>
                <td className="px-3.5 py-3">{r.cost ? `${r.cost} ج` : "لسه"}</td>
                <td className="px-3.5 py-3 font-bold text-lime-deep">{r.cost ? `${Math.round((1 - r.cost / r.sellPrice) * 100)}%` : "-"}</td>
                <td className="px-3.5 py-3">
                  <div className="flex items-center gap-2">
                    <svg width="110" height="32" viewBox="0 0 110 32" role="img" aria-label="ترند الإعلانات الجديدة">
                      <polyline points={sparkPoints(r.vals)} fill="none" stroke="#65A30D" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
                    </svg>
                    <span dir="ltr" className="text-[13px] font-bold text-lime-deep">+{r.change}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
