import {
  createContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type ToastTone = "success" | "error" | "info";

export type ToastItem = {
  id: string;
  title: string;
  description?: string;
  tone: ToastTone;
};

type ToastContextValue = {
  toasts: ToastItem[];
  pushToast: (toast: Omit<ToastItem, "id">) => void;
  dismissToast: (id: string) => void;
};

export const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    if (toasts.length === 0) {
      return undefined;
    }

    const timeout = window.setTimeout(() => {
      setToasts((current) => current.slice(1));
    }, 4500);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [toasts]);

  const value = useMemo<ToastContextValue>(
    () => ({
      toasts,
      pushToast(toast) {
        setToasts((current) => [
          ...current,
          {
            ...toast,
            id: crypto.randomUUID(),
          },
        ]);
      },
      dismissToast(id) {
        setToasts((current) => current.filter((toast) => toast.id !== id));
      },
    }),
    [toasts],
  );

  return (
    <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
  );
}
