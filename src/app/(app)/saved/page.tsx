import Link from "next/link";
import { AdCard } from "@/components/AdCard";
import { getAds } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function SavedPage() {
  const supabase = await createClient();
  const { data: favs } = await supabase.from("favorites").select("ad_id, folder, created_at").order("created_at", { ascending: false });
  const ids = new Set((favs ?? []).map((f) => f.ad_id));
  const saved = (await getAds()).filter((a) => ids.has(a.id));
  return (
    <>
      <header>
        <h1 className="font-display text-[28px] font-bold">المحفوظات</h1>
        <p className="mt-1.5 text-[15px] text-muted">الإعلانات اللي حفظتها عشان ترجعلها.</p>
      </header>
      {saved.length ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-4">
          {saved.map((a) => <AdCard key={a.id} ad={a} />)}
        </div>
      ) : (
        <p className="rounded-2xl border border-line bg-white p-8 text-center text-muted">
          لسه ماحفظتش حاجة. افتح أي إعلان من <Link href="/search" className="font-semibold text-blue-700">البحث</Link> واضغط &quot;حفظ في المفضلة&quot;.
        </p>
      )}
    </>
  );
}
