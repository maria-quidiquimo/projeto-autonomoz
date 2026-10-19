import { useState, useEffect } from 'react';

const icons = {
  success: 'check_circle',
  error: 'error',
  warning: 'warning',
  info: 'info',
};

const styles = {
  success: 'bg-surface-container-lowest text-on-surface border-l-4 border-l-emerald-600 shadow-lg',
  error: 'bg-surface-container-lowest text-on-surface border-l-4 border-l-error shadow-lg',
  warning: 'bg-surface-container-lowest text-on-surface border-l-4 border-l-amber-500 shadow-lg',
  info: 'bg-surface-container-lowest text-on-surface border-l-4 border-l-tertiary shadow-lg',
};

const iconStyles = {
  success: 'text-emerald-600',
  error: 'text-error',
  warning: 'text-amber-500',
  info: 'text-tertiary',
};

export default function ToastItem({ toast, onDismiss }) {
  const { id, message, type = 'info', duration = 6000 } = toast;

  useEffect(() => {
    if (duration <= 0) return;
    const timer = setTimeout(() => {
      onDismiss(id);
    }, duration);
    return () => clearTimeout(timer);
  }, [id, duration, onDismiss]);

  return (
    <div
      role="alert"
      className={`min-w-[320px] max-w-md p-space-md rounded-md border border-outline-variant/40 flex items-start gap-space-sm transition-all duration-300 transform translate-y-0 opacity-100 animate-in fade-in slide-in-from-bottom-2 ${
        styles[type] || styles.info
      }`}
    >
      <span className={`material-symbols-outlined text-[22px] shrink-0 mt-0.5 ${iconStyles[type] || iconStyles.info}`}>
        {icons[type] || 'info'}
      </span>
      <div className="flex-1 text-body-sm font-medium pr-space-xs break-words">
        {message}
      </div>
      <button
        onClick={() => onDismiss(id)}
        className="p-1 rounded text-secondary hover:text-on-surface hover:bg-surface-container transition-colors shrink-0"
        aria-label="Fechar notificação"
      >
        <span className="material-symbols-outlined text-[18px]">close</span>
      </button>
    </div>
  );
}
