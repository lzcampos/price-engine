import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import type { FastifyInstance } from "fastify";

export async function registerSwagger(app: FastifyInstance) {
  await app.register(swagger, {
    openapi: {
      openapi: "3.1.0",
      info: {
        title: "Price Engine API",
        description:
          "Creator rate recommendations for UGC deliverables (take-home).",
        version: "1.0.0",
      },
      tags: [
        { name: "health", description: "Liveness" },
        { name: "creators", description: "Creator profiles" },
        { name: "pricing", description: "Recommended rates" },
        { name: "comparison", description: "Compare two profiles" },
      ],
    },
  });

  await app.register(swaggerUi, {
    routePrefix: "/docs",
    uiConfig: {
      docExpansion: "list",
      deepLinking: true,
    },
    staticCSP: true,
  });
}
