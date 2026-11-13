import { getAd, supplierOffers } from "@/lib/mock-data";

export default async function SuppliersPage({ searchParams }: { searchParams: Promise<{ product?: string; q?: string }> }) {
  const { product, q } = await searchParams;
  const ad = product ? getAd(product) : undefined;
  const term = (q ?? ad?.product ?? "").trim();
  const rows = (ad ? supplierOffers.filter((s) => s.adId === ad.id) : supplierOffers.filter((s) => !term || s.text.includes(term)))
    .slice()
    .sort((a, b) => a.price - b.price);
  return (
    <>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-[28px] font-bold">الموردين</h1>
          <p className="mt-1.5 text-[15px] text-muted">بندوّر لك في قنوات الموردين على تليجرام، وبنرتب النتايج من الأرخص.</p>
        </div>
        <button className="h-[42px] rounded-[10px] border border-line-2 bg-white px-4 text-sm font-semibold">اقترح قناة مورد</button>
      </header>

      <form action="/suppliers" className="flex flex-wrap gap-2.5">
        <label htmlFor="sq" className="sr-only">اسم المنتج</label>
        <input id="sq" name="q" type="search" defaultValue={term} placeholder="اكتب اسم المنتج" className="h-[52px] min-w-0 flex-[1_1_320px] rounded-xl border border-line-2 bg-white px-4 text-base" />
        <button type="button" className="h-[52px] rounded-xl border border-line-2 bg-white px-4 text-[15px] font-semibold">بحث بالصورة</button>
        <button className="h-[52px] rounded-xl bg-lime px-6 text-base font-bold text-ink">دوّر</button>
      </form>

      <div className="flex flex-wrap items-start gap-5">
        <section aria-label="فلاتر الموردين" className="flex w-full max-w-[280px] flex-[1_1_220px] flex-col gap-4 rounded-[14px] border border-line bg-white p-4">
          <div className="flex flex-col gap-2">
            <b className="text-sm">السعر (جنيه)</b>
            <div className="flex gap-2">
              <label className="flex flex-1 flex-col gap-1 text-xs text-muted">من<input type="number" defaultValue={0} className="h-[38px] rounded-lg border border-line-2 px-2 text-sm text-text" /></label>
              <label className="flex flex-1 flex-col gap-1 text-xs text-muted">لحد<input type="number" defaultValue={600} className="h-[38px] rounded-lg border border-line-2 px-2 text-sm text-text" /></label>
            </div>
          </div>
          <fieldset className="flex flex-col gap-2 text-sm">
            <legend className="mb-1 font-bold">تاريخ الرسالة</legend>
            <label className="flex gap-2"><input type="radio" name="d" defaultChecked />آخر 7 أيام</label>
            <label className="flex gap-2"><input type="radio" name="d" />آخر 30 يوم</label>
            <label className="flex gap-2"><input type="radio" name="d" />أي وقت</label>
          </fieldset>
          <fieldset className="flex flex-col gap-2 text-sm">
            <legend className="mb-1 font-bold">نوع المورد</legend>
            <label className="flex gap-2"><input type="checkbox" defaultChecked />جملة</label>
            <label className="flex gap-2"><input type="checkbox" defaultChecked />مستورد</label>
            <label className="flex gap-2"><input type="checkbox" />دروب شيبنج</label>
          </fieldset>
        </section>

        <section className="flex min-w-0 flex-[999_1_480px] flex-col gap-3">
          <div className="text-sm text-muted"><b className="text-text">{rows.length} رسالة</b>{term && <> عن &quot;{term}&quot;</>}</div>
          {rows.length === 0 && <p className="rounded-[14px] border border-line bg-white p-6 text-center text-muted">ملقيناش موردين بالاسم ده. جرب كلمة تانية أو البحث بالصورة.</p>}
          {rows.map((r) => (
            <article key={r.id} className="flex flex-wrap items-center gap-4 rounded-[14px] border border-line bg-white p-4">
              <div className="h-[84px] w-[84px] shrink-0 rounded-[10px] bg-thumb" />
              <div className="flex min-w-0 flex-[1_1_260px] flex-col gap-1">
                <div className="flex flex-wrap items-center gap-2"><b className="text-[15px]">{r.channel}</b><span className="rounded-md bg-[#F2F4F7] px-2 py-0.5 text-xs">{r.kind}</span></div>
                <p className="text-sm leading-7 text-body">{r.text}</p>
                <span className="text-xs text-muted">{r.when} · أقل كمية {r.moq}</span>
              </div>
              <div className="flex flex-col items-end gap-2">
                <b className="font-display text-[22px]">{r.price} ج</b>
                <div className="flex gap-2">
                  <a href="https://t.me/" target="_blank" rel="noreferrer" className="flex h-10 items-center rounded-[9px] border border-line-2 px-3.5 text-sm font-semibold text-text">الرسالة</a>
                  <a href="https://wa.me/" target="_blank" rel="noreferrer" className="flex h-10 items-center rounded-[9px] bg-ink px-4 text-sm font-semibold text-white">واتساب</a>
                </div>
              </div>
            </article>
          ))}
        </section>
      </div>
    </>
  );
}
