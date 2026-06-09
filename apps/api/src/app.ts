import cors from "cors";
import express from "express";
import helmet from "helmet";
import { env } from "./config/env";
import { errorHandler } from "./middleware/error-handler";
import { httpLogger } from "./middleware/logger";
import { apiRateLimiter } from "./middleware/rate-limiter";
import { notFoundHandler } from "./middleware/not-found-handler";
import { apiRouter } from "./modules";

export function createApp() {
  const app = express();

  // Trust proxy (required for rate limiting behind proxies like Next.js)
  app.set("trust proxy", 1);

  // Logging
  app.use(httpLogger);

  // Security
  app.use(helmet());
  app.use(
    cors({
      origin: env.CORS_ORIGIN,
      credentials: true
    })
  );

  // Rate limiting
  app.use(apiRateLimiter);

  // Body parsing
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true }));

  // Routes
  app.use("/api", apiRouter);
  
  // Error handling
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
