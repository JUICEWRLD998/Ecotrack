import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { AppError } from "../utils/app-error";
import { logger } from "./logger";

export const errorHandler: ErrorRequestHandler = (error, request, response, _next) => {
  if (error instanceof ZodError) {
    response.status(400).json({
      message: "Validation failed",
      issues: error.flatten().fieldErrors
    });
    return;
  }

  if (error instanceof AppError) {
    logger.warn({ error: error.message, statusCode: error.statusCode }, "Application error");
    response.status(error.statusCode).json({
      message: error.message
    });
    return;
  }

  logger.error({ error, url: request.url, method: request.method }, "Unhandled error");
  response.status(500).json({
    message: "Internal server error"
  });
};
