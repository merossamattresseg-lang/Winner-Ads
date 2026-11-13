import Link from "next/link";
import { getProducts } from "@/lib/data";

export const metadata = { title: "أفضل المنتجات" };

function sparkPoints(vals: number[]) {
  const max = Math.max(...vals, 1);
  return vals.map((v, i) => `${((i * 110) / (vals.length - 1)).toFixed(1)},${(30 - (v / max) * 26).toFixed(1)}`).join(" ");
}

export default async function ProductsPage() {
  const { rows, sample } = await getProducts(60);
  return (
    <>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-[28px] font-bold">أفضل المنتجات</h1>
          <p className="mt-1.5 text-[15px] text-muted">المنتج نفسه عند أكثر من معلن يظهر مرة واحدة، مرتبًا حسب التقييم وعدد المعلنين.</p>
        </div>
        {sample && <span className="rounded-full bg-[#FEF0C7] px-3 py-1 text-[13px] font-semibold text-[#93370D]">بيانات تجريبية</span>}
      </header>
      {rows.length === 0 ? (
        <p className="rounded-2xl border border-line bg-white p-8 text-center text-muted">لا توجد منتجات بعد. تظهر هنا بعد أول عمليات بحث أو السحب الليلي.</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-line bg-white">
          <table className="w-full min-w-[900px] border-collapse text-sm">
            <thead>
              <tr className="bg-[#F9FAFB] text-right text-muted">
                {["#", "المنتج", "التقييم", "المعلنون", "الإعلانات", "النسخ", "سعر البيع", "الاتجاه"].map((h) => <th key={h} className="px-3.5 py-3 font-semibold">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r.key} className="border-t border-[#F2F4F7]">
                  <td className="px-3.5 py-3 font-semibold text-muted">{i + 1}</td>
                  <td className="px-3.5 py-3">
                    <Link href={`/ads/${r.slug}`} className="flex flex-col">
                      <b>{r.name}</b>
                      <span className="text-xs text-muted">{r.platform} · منذ {r.first}</span>
                    </Link>
                  </td>
                  <td className="px-3.5 py-3"><span className="rounded-lg bg-lime-soft px-2 py-1 font-display font-bold text-lime-text">{r.score}</span></td>
                  <td className="px-3.5 py-3">{r.advertisers}</td>
                  <td className="px-3.5 py-3">{r.ads}</td>
                  <td className="px-3.5 py-3">{r.copies}</td>
                  <td className="px-3.5 py-3">{r.sellPrice ? `${r.sellPrice} ج.م` : "-"}</td>
                  <td className="px-3.5 py-3">
                    <div className="flex items-center gap-2">
                      <svg width="110" height="32" viewBox="0 0 110 32" role="img" aria-label="عدد الإعلانات النشطة أسبوعيًا">
                        <polyline points={sparkPoints(r.trend)} fill="none" stroke="#65A30D" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
                      </svg>
                      <Link href={`/suppliers?q=${encodeURIComponent(r.name)}`} className="text-xs font-semibold text-[#15803D]">الموردون</Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
