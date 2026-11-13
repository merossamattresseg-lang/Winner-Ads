"use server";
import { redirect } from "next/navigation";
import { createAdminClient, createClient } from "@/lib/supabase/server";

// حذف الحساب نهائيًا (الحساب والبيانات المرتبطة به).
export async function deleteMyAccount(form: FormData) {
  if (String(form.get("confirm") ?? "").trim() !== "حذف") return;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const admin = createAdminClient();
  if (admin) {
    await admin.auth.admin.deleteUser(user.id);
  } else {
    await supabase.from("profiles").update({ deletion_requested_at: new Date().toISOString() }).eq("id", user.id);
  }
  await supabase.auth.signOut();
  redirect("/?deleted=1");
}
