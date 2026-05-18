import Fastify from "fastify";
import cors from "@fastify/cors";
import type { Db } from "./db/index.js";
import { isAppError } from "./shared/errors.js";
import { registerComparisonRoutes } from "./modules/comparison/comparison.routes.js";
import { registerCreatorsRoutes } from "./modules/creators/creators.routes.js";
import { registerPricingRoutes } from "./modules/pricing/pricing.routes.js";
import { registerSwagger } from "./plugins/swagger.js";

const isVercel = process.env.VERCEL === "1";

export async function buildApp(db: Db) {
  const app = Fastify({
    logger: isVercel ? false : { level: "info" },
  });

  await app.register(cors, { origin: true });
  await registerSwagger(app);

  app.get(
    "/",
    {
      schema: {
        tags: ["health"],
        summary: "API index",
        response: {
          200: {
            type: "object",
            properties: {
              service: { type: "string" },
              ok: { type: "boolean" },
              docs: { type: "string" },
              swagger: { type: "string" },
            },
          },
        },
      },
    },
    async () => ({
      service: "price-engine",
      ok: true,
      docs: "OpenAPI UI at /docs",
      swagger: "/docs",
    })
  );

  app.get(
    "/health",
    {
      schema: {
        tags: ["health"],
        summary: "Health check",
        response: { 200: { type: "object", properties: { ok: { type: "boolean" } } } },
      },
    },
    async () => ({ ok: true })
  );

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
    if (!isVercel) app.log.error(err);
    return reply.status(500).send({ error: "INTERNAL", message: "Unexpected error" });
  });

  await app.ready();
  return app;
}
