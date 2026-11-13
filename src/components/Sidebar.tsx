"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoMark, Wordmark } from "./ui";

const nav = [
  { href: "/", label: "الرئيسية" },
  { href: "/search", label: "بحث الإعلانات" },
  { href: "/products", label: "أفضل المنتجات" },
  { href: "/advertisers/care-shop", label: "المعلنين", match: "/advertisers" },
  { href: "/suppliers", label: "الموردين" },
  { href: "/pricing", label: "الاشتراك" },
];

export function Sidebar() {
  const path = usePathname();
  return (
    <aside className="flex w-full flex-col gap-6 bg-ink px-4 py-6 text-white md:sticky md:top-0 md:h-screen md:w-64 md:shrink-0">
      <Link href="/" className="flex items-center gap-2.5 px-2">
        <LogoMark />
        <Wordmark />
      </Link>
      <nav aria-label="القائمة" className="flex flex-wrap gap-1 md:flex-col">
        {nav.map((n) => {
          const active = n.href === "/" ? path === "/" : path.startsWith(n.match ?? n.href);
          return (
            <Link
              key={n.href}
              href={n.href}
              className={`flex h-11 items-center rounded-[10px] px-3 text-[15px] ${active ? "bg-lime font-bold text-ink" : "font-medium text-line-2 hover:bg-ink-2"}`}
            >
              {n.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto hidden flex-col gap-2.5 rounded-xl bg-ink-2 p-4 md:flex">
        <div className="flex justify-between text-[13px] text-line-2">
          <span>النقاط المتبقية</span>
          <span dir="ltr">7,420 / 10,000</span>
        </div>
        <div className="h-1.5 rounded-full bg-ink-3">
          <div className="h-1.5 w-[74%] rounded-full bg-lime" />
        </div>
        <span className="text-xs text-line-2">البحث من الكاش مش بيخصم نقاط</span>
      </div>
    </aside>
  );
}
