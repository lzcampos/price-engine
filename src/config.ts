import path from "node:path";

function envNumber(key: string, fallback: number): number {
  const raw = process.env[key];
  if (raw === undefined || raw === "") return fallback;
  const n = Number(raw);
  return Number.isFinite(n) ? n : fallback;
}

function defaultDatabaseUrl(): string {
  if (process.env.DATABASE_URL?.trim()) {
    return process.env.DATABASE_URL.trim();
  }
  // Vercel serverless: project dir is read-only; only /tmp is writable for SQLite files.
  if (process.env.VERCEL === "1") {
    return path.join("/tmp", "price-engine.db");
  }
  return path.join(process.cwd(), "data", "price-engine.db");
}

export const config = {
  port: envNumber("PORT", 3000),
  /** SQLite file path, or remote LibSQL URL (e.g. Turso). */
  databaseUrl: defaultDatabaseUrl(),
};
