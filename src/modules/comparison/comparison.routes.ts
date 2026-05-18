import { z } from "zod";
import type { FastifyInstance } from "fastify";
import type { Db } from "../../db/index.js";
import { pricingEngine } from "../../domain/pricing-engine/pricing-engine.js";
import { totalAudience } from "../../domain/pricing-engine/multipliers.js";
import { getCreatorById, listCreators } from "../creators/creators.service.js";
import {
  comparePricingResults,
  pickBenchmarkCreator,
} from "./comparison.service.js";

const querySchema = z.object({
  a: z.string().min(1),
  b: z.string().min(1),
});

export function registerComparisonRoutes(app: FastifyInstance, db: Db) {
  app.get("/comparison", async (request, reply) => {
    const parsed = querySchema.safeParse(request.query);
    if (!parsed.success) {
      return reply.status(400).send({
        error: "VALIDATION_ERROR",
        details: parsed.error.flatten(),
      });
    }
    const { a, b } = parsed.data;
    if (a === b) {
      return reply.status(400).send({ error: "SAME_ID" });
    }

    const [ca, cb] = await Promise.all([
      getCreatorById(db, a),
      getCreatorById(db, b),
    ]);
    if (!ca || !cb) {
      return reply.status(404).send({ error: "NOT_FOUND" });
    }

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

    const all = await listCreators(db);
    const score = (c: (typeof all)[number]) =>
      c.yearsActiveUgc * Math.log10(1 + totalAudience(c.platforms));
    const less = score(ca) <= score(cb) ? ca : cb;
    const bench = pickBenchmarkCreator(all, less, new Set([ca.id, cb.id]));

    const body = comparePricingResults(priceA, priceB, ca, cb, bench);
    return reply.send(body);
  });
}
