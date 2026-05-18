import { Hono } from "hono";
import { cors } from "hono/cors";
import { createD1Db } from "../db/d1.js";
import { seedD1IfEmpty } from "../db/seed-d1.js";
import { pricingEngine } from "../domain/pricing-engine/pricing-engine.js";
import { totalAudience } from "../domain/pricing-engine/multipliers.js";
import { createCreatorBodySchema } from "../modules/creators/creators.schemas.js";
import {
  createCreator,
  getCreatorById,
  listCreators,
} from "../modules/creators/creators.service.js";
import { getPricingForCreator } from "../modules/pricing/pricing.service.js";
import {
  comparePricingResults,
  pickBenchmarkCreator,
} from "../modules/comparison/comparison.service.js";
import { isAppError } from "../shared/errors.js";
import type { Db } from "../db/index.js";

export type Env = {
  DB: D1Database;
};

const app = new Hono<{ Bindings: Env }>();

app.use("*", cors());

let seeded = false;

async function dbFromEnv(env: Env): Promise<Db> {
  const db = createD1Db(env.DB) as unknown as Db;
  if (!seeded) {
    await seedD1IfEmpty(createD1Db(env.DB));
    seeded = true;
  }
  return db;
}

app.get("/", (c) =>
  c.json({
    service: "price-engine",
    runtime: "cloudflare-worker",
    ok: true,
    docs: "Same routes as local API — use /health, /creators, /creators/:id/pricing, /comparison?a=&b=",
  })
);

app.get("/health", (c) => c.json({ ok: true }));

app.post("/creators", async (c) => {
  try {
    const body = createCreatorBodySchema.safeParse(await c.req.json());
    if (!body.success) {
      return c.json(
        { error: "VALIDATION_ERROR", details: body.error.flatten() },
        400
      );
    }
    const db = await dbFromEnv(c.env);
    const created = await createCreator(db, body.data);
    return c.json(created, 201);
  } catch (e) {
    return handleError(c, e);
  }
});

app.get("/creators/:id", async (c) => {
  try {
    const db = await dbFromEnv(c.env);
    const row = await getCreatorById(db, c.req.param("id"));
    if (!row) return c.json({ error: "NOT_FOUND" }, 404);
    return c.json(row);
  } catch (e) {
    return handleError(c, e);
  }
});

app.get("/creators/:id/pricing", async (c) => {
  try {
    const db = await dbFromEnv(c.env);
    const q = c.req.query();
    const result = await getPricingForCreator(db, c.req.param("id"), {
      includeExtendedUsageRights: parseBool(q.includeExtendedUsageRights),
      exclusivityCampaign: parseBool(q.exclusivityCampaign),
      rushDelivery: parseBool(q.rushDelivery),
    });
    if (!result) return c.json({ error: "NOT_FOUND" }, 404);
    return c.json(result);
  } catch (e) {
    return handleError(c, e);
  }
});

app.get("/comparison", async (c) => {
  try {
    const a = c.req.query("a");
    const b = c.req.query("b");
    if (!a || !b) {
      return c.json({ error: "VALIDATION_ERROR", message: "Query a and b required" }, 400);
    }
    if (a === b) return c.json({ error: "SAME_ID" }, 400);

    const db = await dbFromEnv(c.env);
    const [ca, cb] = await Promise.all([
      getCreatorById(db, a),
      getCreatorById(db, b),
    ]);
    if (!ca || !cb) return c.json({ error: "NOT_FOUND" }, 404);

    const priceA = pricingEngine.calculate(
      ca.nicheKey,
      ca.yearsActiveUgc,
      ca.platforms
    );
    const priceB = pricingEngine.calculate(
      cb.nicheKey,
      cb.yearsActiveUgc,
      cb.platforms
    );

    const score = (x: typeof ca) =>
      x.yearsActiveUgc * Math.log10(1 + totalAudience(x.platforms));
    const less = score(ca) <= score(cb) ? ca : cb;
    const all = (await listCreators(db)).filter(
      (x) => x.nicheKey === less.nicheKey
    );
    const bench = pickBenchmarkCreator(all, less, new Set([ca.id, cb.id]));

    return c.json(comparePricingResults(priceA, priceB, ca, cb, bench));
  } catch (e) {
    return handleError(c, e);
  }
});

function parseBool(raw: string | undefined): boolean | undefined {
  if (raw === undefined || raw === "") return undefined;
  const s = raw.toLowerCase();
  if (s === "1" || s === "true" || s === "yes") return true;
  if (s === "0" || s === "false" || s === "no") return false;
  return undefined;
}

function handleError(
  c: { json: (body: unknown, status?: number) => Response },
  e: unknown
) {
  if (isAppError(e)) {
    return c.json(
      { error: e.code ?? "APP_ERROR", message: e.message },
      e.statusCode
    );
  }
  console.error(e);
  return c.json({ error: "INTERNAL", message: "Unexpected error" }, 500);
}

export default app;
