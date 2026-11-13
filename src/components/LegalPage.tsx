import Link from "next/link";
import { PublicFooter, PublicHeader } from "./PublicChrome";

// بيانات الشركة بتتحط من Environment Variables قبل الإطلاق (Paymob بيطلبها).
const company = {
  name: process.env.NEXT_PUBLIC_COMPANY_NAME ?? "[اسم الشركة]",
  cr: process.env.NEXT_PUBLIC_COMPANY_CR ?? "[رقم السجل التجاري]",
  address: process.env.NEXT_PUBLIC_COMPANY_ADDRESS ?? "[العنوان]",
  email: process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? "[البريد الإلكتروني]",
};

const tabs = [["/terms", "شروط الاستخدام"], ["/privacy", "سياسة الخصوصية"], ["/refund", "سياسة الاسترداد"]] as const;

export function LegalPage({ path, title, sections }: { path: string; title: string; sections: [string, string][] }) {
  return (
    <div className="bg-white">
      <PublicHeader />
      <div className="mx-auto flex max-w-[1100px] flex-wrap gap-10 px-6 py-10">
        <nav aria-label="السياسات" className="flex w-full flex-col gap-1 md:w-56">
          {tabs.map(([href, label]) => (
            <Link key={href} href={href} className={`flex h-[42px] items-center rounded-[10px] px-3 text-[15px] ${href === path ? "bg-[#F3F9F4] font-bold" : ""}`}>{label}</Link>
          ))}
        </nav>
        <article className="flex min-w-0 flex-[1_1_560px] flex-col gap-5 text-base leading-8 text-body">
          <div>
            <h1 className="font-display text-[34px] font-bold text-text">{title}</h1>
            <span className="text-sm text-[#98A2B3]">آخر تحديث: 13 نوفمبر 2026</span>
          </div>
          {sections.map(([h, p]) => (
            <section key={h}><h2 className="mb-1.5 text-[19px] font-bold text-text">{h}</h2><p>{p}</p></section>
          ))}
          <div className="rounded-xl bg-[#F7F8FA] px-4 py-3.5 text-sm">{company.name} · سجل تجاري {company.cr} · {company.address} · {company.email}</div>
        </article>
      </div>
      <PublicFooter />
    </div>
  );
}
