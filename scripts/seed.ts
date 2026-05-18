import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { config } from "../src/config.js";
import { creatorPlatformMetrics, creators } from "../src/db/schema.js";

fs.mkdirSync(path.dirname(config.databaseUrl), { recursive: true });

const client = createClient({ url: pathToFileURL(path.resolve(config.databaseUrl)).href });
const db = drizzle(client);

await db.delete(creatorPlatformMetrics);
await db.delete(creators);

type SeedCreator = {
  id: string;
  name: string;
  niche: string;
  yearsActiveUgc: number;
  platforms: {
    platform: string;
    audienceSize: number;
    engagementRateApprox: number;
  }[];
};

const seeds: SeedCreator[] = [
  {
    id: "seed-valentina-wellness",
    name: "Valentina",
    niche: "Wellness & mental health",
    yearsActiveUgc: 4,
    platforms: [
      { platform: "instagram", audienceSize: 48_000, engagementRateApprox: 5.8 },
      { platform: "tiktok", audienceSize: 31_000, engagementRateApprox: 7.1 },
    ],
  },
  {
    id: "seed-paola-food",
    name: "Paola",
    niche: "Food & recipes",
    yearsActiveUgc: 2,
    platforms: [
      { platform: "instagram", audienceSize: 72_000, engagementRateApprox: 6.2 },
      { platform: "tiktok", audienceSize: 14_000, engagementRateApprox: 8.4 },
    ],
  },
  {
    id: "seed-mariana-finance",
    name: "Mariana",
    niche: "Personal finance & technology",
    yearsActiveUgc: 2,
    platforms: [
      { platform: "tiktok", audienceSize: 118_000, engagementRateApprox: 4.6 },
      { platform: "youtube", audienceSize: 42_000, engagementRateApprox: 3.4 },
    ],
  },
  {
    id: "seed-emilio-gaming",
    name: "Emilio",
    niche: "Gaming & technology",
    yearsActiveUgc: 4,
    platforms: [
      { platform: "youtube", audienceSize: 95_000, engagementRateApprox: 4.1 },
      { platform: "tiktok", audienceSize: 165_000, engagementRateApprox: 5.2 },
    ],
  },
  {
    id: "seed-lucia-food-junior",
    name: "Lucia",
    niche: "Home cooking",
    yearsActiveUgc: 0.6,
    platforms: [
      { platform: "instagram", audienceSize: 9_500, engagementRateApprox: 7.5 },
      { platform: "tiktok", audienceSize: 4_200, engagementRateApprox: 9.0 },
    ],
  },
  {
    id: "seed-carmen-food-senior",
    name: "Carmen",
    niche: "Food creator UGC",
    yearsActiveUgc: 5,
    platforms: [
      { platform: "instagram", audienceSize: 210_000, engagementRateApprox: 5.1 },
      { platform: "tiktok", audienceSize: 88_000, engagementRateApprox: 6.8 },
    ],
  },
];

for (const c of seeds) {
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

console.log("Seed complete:", seeds.length, "creators →", path.relative(process.cwd(), config.databaseUrl));
