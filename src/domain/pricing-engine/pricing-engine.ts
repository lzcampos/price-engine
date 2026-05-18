import type {
  CreatorPlatformMetric,
  DeliverableType,
  NicheKey,
} from "../../shared/types.js";
import {
  BASE_RATES_EUR,
  OPTIONAL_EXCLUSIVITY,
  OPTIONAL_RUSH,
  OPTIONAL_USAGE_RIGHTS,
} from "./constants.js";
import { buildJustification } from "./justification.js";
import {
  computeFactorBreakdown,
  coreMultiplierFromFactors,
} from "./multipliers.js";
import { toRange, type PriceRange } from "./range.js";

export type PricingOptions = {
  includeExtendedUsageRights?: boolean;
  exclusivityCampaign?: boolean;
  rushDelivery?: boolean;
};

export type DeliverablePricing = PriceRange & {
  justification: string;
  factors: ReturnType<typeof computeFactorBreakdown>;
  baseRateEur: number;
};

export type PricingResult = Record<DeliverableType, DeliverablePricing>;

function optionalMultiplier(options?: PricingOptions): number {
  let m = 1;
  if (options?.includeExtendedUsageRights) m *= OPTIONAL_USAGE_RIGHTS;
  if (options?.exclusivityCampaign) m *= OPTIONAL_EXCLUSIVITY;
  if (options?.rushDelivery) m *= OPTIONAL_RUSH;
  return m;
}

export class PricingEngine {
  calculate(
    niche: NicheKey,
    yearsActiveUgc: number,
    platforms: CreatorPlatformMetric[],
    options?: PricingOptions
  ): PricingResult {
    const opt = optionalMultiplier(options);
    const factors = computeFactorBreakdown(
      niche,
      yearsActiveUgc,
      platforms,
      opt
    );
    const core = coreMultiplierFromFactors(factors);
    const justification = buildJustification(niche, factors);

    const keys = Object.keys(BASE_RATES_EUR) as DeliverableType[];
    const out = {} as PricingResult;
    for (const d of keys) {
      const base = BASE_RATES_EUR[d];
      const recommended = base * core;
      const range = toRange(recommended);
      out[d] = {
        ...range,
        justification,
        factors: { ...factors },
        baseRateEur: base,
      };
    }
    return out;
  }
}

export const pricingEngine = new PricingEngine();
