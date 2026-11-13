"use client";
import { useState } from "react";

export function CopyButton({ text, label = "نسخ" }: { text: string; label?: string }) {
  const [done, setDone] = useState(false);
  return (
    <button type="button" onClick={async () => { try { await navigator.clipboard.writeText(text); setDone(true); setTimeout(() => setDone(false), 1500); } catch {} }}
      className="h-[46px] shrink-0 rounded-[10px] bg-lime px-4 font-bold text-ink">
      {done ? "تم النسخ" : label}
    </button>
  );
}
