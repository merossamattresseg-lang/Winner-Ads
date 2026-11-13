"use client";
import Link from "next/link";
import { useEffect } from "react";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-[#F7F8FA] px-4">
      <div className="flex max-w-[480px] flex-col items-center gap-4 rounded-[20px] border border-line bg-white p-8 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-[18px] bg-[#FEE4E2] font-display text-2xl font-bold text-[#912018]">!</span>
        <h1 className="font-display text-2xl font-bold">حدث خطأ غير متوقع</h1>
        <p className="text-[15px] text-muted">حاول مرة أخرى. إذا تكرر الخطأ تواصل معنا عبر واتساب.</p>
        <div className="flex gap-2">
          <button type="button" onClick={reset} className="h-11 rounded-[10px] bg-ink px-5 font-bold text-white">إعادة المحاولة</button>
          <Link href="/" className="flex h-11 items-center rounded-[10px] border border-line-2 px-5 font-semibold">الصفحة الرئيسية</Link>
        </div>
      </div>
    </div>
  );
}
