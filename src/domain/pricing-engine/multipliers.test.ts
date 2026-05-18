import { describe, expect, it } from "vitest";
import {
  audienceMultiplier,
  engagementMultiplier,
  experienceMultiplier,
  nicheMultiplier,
  totalAudience,
  weightedEngagementRate,
} from "./multipliers.js";

describe("multipliers", () => {
  it("totalAudience sums platforms", () => {
    expect(
      totalAudience([
        { platform: "instagram", audienceSize: 1000, engagementRateApprox: 5 },
        { platform: "tiktok", audienceSize: 4000, engagementRateApprox: 6 },
      ])
    ).toBe(5000);
  });

  it("weightedEngagementRate weights by audience", () => {
    const w = weightedEngagementRate([
      { platform: "instagram", audienceSize: 9000, engagementRateApprox: 2 },
      { platform: "tiktok", audienceSize: 1000, engagementRateApprox: 10 },
    ]);
    expect(w).toBeCloseTo(2.8, 5);
  });

  it("audienceMultiplier grows sublinearly", () => {
    const a1 = audienceMultiplier(5000);
    const a2 = audienceMultiplier(500_000);
    expect(a2).toBeGreaterThan(a1);
    expect(a2 / a1).toBeLessThan(50);
  });

  it("engagementMultiplier tiers", () => {
    expect(engagementMultiplier(9)).toBe(1.3);
    expect(engagementMultiplier(6)).toBe(1.15);
    expect(engagementMultiplier(4)).toBe(1.0);
    expect(engagementMultiplier(1)).toBe(0.88);
  });

  it("finance niche premium", () => {
    expect(nicheMultiplier("finance")).toBeGreaterThan(nicheMultiplier("lifestyle"));
  });

  it("experience caps", () => {
    expect(experienceMultiplier(0)).toBe(1);
    expect(experienceMultiplier(10)).toBeCloseTo(1.4, 5);
  });
});
