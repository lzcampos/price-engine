import path from "node:path";

function envNumber(key: string, fallback: number): number {
  const raw = process.env[key];
  if (raw === undefined || raw === "") return fallback;
  const n = Number(raw);
  return Number.isFinite(n) ? n : fallback;
}

export const config = {
  port: envNumber("PORT", 3000),
  /** SQLite file path (relative to cwd or absolute) */
  databaseUrl:
    process.env.DATABASE_URL?.trim() ||
    path.join(process.cwd(), "data", "price-engine.db"),
};
