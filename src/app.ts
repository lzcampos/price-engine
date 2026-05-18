import Fastify from "fastify";
import cors from "@fastify/cors";
import type { Db } from "./db/index.js";
import { isAppError } from "./shared/errors.js";
import { registerComparisonRoutes } from "./modules/comparison/comparison.routes.js";
import { registerCreatorsRoutes } from "./modules/creators/creators.routes.js";
import { registerPricingRoutes } from "./modules/pricing/pricing.routes.js";

export async function buildApp(db: Db) {
  const app = Fastify({ logger: true });

  await app.register(cors, { origin: true });

  app.get("/", async () => ({
    service: "price-engine",
    ok: true,
    docs: "See README for API routes.",
    try: [
      "GET /health",
      "GET /creators/:id",
      "GET /creators/:id/pricing",
      "GET /comparison?a=:id&b=:id",
    ],
  }));

  app.get("/health", async () => ({ ok: true }));

  registerCreatorsRoutes(app, db);
  registerPricingRoutes(app, db);
  registerComparisonRoutes(app, db);

  app.setErrorHandler((err, _request, reply) => {
    if (isAppError(err)) {
      return reply.status(err.statusCode).send({
        error: err.code ?? "APP_ERROR",
        message: err.message,
      });
    }
    app.log.error(err);
    return reply.status(500).send({ error: "INTERNAL", message: "Unexpected error" });
  });

  return app;
}
