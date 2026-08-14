"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, AlertCircle, Info, X } from "lucide-react";

interface Toast {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  message?: string;
}

// Global toast queue
let toastListeners: ((toasts: Toast[]) => void)[] = [];
let currentToasts: Toast[] = [];

function notifyListeners() {
  toastListeners.forEach((l) => l([...currentToasts]));
}

export function toast(
  type: Toast["type"],
  title: string,
  message?: string
) {
  const id = `toast-${Date.now()}-${Math.random()}`;
  const newToast: Toast = { id, type, title, message };
  currentToasts = [...currentToasts, newToast];
  notifyListeners();

  // Auto-remove after 4 seconds
  setTimeout(() => {
    currentToasts = currentToasts.filter((t) => t.id !== id);
    notifyListeners();
  }, 4000);
}

// Convenience methods
toast.success = (title: string, message?: string) => toast("success", title, message);
toast.error = (title: string, message?: string) => toast("error", title, message);
toast.warning = (title: string, message?: string) => toast("warning", title, message);
toast.info = (title: string, message?: string) => toast("info", title, message);

const icons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertCircle,
  info: Info,
};

const colors = {
  success: "text-green-600 bg-green-50 border-green-100",
  error: "text-red-600 bg-red-50 border-red-100",
  warning: "text-amber-600 bg-amber-50 border-amber-100",
  info: "text-blue-600 bg-blue-50 border-blue-100",
};

export function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    toastListeners.push(setToasts);
    return () => {
      toastListeners = toastListeners.filter((l) => l !== setToasts);
    };
  }, []);

  const dismiss = (id: string) => {
    currentToasts = currentToasts.filter((t) => t.id !== id);
    notifyListeners();
  };

  return (
    <div
      aria-live="polite"
      aria-label="Notifications"
      className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none"
    >
      <AnimatePresence initial={false}>
        {toasts.map((t) => {
          const Icon = icons[t.type];
          return (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 100, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.95 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className={`pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-2xl border shadow-lg min-w-[280px] max-w-sm ${colors[t.type]} bg-white`}
              role="alert"
            >
              <Icon className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[var(--color-text-primary)]">
                  {t.title}
                </p>
                {t.message && (
                  <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                    {t.message}
                  </p>
                )}
              </div>
              <button
                onClick={() => dismiss(t.id)}
                aria-label="Dismiss notification"
                className="shrink-0 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
