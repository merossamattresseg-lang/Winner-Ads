import Link from "next/link";
import { LogoMark, Wordmark } from "@/components/ui";
import { LoginForm } from "./LoginForm";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="flex w-full max-w-[420px] flex-col gap-6 rounded-[18px] border border-line bg-white p-7">
        <Link href="/" className="flex items-center gap-2.5 self-center">
          <LogoMark bg="#0B1324" />
          <Wordmark dark={false} size="text-2xl" />
        </Link>
        <p className="text-center text-[15px] text-muted">اعرف الوينر قبل ما تصرف عليه</p>
        <LoginForm next={next ?? "/"} />
      </div>
    </div>
  );
}
