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
    return { error: "Invalid email or password" };
  }

  try {
    const data = await loginUser(result.data);
    await createSession({ user: data.user, apiToken: data.token });
  } catch (error: any) {
    return { error: error?.message || "Invalid email or password" };
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
    return { error: Object.values(errors).flat()[0] || "Validation failed" };
  }

  try {
    const data = await registerUser(result.data);
    await createSession({ user: data.user, apiToken: data.token });
  } catch (error: any) {
    return { error: error?.message || "Registration failed" };
  }

  redirect("/dashboard");
}

export async function logoutAction() {
  await deleteSession();
  redirect("/login");
}
