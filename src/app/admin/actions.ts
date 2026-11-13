"use server";
import { revalidatePath } from "next/cache";
import { createAdminClient, getUserAndProfile } from "@/lib/supabase/server";
import { syncAllChannels, syncChannel } from "@/lib/telegram";

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

// ===== العملاء =====

function admin() {
  const a = createAdminClient();
  if (!a) throw new Error("service_role_missing");
  return a;
}

export async function addPoints(form: FormData) {
  await requireAdmin();
  const user = String(form.get("user_id"));
  const pts = Math.max(-100000, Math.min(100000, Number(form.get("points")) || 0));
  if (pts) await admin().from("credits_ledger").insert({ user_id: user, delta: pts, reason: "تعديل من الأدمن" });
  revalidatePath("/admin/users");
}

export async function extendTrial(form: FormData) {
  await requireAdmin();
  const user = String(form.get("user_id"));
  const days = Math.max(1, Math.min(60, Number(form.get("days")) || 2));
  const { data } = await admin().from("profiles").select("trial_ends_at").eq("id", user).single();
  const base = data?.trial_ends_at && new Date(data.trial_ends_at) > new Date() ? new Date(data.trial_ends_at) : new Date();
  await admin().from("profiles").update({ trial_ends_at: new Date(base.getTime() + days * 86400000).toISOString() }).eq("id", user);
  revalidatePath("/admin/users");
}

export async function setRole(form: FormData) {
  await requireAdmin();
  const role = form.get("role") === "admin" ? "admin" : "user";
  await admin().from("profiles").update({ role }).eq("id", String(form.get("user_id")));
  revalidatePath("/admin/users");
}

export async function grantSubscription(form: FormData) {
  await requireAdmin();
  const user = String(form.get("user_id"));
  const plan = String(form.get("plan_id"));
  const months = Math.max(1, Math.min(12, Number(form.get("months")) || 1));
  const { data: p } = await admin().from("plans").select("monthly_points").eq("id", plan).single();
  if (!p) return;
  await admin().from("subscriptions").insert({ user_id: user, plan_id: plan, status: "active", current_period_end: new Date(Date.now() + months * 30 * 86400000).toISOString() });
  await admin().from("credits_ledger").insert({ user_id: user, delta: p.monthly_points, reason: `اشتراك يدوي ${plan}` });
  revalidatePath("/admin/users");
}

// ===== مصادر البيانات =====
export async function addKeyword(form: FormData) {
  await requireAdmin();
  const words = String(form.get("keywords") ?? "").split(/[\n,،]/).map((w) => w.trim()).filter(Boolean).slice(0, 200);
  if (words.length) await admin().from("crawl_keywords").upsert(words.map((keyword) => ({ keyword })), { onConflict: "keyword", ignoreDuplicates: true });
  revalidatePath("/admin/data");
}

export async function toggleKeyword(form: FormData) {
  await requireAdmin();
  await admin().from("crawl_keywords").update({ active: form.get("active") === "true" }).eq("id", Number(form.get("id")));
  revalidatePath("/admin/data");
}

export async function addChannels(form: FormData) {
  await requireAdmin();
  const kind = ["جملة", "مستورد", "دروب شيبنج"].includes(String(form.get("kind"))) ? String(form.get("kind")) : "جملة";
  const names = String(form.get("channels") ?? "")
    .split(/[\s,،]+/)
    .map((c) => c.trim().replace(/^https?:\/\/t\.me\/(s\/)?/, "").replace(/^@/, "").replace(/\/.*$/, ""))
    .filter((c) => /^[A-Za-z0-9_]{4,64}$/.test(c))
    .slice(0, 200);
  if (names.length) await admin().from("supplier_channels").upsert(names.map((username) => ({ username, kind })), { onConflict: "username", ignoreDuplicates: true });
  revalidatePath("/admin/data");
}

export async function toggleChannel(form: FormData) {
  await requireAdmin();
  await admin().from("supplier_channels").update({ active: form.get("active") === "true" }).eq("id", Number(form.get("id")));
  revalidatePath("/admin/data");
}

export async function syncChannelsNow() {
  await requireAdmin();
  await syncAllChannels(30);
  revalidatePath("/admin/data");
}

export async function syncOneChannel(form: FormData) {
  await requireAdmin();
  await syncChannel({ id: Number(form.get("id")), username: String(form.get("username")) });
  revalidatePath("/admin/data");
}

export async function saveProviderSettings(form: FormData) {
  await requireAdmin();
  const value = {
    meta: "searchapi",
    tiktok: "scrapecreators",
    cache_hours: num(form.get("cache_hours"), 1, 168),
    guest_searches_per_day: num(form.get("guest_searches_per_day"), 0, 20),
    apify_actor: String(form.get("apify_actor") ?? "").trim() || undefined,
    nightly_keywords_limit: num(form.get("nightly_keywords_limit"), 1, 200),
  };
  await admin().from("app_settings").upsert({ key: "providers", value, updated_at: new Date().toISOString() });
  revalidatePath("/admin/data");
}
