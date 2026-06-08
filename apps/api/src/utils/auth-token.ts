import jwt from "jsonwebtoken";
import { env } from "../config/env";
import type { AuthenticatedUser } from "../types/auth";
import { AppError } from "./app-error";

type AuthTokenPayload = {
  role: AuthenticatedUser["role"];
  email: string;
  name: string;
};

export function signAuthToken(user: AuthenticatedUser) {
  return jwt.sign(
    {
      role: user.role,
      email: user.email,
      name: user.name
    } satisfies AuthTokenPayload,
    env.API_JWT_SECRET,
    {
      subject: user.id,
      expiresIn: "7d"
    }
  );
}

export function verifyAuthToken(token: string) {
  try {
    const decoded = jwt.verify(token, env.API_JWT_SECRET);

    if (typeof decoded === "string" || !decoded.sub) {
      throw new AppError("Invalid authentication token", 401);
    }

    return decoded as jwt.JwtPayload & AuthTokenPayload;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError("Invalid or expired authentication token", 401);
  }
}
