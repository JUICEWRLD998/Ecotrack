import bcrypt from "bcryptjs";
import type { LoginInput, RegisterInput } from "../../schemas";
import { prisma } from "../../config/prisma";
import type { AuthenticatedUser } from "../../types/auth";
import { signAuthToken } from "../../utils/auth-token";
import { AppError } from "../../utils/app-error";

const PASSWORD_SALT_ROUNDS = 12;

function toAuthUser(user: {
  id: string;
  name: string;
  email: string;
  role: AuthenticatedUser["role"];
}): AuthenticatedUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role
  };
}

export async function registerUser(input: RegisterInput) {
  const existingUser = await prisma.user.findUnique({
    where: { email: input.email },
    select: { id: true }
  });

  if (existingUser) {
    throw new AppError("An account with this email already exists", 409);
  }

  const password = await bcrypt.hash(input.password, PASSWORD_SALT_ROUNDS);
  const user = await prisma.$transaction(async (tx) => {
    const createdUser = await tx.user.create({
      data: {
        name: input.name,
        email: input.email,
        password
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      }
    });

    await tx.notification.create({
      data: {
        userId: createdUser.id,
        title: "Welcome to EcoTrack",
        message: "Your account is ready. Submit a collection request when your bin needs pickup."
      }
    });

    return createdUser;
  });

  const authUser = toAuthUser(user);

  return {
    user: authUser,
    token: signAuthToken(authUser)
  };
}

export async function loginUser(input: LoginInput) {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
    select: {
      id: true,
      name: true,
      email: true,
      password: true,
      role: true,
      isActive: true
    }
  });

  if (!user || !user.isActive) {
    throw new AppError("Invalid email or password", 401);
  }

  const isValidPassword = await bcrypt.compare(input.password, user.password);

  if (!isValidPassword) {
    throw new AppError("Invalid email or password", 401);
  }

  const authUser = toAuthUser(user);

  return {
    user: authUser,
    token: signAuthToken(authUser)
  };
}
