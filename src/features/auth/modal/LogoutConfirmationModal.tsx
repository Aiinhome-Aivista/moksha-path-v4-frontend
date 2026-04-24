import React from 'react';
import { createPortal } from 'react-dom';
import { X, LogOut } from 'lucide-react';

interface LogoutConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

export const LogoutConfirmationModal: React.FC<LogoutConfirmationModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
}) => {
    if (!isOpen) return null;

    const [isLoggingOut, setIsLoggingOut] = React.useState(false);

    const handleConfirm = async () => {
        setIsLoggingOut(true);
        await onConfirm();
        setIsLoggingOut(false);
    };

// Prevent background scroll when modal is open
    React.useEffect(() => {
        if (isOpen) {
            document.body.style.setProperty("overflow", "hidden", "important");
            document.documentElement.style.setProperty("overflow", "hidden", "important");
        } else {
            document.body.style.removeProperty("overflow");
            document.documentElement.style.removeProperty("overflow");
        }
        return () => {
            document.body.style.removeProperty("overflow");
            document.documentElement.style.removeProperty("overflow");
        };
    }, [isOpen]);

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overscroll-contain">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity touch-none"
            />

            {/* Modal Content */}
            <div className="relative w-full max-w-sm bg-white dark:bg-secondary-900 rounded-3xl shadow-2xl transform transition-all overflow-hidden border border-secondary-100 dark:border-secondary-800">
                {/* Header */}
                <div className="relative px-6 pt-6 pb-2 text-center">
                    <div className="mx-auto w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
                        <LogOut className="w-6 h-6 text-red-600 dark:text-red-400" />
                    </div>

                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        Sign Out
                    </h2>

                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                        Are you sure you want to sign out of your account?
                    </p>

                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Footer / Actions */}
                <div className="p-6 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-secondary-700 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-secondary-800 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={isLoggingOut}
                        className={`flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 shadow-lg shadow-red-600/20 transition-all hover:scale-[1.02] ${isLoggingOut ? "opacity-70 cursor-not-allowed" : ""}`}
                    >
                        {isLoggingOut ? "Signing Out..." : "Sign Out"}
                    </button>
                </div>
            </div>
        </div>
        , document.body
    );
};
