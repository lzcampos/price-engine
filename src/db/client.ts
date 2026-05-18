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

/** Absolute `file:` URL for local LibSQL (avoids better-sqlite3 native bindings). */
function sqliteFileUrl(filePath: string): string {
  const resolved = path.resolve(filePath);
  return pathToFileURL(resolved).href;
}

export function createDb() {
  ensureDirForFile(config.databaseUrl);
  const client = createClient({ url: sqliteFileUrl(config.databaseUrl) });
  return drizzle(client, { schema });
}

export type Db = ReturnType<typeof createDb>;
