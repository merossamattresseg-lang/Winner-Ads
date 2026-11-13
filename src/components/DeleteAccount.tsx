"use client";
import { useState } from "react";
import { deleteMyAccount } from "@/app/(app)/account/actions";

export function DeleteAccount() {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  if (!open) return <button type="button" onClick={() => setOpen(true)} className="self-start text-sm font-semibold text-[#912018]">حذف الحساب</button>;
  return (
    <form action={deleteMyAccount} className="flex flex-col gap-2 rounded-xl bg-[#FEE4E2] p-4 text-[#912018]">
      <b>حذف الحساب نهائي ولا يمكن التراجع عنه.</b>
      <label className="flex flex-col gap-1 text-sm">اكتب كلمة &quot;حذف&quot; للتأكيد<input name="confirm" value={text} onChange={(e) => setText(e.target.value)} className="h-10 rounded-lg border border-[#FDA29B] bg-white px-3 text-text" /></label>
      <div className="flex gap-2">
        <button disabled={text.trim() !== "حذف"} className="h-10 rounded-lg bg-[#B42318] px-4 font-bold text-white disabled:opacity-50">حذف الحساب</button>
        <button type="button" onClick={() => setOpen(false)} className="h-10 rounded-lg bg-white px-4 font-semibold text-text">إلغاء</button>
      </div>
    </form>
  );
}
