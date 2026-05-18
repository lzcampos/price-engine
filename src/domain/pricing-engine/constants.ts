import type { DeliverableType } from "../../shared/types.js";

/** Base rates in EUR per deliverable type (heuristic starting point) */
export const BASE_RATES_EUR: Record<DeliverableType, number> = {
  storyPack: 40,
  feedPost: 80,
  reelShort: 120,
  ugcBrandOnly: 150,
  longVideo: 220,
};

export const RANGE_MIN_FACTOR = 0.85;
export const RANGE_MAX_FACTOR = 1.2;

export const AUDIENCE_LOG_COEFF = 0.35;
export const AUDIENCE_FLOOR_FOLLOWERS = 1000;
export const AUDIENCE_MULTIPLIER_CAP = 4.2;

export const EXPERIENCE_PER_YEAR = 0.08;
export const EXPERIENCE_CAP_BONUS = 0.4;

export const MULTI_PLATFORM_STEP = 0.04;
export const MULTI_PLATFORM_MAX_BONUS = 0.12;

export const OPTIONAL_USAGE_RIGHTS = 1.25;
export const OPTIONAL_EXCLUSIVITY = 1.45;
export const OPTIONAL_RUSH = 1.15;
