"use client";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { ScoredAd } from "@/lib/data";
import { AdCard } from "@/components/AdCard";

const platforms = [["all", "الكل"], ["meta", "ميتا"], ["tiktok", "تيك توك"]] as const;
type Result = { ads: ScoredAd[]; total: number; locked: number; cached: boolean; charged: boolean; sample: boolean; error?: string | null };
type Problem = { kind: "login" | "upgrade" | "error"; message: string } | null;

export function SearchView({ initialQuery }: { initialQuery: string }) {
  const [query, setQuery] = useState(initialQuery);
  const [platform, setPlatform] = useState<string>("all");
  const [minDays, setMinDays] = useState(0);
  const [tier, setTier] = useState("all");
  const [data, setData] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);
  const [problem, setProblem] = useState<Problem>(null);

  const run = useCallback(async (q: string, p: string) => {
    setLoading(true);
    setProblem(null);
    const res = await fetch(`/api/search?q=${encodeURIComponent(q)}&platform=${p}`);
    const body = await res.json().catch(() => ({}));
    setLoading(false);
    if (res.status === 401) return setProblem({ kind: "login", message: body.message ?? "سجّل مجانًا لمتابعة البحث." });
    if (res.status === 402) return setProblem({ kind: "upgrade", message: body.message ?? "اشترك لمتابعة البحث." });
    if (!res.ok) return setProblem({ kind: "error", message: "تعذر البحث الآن. حاول مرة أخرى." });
    setData(body);
  }, []);

  useEffect(() => {
    run(initialQuery, "all");
  }, [initialQuery, run]);

  const results = useMemo(
    () => (data?.ads ?? []).filter((a) => a.days >= minDays && (tier === "all" || a.tier === tier)),
    [data, minDays, tier],
  );
  const count = (t: string) => results.filter((a) => a.tier === t).length;

  return (
    <>
      <section className="flex flex-col gap-4 rounded-[18px] bg-ink p-5 md:p-6">
        <form onSubmit={(e) => { e.preventDefault(); run(query, platform); }} className="flex flex-wrap gap-2.5">
          <label htmlFor="term" className="sr-only">كلمة البحث</label>
          <input id="term" type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="اسم منتج أو كلمة من الإعلان"
            className="h-[54px] min-w-0 flex-[1_1_280px] rounded-xl bg-white px-4 text-[17px] text-text" />
          <button disabled={loading} className="h-[54px] rounded-xl bg-lime px-7 text-[17px] font-bold text-ink disabled:opacity-60">{loading ? "جارٍ البحث..." : "بحث"}</button>
        </form>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[13px] text-line-2">المنصة:</span>
          {platforms.map(([id, label]) => (
            <button key={id} type="button" aria-pressed={platform === id} onClick={() => { setPlatform(id); run(query, id); }}
              className={`h-[34px] rounded-lg px-3.5 text-[13px] ${platform === id ? "bg-lime font-bold text-ink" : "border border-ink-3 font-semibold text-white"}`}>{label}</button>
          ))}
        </div>
      </section>

      <section aria-label="الفلاتر" className="flex flex-wrap items-end gap-3">
        <label className="flex flex-[1_1_160px] flex-col gap-1.5 text-[13px] text-muted">
          <span>مدة التشغيل</span>
          <select value={minDays} onChange={(e) => setMinDays(Number(e.target.value))} className="h-[42px] rounded-[10px] border border-line-2 bg-white px-2.5 text-sm font-semibold text-text">
            <option value={0}>أي مدة</option>
            <option value={7}>أكثر من 7 أيام</option>
            <option value={30}>أكثر من 30 يومًا</option>
            <option value={60}>أكثر من 60 يومًا</option>
          </select>
        </label>
        <label className="flex flex-[1_1_160px] flex-col gap-1.5 text-[13px] text-muted">
          <span>التصنيف</span>
          <select value={tier} onChange={(e) => setTier(e.target.value)} className="h-[42px] rounded-[10px] border border-line-2 bg-white px-2.5 text-sm font-semibold text-text">
            <option value="all">الكل</option>
            <option value="super">رابح مؤكد</option>
            <option value="winner">رابح</option>
            <option value="testing">قيد الاختبار</option>
          </select>
        </label>
      </section>

      {problem && (
        <div role="alert" className={`flex flex-wrap items-center justify-between gap-3 rounded-2xl p-5 ${problem.kind === "error" ? "bg-[#FEE4E2] text-[#912018]" : "bg-ink text-white"}`}>
          <b>{problem.message}</b>
          {problem.kind === "login" && <Link href="/login?mode=up" className="rounded-[10px] bg-lime px-5 py-2.5 font-bold text-ink">ابدأ مجانًا</Link>}
          {problem.kind === "upgrade" && <Link href="/pricing" className="rounded-[10px] bg-lime px-5 py-2.5 font-bold text-ink">الباقات</Link>}
        </div>
      )}

      {data && (
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <b className="text-base">{data.total} نتيجة</b>
          <span className="rounded-full bg-ink px-3 py-1 text-[13px] font-bold text-lime">رابح مؤكد {count("super")}</span>
          <span className="rounded-full border border-lime-line bg-lime-soft px-3 py-1 text-[13px] font-bold text-lime-text">رابح {count("winner")}</span>
          {data.cached && <span className="text-muted">· من نتائج محفوظة، دون خصم نقاط</span>}
          {data.charged && <span className="text-muted">· خُصمت نقطة واحدة</span>}
          {data.sample && <span className="rounded-full bg-[#FEF0C7] px-3 py-1 text-[13px] font-semibold text-[#93370D]">بيانات تجريبية</span>}
        </div>
      )}

      {loading && !data ? (
        <p className="rounded-2xl border border-line bg-white p-8 text-center text-muted">جارٍ تحميل النتائج...</p>
      ) : results.length ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-4">
          {results.map((a) => <AdCard key={a.id} ad={a} />)}
        </div>
      ) : data ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-line bg-white p-8 text-center">
          <b className="font-display text-xl">لا توجد نتائج</b>
          <span className="text-muted">جرّب كلمة أخرى أو خفّف الفلاتر.</span>
          <button type="button" onClick={() => { setMinDays(0); setTier("all"); }} className="h-11 rounded-[10px] bg-ink px-5 font-bold text-white">مسح الفلاتر</button>
        </div>
      ) : null}

      {data && data.locked > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#CDE7D4] bg-[#F3F9F4] p-5">
          <b>{data.locked} نتيجة إضافية</b>
          <Link href="/pricing" className="rounded-[10px] bg-ink px-5 py-2.5 font-bold text-white">عرض جميع النتائج</Link>
        </div>
      )}
    </>
  );
}
