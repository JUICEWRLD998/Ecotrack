"use client";

import { Toaster } from "sonner";

export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      expand={false}
      richColors
      closeButton
      toastOptions={{
        duration: 4000,
        classNames: {
          error: "border-red-500",
          success: "border-green-500",
          warning: "border-yellow-500",
          info: "border-blue-500"
        }
      }}
    />
  );
}
