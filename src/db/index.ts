export { getDb, isRemoteLibsqlUrl, type Db } from "./client.js";
/** @deprecated Use `getDb()` — kept for scripts */
export { getDb as createDb } from "./client.js";
export { ensureDatabaseReady } from "./bootstrap.js";
export * from "./schema.js";
