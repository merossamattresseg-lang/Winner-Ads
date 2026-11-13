// اللينك والمفتاح العام (publishable) مش أسرار، ومعمولين عشان يتشافوا في المتصفح.
// الحماية الحقيقية من قواعد RLS في قاعدة البيانات. تقدر تغيرهم من Environment Variables.
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://ydgenbqjgisyeiodfwzy.supabase.co";
export const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "sb_publishable_x484IG8GJ8LiHug_wFtv6Q_tAvwJyzu";
