import { RANGE_MAX_FACTOR, RANGE_MIN_FACTOR } from "./constants.js";

export type PriceRange = {
  min: number;
  max: number;
  recommended: number;
};

export function toRange(recommended: number): PriceRange {
  const r = Math.max(0, recommended);
  return {
    min: Math.round(r * RANGE_MIN_FACTOR),
    max: Math.round(r * RANGE_MAX_FACTOR),
    recommended: Math.round(r),
  };
}
