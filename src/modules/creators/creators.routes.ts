import type { FastifyInstance } from "fastify";
import type { Db } from "../../db/index.js";
import {
  createCreatorBodySchema,
  creatorResponseSchema,
  errorResponseSchema,
  idParamSchema,
} from "../../openapi/schemas.js";
import { createCreatorBodySchema as zodCreateSchema } from "./creators.schemas.js";
import { createCreator, getCreatorById } from "./creators.service.js";

export function registerCreatorsRoutes(app: FastifyInstance, db: Db) {
  app.post(
    "/creators",
    {
      schema: {
        tags: ["creators"],
        summary: "Register a creator profile",
        body: createCreatorBodySchema,
        response: {
          201: creatorResponseSchema,
          400: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const parsed = zodCreateSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.status(400).send({
          error: "VALIDATION_ERROR",
          details: parsed.error.flatten(),
        });
      }
      const created = await createCreator(db, parsed.data);
      return reply.status(201).send(created);
    }
  );

  app.get(
    "/creators/:id",
    {
      schema: {
        tags: ["creators"],
        summary: "Get creator by id",
        params: idParamSchema,
        response: {
          200: creatorResponseSchema,
          404: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const c = await getCreatorById(db, id);
      if (!c) {
        return reply.status(404).send({ error: "NOT_FOUND" });
      }
      return reply.send(c);
    }
  );
}
