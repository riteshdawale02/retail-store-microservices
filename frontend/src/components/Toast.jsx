import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function Toast({ toasts, onDismiss }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((t) => {
        const isSuccess = t.type === 'success';
        const isError = t.type === 'error';

        return (
          <div
            key={t.id}
            className={`toast-pill glass-panel ${isSuccess ? 'toast-success' : isError ? 'toast-error' : 'toast-info'} animate-fade`}
          >
            <div className="toast-icon">
              {isSuccess ? (
                <CheckCircle2 size={18} className="text-emerald" />
              ) : isError ? (
                <AlertCircle size={18} className="text-rose" />
              ) : (
                <Info size={18} className="text-cyan" />
              )}
            </div>

            <div className="toast-content">
              {t.title && <strong className="toast-title">{t.title}</strong>}
              <p className="toast-message">{t.message}</p>
            </div>

            <button
              className="toast-close"
              onClick={() => onDismiss(t.id)}
            >
              <X size={15} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
