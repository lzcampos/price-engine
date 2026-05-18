import fs from "node:fs";
import path from "node:path";
import { migrate } from "drizzle-orm/libsql/migrator";
import { SEED_CREATORS } from "../seed-data.js";
import type { Db } from "./index.js";
import { creatorPlatformMetrics, creators } from "./schema.js";

/**
 * Applies SQL migrations and inserts demo data when the DB is empty.
 * Required on Vercel: the filesystem is read-only except `/tmp`, so each
 * fresh instance gets a writable DB path (see `config.databaseUrl`) and
 * must bootstrap schema + seed on first use.
 */
export async function ensureDatabaseReady(db: Db): Promise<void> {
  const migrationsFolder = path.join(process.cwd(), "drizzle");
  if (fs.existsSync(migrationsFolder)) {
    await migrate(db, { migrationsFolder });
  }

  const existing = await db.select().from(creators).limit(1);
  if (existing.length > 0) {
    return;
  }

  for (const c of SEED_CREATORS) {
    await db.insert(creators).values({
      id: c.id,
      name: c.name,
      niche: c.niche,
      yearsActiveUgc: c.yearsActiveUgc,
    });
    for (const p of c.platforms) {
      await db.insert(creatorPlatformMetrics).values({
        id: crypto.randomUUID(),
        creatorId: c.id,
        platform: p.platform,
        audienceSize: p.audienceSize,
        engagementRateApprox: p.engagementRateApprox,
      });
    }
  }
}
