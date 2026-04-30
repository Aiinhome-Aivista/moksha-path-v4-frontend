import React from 'react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onCancel}
      />
      
      {/* Modal Card - Styled with the home page / auth theme */}
      <div className="relative auth-card shadow-2xl w-full max-w-md animate-in fade-in zoom-in-95 duration-200" style={{ margin: 0 }}>
        <div className="text-center flex flex-col items-center">
            <div className="auth-card__eyebrow" style={{ justifyContent: 'center', width: '100%', marginBottom: '1rem' }}>
              <span className="accent-sanskrit">सावधान</span>
              <span className="auth-eb-en">Attention</span>
            </div>
            
            <h3 className="auth-card__title" style={{ fontSize: '1.75rem', marginBottom: '0.75rem' }}>
                {title}
            </h3>
            <p className="auth-card__lede" style={{ marginBottom: '2rem' }}>
                {message}
            </p>
            
            <div className="cta-row" style={{ justifyContent: 'center', width: '100%' }}>
                <button
                    onClick={onCancel}
                    className="btn btn-ghost"
                >
                    {cancelText}
                </button>
                <button
                    onClick={onConfirm}
                    className="btn btn-primary"
                >
                    {confirmText}
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
