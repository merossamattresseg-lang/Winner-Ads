import { ImageResponse } from "next/og";

export const alt = "WinnerAds";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// صورة المشاركة على السوشيال (بالإنجليزي لأن الخط العربي غير مضمن في المولد).
export default function OG() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", background: "#0B1324", display: "flex", flexDirection: "column", justifyContent: "center", padding: 80, gap: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <svg width="96" height="96" viewBox="0 0 48 48"><rect width="48" height="48" rx="13" fill="#1B2740" /><polyline points="9,17 16,34 24,22 31,32 39,13" fill="none" stroke="#C8F03C" strokeWidth="4.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          <div style={{ display: "flex", fontSize: 72, fontWeight: 800, color: "#FFFFFF" }}>Winner<span style={{ color: "#C8F03C" }}>Ads</span></div>
        </div>
        <div style={{ fontSize: 44, color: "#D0D5DD", display: "flex" }}>Find winning products in Egypt before you spend on ads.</div>
      </div>
    ),
    size,
  );
}
