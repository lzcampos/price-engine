import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";
import { config } from "../src/config.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const migrationsFolder = path.join(__dirname, "..", "drizzle");

fs.mkdirSync(path.dirname(config.databaseUrl), { recursive: true });

const client = createClient({ url: pathToFileURL(path.resolve(config.databaseUrl)).href });
const db = drizzle(client);
await migrate(db, { migrationsFolder });
console.log("Migrations applied to", config.databaseUrl);
