import type { ReactNode } from "react";
import { tierOf, type Tier } from "@/lib/score";

export function LogoMark({ size = 36, bg = "#1B2740", stroke = "#C8F03C" }: { size?: number; bg?: string; stroke?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
      <rect width="48" height="48" rx="13" fill={bg} />
      <polyline points="9,17 16,34 24,22 31,32 39,13" fill="none" stroke={stroke} strokeWidth="4.2" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points="33,12.5 39.5,12 40,18.5" fill="none" stroke={stroke} strokeWidth="4.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Wordmark({ dark = true, size = "text-[21px]" }: { dark?: boolean; size?: string }) {
  return (
    <span dir="ltr" className={`font-display font-bold ${size} ${dark ? "text-white" : "text-text"}`}>
      Winner<span className={dark ? "text-lime" : "text-lime-deep"}>Ads</span>
    </span>
  );
}

const tierStyles: Record<Tier, string> = {
  super: "bg-ink text-lime",
  winner: "bg-lime-soft text-lime-text border border-lime-line",
  testing: "bg-white text-body border border-line-2",
};
const tierLabels: Record<Tier, string> = { super: "رابح مؤكد", winner: "رابح", testing: "قيد الاختبار" };

export function TierBadge({ score, tier }: { score?: number; tier?: Tier }) {
  const t = tier ?? tierOf(score ?? 0);
  return <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${tierStyles[t]}`}>{tierLabels[t]}</span>;
}

export function ScoreRing({ score, size = 48 }: { score: number; size?: number }) {
  const dash = Math.round(score * 1.445);
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }} title="التقييم">
      <svg width={size} height={size} viewBox="0 0 56 56" aria-hidden="true">
        <circle cx="28" cy="28" r="23" fill="none" stroke="#E4E7EC" strokeWidth="6" />
        <circle cx="28" cy="28" r="23" fill="none" stroke={score >= 60 ? "#65A30D" : "#98A2B3"} strokeWidth="6" strokeLinecap="round" strokeDasharray={`${dash} 145`} transform="rotate(-90 28 28)" />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center font-display font-bold" style={{ fontSize: size * 0.32 }}>
        {score}
      </span>
    </div>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-2xl border border-line bg-white p-5 ${className}`}>{children}</section>;
}

export function H2({ children }: { children: ReactNode }) {
  return <h2 className="font-display text-lg font-bold">{children}</h2>;
}

export function Stat({ label, value, note }: { label: string; value: string | number; note?: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-xl border border-line bg-white px-4 py-3.5">
      <span className="text-[13px] text-muted">{label}</span>
      <b className="font-display text-2xl">{value}</b>
      {note && <span className="text-xs font-semibold text-lime-deep">{note}</span>}
    </div>
  );
}

export function Thumb({ label, className = "" }: { label?: string; className?: string }) {
  return <div className={`flex items-center justify-center bg-thumb text-sm text-muted ${className}`}>{label}</div>;
}

export function PlayIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <polygon points="7,4 20,12 7,20" fill="#FFFFFF" />
    </svg>
  );
}

export function Bars({ values, labels, highlightFrom, unit = "", height = 200 }: { values: number[]; labels: string[]; highlightFrom: number; unit?: string; height?: number }) {
  const max = Math.max(...values);
  return (
    <div dir="ltr">
      <div className="flex items-end gap-2.5 border-b border-line px-1" style={{ height }}>
        {values.map((v, i) => (
          <div key={i} className="flex h-full flex-1 flex-col items-center justify-end gap-1.5">
            <span className="text-xs font-semibold text-body">{v}{unit}</span>
            <div className="w-full max-w-11 rounded-t-md" style={{ height: `${(v / max) * (height - 30)}px`, background: i >= highlightFrom ? "#65A30D" : "#98A2B3" }} />
          </div>
        ))}
      </div>
      <div className="mt-2 flex gap-2.5 px-1">
        {labels.map((l, i) => (
          <span key={i} className="flex-1 text-center text-[11px] text-muted">{l}</span>
        ))}
      </div>
    </div>
  );
}
