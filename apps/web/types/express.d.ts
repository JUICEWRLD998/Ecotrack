import type { AuthenticatedUser } from "@ecotrack/api/src/types/auth";

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export {};
