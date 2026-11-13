"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoMark, Wordmark } from "./ui";

const nav = [
  { href: "/dashboard", label: "الأكثر ربحًا اليوم" },
  { href: "/search", label: "بحث الإعلانات" },
  { href: "/products", label: "أفضل المنتجات" },
  { href: "/suppliers", label: "الموردون" },
  { href: "/calculator", label: "حاسبة الربح" },
  { href: "/saved", label: "المحفوظات" },
];
const mobileNav = [
  { href: "/dashboard", label: "الرئيسية" },
  { href: "/search", label: "بحث" },
  { href: "/suppliers", label: "الموردون" },
  { href: "/account", label: "الحساب" },
];

const active = (path: string, href: string) => (href === "/dashboard" ? path === href : path.startsWith(href));

// القائمة العلوية الفاتحة (الشكل الجديد) + قائمة سفلية للجوال.
export function AppNav({ credits, loggedIn, initial }: { credits: number | null; loggedIn: boolean; initial: string }) {
  const path = usePathname();
  return (
    <>
      <header className="sticky top-0 z-30 border-b border-line bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1280px] items-center gap-5 px-4 py-2.5 md:px-6">
          <Link href={loggedIn ? "/dashboard" : "/"} className="flex shrink-0 items-center gap-2"><LogoMark size={32} bg="#0B1324" /><Wordmark dark={false} size="text-[19px]" /></Link>
          <nav aria-label="القائمة" className="hidden flex-1 gap-1 overflow-x-auto lg:flex">
            {nav.map((n) => (
              <Link key={n.href} href={n.href} className={`flex h-10 shrink-0 items-center rounded-[10px] px-3 text-[15px] ${active(path, n.href) ? "bg-[#F3F9F4] font-bold text-[#14532D]" : "font-medium text-body hover:bg-[#F7F8FA]"}`}>{n.label}</Link>
            ))}
          </nav>
          <div className="ms-auto flex items-center gap-2.5">
            {loggedIn ? (
              <>
                {credits !== null && (
                  <Link href="/pricing" className="flex items-center gap-1.5 rounded-full border border-[#CDE7D4] bg-[#F3F9F4] px-3 py-1.5 text-sm" title="رصيد النقاط">
                    <span className="h-2 w-2 rounded-full bg-[#16A34A]" />{credits.toLocaleString("en-US")} نقطة
                  </Link>
                )}
                <Link href="/account" aria-label="الحساب" className="flex h-9 w-9 items-center justify-center rounded-full bg-[#E4E7EC] font-bold">{initial}</Link>
              </>
            ) : (
              <>
                <Link href="/login" className="hidden text-[15px] font-semibold sm:inline">تسجيل الدخول</Link>
                <Link href="/login?mode=up" className="flex h-10 items-center rounded-[10px] bg-ink px-4 text-sm font-bold text-white">ابدأ مجانًا</Link>
              </>
            )}
          </div>
        </div>
        <nav aria-label="القائمة" className="hidden gap-1 overflow-x-auto px-4 pb-2 md:flex lg:hidden">
          {nav.map((n) => (
            <Link key={n.href} href={n.href} className={`flex h-9 shrink-0 items-center rounded-[9px] px-3 text-sm ${active(path, n.href) ? "bg-[#F3F9F4] font-bold text-[#14532D]" : "text-body"}`}>{n.label}</Link>
          ))}
        </nav>
      </header>
      <nav aria-label="تنقل الجوال" className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t border-line bg-white pb-3 pt-2 text-center text-xs md:hidden">
        {mobileNav.map((n) => (
          <Link key={n.href} href={n.href} className={`py-1.5 ${active(path, n.href) ? "font-bold text-[#14532D]" : "text-muted"}`}>{n.label}</Link>
        ))}
      </nav>
    </>
  );
}
