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
      description={isAdmin ? "Access the admin dashboard" : "Sign in to your resident account"}
      footerHref="/register"
      footerLabel="Create an account"
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
