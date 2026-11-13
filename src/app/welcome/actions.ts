"use server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const allowedTypes = ["media_buyer", "brand", "dropshipping", "agency"];
const allowedCats = ["صحة", "منزل ومطبخ", "تجميل", "ملابس", "إلكترونيات", "أطفال", "رياضة", "إكسسوارات"];
const allowedPlatforms = ["meta", "tiktok", "none"];

export async function saveOnboarding(form: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const type = String(form.get("business_type") ?? "");
  await supabase.from("profiles").update({
    business_type: allowedTypes.includes(type) ? type : null,
    categories: form.getAll("categories").map(String).filter((c) => allowedCats.includes(c)),
    ad_platforms: form.getAll("ad_platforms").map(String).filter((c) => allowedPlatforms.includes(c)),
    weekly_email: form.get("weekly_email") === "on",
    onboarded: true,
  }).eq("id", user.id);
  redirect("/dashboard?started=1");
}
