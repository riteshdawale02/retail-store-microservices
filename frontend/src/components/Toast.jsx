import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function Toast({ toasts, onDismiss }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="toast-container" role="status" aria-live="polite">
      {toasts.map((t) => {
        const isSuccess = t.type === 'success';
        const isError = t.type === 'error';

        return (
          <div
            key={t.id}
            className={`toast-pill ${isSuccess ? 'toast-success' : isError ? 'toast-error' : 'toast-info'} animate-fade`}
          >
            <div className="toast-icon">
              {isSuccess ? (
                <CheckCircle2 size={17} className="toast-icon-svg text-emerald" />
              ) : isError ? (
                <AlertCircle size={17} className="toast-icon-svg text-rose" />
              ) : (
                <Info size={17} className="toast-icon-svg text-cyan" />
              )}
            </div>

            <div className="toast-content">
              {t.title && <strong className="toast-title">{t.title}</strong>}
              <p className="toast-message">{t.message}</p>
            </div>

            <button
              type="button"
              className="toast-close"
              onClick={() => onDismiss(t.id)}
              aria-label="Dismiss notification"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
