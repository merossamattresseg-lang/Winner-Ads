import type { Metadata } from "next";
import { IBM_Plex_Sans_Arabic, Readex_Pro } from "next/font/google";
import "./globals.css";
import { MetaPixel, WhatsAppButton } from "@/components/Tracking";
import { SITE_URL } from "@/lib/site";

const plex = IBM_Plex_Sans_Arabic({
  variable: "--font-plex",
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700"],
});

const readex = Readex_Pro({
  variable: "--font-readex",
  subsets: ["arabic", "latin"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "WinnerAds | اكتشف المنتج الرابح قبل أن تنفق على الإعلان", template: "%s | WinnerAds" },
  description: "ابحث في إعلانات ميتا وتيك توك، واعرف مدة تشغيل الإعلان والمورد والسعر في مصر.",
  openGraph: { siteName: "WinnerAds", locale: "ar_EG", type: "website" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ar" dir="rtl">
      <body className={`${plex.variable} ${readex.variable} font-sans antialiased`}>
        {children}
        <WhatsAppButton />
        <MetaPixel />
      </body>
    </html>
  );
}
