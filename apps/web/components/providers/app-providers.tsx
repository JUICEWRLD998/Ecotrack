"use client";

import { SessionProvider } from "next-auth/react";
import { ToastProvider } from "./toast-provider";
import { ErrorBoundaryProvider } from "./error-boundary-provider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ErrorBoundaryProvider>
        {children}
        <ToastProvider />
      </ErrorBoundaryProvider>
    </SessionProvider>
  );
}
