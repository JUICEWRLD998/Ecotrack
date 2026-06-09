"use server";

import { redirect } from "next/navigation";
import { createSession, deleteSession } from "@/lib/auth";
import { loginSchema, registerSchema } from "@/lib/schemas";
import { loginUser, registerUser } from "@ecotrack/api/src/modules/auth/auth.service";

export async function loginAction(_prevState: unknown, formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const result = loginSchema.safeParse({ email, password });
  if (!result.success) {
    return { error: "Please enter a valid email and password" };
  }

  try {
    const data = await loginUser(result.data);
    await createSession({ user: data.user, apiToken: data.token });
  } catch (error: unknown) {
    console.error("Login error:", error);
    const msg = error instanceof Error ? error.message : "";
    if (msg.includes("credentials") || msg.includes("password") || msg.includes("not found")) {
      return { error: "Invalid email or password. Please try again." };
    }
    if (msg.includes("database") || msg.includes("connection")) {
      return { error: "Database connection issue. Please try again in a moment." };
    }
    return { error: msg || "Unable to sign in. Please try again." };
  }

  // Role-based redirect — read session to decide
  const { getSession } = await import("@/lib/auth");
  const session = await getSession();
  redirect(session?.user.role === "ADMIN" ? "/admin" : "/dashboard");
}

export async function registerAction(_prevState: unknown, formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const result = registerSchema.safeParse({ name, email, password });
  if (!result.success) {
    const errors = result.error.flatten().fieldErrors;
    return { error: Object.values(errors).flat()[0] || "Please check your input" };
  }

  try {
    const data = await registerUser(result.data);
    await createSession({ user: data.user, apiToken: data.token });
  } catch (error: unknown) {
    console.error("Registration error:", error);
    const msg = error instanceof Error ? error.message : "";
    if (msg.includes("unique") || msg.includes("already exists")) {
      return { error: "This email is already registered. Try logging in instead." };
    }
    if (msg.includes("database") || msg.includes("connection")) {
      return { error: "Database connection issue. Please try again in a moment." };
    }
    return { error: msg || "Unable to create account. Please try again." };
  }

  redirect("/dashboard");
}

export async function registerAdminAction(_prevState: unknown, formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const inviteCode = formData.get("inviteCode") as string;

  // Validate invite code
  const validCode = process.env.ADMIN_INVITE_CODE ?? "ecotrack-admin-2026";
  if (!inviteCode || inviteCode.trim() !== validCode.trim()) {
    return { error: "Invalid admin invite code. Please check with your system administrator." };
  }

  const result = registerSchema.safeParse({ name, email, password });
  if (!result.success) {
    const errors = result.error.flatten().fieldErrors;
    return { error: Object.values(errors).flat()[0] || "Please check your input" };
  }

  try {
    const data = await registerUser(result.data, "ADMIN");
    await createSession({ user: data.user, apiToken: data.token });
  } catch (error: unknown) {
    console.error("Admin registration error:", error);
    const msg = error instanceof Error ? error.message : "";
    if (msg.includes("unique") || msg.includes("already exists")) {
      return { error: "This email is already registered. Try logging in instead." };
    }
    if (msg.includes("database") || msg.includes("connection")) {
      return { error: "Database connection issue. Please try again in a moment." };
    }
    return { error: msg || "Unable to create admin account. Please try again." };
  }

  redirect("/admin");
}

export async function logoutAction() {
  await deleteSession();
  redirect("/login");
}
