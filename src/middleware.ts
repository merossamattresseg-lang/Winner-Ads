import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { SUPABASE_KEY, SUPABASE_URL } from "@/lib/supabase/config";

const PROTECTED = ["/admin", "/account", "/saved", "/welcome", "/dashboard"];

function sessionId(token?: string) {
  try {
    const p = token?.split(".")[1];
    if (!p) return null;
    return JSON.parse(atob(p.replace(/-/g, "+").replace(/_/g, "/"))).session_id ?? null;
  } catch {
    return null;
  }
}

// بيجدد جلسة الدخول، وبيقفل الصفحات الخاصة، وبيسمح بجلسة واحدة لكل حساب، و/admin للأدمن بس.
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
  const isProtected = PROTECTED.some((p) => path === p || path.startsWith(`${p}/`));

  if (isProtected && !user) {
    const to = req.nextUrl.clone();
    to.pathname = "/login";
    to.search = `?next=${encodeURIComponent(path)}`;
    return NextResponse.redirect(to);
  }

  if (isProtected && user) {
    const [{ data: profile }, { data: { session } }] = await Promise.all([
      supabase.from("profiles").select("role, active_session").eq("id", user.id).single(),
      supabase.auth.getSession(),
    ]);
    const sid = sessionId(session?.access_token);
    if (profile?.active_session && sid && profile.active_session !== sid) {
      await supabase.auth.signOut({ scope: "local" });
      const out = NextResponse.redirect(new URL("/login?reason=other_device", req.url));
      res.cookies.getAll().forEach((c) => out.cookies.set(c));
      return out;
    }
    if (path.startsWith("/admin") && profile?.role !== "admin") return NextResponse.redirect(new URL("/dashboard", req.url));
  }
  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|icon.svg|api/paymob/webhook|api/cron).*)"],
};
