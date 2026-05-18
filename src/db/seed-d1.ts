import { SEED_CREATORS } from "../seed-data.js";
import type { D1Db } from "./d1.js";
import { creatorPlatformMetrics, creators } from "./schema.js";

export async function seedD1IfEmpty(db: D1Db): Promise<void> {
  const existing = await db.select({ id: creators.id }).from(creators).limit(1);
  if (existing.length > 0) return;

  for (const c of SEED_CREATORS) {
    await db.insert(creators).values({
      id: c.id,
      name: c.name,
      niche: c.niche,
      yearsActiveUgc: c.yearsActiveUgc,
    });
    if (c.platforms.length > 0) {
      await db.insert(creatorPlatformMetrics).values(
        c.platforms.map((p) => ({
          id: crypto.randomUUID(),
          creatorId: c.id,
          platform: p.platform,
          audienceSize: p.audienceSize,
          engagementRateApprox: p.engagementRateApprox,
        }))
      );
    }
  }
}
