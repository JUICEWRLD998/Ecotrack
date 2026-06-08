"use client";

import { ErrorBoundary, type FallbackProps } from "react-error-boundary";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "../ui/button";

function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-lg border border-red-200 bg-white p-8 shadow-lg">
        <div className="mb-4 flex items-center justify-center">
          <div className="rounded-full bg-red-100 p-3">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
        </div>
        
        <h1 className="mb-2 text-center text-2xl font-bold text-gray-900">
          Something went wrong
        </h1>
        
        <p className="mb-6 text-center text-gray-600">
          An unexpected error occurred. Please try refreshing the page.
        </p>
        
        {process.env.NODE_ENV === "development" && error instanceof Error && (
          <div className="mb-6 rounded-md bg-gray-100 p-4">
            <p className="text-sm font-semibold text-gray-700 mb-2">Error details:</p>
            <p className="text-xs text-gray-600 font-mono break-words">
              {error.message}
            </p>
          </div>
        )}
        
        <div className="flex gap-3">
          <Button
            onClick={resetErrorBoundary}
            className="flex-1"
            variant="default"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
          
          <Button
            onClick={() => window.location.href = "/"}
            className="flex-1"
            variant="outline"
          >
            Go Home
          </Button>
        </div>
      </div>
    </div>
  );
}

export function ErrorBoundaryProvider({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error, errorInfo) => {
        // Log to error reporting service in production
        console.error("Error boundary caught:", error, errorInfo);
      }}
      onReset={() => {
        // Reset app state here if needed
        window.location.reload();
      }}
    >
      {children}
    </ErrorBoundary>
  );
}
