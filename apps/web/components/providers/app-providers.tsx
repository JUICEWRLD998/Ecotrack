"use client";

import { ToastProvider } from "./toast-provider";
import { ErrorBoundaryProvider } from "./error-boundary-provider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundaryProvider>
      {children}
      <ToastProvider />
    </ErrorBoundaryProvider>
  );
}
