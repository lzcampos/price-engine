import {
  comparisonQuerySchema,
  createCreatorBodySchema,
  creatorResponseSchema,
  errorResponseSchema,
  healthResponseSchema,
  idParamSchema,
  pricingQuerySchema,
} from "./schemas.js";

export function buildOpenApiDocument(serverUrl: string) {
  return {
    openapi: "3.1.0",
    info: {
      title: "Price Engine API",
      description:
        "UGC creator rate recommendations. Demo seed ids: seed-paola-food, seed-lucia-food-junior, seed-valentina-wellness.",
      version: "1.0.0",
    },
    servers: [{ url: serverUrl }],
    tags: [
      { name: "health" },
      { name: "creators" },
      { name: "pricing" },
      { name: "comparison" },
    ],
    paths: {
      "/health": {
        get: {
          tags: ["health"],
          summary: "Health check",
          responses: {
            "200": {
              description: "OK",
              content: {
                "application/json": {
                  schema: healthResponseSchema,
                },
              },
            },
          },
        },
      },
      "/creators": {
        post: {
          tags: ["creators"],
          summary: "Register a creator profile",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: createCreatorBodySchema,
              },
            },
          },
          responses: {
            "201": {
              description: "Created",
              content: {
                "application/json": { schema: creatorResponseSchema },
              },
            },
            "400": {
              description: "Validation error",
              content: {
                "application/json": { schema: errorResponseSchema },
              },
            },
          },
        },
      },
      "/creators/{id}": {
        get: {
          tags: ["creators"],
          summary: "Get creator by id",
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
              example: "seed-paola-food",
            },
          ],
          responses: {
            "200": {
              description: "Creator",
              content: {
                "application/json": { schema: creatorResponseSchema },
              },
            },
            "404": {
              description: "Not found",
              content: {
                "application/json": { schema: errorResponseSchema },
              },
            },
          },
        },
      },
      "/creators/{id}/pricing": {
        get: {
          tags: ["pricing"],
          summary: "Recommended rates for a creator",
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
              example: "seed-paola-food",
            },
            {
              name: "includeExtendedUsageRights",
              in: "query",
              schema: { type: "string", enum: ["0", "1", "true", "false"] },
            },
            {
              name: "exclusivityCampaign",
              in: "query",
              schema: { type: "string", enum: ["0", "1", "true", "false"] },
            },
            {
              name: "rushDelivery",
              in: "query",
              schema: { type: "string", enum: ["0", "1", "true", "false"] },
            },
          ],
          responses: {
            "200": {
              description: "Pricing breakdown",
              content: {
                "application/json": {
                  schema: { type: "object", additionalProperties: true },
                },
              },
            },
            "404": {
              description: "Not found",
              content: {
                "application/json": { schema: errorResponseSchema },
              },
            },
          },
        },
      },
      "/comparison": {
        get: {
          tags: ["comparison"],
          summary: "Compare two creator profiles",
          parameters: [
            {
              name: "a",
              in: "query",
              required: true,
              schema: { type: "string" },
              example: "seed-lucia-food-junior",
            },
            {
              name: "b",
              in: "query",
              required: true,
              schema: { type: "string" },
              example: "seed-paola-food",
            },
          ],
          responses: {
            "200": {
              description: "Comparison result",
              content: {
                "application/json": {
                  schema: { type: "object", additionalProperties: true },
                },
              },
            },
            "400": {
              description: "Bad request",
              content: {
                "application/json": { schema: errorResponseSchema },
              },
            },
            "404": {
              description: "Not found",
              content: {
                "application/json": { schema: errorResponseSchema },
              },
            },
          },
        },
      },
    },
    components: {
      schemas: {
        HealthResponse: healthResponseSchema,
        CreateCreatorBody: createCreatorBodySchema,
        CreatorResponse: creatorResponseSchema,
        ErrorResponse: errorResponseSchema,
        PricingQuery: pricingQuerySchema,
        ComparisonQuery: comparisonQuerySchema,
        IdParam: idParamSchema,
      },
    },
  };
}
