import type { RequestHandler } from "express";
import type { UserRole } from "@ecotrack/shared";
import { AppError } from "../utils/app-error";

export function requireRole(...allowedRoles: UserRole[]): RequestHandler {
  return (request, _response, next) => {
    if (!request.user) {
      next(new AppError("Authentication required", 401));
      return;
    }

    if (!allowedRoles.includes(request.user.role)) {
      next(new AppError("You do not have permission to access this resource", 403));
      return;
    }

    next();
  };
}
