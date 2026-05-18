/**
 * Vercel Fastify entrypoint: this filename is one of the auto-detected paths,
 * so the default export must be the Fastify instance (see Vercel Fastify docs).
 *
 * Vercel's build requires a direct `import … from "fastify"` in this file (static scan).
 */
import Fastify from "fastify";
import { config } from "./config.js";
import { buildApp } from "./fastify-app.js";
import { createDb } from "./db/client.js";
import { ensureDatabaseReady } from "./db/bootstrap.js";

void Fastify;

const db = createDb();
await ensureDatabaseReady(db);
const app = await buildApp(db);

if (process.env.VERCEL !== "1") {
  try {
    await app.listen({ port: config.port, host: "0.0.0.0" });
    app.log.info(`Listening on http://localhost:${config.port}`);
  } catch (e) {
    app.log.error(e);
    process.exit(1);
  }
}

export default app;
