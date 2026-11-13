"use server";
import { revalidatePath } from "next/cache";
import { getUserAndProfile } from "@/lib/supabase/server";

async function requireAdmin() {
  const ctx = await getUserAndProfile();
  if (ctx.profile?.role !== "admin") throw new Error("not_admin");
  return ctx.supabase;
}

const num = (v: FormDataEntryValue | null, min = 0, max = 1_000_000) => Math.min(Math.max(Number(v) || 0, min), max);

export async function savePlans(form: FormData) {
  const supabase = await requireAdmin();
  const popular = String(form.get("popular") ?? "");
  const ids = form.getAll("id").map(String);
  for (const id of ids) {
    await supabase.from("plans").update({
      price_egp: num(form.get(`price_${id}`), 0, 100000),
      monthly_points: num(form.get(`points_${id}`), 0, 10_000_000),
      popular: id === popular,
    }).eq("id", id);
  }
  revalidatePath("/", "layout");
}

export async function saveScore(form: FormData) {
  const supabase = await requireAdmin();
  const value = {
    weights: {
      days: num(form.get("w_days"), 0, 100),
      copies: num(form.get("w_copies"), 0, 100),
      engagement: num(form.get("w_engagement"), 0, 100),
      advertisers: num(form.get("w_advertisers"), 0, 100),
      supplier: num(form.get("w_supplier"), 0, 100),
    },
    caps: { days: num(form.get("c_days"), 1, 365), copies: num(form.get("c_copies"), 1, 100), advertisers: num(form.get("c_advertisers"), 1, 100) },
    thresholds: { winner: num(form.get("t_winner"), 0, 100), super: num(form.get("t_super"), 0, 100) },
  };
  await supabase.from("app_settings").upsert({ key: "score", value, updated_at: new Date().toISOString() });
  revalidatePath("/", "layout");
}

export async function saveProfitDefaults(form: FormData) {
  const supabase = await requireAdmin();
  const value = {
    shipping: num(form.get("shipping")),
    packaging: num(form.get("packaging")),
    returnRate: num(form.get("returnRate"), 0, 100),
    returnCost: num(form.get("returnCost")),
    targetMargin: num(form.get("targetMargin"), 0, 100),
  };
  await supabase.from("app_settings").upsert({ key: "profit_defaults", value, updated_at: new Date().toISOString() });
  revalidatePath("/", "layout");
}
