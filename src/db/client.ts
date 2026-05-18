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

/** Absolute `file:` URL for local SQLite via LibSQL. */
function sqliteFileUrl(filePath: string): string {
  const resolved = path.resolve(filePath);
  return pathToFileURL(resolved).href;
}

function isRemoteLibsqlUrl(url: string): boolean {
  return (
    url.startsWith("libsql:") ||
    url.startsWith("http://") ||
    url.startsWith("https://")
  );
}

export function createDb() {
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
  return drizzle(client, { schema });
}

export type Db = ReturnType<typeof createDb>;
