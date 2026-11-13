import { Wordmark } from "@/components/ui";
import { botLink } from "@/lib/telegramBot";
import { createClient } from "@/lib/supabase/server";
import { Onboarding } from "./Onboarding";

export const metadata = { title: "مرحبًا بك" };

export default async function WelcomePage({ searchParams }: { searchParams: Promise<{ reg?: string }> }) {
  const { reg } = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: p } = user ? await supabase.from("profiles").select("telegram_link_token").eq("id", user.id).single() : { data: null };
  const link = botLink(p?.telegram_link_token);
  return (
    <div className="flex min-h-screen flex-col items-center gap-7 bg-[#F7F8FA] px-4 py-10">
      <div className="flex w-full max-w-[760px] justify-between"><Wordmark dark={false} /></div>
      <Onboarding regId={reg} telegramLink={link ?? undefined} />
    </div>
  );
}
