import { PLATFORMS, type Platform } from "./types.js";

export function normalizePlatform(raw: string): Platform {
  const p = raw.trim().toLowerCase() as Platform;
  if ((PLATFORMS as readonly string[]).includes(p)) return p;
  return "other";
}
