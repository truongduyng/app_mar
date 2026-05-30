"use client";

import { Toaster } from "sonner";
import "sonner/dist/styles.css";

export function ToastProvider() {
  return (
    <Toaster
      closeButton
      richColors
      position="bottom-right"
      toastOptions={{
        style: {
          fontFamily: "inherit",
        },
      }}
    />
  );
}
