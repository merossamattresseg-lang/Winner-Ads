"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoMark, Wordmark } from "./ui";

const nav = [
  { href: "/dashboard", label: "الرئيسية" },
  { href: "/search", label: "بحث الإعلانات" },
  { href: "/products", label: "أفضل المنتجات" },
  { href: "/advertisers/care-shop", label: "المعلنون", match: "/advertisers" },
  { href: "/suppliers", label: "الموردون" },
  { href: "/calculator", label: "حاسبة الربح" },
  { href: "/saved", label: "المحفوظات" },
  { href: "/account", label: "الحساب" },
];

const mobileNav = [
  { href: "/dashboard", label: "الرئيسية" },
  { href: "/search", label: "بحث" },
  { href: "/suppliers", label: "الموردون" },
  { href: "/account", label: "الحساب" },
];

const isActive = (path: string, href: string, match?: string) => (href === "/dashboard" ? path === href : path.startsWith(match ?? href));

export function Sidebar({ credits, quota, loggedIn }: { credits: number | null; quota: number; loggedIn: boolean }) {
  const path = usePathname();
  const pct = quota ? Math.min(100, Math.round(((credits ?? 0) / quota) * 100)) : 0;
  return (
    <>
      <aside className="flex w-full flex-col gap-6 bg-ink px-4 py-4 text-white md:sticky md:top-0 md:h-screen md:w-64 md:shrink-0 md:py-6">
        <div className="flex items-center justify-between px-2">
          <Link href={loggedIn ? "/dashboard" : "/"} className="flex items-center gap-2.5"><LogoMark /><Wordmark /></Link>
          {!loggedIn && <Link href="/login?mode=up" className="rounded-lg bg-lime px-3 py-1.5 text-sm font-bold text-ink md:hidden">ابدأ مجانًا</Link>}
        </div>
        <nav aria-label="القائمة" className="hidden flex-col gap-1 md:flex">
          {nav.map((n) => (
            <Link key={n.href} href={n.href}
              className={`flex h-11 items-center rounded-[10px] px-3 text-[15px] ${isActive(path, n.href, n.match) ? "bg-lime font-bold text-ink" : "font-medium text-line-2 hover:bg-ink-2"}`}>
              {n.label}
            </Link>
          ))}
          {!loggedIn && <Link href="/login?mode=up" className="mt-2 flex h-11 items-center justify-center rounded-[10px] bg-lime font-bold text-ink">ابدأ مجانًا</Link>}
        </nav>
        {loggedIn && credits !== null && (
          <div className="mt-auto hidden flex-col gap-2.5 rounded-xl bg-ink-2 p-4 md:flex">
            <div className="flex justify-between text-[13px] text-line-2">
              <span>النقاط المتبقية</span>
              <span dir="ltr">{credits.toLocaleString("en-US")}</span>
            </div>
            <div className="h-1.5 rounded-full bg-ink-3"><div className="h-1.5 rounded-full bg-lime" style={{ width: `${pct}%` }} /></div>
            <Link href="/pricing" className="text-xs font-semibold text-lime">زيادة النقاط</Link>
          </div>
        )}
      </aside>
      <nav aria-label="تنقل الجوال" className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t border-line bg-white pb-3 pt-2 text-center text-xs md:hidden">
        {mobileNav.map((n) => (
          <Link key={n.href} href={n.href} className={`py-1.5 ${isActive(path, n.href) ? "font-bold text-[#14532D]" : "text-muted"}`}>{n.label}</Link>
        ))}
      </nav>
    </>
  );
}
