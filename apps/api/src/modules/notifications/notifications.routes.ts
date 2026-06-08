import { Router } from "express";

export const notificationsRouter = Router();

notificationsRouter.get("/status", (_request, response) => {
  response.json({
    module: "notifications",
    status: "ready",
    phase: "In-app and email notification endpoints are implemented in Phase 6."
  });
});
