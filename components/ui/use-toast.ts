"use client"

import React, { createContext, useContext, useState, ReactNode } from "react";

export type ToastVariant = "default" | "destructive" | "success" | "warning" | "info";

export type Toast = {
  id?: string;
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
};

type ToastContextType = {
  toast: (toast: Toast) => void;
  dismiss: (id: string) => void;
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<(Toast & { id: string })[]>([]);

  const toast = (toast: Toast) => {
    const id = toast.id || Math.random().toString(36).substring(7);
    const duration = toast.duration || 4000;
    
    setToasts((prev) => [...prev, { ...toast, id }]);
    
    if (duration > 0) {
      setTimeout(() => {
        dismiss(id);
      }, duration);
    }
  };

  const dismiss = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const getToastStyles = (variant?: ToastVariant) => {
    const baseStyles = {
      padding: "16px 20px",
      borderRadius: "12px",
      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
      minWidth: "280px",
      maxWidth: "420px",
      fontWeight: 500,
      backdropFilter: "blur(10px)",
      border: "1px solid",
      animation: "slideIn 0.3s ease-out",
    };

    switch (variant) {
      case "destructive":
        return {
          ...baseStyles,
          background: "linear-gradient(135deg, rgba(239, 68, 68, 0.95), rgba(220, 38, 38, 0.95))",
          borderColor: "rgba(248, 113, 113, 0.3)",
          color: "#fff",
        };
      case "success":
        return {
          ...baseStyles,
          background: "linear-gradient(135deg, rgba(34, 197, 94, 0.95), rgba(22, 163, 74, 0.95))",
          borderColor: "rgba(74, 222, 128, 0.3)",
          color: "#fff",
        };
      case "warning":
        return {
          ...baseStyles,
          background: "linear-gradient(135deg, rgba(251, 146, 60, 0.95), rgba(249, 115, 22, 0.95))",
          borderColor: "rgba(253, 186, 116, 0.3)",
          color: "#fff",
        };
      case "info":
        return {
          ...baseStyles,
          background: "linear-gradient(135deg, rgba(59, 130, 246, 0.95), rgba(37, 99, 235, 0.95))",
          borderColor: "rgba(96, 165, 250, 0.3)",
          color: "#fff",
        };
      default:
        return {
          ...baseStyles,
          background: "rgba(30, 30, 30, 0.95)",
          borderColor: "rgba(100, 100, 100, 0.3)",
          color: "#fff",
        };
    }
  };

  return (
    React.createElement(
      ToastContext.Provider,
      { value: { toast, dismiss } },
      React.createElement(
        React.Fragment,
        null,
        children,
        React.createElement(
          "div",
          {
            style: {
              position: "fixed",
              top: 20,
              right: 20,
              zIndex: 9999,
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            },
          },
          toasts.map((t) =>
            React.createElement(
              "div",
              {
                key: t.id,
                style: getToastStyles(t.variant),
              },
              React.createElement(
                "div",
                { style: { display: "flex", justifyContent: "space-between", alignItems: "flex-start" } },
                React.createElement(
                  "div",
                  { style: { flex: 1 } },
                  React.createElement("div", { style: { fontWeight: 600, marginBottom: 4 } }, t.title),
                  t.description &&
                    React.createElement(
                      "div",
                      { style: { fontSize: "0.9em", opacity: 0.9, marginTop: 4 } },
                      t.description
                    ),
                  t.action &&
                    React.createElement(
                      "button",
                      {
                        onClick: t.action.onClick,
                        style: {
                          marginTop: 8,
                          padding: "6px 12px",
                          background: "rgba(255, 255, 255, 0.2)",
                          border: "1px solid rgba(255, 255, 255, 0.3)",
                          borderRadius: "6px",
                          color: "#fff",
                          fontSize: "0.85em",
                          fontWeight: 600,
                          cursor: "pointer",
                        },
                      },
                      t.action.label
                    )
                ),
                React.createElement(
                  "button",
                  {
                    onClick: () => dismiss(t.id),
                    style: {
                      marginLeft: 12,
                      background: "transparent",
                      border: "none",
                      color: "#fff",
                      cursor: "pointer",
                      fontSize: "1.2em",
                      opacity: 0.7,
                      padding: 0,
                      width: 20,
                      height: 20,
                    },
                  },
                  "×"
                )
              )
            )
          )
        ),
        React.createElement(
          "style",
          null,
          `
            @keyframes slideIn {
              from {
                transform: translateX(100%);
                opacity: 0;
              }
              to {
                transform: translateX(0);
                opacity: 1;
              }
            }
          `
        )
      )
    )
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx;
}