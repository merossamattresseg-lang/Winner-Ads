import { Wordmark } from "@/components/ui";
import { Onboarding } from "./Onboarding";

export const metadata = { title: "مرحبًا بك" };

export default async function WelcomePage({ searchParams }: { searchParams: Promise<{ reg?: string }> }) {
  const { reg } = await searchParams;
  return (
    <div className="flex min-h-screen flex-col items-center gap-7 bg-[#F7F8FA] px-4 py-10">
      <div className="flex w-full max-w-[760px] justify-between"><Wordmark dark={false} /></div>
      <Onboarding regId={reg} telegramBot={process.env.NEXT_PUBLIC_TELEGRAM_BOT} />
    </div>
  );
}
