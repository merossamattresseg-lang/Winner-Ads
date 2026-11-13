"use client";
import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { META_PIXEL_ID, waLink, WHATSAPP_NUMBER } from "@/lib/site";

type Fbq = (...args: unknown[]) => void;

export function track(event: string, params?: Record<string, unknown>, eventId?: string) {
  const fbq = (window as unknown as { fbq?: Fbq }).fbq;
  if (fbq) fbq("track", event, params ?? {}, eventId ? { eventID: eventId } : undefined);
}

// بيكسل ميتا. بيشتغل بس لو NEXT_PUBLIC_META_PIXEL_ID موجود.
export function MetaPixel() {
  const path = usePathname();
  useEffect(() => {
    if (META_PIXEL_ID) track("PageView");
  }, [path]);
  if (!META_PIXEL_ID) return null;
  return (
    <Script id="meta-pixel" strategy="afterInteractive">
      {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${META_PIXEL_ID}');`}
    </Script>
  );
}

// زر واتساب ثابت في كل الصفحات.
export function WhatsAppButton() {
  const path = usePathname();
  if (!WHATSAPP_NUMBER || path.startsWith("/admin")) return null;
  return (
    <a href={waLink("مرحبًا، عندي استفسار عن WinnerAds")} target="_blank" rel="noreferrer" aria-label="تواصل عبر واتساب"
      className="fixed bottom-20 left-4 z-40 flex h-13 w-13 items-center justify-center rounded-full bg-[#25D366] shadow-lg md:bottom-6">
      <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden="true"><path fill="#FFFFFF" d="M12 2a10 10 0 00-8.6 15.1L2 22l5-1.3A10 10 0 1012 2zm5.3 14.2c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.3-.7-2.8-1.1-4.6-4-4.7-4.2-.1-.2-1.1-1.5-1.1-2.9s.7-2.1 1-2.4c.3-.3.6-.3.8-.3h.6c.2 0 .4 0 .6.5l.9 2.1c.1.2.1.4 0 .5l-.3.5-.4.4c-.1.1-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.1 1 2.1 1.3 2.4 1.5.3.1.5.1.6-.1l.9-1.1c.2-.3.4-.2.7-.1l2 1c.3.1.5.2.5.3.1.2.1.7-.1 1.1z" /></svg>
    </a>
  );
}

export function TrackOnMount({ event, eventId, params }: { event: string; eventId?: string; params?: Record<string, unknown> }) {
  useEffect(() => {
    track(event, params, eventId);
  }, [event, eventId, params]);
  return null;
}
