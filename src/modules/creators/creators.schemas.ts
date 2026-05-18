import { z } from "zod";

export const createCreatorBodySchema = z.object({
  name: z.string().min(1).max(200),
  niche: z.string().min(1).max(120),
  yearsActiveUgc: z.number().min(0).max(80),
  platforms: z
    .array(
      z.object({
        platform: z.string().min(1).max(40),
        audienceSize: z.number().int().min(0),
        engagementRateApprox: z.number().min(0).max(100),
      })
    )
    .min(1)
    .max(20),
});

export type CreateCreatorBody = z.infer<typeof createCreatorBodySchema>;
