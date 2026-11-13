"use server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const safeNext = (v: FormDataEntryValue | null) => {
  const s = typeof v === "string" ? v : "/";
  return s.startsWith("/") && !s.startsWith("//") ? s : "/";
};

export type AuthState = { error?: string; info?: string };

export async function signIn(_: AuthState, form: FormData): Promise<AuthState> {
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: String(form.get("email") ?? ""),
    password: String(form.get("password") ?? ""),
  });
  if (error) return { error: error.message.includes("confirm") ? "لازم تأكد إيميلك الأول من الرسالة اللي وصلتك" : "الإيميل أو كلمة السر غلط" };
  redirect(safeNext(form.get("next")));
}

export async function signUp(_: AuthState, form: FormData): Promise<AuthState> {
  const password = String(form.get("password") ?? "");
  if (password.length < 8) return { error: "كلمة السر لازم تكون 8 حروف أو أكتر" };
  const h = await headers();
  const origin = h.get("origin") ?? `https://${h.get("host")}`;
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: String(form.get("email") ?? ""),
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(safeNext(form.get("next")))}`,
      data: { full_name: String(form.get("name") ?? ""), phone: String(form.get("phone") ?? "") },
    },
  });
  if (error) return { error: error.message.includes("registered") ? "الإيميل ده عنده حساب بالفعل، سجل دخول" : "مقدرناش نعمل الحساب، جرب تاني" };
  if (data.session) redirect(safeNext(form.get("next")));
  return { info: "بعتنالك إيميل تأكيد. افتحه واضغط على اللينك، وبعدها سجل دخول." };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
