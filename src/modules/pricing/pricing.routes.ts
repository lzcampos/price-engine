import type { FastifyInstance } from "fastify";
import type { Db } from "../../db/index.js";
import { getPricingForCreator } from "./pricing.service.js";

function parseBool(q: unknown): boolean | undefined {
  if (q === undefined || q === "") return undefined;
  const s = String(q).toLowerCase();
  if (s === "1" || s === "true" || s === "yes") return true;
  if (s === "0" || s === "false" || s === "no") return false;
  return undefined;
}

export function registerPricingRoutes(app: FastifyInstance, db: Db) {
  app.get("/creators/:id/pricing", async (request, reply) => {
    const { id } = request.params as { id: string };
    const q = request.query as Record<string, unknown>;
    const result = await getPricingForCreator(db, id, {
      includeExtendedUsageRights: parseBool(q.includeExtendedUsageRights),
      exclusivityCampaign: parseBool(q.exclusivityCampaign),
      rushDelivery: parseBool(q.rushDelivery),
    });
    if (!result) {
      return reply.status(404).send({ error: "NOT_FOUND" });
    }
    return reply.send(result);
  });
}
