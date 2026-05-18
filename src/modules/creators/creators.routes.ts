import type { FastifyInstance } from "fastify";
import type { Db } from "../../db/index.js";
import { AppError } from "../../shared/errors.js";
import { createCreatorBodySchema } from "./creators.schemas.js";
import { createCreator, getCreatorById } from "./creators.service.js";

export function registerCreatorsRoutes(app: FastifyInstance, db: Db) {
  app.post("/creators", async (request, reply) => {
    const parsed = createCreatorBodySchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({
        error: "VALIDATION_ERROR",
        details: parsed.error.flatten(),
      });
    }
    const { id } = await createCreator(db, parsed.data);
    const created = await getCreatorById(db, id);
    if (!created) {
      throw new AppError("Creator not found after insert", 500);
    }
    return reply.status(201).send({
      id: created.id,
      name: created.name,
      niche: created.niche,
      nicheKey: created.nicheKey,
      yearsActiveUgc: created.yearsActiveUgc,
      platforms: created.platforms,
    });
  });

  app.get("/creators/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const c = await getCreatorById(db, id);
    if (!c) {
      return reply.status(404).send({ error: "NOT_FOUND" });
    }
    return reply.send({
      id: c.id,
      name: c.name,
      niche: c.niche,
      nicheKey: c.nicheKey,
      yearsActiveUgc: c.yearsActiveUgc,
      platforms: c.platforms,
    });
  });
}
