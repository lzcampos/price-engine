import fs from "node:fs";
import path from "node:path";

const src = path.join(process.cwd(), "drizzle");
const dest = path.join(process.cwd(), "dist", "drizzle");

if (!fs.existsSync(src)) {
  console.warn("copy-migrations: no drizzle/ folder, skipping");
  process.exit(0);
}

fs.cpSync(src, dest, { recursive: true });
console.log("copy-migrations: drizzle -> dist/drizzle");
