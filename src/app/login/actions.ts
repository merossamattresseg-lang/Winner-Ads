"use server";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { sendEmail } from "@/lib/email";
import { sendCapiEvent } from "@/lib/meta";
import { claimSession } from "@/lib/session";
import { createClient } from "@/lib/supabase/server";

const safeNext = (v: FormDataEntryValue | null, fallback = "/dashboard") => {
  const s = typeof v === "string" && v ? v : fallback;
  return s.startsWith("/") && !s.startsWith("//") ? s : fallback;
};

async function origin() {
  const h = await headers();
  return h.get("origin") ?? `https://${h.get("host")}`;
}

export type AuthState = { error?: string; info?: string };

export async function signIn(_: AuthState, form: FormData): Promise<AuthState> {
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: String(form.get("email") ?? ""),
    password: String(form.get("password") ?? ""),
  });
  if (error) return { error: error.message.toLowerCase().includes("confirm") ? "يرجى تأكيد بريدك الإلكتروني أولًا." : "البريد الإلكتروني أو كلمة المرور غير صحيحة." };
  await claimSession(supabase);
  redirect(safeNext(form.get("next")));
}

export async function signUp(_: AuthState, form: FormData): Promise<AuthState> {
  const password = String(form.get("password") ?? "");
  if (password.length < 8) return { error: "كلمة المرور 8 أحرف على الأقل." };
  const email = String(form.get("email") ?? "").trim();
  const phone = String(form.get("phone") ?? "").trim();
  const name = String(form.get("name") ?? "").trim();
  const ref = (await cookies()).get("wa_ref")?.value ?? "";
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${await origin()}/auth/callback?next=/welcome`,
      data: { full_name: name, phone, ref },
    },
  });
  if (error) return { error: error.message.toLowerCase().includes("registered") ? "هذا البريد مسجل بالفعل. سجّل الدخول." : "تعذر إنشاء الحساب. حاول مرة أخرى." };
  const userId = data.user?.id;
  const h = await headers();
  await Promise.all([
    userId ? sendEmail({ to: email, kind: "welcome", userId, ctx: { name } }) : null,
    userId ? sendCapiEvent({ name: "CompleteRegistration", eventId: `reg_${userId}`, email, phone, userId, ip: h.get("x-forwarded-for")?.split(",")[0], userAgent: h.get("user-agent"), path: "/login" }) : null,
  ]);
  if (data.session) {
    await claimSession(supabase);
    redirect(`/welcome?reg=${userId}`);
  }
  return { info: "أرسلنا رابط التأكيد إلى بريدك الإلكتروني." };
}

export async function resetPassword(_: AuthState, form: FormData): Promise<AuthState> {
  const supabase = await createClient();
  await supabase.auth.resetPasswordForEmail(String(form.get("email") ?? ""), { redirectTo: `${await origin()}/auth/callback?next=/account` });
  return { info: "إذا كان البريد مسجلًا، فستصلك رسالة خلال دقائق." };
}

export async function signInWithGoogle(form: FormData) {
  const supabase = await createClient();
  const { data } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${await origin()}/auth/callback?next=${encodeURIComponent(safeNext(form.get("next")))}` },
  });
  redirect(data.url ?? "/login?error=google");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
