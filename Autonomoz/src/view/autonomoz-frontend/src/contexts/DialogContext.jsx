import { createContext, useContext, useState, useRef } from 'react';
import ConfirmDialog from '../components/ui/ConfirmDialog';

export const DialogContext = createContext(null);

export function DialogProvider({ children }) {
  const [dialogConfig, setDialogConfig] = useState(null);
  const [loading, setLoading] = useState(false);
  const resolveRef = useRef(null);

  const confirm = (options) => {
    return new Promise((resolve) => {
      resolveRef.current = resolve;
      setDialogConfig({
        title: options.title || 'Confirmação',
        message: options.message || 'Tem certeza que deseja prosseguir?',
        confirmText: options.confirmText || 'Confirmar',
        cancelText: options.cancelText || 'Cancelar',
        isDestructive: !!options.isDestructive,
      });
    });
  };

  const destructiveConfirm = (options) => {
    return confirm({
      title: options.title || 'Exclusão Crítica',
      message: options.message || 'Esta ação não pode ser desfeita. Confirmar exclusão?',
      confirmText: options.confirmText || 'Excluir',
      cancelText: options.cancelText || 'Cancelar',
      isDestructive: true,
      ...options,
    });
  };

  const handleClose = () => {
    if (resolveRef.current) {
      resolveRef.current(false);
    }
    setDialogConfig(null);
    setLoading(false);
  };

  const handleConfirm = async () => {
    if (resolveRef.current) {
      resolveRef.current(true);
    }
    setDialogConfig(null);
    setLoading(false);
  };

  return (
    <DialogContext.Provider value={{ confirm, destructiveConfirm }}>
      {children}
      {dialogConfig && (
        <ConfirmDialog
          isOpen={true}
          onClose={handleClose}
          onConfirm={handleConfirm}
          title={dialogConfig.title}
          message={dialogConfig.message}
          confirmText={dialogConfig.confirmText}
          cancelText={dialogConfig.cancelText}
          isDestructive={dialogConfig.isDestructive}
          loading={loading}
        />
      )}
    </DialogContext.Provider>
  );
}

export const useDialog = () => {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error('useDialog deve ser usado dentro de um DialogProvider');
  }
  return context;
};
