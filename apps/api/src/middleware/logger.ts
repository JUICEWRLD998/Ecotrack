import pino from "pino";
import pinoHttp from "pino-http";
import { env } from "../config/env";

export const logger = pino({
  level: env.NODE_ENV === "production" ? "info" : "debug",
  transport: env.NODE_ENV !== "production" 
    ? {
        target: "pino-pretty",
        options: {
          colorize: true,
          ignore: "pid,hostname",
          translateTime: "SYS:standard"
        }
      }
    : undefined
});

export const httpLogger = pinoHttp({
  logger,
  customLogLevel: (request, response, error) => {
    if (response.statusCode >= 500 || error) {
      return "error";
    }
    if (response.statusCode >= 400) {
      return "warn";
    }
    return "info";
  },
  customSuccessMessage: (request, response) => {
    return `${request.method} ${request.url} ${response.statusCode}`;
  },
  customErrorMessage: (request, response, error) => {
    return `${request.method} ${request.url} ${response.statusCode} - ${error?.message}`;
  },
  serializers: {
    req: (request) => ({
      method: request.method,
      url: request.url,
      query: request.query,
      params: request.params
    }),
    res: (response) => ({
      statusCode: response.statusCode
    })
  }
});
