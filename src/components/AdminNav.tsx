import Link from "next/link";
import { Wordmark } from "./ui";

const items = [["/admin", "نظرة عامة"], ["/admin/users", "العملاء"], ["/admin/data", "مصادر البيانات"], ["/admin/coupons", "أكواد الخصم"]] as const;

export function AdminNav({ active }: { active: string }) {
  return (
    <header className="border-b border-line bg-white">
      <div className="mx-auto flex max-w-[1320px] flex-wrap items-center gap-5 px-6 py-3">
        <Link href="/dashboard"><Wordmark dark={false} size="text-[19px]" /></Link>
        <span className="rounded-full bg-ink px-2.5 py-0.5 text-xs font-bold text-lime">أدمن</span>
        <nav aria-label="قائمة الأدمن" className="flex flex-wrap gap-1">
          {items.map(([href, label]) => (
            <Link key={href} href={href} className={`flex h-[38px] items-center rounded-[9px] px-3 text-sm ${active === href ? "bg-[#F3F9F4] font-bold text-[#14532D]" : "text-body"}`}>{label}</Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
