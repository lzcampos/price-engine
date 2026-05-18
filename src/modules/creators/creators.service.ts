import { eq, inArray } from "drizzle-orm";
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

type CreatorRow = typeof creators.$inferSelect;
type MetricRow = typeof creatorPlatformMetrics.$inferSelect;

function toCreatorRecord(
  row: CreatorRow,
  metrics: MetricRow[]
): CreatorRecord {
  return {
    id: row.id,
    name: row.name,
    niche: row.niche,
    nicheKey: normalizeNicheKey(row.niche),
    yearsActiveUgc: row.yearsActiveUgc,
    platforms: metrics.map((m) => ({
      platform: m.platform as CreatorPlatformMetric["platform"],
      audienceSize: m.audienceSize,
      engagementRateApprox: m.engagementRateApprox,
    })),
  };
}

function groupMetricsByCreator(
  metrics: MetricRow[]
): Map<string, MetricRow[]> {
  const map = new Map<string, MetricRow[]>();
  for (const m of metrics) {
    const list = map.get(m.creatorId);
    if (list) list.push(m);
    else map.set(m.creatorId, [m]);
  }
  return map;
}

export async function createCreator(
  db: Db,
  body: CreateCreatorBody
): Promise<CreatorRecord> {
  const id = crypto.randomUUID();
  const platforms = body.platforms.map((row) => ({
    platform: normalizePlatform(row.platform),
    audienceSize: row.audienceSize,
    engagementRateApprox: row.engagementRateApprox,
  }));

  await db.transaction(async (tx) => {
    await tx.insert(creators).values({
      id,
      name: body.name,
      niche: body.niche,
      yearsActiveUgc: body.yearsActiveUgc,
    });
    if (platforms.length > 0) {
      await tx.insert(creatorPlatformMetrics).values(
        platforms.map((p) => ({
          id: crypto.randomUUID(),
          creatorId: id,
          platform: p.platform,
          audienceSize: p.audienceSize,
          engagementRateApprox: p.engagementRateApprox,
        }))
      );
    }
  });

  return {
    id,
    name: body.name,
    niche: body.niche,
    nicheKey: normalizeNicheKey(body.niche),
    yearsActiveUgc: body.yearsActiveUgc,
    platforms,
  };
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

  return toCreatorRecord(c, metrics);
}

/** Two queries total (no N+1). Used for comparison benchmarks. */
export async function listCreators(db: Db): Promise<CreatorRecord[]> {
  const rows = await db.select().from(creators);
  if (rows.length === 0) return [];

  const ids = rows.map((r) => r.id);
  const metrics = await db
    .select()
    .from(creatorPlatformMetrics)
    .where(inArray(creatorPlatformMetrics.creatorId, ids));

  const byCreator = groupMetricsByCreator(metrics);
  return rows.map((r) => toCreatorRecord(r, byCreator.get(r.id) ?? []));
}
