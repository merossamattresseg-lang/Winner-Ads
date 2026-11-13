import { createServerClient } from "@supabase/ssr";
import { createClient as createPlainClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { SUPABASE_KEY, SUPABASE_URL } from "./config";

export async function createClient() {
  const store = await cookies();
  return createServerClient(SUPABASE_URL, SUPABASE_KEY, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (list) => {
        try {
          list.forEach(({ name, value, options }) => store.set(name, value, options));
        } catch {
          // من Server Component مينفعش نكتب كوكيز، والـ middleware بيجدد الجلسة.
        }
      },
    },
  });
}

// عميل بصلاحية كاملة للسيرفر بس (الـ webhook). محتاج SUPABASE_SERVICE_ROLE_KEY في Vercel.
export function createAdminClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) return null;
  return createPlainClient(SUPABASE_URL, key, { auth: { persistSession: false } });
}

// عميل من غير كوكيز للداتا العامة (الباقات والإعدادات) عشان الصفحات تفضل سريعة.
export function createPublicClient() {
  return createPlainClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: false } });
}

export async function getUserAndProfile() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { supabase, user: null, profile: null };
  const { data: profile } = await supabase.from("profiles").select("id, full_name, phone, role").eq("id", user.id).single();
  return { supabase, user, profile };
}
