"use client";

import { ThemeProvider } from "./theme-provider";
import { ToastProvider } from "./toast-provider";
import { ErrorBoundaryProvider } from "./error-boundary-provider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundaryProvider>
      <ThemeProvider>
        {children}
        <ToastProvider />
      </ThemeProvider>
    </ErrorBoundaryProvider>
  );
}
