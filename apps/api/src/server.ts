import { createServer } from "node:http";
import { createApp } from "./app";
import { env } from "./config/env";

const app = createApp();
const server = createServer(app);

server.listen(env.PORT, () => {
  console.info(`EcoTrack API listening on http://localhost:${env.PORT}`);
});

const shutdown = (signal: string) => {
  console.info(`${signal} received. Closing API server.`);
  server.close(() => {
    process.exit(0);
  });
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
