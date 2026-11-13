"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function FavoriteButton({ adId }: { adId: string }) {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const sb = createClient();
    sb.auth.getUser().then(async ({ data }) => {
      if (!data.user) return;
      setUserId(data.user.id);
      const { data: row } = await sb.from("favorites").select("ad_id").eq("ad_id", adId).maybeSingle();
      setSaved(Boolean(row));
    });
  }, [adId]);

  async function toggle() {
    if (!userId) return router.push(`/login?next=/ads/${adId}`);
    setBusy(true);
    const sb = createClient();
    const { error } = saved
      ? await sb.from("favorites").delete().eq("ad_id", adId)
      : await sb.from("favorites").insert({ user_id: userId, ad_id: adId });
    if (!error) setSaved(!saved);
    setBusy(false);
  }

  return (
    <button type="button" onClick={toggle} disabled={busy} aria-pressed={saved}
      className={`h-11 rounded-[10px] text-sm font-semibold disabled:opacity-60 ${saved ? "bg-lime-soft text-lime-text" : "border border-line-2 bg-white"}`}>
      {saved ? "محفوظ في المفضلة" : "حفظ في المفضلة"}
    </button>
  );
}
