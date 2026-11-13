import { OfferList } from "@/components/OfferList";
import { getAccess, LIMITS } from "@/lib/access";
import { getOffers } from "@/lib/data";

export const metadata = { title: "الموردون" };

export default async function SuppliersPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const term = (q ?? "").trim();
  const [access, { offers, sample }] = await Promise.all([getAccess(), getOffers(term, 60)]);
  return (
    <>
      <header>
        <h1 className="font-display text-[28px] font-bold">الموردون</h1>
        <p className="mt-1.5 text-[15px] text-muted">رسائل قنوات الموردين على تليجرام، مرتبة من الأرخص.</p>
      </header>
      <form action="/suppliers" className="flex flex-wrap gap-2.5">
        <label htmlFor="sq" className="sr-only">اسم المنتج</label>
        <input id="sq" name="q" type="search" defaultValue={term} placeholder="اسم المنتج" className="h-[52px] min-w-0 flex-[1_1_300px] rounded-xl border border-line-2 bg-white px-4 text-base" />
        <button className="h-[52px] rounded-xl bg-lime px-6 text-base font-bold text-ink">بحث</button>
      </form>
      {access.userId && (
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted">
          <b className="text-text">{offers.length} رسالة</b>{term && <> عن &quot;{term}&quot;</>}
          {sample && <span className="rounded-full bg-[#FEF0C7] px-3 py-1 text-[13px] font-semibold text-[#93370D]">بيانات تجريبية</span>}
        </div>
      )}
      <OfferList offers={offers} loggedIn={Boolean(access.userId)} limit={access.subscribed ? undefined : LIMITS.trialSupplierOffers} empty="لا توجد رسائل مطابقة. جرّب كلمة أخرى." />
    </>
  );
}
