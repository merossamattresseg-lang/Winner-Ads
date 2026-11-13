"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { fromSlug } from "@/lib/slug";
import { createClient } from "@/lib/supabase/client";

export function FollowButton({ advertiserId }: { advertiserId: string }) {
  const router = useRouter();
  const [following, setFollowing] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const sb = createClient();
    sb.auth.getUser().then(async ({ data }) => {
      if (!data.user) return;
      setLoggedIn(true);
      const { data: row } = await sb.from("tracked_pages").select("advertiser_id").eq("advertiser_id", fromSlug(advertiserId)).maybeSingle();
      setFollowing(Boolean(row));
    });
  }, [advertiserId]);

  async function toggle() {
    if (!loggedIn) return router.push("/login?mode=up");
    setBusy(true);
    const res = await fetch("/api/track", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ advertiserId, follow: !following }) });
    if (res.ok) setFollowing(!following);
    setBusy(false);
  }

  return (
    <button type="button" onClick={toggle} disabled={busy} aria-pressed={following}
      className={`h-11 rounded-[10px] px-4 text-sm font-semibold disabled:opacity-60 ${following ? "bg-lime-soft text-lime-text" : "border border-line-2 bg-white"}`}>
      {following ? "تتابع هذا المعلن" : "متابعة المعلن"}
    </button>
  );
}
