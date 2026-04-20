import { useToast } from "../../hooks/useToast";

export function ToastHost() {
  const { toasts, dismissToast } = useToast();

  return (
    <aside className="toast-stack" aria-live="polite">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast toast-${toast.tone}`}>
          <div>
            <strong>{toast.title}</strong>
            {toast.description ? <p>{toast.description}</p> : null}
          </div>
          <button
            className="icon-button"
            onClick={() => dismissToast(toast.id)}
            type="button"
          >
            Dismiss
          </button>
        </div>
      ))}
    </aside>
  );
}
