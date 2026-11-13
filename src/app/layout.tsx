import type { Metadata } from "next";
import { IBM_Plex_Sans_Arabic, Readex_Pro } from "next/font/google";
import "./globals.css";

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
  title: "WinnerAds | اعرف الوينر قبل ما تصرف عليه",
  description: "دوّر على المنتجات والإعلانات الوينر في مصر، واعرف مين بيبيعها وبكام.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ar" dir="rtl">
      <body className={`${plex.variable} ${readex.variable} font-sans antialiased`}>{children}</body>
    </html>
  );
}
