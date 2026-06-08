import type { RequestHandler } from "express";
import type { ZodSchema } from "zod";

type RequestSchemas = {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
};

export function validateRequest(schemas: RequestSchemas): RequestHandler {
  return (request, _response, next) => {
    if (schemas.body) {
      request.body = schemas.body.parse(request.body);
    }

    if (schemas.query) {
      request.query = schemas.query.parse(request.query);
    }

    if (schemas.params) {
      request.params = schemas.params.parse(request.params);
    }

    next();
  };
}
