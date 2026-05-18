import type { Db } from "../../db/index.js";
import type { PricingOptions } from "../../domain/pricing-engine/pricing-engine.js";
import { pricingEngine } from "../../domain/pricing-engine/pricing-engine.js";
import { getCreatorById } from "../creators/creators.service.js";

export async function getPricingForCreator(
  db: Db,
  creatorId: string,
  options?: PricingOptions
) {
  const creator = await getCreatorById(db, creatorId);
  if (!creator) return null;
  const breakdown = pricingEngine.calculate(
    creator.nicheKey,
    creator.yearsActiveUgc,
    creator.platforms,
    options
  );
  return {
    creator: {
      id: creator.id,
      name: creator.name,
      niche: creator.niche,
      nicheKey: creator.nicheKey,
      yearsActiveUgc: creator.yearsActiveUgc,
      platforms: creator.platforms,
    },
    currency: "EUR",
    deliverables: breakdown,
  };
}
