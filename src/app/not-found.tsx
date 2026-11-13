import Link from "next/link";
import { PublicHeader } from "@/components/PublicChrome";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#F7F8FA]">
      <PublicHeader />
      <div className="mx-auto mt-16 flex max-w-[480px] flex-col items-center gap-4 rounded-[20px] border border-line bg-white p-8 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-[18px] bg-[#F2F4F7] font-display text-xl font-bold">404</span>
        <h1 className="font-display text-2xl font-bold">الصفحة غير موجودة</h1>
        <p className="text-[15px] text-muted">ربما تغيّر الرابط أو حُذفت الصفحة.</p>
        <div className="flex gap-2">
          <Link href="/" className="flex h-11 items-center rounded-[10px] bg-ink px-5 font-bold text-white">الصفحة الرئيسية</Link>
          <Link href="/search" className="flex h-11 items-center rounded-[10px] border border-line-2 px-5 font-semibold">البحث</Link>
        </div>
      </div>
    </div>
  );
}
