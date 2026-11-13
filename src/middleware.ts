import { NextResponse, type NextRequest } from "next/server";

// حماية مؤقتة للوحة الأدمن بكلمة سر من Environment Variables (ADMIN_USER و ADMIN_PASSWORD).
// هتتبدل بتسجيل دخول Supabase وصلاحية أدمن في المرحلة التانية.
export function middleware(req: NextRequest) {
  const user = process.env.ADMIN_USER;
  const pass = process.env.ADMIN_PASSWORD;
  if (!user || !pass) {
    return new NextResponse("لوحة الإدارة مقفولة لحد ما تتحط ADMIN_USER و ADMIN_PASSWORD", { status: 503, headers: { "content-type": "text/plain; charset=utf-8" } });
  }
  const auth = req.headers.get("authorization") ?? "";
  const [scheme, encoded] = auth.split(" ");
  if (scheme === "Basic" && encoded) {
    const [u, p] = atob(encoded).split(":");
    if (u === user && p === pass) return NextResponse.next();
  }
  return new NextResponse("مطلوب تسجيل دخول", { status: 401, headers: { "WWW-Authenticate": 'Basic realm="WinnerAds Admin"' } });
}

export const config = { matcher: ["/admin/:path*"] };
