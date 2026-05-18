import { config } from "./config.js";
import { createDb } from "./db/client.js";
import { buildApp } from "./app.js";

const db = createDb();
const app = await buildApp(db);

try {
  await app.listen({ port: config.port, host: "0.0.0.0" });
  app.log.info(`Listening on http://localhost:${config.port}`);
} catch (e) {
  app.log.error(e);
  process.exit(1);
}
