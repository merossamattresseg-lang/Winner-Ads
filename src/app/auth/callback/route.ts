import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";
import { claimSession } from "@/lib/session";
import { createClient } from "@/lib/supabase/server";

// رابط تأكيد البريد ودخول Google بيرجع هنا، وبنحوله لجلسة دخول.
export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const nextParam = url.searchParams.get("next") ?? "/dashboard";
  let next = nextParam.startsWith("/") && !nextParam.startsWith("//") ? nextParam : "/dashboard";
  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const { user } = await claimSession(supabase);
      if (user) {
        const { data: profile } = await supabase.from("profiles").select("onboarded, full_name").eq("id", user.id).single();
        if (profile && !profile.onboarded) {
          next = "/welcome";
          if (user.email) await sendEmail({ to: user.email, kind: "welcome", userId: user.id, ctx: { name: profile.full_name } });
        }
      }
    }
  }
  return NextResponse.redirect(new URL(next, url.origin));
}
