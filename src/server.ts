/**
 * Alternate auto-detected entry name. Vercel's scanner requires a direct `fastify`
 * import on probed entry files — keep this shim so `server.ts` is valid if chosen.
 */
import Fastify from "fastify";

void Fastify;

export { default } from "./app.js";
