import app from "./app.js";
import { pool } from "./config/db.js";
import { env } from "./config/env.js";

const server = app.listen(env.port, env.host, () => {
  console.log(`Backend running at http://${env.host}:${env.port}`);
});

async function shutdown(signal) {
  console.log(`${signal} received. Closing server...`);
  server.close(async () => {
    await pool.end();
    process.exit(0);
  });
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
