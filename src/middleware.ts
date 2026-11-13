import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { SUPABASE_KEY, SUPABASE_URL } from "@/lib/supabase/config";

// بيجدد جلسة الدخول مع كل طلب، وبيقفل /admin على الحسابات اللي role بتاعها admin بس.
export async function middleware(req: NextRequest) {
  let res = NextResponse.next({ request: req });
  const supabase = createServerClient(SUPABASE_URL, SUPABASE_KEY, {
    cookies: {
      getAll: () => req.cookies.getAll(),
      setAll: (list) => {
        list.forEach(({ name, value }) => req.cookies.set(name, value));
        res = NextResponse.next({ request: req });
        list.forEach(({ name, value, options }) => res.cookies.set(name, value, options));
      },
    },
  });
  const { data: { user } } = await supabase.auth.getUser();

  const path = req.nextUrl.pathname;
  const needsLogin = path.startsWith("/admin") || path.startsWith("/account") || path.startsWith("/saved");
  if (needsLogin && !user) {
    const to = req.nextUrl.clone();
    to.pathname = "/login";
    to.search = `?next=${encodeURIComponent(path)}`;
    return NextResponse.redirect(to);
  }
  if (path.startsWith("/admin") && user) {
    const { data } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    if (data?.role !== "admin") return NextResponse.redirect(new URL("/", req.url));
  }
  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|icon.svg|api/paymob/webhook).*)"],
};
