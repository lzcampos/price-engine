import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { config } from "../src/config.js";
import { creatorPlatformMetrics, creators } from "../src/db/schema.js";
import { SEED_CREATORS } from "../src/seed-data.js";

fs.mkdirSync(path.dirname(config.databaseUrl), { recursive: true });

const client = createClient({ url: pathToFileURL(path.resolve(config.databaseUrl)).href });
const db = drizzle(client);

await db.delete(creatorPlatformMetrics);
await db.delete(creators);

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

console.log("Seed complete:", SEED_CREATORS.length, "creators →", path.relative(process.cwd(), config.databaseUrl));
