import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { config } from "../config.js";
import * as schema from "./schema.js";

function ensureDirForFile(filePath: string) {
  const dir = path.dirname(filePath);
  fs.mkdirSync(dir, { recursive: true });
}

function sqliteFileUrl(filePath: string): string {
  return pathToFileURL(path.resolve(filePath)).href;
}

export function isRemoteLibsqlUrl(url: string): boolean {
  return (
    url.startsWith("libsql:") ||
    url.startsWith("http://") ||
    url.startsWith("https://")
  );
}

let dbSingleton: ReturnType<typeof drizzle> | null = null;

/** Reuse one DB client per serverless isolate (avoids reconnecting every import). */
export function getDb() {
  if (dbSingleton) return dbSingleton;

  const raw = config.databaseUrl;
  let url: string;
  if (isRemoteLibsqlUrl(raw)) {
    url = raw;
  } else {
    ensureDirForFile(raw);
    url = sqliteFileUrl(raw);
  }

  const client = createClient({
    url,
    authToken: process.env.LIBSQL_AUTH_TOKEN?.trim() || undefined,
  });
  dbSingleton = drizzle(client, { schema });
  return dbSingleton;
}

export type Db = ReturnType<typeof getDb>;
