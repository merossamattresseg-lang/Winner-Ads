// معادلة الوينر. الأوزان والحدود هتتنقل لجدول إعدادات في قاعدة البيانات
// عشان تتعدل من لوحة الأدمن من غير كود.
export type Tier = "super" | "winner" | "testing";

export type ScoreSettings = {
  weights: { days: number; copies: number; engagement: number; advertisers: number; supplier: number };
  caps: { days: number; copies: number; advertisers: number };
  thresholds: { winner: number; super: number };
};

export const scoreSettings: ScoreSettings = {
  weights: { days: 35, copies: 25, engagement: 20, advertisers: 15, supplier: 5 },
  caps: { days: 60, copies: 10, advertisers: 5 },
  thresholds: { winner: 60, super: 80 },
};

export type ScoreInput = {
  days: number;
  copies: number;
  engagement: number; // من 0 لـ 1 مقارنة بباقي النتايج
  advertisers: number;
  hasSupplier: boolean;
};

export function winnerScore(i: ScoreInput, s: ScoreSettings = scoreSettings): number {
  const w = s.weights;
  const parts =
    w.days * Math.min(i.days / s.caps.days, 1) +
    w.copies * Math.min(i.copies / s.caps.copies, 1) +
    w.engagement * Math.min(Math.max(i.engagement, 0), 1) +
    w.advertisers * Math.min(i.advertisers / s.caps.advertisers, 1) +
    w.supplier * (i.hasSupplier ? 1 : 0);
  const total = w.days + w.copies + w.engagement + w.advertisers + w.supplier;
  return Math.round((parts / total) * 100);
}

export function tierOf(score: number, s: ScoreSettings = scoreSettings): Tier {
  if (score >= s.thresholds.super) return "super";
  if (score >= s.thresholds.winner) return "winner";
  return "testing";
}
