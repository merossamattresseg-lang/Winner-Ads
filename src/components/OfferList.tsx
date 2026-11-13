import Link from "next/link";
import type { Offer } from "@/lib/data";

// قائمة عروض الموردين. للزائر: دعوة للتسجيل. للتجربة: أول عرضين فقط.
export function OfferList({ offers, loggedIn, limit, empty = "لم نعثر على موردين لهذا المنتج بعد." }: { offers: Offer[]; loggedIn: boolean; limit?: number; empty?: string }) {
  if (!loggedIn)
    return (
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-[14px] bg-ink p-5 text-white">
        <b>سجّل مجانًا لعرض الموردين والأسعار.</b>
        <Link href="/login?mode=up" className="rounded-[10px] bg-lime px-5 py-2.5 font-bold text-ink">ابدأ مجانًا</Link>
      </div>
    );
  if (!offers.length) return <p className="rounded-[14px] border border-line bg-white p-6 text-center text-muted">{empty}</p>;
  const visible = limit ? offers.slice(0, limit) : offers;
  const hidden = offers.length - visible.length;
  return (
    <div className="flex flex-col gap-3">
      {visible.map((r) => (
        <article key={r.id} className="flex flex-wrap items-center gap-4 rounded-[14px] border border-line bg-white p-4">
          {r.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={r.image} alt="" loading="lazy" className="h-[72px] w-[72px] shrink-0 rounded-[10px] object-cover" />
          ) : (
            <div className="h-[72px] w-[72px] shrink-0 rounded-[10px] bg-thumb" />
          )}
          <div className="flex min-w-0 flex-[1_1_240px] flex-col gap-1">
            <div className="flex flex-wrap items-center gap-2"><b className="text-[15px]">{r.channel}</b><span className="rounded-md bg-[#F2F4F7] px-2 py-0.5 text-xs">{r.kind}</span></div>
            <p className="line-clamp-3 whitespace-pre-line text-sm leading-6 text-body">{r.text}</p>
            <span className="text-xs text-muted">{r.when}</span>
          </div>
          <div className="flex flex-col items-end gap-2">
            <b className="font-display text-[22px]">{r.price ? `${r.price} ج.م` : "السعر في الرسالة"}</b>
            {r.link && <a href={r.link} target="_blank" rel="noreferrer" className="flex h-10 items-center rounded-[9px] bg-ink px-4 text-sm font-semibold text-white">فتح الرسالة</a>}
          </div>
        </article>
      ))}
      {hidden > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-[14px] border border-[#CDE7D4] bg-[#F3F9F4] p-4">
          <b>{hidden} موردين آخرين</b>
          <Link href="/pricing" className="rounded-[10px] bg-ink px-5 py-2.5 font-bold text-white">اشترك لعرضهم</Link>
        </div>
      )}
    </div>
  );
}
