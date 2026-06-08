import { Router } from "express";

export const analyticsRouter = Router();

analyticsRouter.get("/status", (_request, response) => {
  response.json({
    module: "analytics",
    status: "ready",
    phase: "Analytics endpoints are implemented in Phase 7."
  });
});
