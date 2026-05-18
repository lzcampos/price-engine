/** Platforms we normalize for metrics and optional platform multiplier */
export const PLATFORMS = [
  "instagram",
  "tiktok",
  "youtube",
  "facebook",
  "other",
] as const;
export type Platform = (typeof PLATFORMS)[number];

export const DELIVERABLE_TYPES = [
  "feedPost",
  "reelShort",
  "storyPack",
  "ugcBrandOnly",
  "longVideo",
] as const;
export type DeliverableType = (typeof DELIVERABLE_TYPES)[number];

/** Recognized niches for multiplier lookup; unknown inputs map to `other` */
export const NICHE_KEYS = [
  "lifestyle",
  "fitness",
  "cooking",
  "food",
  "wellness",
  "mental_health",
  "finance",
  "tech",
  "gaming",
  "beauty",
  "travel",
  "other",
] as const;
export type NicheKey = (typeof NICHE_KEYS)[number];

export type CreatorPlatformMetric = {
  platform: Platform;
  audienceSize: number;
  engagementRateApprox: number;
};
