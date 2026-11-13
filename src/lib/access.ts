import { createClient } from "./supabase/server";

// حالة صلاحيات المستخدم الحالي: مشترك، أو في التجربة، أو زائر.
export type Access = { userId: string | null; subscribed: boolean; trial: boolean; credits: number; plan: string | null };

export async function getAccess(): Promise<Access> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { userId: null, subscribed: false, trial: false, credits: 0, plan: null };
  const [{ data: profile }, { data: sub }, { data: credits }] = await Promise.all([
    supabase.from("profiles").select("trial_ends_at").eq("id", user.id).single(),
    supabase.from("subscriptions").select("plan_id").eq("status", "active").gt("current_period_end", new Date().toISOString()).limit(1).maybeSingle(),
    supabase.from("my_credits").select("balance").maybeSingle(),
  ]);
  return {
    userId: user.id,
    subscribed: Boolean(sub),
    trial: !sub && Boolean(profile?.trial_ends_at && new Date(profile.trial_ends_at) > new Date()),
    credits: credits?.balance ?? 0,
    plan: sub?.plan_id ?? null,
  };
}

// حدود كل حالة (تتعدل من هنا).
export const LIMITS = {
  guestResults: 6,
  trialSupplierOffers: 2,
  trialResults: 40,
};
