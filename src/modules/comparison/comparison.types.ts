import type { DeliverableType } from "../../shared/types.js";

export type DeliverableComparison = {
  deliverable: DeliverableType;
  a: { min: number; max: number; recommended: number };
  b: { min: number; max: number; recommended: number };
  deltaRecommended: number;
  pctDeltaRecommended: number | null;
};

export type ComparisonResponse = {
  creatorA: { id: string; name: string };
  creatorB: { id: string; name: string };
  summary: string[];
  byDeliverable: DeliverableComparison[];
  potentialInsight: {
    orientedToward: "a" | "b" | "neutral";
    note: string;
    benchmarkCreator?: { id: string; name: string; yearsActiveUgc: number };
  };
};
