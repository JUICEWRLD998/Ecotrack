import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { AppError } from "../utils/app-error";
import { logger } from "./logger";

export const errorHandler: ErrorRequestHandler = (error, request, response, _next) => {
  if (error instanceof ZodError) {
    console.error("Validation error:", error.flatten().fieldErrors);
    response.status(400).json({
      message: "Validation failed",
      issues: error.flatten().fieldErrors
    });
    return;
  }

  if (error instanceof AppError) {
    console.error("App error:", error.message, error.statusCode);
    logger.warn({ error: error.message, statusCode: error.statusCode }, "Application error");
    response.status(error.statusCode).json({
      message: error.message
    });
    return;
  }

  console.error("Unhandled error:", error);
  logger.error({ error, url: request.url, method: request.method }, "Unhandled error");
  response.status(500).json({
    message: "Internal server error"
  });
};
