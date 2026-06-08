import { Router } from "express";
import { authenticate } from "../../middleware/authenticate";
import { asyncHandler } from "../../utils/async-handler";
import { createUploadSignature } from "../../services/cloudinary.service";

export const uploadsRouter = Router();

uploadsRouter.get("/status", (_request, response) => {
  response.json({
    module: "uploads",
    status: "ready",
    phase: "Cloudinary upload signing is implemented in Phase 3."
  });
});

uploadsRouter.post(
  "/signature",
  authenticate,
  asyncHandler(async (_request, response) => {
    response.json({ upload: createUploadSignature() });
  })
);
