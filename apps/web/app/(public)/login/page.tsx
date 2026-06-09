"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { LoginForm } from "@/components/forms/login-form";
import { AuthShell } from "@/components/layout/auth-shell";

function LoginPageContent() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams?.get("callbackUrl");
  const isAdmin = callbackUrl?.startsWith("/admin");

  return (
    <AuthShell
      title={isAdmin ? "Admin Login" : "Welcome Back"}
      description={
        isAdmin
          ? "Sign in to access the admin dashboard"
          : "Sign in to your resident account"
      }
      footerHref={isAdmin ? "/admin-register" : "/register"}
      footerLabel={isAdmin ? "Create an admin account" : "Create a resident account"}
      role={isAdmin ? "admin" : "resident"}
    >
      <LoginForm />
    </AuthShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginPageContent />
    </Suspense>
  );
}
