import { relations } from "drizzle-orm";
import { real, sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const creators = sqliteTable("creators", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  /** Raw client niche string; normalize with `normalizeNicheKey` when reading */
  niche: text("niche").notNull(),
  yearsActiveUgc: real("years_active_ugc").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const creatorPlatformMetrics = sqliteTable("creator_platform_metrics", {
  id: text("id").primaryKey(),
  creatorId: text("creator_id")
    .notNull()
    .references(() => creators.id, { onDelete: "cascade" }),
  platform: text("platform").notNull(),
  audienceSize: integer("audience_size").notNull(),
  engagementRateApprox: real("engagement_rate_approx").notNull(),
});

export const creatorsRelations = relations(creators, ({ many }) => ({
  platformMetrics: many(creatorPlatformMetrics),
}));

export const creatorPlatformMetricsRelations = relations(
  creatorPlatformMetrics,
  ({ one }) => ({
    creator: one(creators, {
      fields: [creatorPlatformMetrics.creatorId],
      references: [creators.id],
    }),
  })
);
