"use client";

import { Toaster } from "sonner";

export default function ToastProvider() {
  return (
    <Toaster
      position='top-right'
      toastOptions={{
        style: {
          background: "white",
          border: "1px solid rgb(226, 232, 240)",
          borderRadius: "1rem",
          boxShadow:
            "0 10px 15px -3px rgba(99, 102, 241, 0.1), 0 4px 6px -4px rgba(99, 102, 241, 0.1)",
          padding: "1rem",
          fontSize: "0.875rem",
          fontWeight: "500",
        },
        className: "toast-custom",
        // Success toast styling
        success: {
          style: {
            background:
              "linear-gradient(to right, rgb(240, 253, 244), rgb(220, 252, 231))",
            border: "1px solid rgb(134, 239, 172)",
            color: "rgb(22, 101, 52)",
          },
          iconTheme: {
            primary: "rgb(34, 197, 94)",
            secondary: "white",
          },
        },
        // Error toast styling
        error: {
          style: {
            background:
              "linear-gradient(to right, rgb(254, 242, 242), rgb(254, 226, 226))",
            border: "1px solid rgb(252, 165, 165)",
            color: "rgb(127, 29, 29)",
          },
          iconTheme: {
            primary: "rgb(239, 68, 68)",
            secondary: "white",
          },
        },
        // Info toast styling
        info: {
          style: {
            background:
              "linear-gradient(to right, rgb(239, 246, 255), rgb(219, 234, 254))",
            border: "1px solid rgb(147, 197, 253)",
            color: "rgb(30, 58, 138)",
          },
          iconTheme: {
            primary: "rgb(59, 130, 246)",
            secondary: "white",
          },
        },
        // Warning toast styling
        warning: {
          style: {
            background:
              "linear-gradient(to right, rgb(254, 252, 232), rgb(254, 249, 195))",
            border: "1px solid rgb(253, 224, 71)",
            color: "rgb(113, 63, 18)",
          },
          iconTheme: {
            primary: "rgb(234, 179, 8)",
            secondary: "white",
          },
        },
      }}
      closeButton
      richColors
      expand={false}
      duration={4000}
    />
  );
}
