import React from 'react';
import { AlertTriangle } from 'lucide-react';
import Modal from './Modal';

export const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed with this action? This cannot be undone.',
  confirmText = 'Delete',
  confirmVariant = 'danger',
  isLoading = false
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="max-w-md">
      <div className="flex flex-col items-center text-center">
        <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400 flex items-center justify-center mb-4">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-300 mb-6">{message}</p>
        
        <div className="flex items-center gap-3 w-full justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="btn-secondary flex-1 sm:flex-none justify-center"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`${confirmVariant === 'danger' ? 'btn-danger' : 'btn-primary'} flex-1 sm:flex-none justify-center`}
          >
            {isLoading ? 'Processing...' : confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmationModal;

