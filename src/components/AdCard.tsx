"use client";
import Link from "next/link";
import { useState } from "react";
import type { ScoredAd } from "@/lib/data";
import { PlayIcon, ScoreRing, TierBadge } from "./ui";

export function AdCard({ ad }: { ad: ScoredAd }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(ad.copy);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };
  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-line bg-white">
      <Link href={`/ads/${ad.id}`} className="relative flex h-56 items-center justify-center bg-thumb text-sm text-muted" aria-label={ad.product}>
        <span className="absolute flex h-12 w-12 items-center justify-center rounded-full bg-ink/75"><PlayIcon /></span>
        <span className="absolute right-2.5 top-2.5"><TierBadge tier={ad.tier} /></span>
        <span className="absolute bottom-2.5 left-2.5 rounded-md bg-white px-2 py-0.5 text-xs font-semibold text-text">{ad.platform}</span>
      </Link>
      <div className="flex flex-col gap-3 p-4">
        <div className="flex items-center justify-between gap-2.5">
          <div className="flex min-w-0 flex-col">
            <Link href={`/advertisers/${ad.advertiserId}`} className="text-[15px] font-bold text-text hover:underline">{ad.page}</Link>
            <span className="text-xs text-muted">بدأ {ad.start}</span>
          </div>
          <ScoreRing score={ad.score} />
        </div>
        <div className="flex flex-col gap-1">
          <b className="text-[15px]">{ad.product}</b>
          <p className="line-clamp-2 h-12 text-sm leading-7 text-body">{ad.copy}</p>
        </div>
        <div className="grid grid-cols-3 gap-1.5 rounded-[10px] bg-[#F9FAFB] px-1.5 py-2.5 text-center">
          <div className="flex flex-col"><b className="text-[15px]">{ad.days}</b><span className="text-xs text-muted">يوم شغال</span></div>
          <div className="flex flex-col"><b className="text-[15px]">{ad.copies}</b><span className="text-xs text-muted">نسخة</span></div>
          <div className="flex flex-col"><b className="text-[15px]" dir="ltr">{ad.views}</b><span className="text-xs text-muted">مشاهدة</span></div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button type="button" className="h-10 rounded-[9px] bg-ink text-[13px] font-semibold text-white">تحميل</button>
          <button type="button" onClick={copy} className="h-10 rounded-[9px] border border-line-2 bg-white text-[13px] font-semibold text-text">{copied ? "اتنسخ" : "نسخ النص"}</button>
          <Link href={`/suppliers?product=${ad.id}`} className="flex h-10 items-center justify-center rounded-[9px] bg-lime-soft text-[13px] font-bold text-lime-text">الموردين ({ad.suppliers})</Link>
          <Link href={`/ads/${ad.id}`} className="flex h-10 items-center justify-center rounded-[9px] border border-line-2 text-[13px] font-semibold text-text">التفاصيل</Link>
        </div>
      </div>
    </article>
  );
}
