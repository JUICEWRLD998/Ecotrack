import { Router } from "express";
import { updateProfileSchema } from "../../schemas";
import { authenticate } from "../../middleware/authenticate";
import { validateRequest } from "../../middleware/validate-request";
import { asyncHandler } from "../../utils/async-handler";
import { getUserProfile, updateUserProfile } from "./users.service";

export const usersRouter = Router();

usersRouter.get("/status", (_request, response) => {
  response.json({
    module: "users",
    status: "ready",
    phase: "User profile and admin management endpoints are implemented in Phase 2 and Phase 4."
  });
});

usersRouter.get(
  "/me",
  authenticate,
  asyncHandler(async (request, response) => {
    const user = await getUserProfile(request.user!.id);
    response.json({ user });
  })
);

usersRouter.patch(
  "/me",
  authenticate,
  validateRequest({ body: updateProfileSchema }),
  asyncHandler(async (request, response) => {
    const user = await updateUserProfile(request.user!.id, request.body);
    response.json({ user });
  })
);
