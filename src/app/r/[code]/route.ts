import { NextResponse } from "next/server";

// رابط الإحالة: بيحفظ الكود 30 يوم ويوديه على إنشاء حساب.
export async function GET(req: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const res = NextResponse.redirect(new URL("/login?mode=up", req.url));
  if (/^[A-Z0-9]{4,12}$/i.test(code)) {
    res.cookies.set("wa_ref", code.toUpperCase(), { maxAge: 60 * 60 * 24 * 30, path: "/", sameSite: "lax", httpOnly: true });
  }
  return res;
}
