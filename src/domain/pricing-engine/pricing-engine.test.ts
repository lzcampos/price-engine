import { describe, expect, it } from "vitest";
import { pricingEngine } from "./pricing-engine.js";

describe("PricingEngine", () => {
  it("returns all deliverables with range", () => {
    const r = pricingEngine.calculate(
      "food",
      2,
      [
        {
          platform: "instagram",
          audienceSize: 25_000,
          engagementRateApprox: 6,
        },
      ]
    );
    expect(r.feedPost.min).toBeLessThanOrEqual(r.feedPost.recommended);
    expect(r.feedPost.recommended).toBeLessThanOrEqual(r.feedPost.max);
    expect(r.longVideo.recommended).toBeGreaterThanOrEqual(r.storyPack.recommended);
    expect(r.feedPost.justification.length).toBeGreaterThan(20);
  });

  it("applies optional multipliers", () => {
    const base = pricingEngine.calculate("lifestyle", 1, [
      {
        platform: "tiktok",
        audienceSize: 10_000,
        engagementRateApprox: 4,
      },
    ]);
    const boosted = pricingEngine.calculate("lifestyle", 1, [
      {
        platform: "tiktok",
        audienceSize: 10_000,
        engagementRateApprox: 4,
      },
    ], {
      exclusivityCampaign: true,
      includeExtendedUsageRights: true,
    });
    expect(boosted.feedPost.recommended).toBeGreaterThan(base.feedPost.recommended);
  });
});
