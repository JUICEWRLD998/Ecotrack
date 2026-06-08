import { Router } from "express";

export const usersRouter = Router();

usersRouter.get("/status", (_request, response) => {
  response.json({
    module: "users",
    status: "ready",
    phase: "User profile and admin management endpoints are implemented in Phase 2 and Phase 4."
  });
});
