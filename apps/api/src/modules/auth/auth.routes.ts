import { Router } from "express";

export const authRouter = Router();

authRouter.get("/status", (_request, response) => {
  response.json({
    module: "auth",
    status: "ready",
    phase: "Authentication endpoints are implemented in Phase 2."
  });
});
