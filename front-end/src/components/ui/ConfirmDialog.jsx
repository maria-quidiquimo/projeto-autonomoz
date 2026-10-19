import Modal from './Modal';

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirmação',
  message = 'Tem certeza que deseja executar esta ação?',
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  isDestructive = false,
  loading = false,
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="max-w-md">
      <div className="flex flex-col gap-space-md">
        <div className="flex items-start gap-space-sm">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
              isDestructive
                ? 'bg-error/15 text-error'
                : 'bg-primary/15 text-primary'
            }`}
          >
            <span className="material-symbols-outlined text-[24px]">
              {isDestructive ? 'warning' : 'help_outline'}
            </span>
          </div>
          <div className="flex-1 text-body-md text-on-surface pt-1">
            {message}
          </div>
        </div>

        <div className="flex items-center justify-end gap-space-sm pt-space-sm border-t border-outline-variant/30">
          <button
            type="button"
            disabled={loading}
            onClick={onClose}
            className="px-space-md h-11 rounded font-body-md font-semibold text-secondary hover:text-on-surface hover:bg-surface-container transition-colors disabled:opacity-50 cursor-pointer min-h-[44px]"
          >
            {cancelText}
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={onConfirm}
            className={`px-space-md h-11 rounded font-body-md font-bold text-on-primary transition-all active:scale-[0.98] disabled:opacity-50 flex items-center gap-2 cursor-pointer min-h-[44px] shadow-sm ${
              isDestructive
                ? 'bg-error hover:bg-error/90'
                : 'bg-primary hover:bg-primary-container'
            }`}
          >
            {loading && (
              <span className="material-symbols-outlined animate-spin text-[18px]">
                progress_activity
              </span>
            )}
            <span>{confirmText}</span>
          </button>
        </div>
      </div>
    </Modal>
  );
}
