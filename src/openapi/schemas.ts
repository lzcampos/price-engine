export const healthResponseSchema = {
  type: "object",
  properties: { ok: { type: "boolean" } },
} as const;

export const errorResponseSchema = {
  type: "object",
  properties: {
    error: { type: "string" },
    message: { type: "string" },
    details: { type: "object" },
  },
} as const;

export const platformMetricSchema = {
  type: "object",
  required: ["platform", "audienceSize", "engagementRateApprox"],
  properties: {
    platform: { type: "string", examples: ["instagram"] },
    audienceSize: { type: "integer", minimum: 0 },
    engagementRateApprox: { type: "number", minimum: 0, maximum: 100 },
  },
} as const;

export const createCreatorBodySchema = {
  type: "object",
  required: ["name", "niche", "yearsActiveUgc", "platforms"],
  properties: {
    name: { type: "string", minLength: 1, maxLength: 200 },
    niche: { type: "string", minLength: 1, maxLength: 120 },
    yearsActiveUgc: { type: "number", minimum: 0, maximum: 80 },
    platforms: {
      type: "array",
      minItems: 1,
      maxItems: 20,
      items: platformMetricSchema,
    },
  },
} as const;

export const creatorResponseSchema = {
  type: "object",
  properties: {
    id: { type: "string" },
    name: { type: "string" },
    niche: { type: "string" },
    nicheKey: { type: "string" },
    yearsActiveUgc: { type: "number" },
    platforms: { type: "array", items: platformMetricSchema },
  },
} as const;

export const pricingQuerySchema = {
  type: "object",
  properties: {
    includeExtendedUsageRights: {
      type: "string",
      enum: ["0", "1", "true", "false"],
    },
    exclusivityCampaign: { type: "string", enum: ["0", "1", "true", "false"] },
    rushDelivery: { type: "string", enum: ["0", "1", "true", "false"] },
  },
} as const;

export const comparisonQuerySchema = {
  type: "object",
  required: ["a", "b"],
  properties: {
    a: { type: "string", description: "First creator id" },
    b: { type: "string", description: "Second creator id" },
  },
} as const;

export const idParamSchema = {
  type: "object",
  required: ["id"],
  properties: { id: { type: "string" } },
} as const;
