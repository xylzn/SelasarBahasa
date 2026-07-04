'use client';

import { useState, createContext, useContext } from 'react';
import { X } from 'lucide-react';

type ConfirmDialogState = {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  onConfirm: () => void | Promise<void>;
  isLoading?: boolean;
};

const ConfirmDialogContext = createContext<{
  showDialog: (config: Omit<ConfirmDialogState, 'isOpen'>) => void;
} | null>(null);

export function ConfirmDialogProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ConfirmDialogState>({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Konfirmasi',
    cancelText: 'Batal',
    onConfirm: () => {},
    isLoading: false,
  });

  const showDialog = (config: Omit<ConfirmDialogState, 'isOpen'>) => {
    setState({ ...config, isOpen: true });
  };

  const closeDialog = () => {
    setState(prev => ({ ...prev, isOpen: false }));
  };

  const handleConfirm = async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      await state.onConfirm();
      closeDialog();
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  return (
    <ConfirmDialogContext.Provider value={{ showDialog }}>
      {children}
      {state.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 backdrop-blur-sm bg-black/40"
            onClick={closeDialog}
          />
          {/* Dialog */}
          <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">{state.title}</h3>
              <button
                onClick={closeDialog}
                className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                disabled={state.isLoading}
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            <div className="p-6">
              <p className="text-gray-600">{state.message}</p>
            </div>
            <div className="flex gap-3 p-6 pt-0 justify-end">
              <button
                onClick={closeDialog}
                className="px-5 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                disabled={state.isLoading}
              >
                {state.cancelText}
              </button>
              <button
                onClick={handleConfirm}
                className="px-5 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                disabled={state.isLoading}
              >
                {state.isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : null}
                {state.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmDialogContext.Provider>
  );
}

export function useConfirmDialog() {
  const context = useContext(ConfirmDialogContext);
  if (!context) {
    throw new Error('useConfirmDialog must be used within ConfirmDialogProvider');
  }
  return context;
}
