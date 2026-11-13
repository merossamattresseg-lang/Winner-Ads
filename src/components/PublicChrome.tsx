import Link from "next/link";
import { LogoMark, Wordmark } from "./ui";

export function PublicHeader({ loggedIn = false }: { loggedIn?: boolean }) {
  return (
    <header className="mx-auto flex max-w-[1240px] flex-wrap items-center justify-between gap-4 px-6 py-4">
      <Link href="/" className="flex items-center gap-2.5">
        <LogoMark size={38} bg="#0B1324" />
        <Wordmark dark={false} size="text-[22px]" />
      </Link>
      <nav aria-label="أقسام الصفحة" className="hidden gap-7 text-[15px] font-medium text-body md:flex">
        <Link href="/#features">المزايا</Link>
        <Link href="/#how">كيف يعمل</Link>
        <Link href="/#pricing">الأسعار</Link>
        <Link href="/top">الأكثر ربحًا</Link>
      </nav>
      <div className="flex items-center gap-2.5">
        {loggedIn ? (
          <Link href="/dashboard" className="flex h-11 items-center rounded-[10px] bg-ink px-5 text-[15px] font-bold text-white">لوحة التحكم</Link>
        ) : (
          <>
            <Link href="/login" className="hidden px-2 text-[15px] font-semibold sm:inline">تسجيل الدخول</Link>
            <Link href="/login?mode=up" className="flex h-11 items-center rounded-[10px] bg-ink px-5 text-[15px] font-bold text-white">ابدأ مجانًا</Link>
          </>
        )}
      </div>
    </header>
  );
}

export function PublicFooter() {
  return (
    <footer className="border-t border-line px-6 py-8">
      <div className="mx-auto flex max-w-[1160px] flex-wrap justify-between gap-6 text-sm text-muted">
        <Wordmark dark={false} size="text-lg" />
        <nav aria-label="روابط" className="flex flex-wrap gap-5">
          <Link href="/#pricing">الأسعار</Link>
          <Link href="/top">الأكثر ربحًا</Link>
          <Link href="/terms">الشروط</Link>
          <Link href="/privacy">الخصوصية</Link>
          <Link href="/refund">الاسترداد</Link>
        </nav>
        <span>© 2026 WinnerAds</span>
      </div>
    </footer>
  );
}

export const gridBg = {
  backgroundColor: "#F3F9F4",
  backgroundImage: "linear-gradient(#E3F0E6 1px, transparent 1px), linear-gradient(90deg, #E3F0E6 1px, transparent 1px)",
  backgroundSize: "48px 48px",
} as const;

export function Highlight({ children }: { children: React.ReactNode }) {
  return <span className="px-1.5" style={{ background: "linear-gradient(transparent 58%, #C8F03C 58%)" }}>{children}</span>;
}
