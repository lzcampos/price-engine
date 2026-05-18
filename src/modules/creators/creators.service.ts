import { eq } from "drizzle-orm";
import type { Db } from "../../db/index.js";
import { creatorPlatformMetrics, creators } from "../../db/schema.js";
import type { CreatorPlatformMetric } from "../../shared/types.js";
import { normalizeNicheKey } from "../../shared/niche.js";
import { normalizePlatform } from "../../shared/platform.js";
import type { CreateCreatorBody } from "./creators.schemas.js";

export type CreatorRecord = {
  id: string;
  name: string;
  niche: string;
  nicheKey: ReturnType<typeof normalizeNicheKey>;
  yearsActiveUgc: number;
  platforms: CreatorPlatformMetric[];
};

export async function createCreator(
  db: Db,
  body: CreateCreatorBody
): Promise<{ id: string }> {
  const id = crypto.randomUUID();
  await db.transaction(async (tx) => {
    await tx.insert(creators).values({
      id,
      name: body.name,
      niche: body.niche,
      yearsActiveUgc: body.yearsActiveUgc,
    });
    for (const row of body.platforms) {
      await tx.insert(creatorPlatformMetrics).values({
        id: crypto.randomUUID(),
        creatorId: id,
        platform: normalizePlatform(row.platform),
        audienceSize: row.audienceSize,
        engagementRateApprox: row.engagementRateApprox,
      });
    }
  });
  return { id };
}

export async function getCreatorById(
  db: Db,
  id: string
): Promise<CreatorRecord | null> {
  const rows = await db
    .select()
    .from(creators)
    .where(eq(creators.id, id))
    .limit(1);
  const c = rows[0];
  if (!c) return null;
  const metrics = await db
    .select()
    .from(creatorPlatformMetrics)
    .where(eq(creatorPlatformMetrics.creatorId, id));
  const platforms: CreatorPlatformMetric[] = metrics.map((m) => ({
    platform: m.platform as CreatorPlatformMetric["platform"],
    audienceSize: m.audienceSize,
    engagementRateApprox: m.engagementRateApprox,
  }));
  return {
    id: c.id,
    name: c.name,
    niche: c.niche,
    nicheKey: normalizeNicheKey(c.niche),
    yearsActiveUgc: c.yearsActiveUgc,
    platforms,
  };
}

export async function listCreators(db: Db): Promise<CreatorRecord[]> {
  const all = await db.select().from(creators);
  const out: CreatorRecord[] = [];
  for (const c of all) {
    const full = await getCreatorById(db, c.id);
    if (full) out.push(full);
  }
  return out;
}
