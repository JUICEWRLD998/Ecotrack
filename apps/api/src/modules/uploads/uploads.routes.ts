import { Router } from "express";

export const uploadsRouter = Router();

uploadsRouter.get("/status", (_request, response) => {
  response.json({
    module: "uploads",
    status: "ready",
    phase: "Cloudinary upload signing is implemented in Phase 3."
  });
});
