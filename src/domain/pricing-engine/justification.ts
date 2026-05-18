import type { NicheKey } from "../../shared/types.js";
import type { FactorBreakdown } from "./multipliers.js";

function nicheLabel(n: NicheKey): string {
  const labels: Record<NicheKey, string> = {
    lifestyle: "lifestyle",
    fitness: "fitness",
    cooking: "cooking",
    food: "food & recipes",
    wellness: "wellness",
    mental_health: "mental health",
    finance: "personal finance",
    tech: "technology",
    gaming: "gaming",
    beauty: "beauty",
    travel: "travel",
    other: "general content",
  };
  return labels[n] ?? "this niche";
}

export function buildJustification(
  niche: NicheKey,
  factors: FactorBreakdown
): string {
  const parts: string[] = [];

  if (factors.weightedEngagementPercent >= 8) {
    parts.push(
      `Very high engagement (~${factors.weightedEngagementPercent.toFixed(1)}%), which usually correlates with stronger campaign performance.`
    );
  } else if (factors.weightedEngagementPercent >= 5) {
    parts.push(
      `Above-average engagement (~${factors.weightedEngagementPercent.toFixed(1)}%).`
    );
  } else if (factors.weightedEngagementPercent < 3) {
    parts.push(
      `Moderate engagement (~${factors.weightedEngagementPercent.toFixed(1)}%); the lower end of the range reflects more conversion uncertainty.`
    );
  }

  if (factors.totalFollowers >= 100_000) {
    parts.push(
      `High reach (~${formatFollowers(factors.totalFollowers)} combined followers) with diminishing returns on price (log scale).`
    );
  } else if (factors.totalFollowers >= 10_000) {
    parts.push(
      `Solid audience (~${formatFollowers(factors.totalFollowers)} followers) as a value baseline.`
    );
  } else {
    parts.push(
      `Smaller combined audience (~${formatFollowers(factors.totalFollowers)} followers); weight shifts more to niche, format, and experience.`
    );
  }

  const nicheM = factors.nicheMultiplier;
  if (nicheM >= 1.35) {
    parts.push(
      `${nicheLabel(niche)} is a high-premium vertical: brands here often see higher CAC/LTV, which supports higher creator rates.`
    );
  } else if (nicheM >= 1.12) {
    parts.push(
      `${nicheLabel(niche)} carries a modest premium over generic lifestyle.`
    );
  }

  if (factors.experienceMultiplier >= 1.25) {
    parts.push(
      "Several years active in UGC: a capped bonus applies for reliability and execution speed."
    );
  }

  if (factors.platformDiversityMultiplier > 1.05) {
    parts.push(
      "Presence on multiple platforms: more options for the brand to reuse assets."
    );
  }

  if (factors.optionalMultiplier > 1.01) {
    parts.push(
      "Includes adjustments for extended usage rights, exclusivity, or rush delivery as requested."
    );
  }

  parts.push(
    "The min–max band covers variability in briefs, editing, rights, and negotiation."
  );

  return parts.join(" ");
}

function formatFollowers(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}k`;
  return String(Math.round(n));
}
