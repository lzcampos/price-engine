import type { PricingResult } from "../../domain/pricing-engine/pricing-engine.js";
import {
  totalAudience,
  weightedEngagementRate,
} from "../../domain/pricing-engine/multipliers.js";
import type { DeliverableType } from "../../shared/types.js";
import type { CreatorRecord } from "../creators/creators.service.js";
import type { ComparisonResponse, DeliverableComparison } from "./comparison.types.js";

function pctDelta(a: number, b: number): number | null {
  if (a === 0) return null;
  return Math.round(((b - a) / a) * 1000) / 10;
}

export function comparePricingResults(
  priceA: PricingResult,
  priceB: PricingResult,
  creatorA: CreatorRecord,
  creatorB: CreatorRecord,
  benchmark?: CreatorRecord | null
): ComparisonResponse {
  const deliverables = Object.keys(priceA) as DeliverableType[];
  const byDeliverable: DeliverableComparison[] = deliverables.map((d) => {
    const pa = priceA[d];
    const pb = priceB[d];
    const delta = pb.recommended - pa.recommended;
    return {
      deliverable: d,
      a: { min: pa.min, max: pa.max, recommended: pa.recommended },
      b: { min: pb.min, max: pb.max, recommended: pb.recommended },
      deltaRecommended: delta,
      pctDeltaRecommended: pctDelta(pa.recommended, pb.recommended),
    };
  });

  const audA = totalAudience(creatorA.platforms);
  const audB = totalAudience(creatorB.platforms);
  const engA = weightedEngagementRate(creatorA.platforms);
  const engB = weightedEngagementRate(creatorB.platforms);

  const summary: string[] = [];
  if (creatorA.nicheKey !== creatorB.nicheKey) {
    summary.push(
      `Different niches (${creatorA.nicheKey} vs ${creatorB.nicheKey}): market premiums often diverge by category CAC/LTV.`
    );
  }
  if (Math.abs(engA - engB) >= 1.5) {
    summary.push(
      `Different weighted engagement (~${engA.toFixed(1)}% vs ~${engB.toFixed(1)}%): affects the expected performance multiplier.`
    );
  }
  if (Math.abs(audA - audB) / Math.max(audA, audB, 1) >= 0.25) {
    summary.push(
      `Different combined reach (~${Math.round(audA)} vs ~${Math.round(audB)} followers): the model applies a logarithmic audience scale.`
    );
  }
  if (Math.abs(creatorA.yearsActiveUgc - creatorB.yearsActiveUgc) >= 0.75) {
    summary.push(
      `Different UGC tenure (${creatorA.yearsActiveUgc} vs ${creatorB.yearsActiveUgc} years): capped trajectory bonus.`
    );
  }
  if (summary.length === 0) {
    summary.push(
      "Profiles are fairly aligned on the main signals: price differences mostly come from deliverable weights (story vs long video)."
    );
  }

  const score = (c: CreatorRecord) =>
    c.yearsActiveUgc * Math.log10(1 + totalAudience(c.platforms));
  const lessIsA = score(creatorA) <= score(creatorB);
  const less = lessIsA ? creatorA : creatorB;

  const oriented: "a" | "b" | "neutral" =
    less.id === creatorA.id ? "a" : less.id === creatorB.id ? "b" : "neutral";

  let note: string;
  let benchmarkCreator: ComparisonResponse["potentialInsight"]["benchmarkCreator"];

  if (benchmark && benchmark.id !== creatorA.id && benchmark.id !== creatorB.id) {
    benchmarkCreator = {
      id: benchmark.id,
      name: benchmark.name,
      yearsActiveUgc: benchmark.yearsActiveUgc,
    };
    const lessAud = totalAudience(less.platforms);
    const benchAud = totalAudience(benchmark.platforms);
    const rawUplift =
      lessAud > 0
        ? Math.round(((benchAud - lessAud) / lessAud) * 100)
        : 100;
    const uplift = Math.min(Math.max(0, rawUplift), 250);
    const upliftNote =
      rawUplift > 250
        ? "substantially higher combined audience (several levels above)"
        : `~${uplift}% higher combined audience`;
    note =
      `For the creator lower on the trajectory curve (${less.name}), a same-niche benchmark is ${benchmark.name}: ${upliftNote} and ${Math.max(0, benchmark.yearsActiveUgc - less.yearsActiveUgc).toFixed(1)} additional years of UGC often correlate with higher rates for the same deliverables. ` +
      `This is indicative only (no live market data), but it helps visualize a plausible next step.`;
  } else {
    note =
      `Between ${creatorA.name} and ${creatorB.name} there is not yet a third seed profile in the same specialty for an automatic benchmark. ` +
      `Add more creators in that niche or extend the seed data to enable the “aspirational” comparison.`;
  }

  return {
    creatorA: { id: creatorA.id, name: creatorA.name },
    creatorB: { id: creatorB.id, name: creatorB.name },
    summary,
    byDeliverable,
    potentialInsight: {
      orientedToward: oriented,
      note,
      benchmarkCreator,
    },
  };
}

/** Picks a “next level” creator in the same niche, excluding given ids */
export function pickBenchmarkCreator(
  all: CreatorRecord[],
  less: CreatorRecord,
  exclude: Set<string>
): CreatorRecord | null {
  const candidates = all.filter(
    (c) =>
      c.nicheKey === less.nicheKey &&
      !exclude.has(c.id) &&
      c.id !== less.id &&
      (c.yearsActiveUgc >= less.yearsActiveUgc + 0.75 ||
        totalAudience(c.platforms) >= totalAudience(less.platforms) * 1.5)
  );
  if (candidates.length === 0) return null;
  const lessAud = totalAudience(less.platforms);
  const scored = candidates
    .map((c) => ({
      c,
      score:
        Math.abs(c.yearsActiveUgc - (less.yearsActiveUgc + 2)) +
        Math.abs(Math.log10(1 + totalAudience(c.platforms)) - Math.log10(1 + Math.max(lessAud * 2, 1))) * 0.5,
    }))
    .sort((x, y) => x.score - y.score);
  return scored[0]?.c ?? null;
}
