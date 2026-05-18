import type { CreatorPlatformMetric, NicheKey } from "../../shared/types.js";
import {
  AUDIENCE_FLOOR_FOLLOWERS,
  AUDIENCE_LOG_COEFF,
  AUDIENCE_MULTIPLIER_CAP,
  EXPERIENCE_CAP_BONUS,
  EXPERIENCE_PER_YEAR,
  MULTI_PLATFORM_MAX_BONUS,
  MULTI_PLATFORM_STEP,
} from "./constants.js";

export function totalAudience(platforms: CreatorPlatformMetric[]): number {
  return platforms.reduce((sum, p) => sum + Math.max(0, p.audienceSize), 0);
}

/** Audience-weighted mean engagement across platforms */
export function weightedEngagementRate(
  platforms: CreatorPlatformMetric[]
): number {
  const total = totalAudience(platforms);
  if (total <= 0) {
    const rates = platforms.map((p) => p.engagementRateApprox);
    if (rates.length === 0) return 3;
    return rates.reduce((a, b) => a + b, 0) / rates.length;
  }
  return platforms.reduce((sum, p) => {
    const w = Math.max(0, p.audienceSize) / total;
    return sum + w * p.engagementRateApprox;
  }, 0);
}

/**
 * Log scale: reach is not linear in follower count.
 * Floor at 1k to avoid extreme negative logs.
 */
export function audienceMultiplier(totalFollowers: number): number {
  const f = Math.max(totalFollowers, AUDIENCE_FLOOR_FOLLOWERS);
  const raw = 1 + Math.log10(f / AUDIENCE_FLOOR_FOLLOWERS) * AUDIENCE_LOG_COEFF;
  return Math.min(raw, AUDIENCE_MULTIPLIER_CAP);
}

export function engagementMultiplier(engagementPercent: number): number {
  if (engagementPercent >= 8) return 1.3;
  if (engagementPercent >= 5) return 1.15;
  if (engagementPercent >= 3) return 1.0;
  return 0.88;
}

export function nicheMultiplier(niche: NicheKey): number {
  const table: Record<NicheKey, number> = {
    lifestyle: 1.0,
    fitness: 1.12,
    cooking: 1.1,
    food: 1.12,
    wellness: 1.28,
    mental_health: 1.32,
    finance: 1.48,
    tech: 1.18,
    gaming: 1.15,
    beauty: 1.08,
    travel: 1.05,
    other: 1.0,
  };
  return table[niche] ?? 1.0;
}

export function experienceMultiplier(yearsActiveUgc: number): number {
  const bonus = Math.min(
    Math.max(0, yearsActiveUgc) * EXPERIENCE_PER_YEAR,
    EXPERIENCE_CAP_BONUS
  );
  return 1 + bonus;
}

/** Small bump for multi-platform presence (more surfaces for brand reuse) */
export function platformDiversityMultiplier(
  platforms: CreatorPlatformMetric[]
): number {
  const n = new Set(platforms.map((p) => p.platform)).size;
  const bonus = Math.min(
    Math.max(0, n - 1) * MULTI_PLATFORM_STEP,
    MULTI_PLATFORM_MAX_BONUS
  );
  return 1 + bonus;
}

export type FactorBreakdown = {
  audienceMultiplier: number;
  engagementMultiplier: number;
  nicheMultiplier: number;
  experienceMultiplier: number;
  platformDiversityMultiplier: number;
  optionalMultiplier: number;
  totalFollowers: number;
  weightedEngagementPercent: number;
};

export function computeFactorBreakdown(
  niche: NicheKey,
  yearsActiveUgc: number,
  platforms: CreatorPlatformMetric[],
  optionalMultiplier: number
): FactorBreakdown {
  const totalFollowers = totalAudience(platforms);
  const weightedEngagementPercent = weightedEngagementRate(platforms);
  return {
    audienceMultiplier: audienceMultiplier(totalFollowers),
    engagementMultiplier: engagementMultiplier(weightedEngagementPercent),
    nicheMultiplier: nicheMultiplier(niche),
    experienceMultiplier: experienceMultiplier(yearsActiveUgc),
    platformDiversityMultiplier: platformDiversityMultiplier(platforms),
    optionalMultiplier,
    totalFollowers,
    weightedEngagementPercent,
  };
}

export function coreMultiplierFromFactors(f: FactorBreakdown): number {
  return (
    f.audienceMultiplier *
    f.engagementMultiplier *
    f.nicheMultiplier *
    f.experienceMultiplier *
    f.platformDiversityMultiplier *
    f.optionalMultiplier
  );
}
