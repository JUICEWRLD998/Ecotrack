import { Router } from "express";

export const requestsRouter = Router();

requestsRouter.get("/status", (_request, response) => {
  response.json({
    module: "requests",
    status: "ready",
    phase: "Waste request endpoints are implemented in Phase 3 and Phase 4."
  });
});
