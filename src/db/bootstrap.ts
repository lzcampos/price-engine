import fs from "node:fs";
import path from "node:path";
import { migrate } from "drizzle-orm/libsql/migrator";
import { SEED_CREATORS } from "../seed-data.js";
import { config } from "../config.js";
import { isRemoteLibsqlUrl } from "./client.js";
import type { Db } from "./client.js";
import { creatorPlatformMetrics, creators } from "./schema.js";

function readyMarkerPath(): string {
  return `${config.databaseUrl}.ready`;
}

function isBootstrapped(): boolean {
  if (isRemoteLibsqlUrl(config.databaseUrl)) {
    return false;
  }
  return fs.existsSync(readyMarkerPath());
}

function markBootstrapped(): void {
  if (!isRemoteLibsqlUrl(config.databaseUrl)) {
    fs.writeFileSync(readyMarkerPath(), "1");
  }
}

async function seedIfEmpty(db: Db): Promise<void> {
  const existing = await db.select({ id: creators.id }).from(creators).limit(1);
  if (existing.length > 0) return;

  await db.transaction(async (tx) => {
    for (const c of SEED_CREATORS) {
      await tx.insert(creators).values({
        id: c.id,
        name: c.name,
        niche: c.niche,
        yearsActiveUgc: c.yearsActiveUgc,
      });
      if (c.platforms.length > 0) {
        await tx.insert(creatorPlatformMetrics).values(
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
  });
}

/**
 * Runs once per warm serverless isolate when using local SQLite (/tmp on Vercel).
 * Skips migration + seed checks when the ready marker exists.
 */
export async function ensureDatabaseReady(db: Db): Promise<void> {
  if (isBootstrapped()) {
    return;
  }

  const migrationsFolder = path.join(process.cwd(), "drizzle");
  if (fs.existsSync(migrationsFolder)) {
    await migrate(db, { migrationsFolder });
  }

  await seedIfEmpty(db);
  markBootstrapped();
}
