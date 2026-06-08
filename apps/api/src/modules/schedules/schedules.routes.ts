import { Router } from "express";

export const schedulesRouter = Router();

schedulesRouter.get("/status", (_request, response) => {
  response.json({
    module: "schedules",
    status: "ready",
    phase: "Collection scheduling endpoints are implemented in Phase 5."
  });
});
