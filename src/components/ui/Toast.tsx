"use client";

import { createContext, useContext, ReactNode } from "react";
import toast, { Toaster, ToastOptions } from "react-hot-toast";

// 全局Toast上下文
interface ToastContextType {
  showToast: (
    message: string,
    type?: "success" | "error" | "warning" | "info",
    options?: ToastOptions
  ) => void;
  showSuccessToast: (message: string, options?: ToastOptions) => void;
  showErrorToast: (message: string, options?: ToastOptions) => void;
  showWarningToast: (message: string, options?: ToastOptions) => void;
  showInfoToast: (message: string, options?: ToastOptions) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

// Toast提供者组件
export function ToastProvider({ children }: { children: ReactNode }) {
  const showToast = (
    message: string,
    type: "success" | "error" | "warning" | "info" = "info",
    options?: ToastOptions
  ) => {
    const defaultOptions: ToastOptions = {
      duration: 4000,
      position: "top-center",
      style: {
        background: "#363636",
        color: "#fff",
        borderRadius: "12px",
        padding: "16px",
        fontSize: "14px",
        fontWeight: "500",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        backdropFilter: "blur(10px)",
      },
      ...options,
    };

    switch (type) {
      case "success":
        toast.success(message, {
          ...defaultOptions,
          style: {
            ...defaultOptions.style,
            background: "linear-gradient(135deg, #10b981, #059669)",
            border: "1px solid rgba(16, 185, 129, 0.2)",
          },
        });
        break;
      case "error":
        toast.error(message, {
          ...defaultOptions,
          style: {
            ...defaultOptions.style,
            background: "linear-gradient(135deg, #ef4444, #dc2626)",
            border: "1px solid rgba(239, 68, 68, 0.2)",
          },
        });
        break;
      case "warning":
        toast(message, {
          ...defaultOptions,
          style: {
            ...defaultOptions.style,
            background: "linear-gradient(135deg, #f59e0b, #d97706)",
            border: "1px solid rgba(245, 158, 11, 0.2)",
          },
        });
        break;
      default:
        toast(message, {
          ...defaultOptions,
          style: {
            ...defaultOptions.style,
            background: "linear-gradient(135deg, #3b82f6, #2563eb)",
            border: "1px solid rgba(59, 130, 246, 0.2)",
          },
        });
        break;
    }
  };

  const showSuccessToast = (message: string, options?: ToastOptions) => {
    showToast(message, "success", options);
  };

  const showErrorToast = (message: string, options?: ToastOptions) => {
    showToast(message, "error", options);
  };

  const showWarningToast = (message: string, options?: ToastOptions) => {
    showToast(message, "warning", options);
  };

  const showInfoToast = (message: string, options?: ToastOptions) => {
    showToast(message, "info", options);
  };

  return (
    <ToastContext.Provider
      value={{
        showToast,
        showSuccessToast,
        showErrorToast,
        showWarningToast,
        showInfoToast,
      }}
    >
      {children}
      <Toaster
        toastOptions={{
          // 默认样式
          duration: 4000,
          position: "top-center",
          style: {
            background: "#363636",
            color: "#fff",
            borderRadius: "12px",
            padding: "16px",
            fontSize: "14px",
            fontWeight: "500",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            backdropFilter: "blur(10px)",
          },
        }}
        containerStyle={{
          top: 20,
          left: "50%",
          transform: "translateX(-50%)",
        }}
      />
    </ToastContext.Provider>
  );
}

// 使用Toast的Hook
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

// 便捷的Toast函数
export const showSuccessToast = (message: string, options?: ToastOptions) => {
  toast.success(message, {
    duration: 4000,
    position: "top-center",

    style: {
      background: "linear-gradient(135deg, #10b981, #059669)",
      color: "#fff",
      borderRadius: "12px",
      padding: "16px",
      fontSize: "14px",
      fontWeight: "500",
      boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12)",
      border: "1px solid rgba(16, 185, 129, 0.2)",
      backdropFilter: "blur(10px)",
    },
    ...options,
  });
};

export const showErrorToast = (message: string, options?: ToastOptions) => {
  toast.error(message, {
    duration: 4000,
    position: "top-center",

    style: {
      background: "linear-gradient(135deg, #ef4444, #dc2626)",
      color: "#fff",
      borderRadius: "12px",
      padding: "16px",
      fontSize: "14px",
      fontWeight: "500",
      boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12)",
      border: "1px solid rgba(239, 68, 68, 0.2)",
      backdropFilter: "blur(10px)",
    },
    ...options,
  });
};

export const showWarningToast = (message: string, options?: ToastOptions) => {
  toast(message, {
    duration: 4000,
    position: "top-center",

    style: {
      background: "linear-gradient(135deg, #f59e0b, #d97706)",
      color: "#fff",
      borderRadius: "12px",
      padding: "16px",
      fontSize: "14px",
      fontWeight: "500",
      boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12)",
      border: "1px solid rgba(245, 158, 11, 0.2)",
      backdropFilter: "blur(10px)",
    },
    ...options,
  });
};

export const showInfoToast = (message: string, options?: ToastOptions) => {
  toast(message, {
    duration: 4000,
    position: "top-center",

    style: {
      background: "linear-gradient(135deg, #3b82f6, #2563eb)",
      color: "#fff",
      borderRadius: "12px",
      padding: "16px",
      fontSize: "14px",
      fontWeight: "500",
      boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12)",
      border: "1px solid rgba(59, 130, 246, 0.2)",
      backdropFilter: "blur(10px)",
    },
    ...options,
  });
};
