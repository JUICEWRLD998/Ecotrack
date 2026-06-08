import type { RequestHandler } from "express";
import { prisma } from "../config/prisma";
import { verifyAuthToken } from "../utils/auth-token";
import { AppError } from "../utils/app-error";

export const authenticate: RequestHandler = async (request, _response, next) => {
  try {
    const authorization = request.get("authorization");

    if (!authorization?.startsWith("Bearer ")) {
      throw new AppError("Authentication required", 401);
    }

    const token = authorization.slice("Bearer ".length);
    const payload = verifyAuthToken(token);

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true
      }
    });

    if (!user || !user.isActive) {
      throw new AppError("Authentication required", 401);
    }

    request.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    };

    next();
  } catch (error) {
    next(error);
  }
};
