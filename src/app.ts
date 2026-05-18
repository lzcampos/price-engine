/**
 * Vercel Fastify entrypoint — default export must be the Fastify instance.
 * Direct `fastify` import required by Vercel's static entry scan.
 */
import Fastify from "fastify";
import { config } from "./config.js";
import { buildApp } from "./fastify-app.js";
import { ensureDatabaseReady } from "./db/bootstrap.js";
import { getDb } from "./db/client.js";

void Fastify;

let appPromise: ReturnType<typeof buildApp> | undefined;

async function getApp() {
  if (!appPromise) {
    appPromise = (async () => {
      const db = getDb();
      await ensureDatabaseReady(db);
      return buildApp(db);
    })();
  }
  return appPromise;
}

const app = await getApp();

if (process.env.VERCEL !== "1") {
  try {
    await app.listen({ port: config.port, host: "0.0.0.0" });
    console.info(`Listening on http://localhost:${config.port}`);
    console.info(`Swagger UI: http://localhost:${config.port}/docs`);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

export default app;
