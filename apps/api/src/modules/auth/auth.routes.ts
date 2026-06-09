import { Router } from "express";
import { loginSchema, registerSchema } from "../../schemas";
import { authenticate } from "../../middleware/authenticate";
import { authRateLimiter } from "../../middleware/rate-limiter";
import { validateRequest } from "../../middleware/validate-request";
import { asyncHandler } from "../../utils/async-handler";
import { loginUser, registerUser } from "./auth.service";

export const authRouter = Router();

authRouter.get("/status", (_request, response) => {
  response.json({
    module: "auth",
    status: "ready",
    phase: "Authentication endpoints are implemented in Phase 2."
  });
});

authRouter.post(
  "/register",
  authRateLimiter,
  validateRequest({ body: registerSchema }),
  asyncHandler(async (request, response) => {
    const payload = await registerUser(request.body);
    response.status(201).json(payload);
  })
);

authRouter.post(
  "/login",
  authRateLimiter,
  validateRequest({ body: loginSchema }),
  asyncHandler(async (request, response) => {
    const payload = await loginUser(request.body);
    response.json(payload);
  })
);

authRouter.post("/logout", (_request, response) => {
  response.json({
    message: "Logged out"
  });
});

authRouter.get("/me", authenticate, (request, response) => {
  response.json({
    user: request.user
  });
});
