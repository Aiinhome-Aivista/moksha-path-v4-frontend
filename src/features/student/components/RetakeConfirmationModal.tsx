import React, { useEffect } from "react";
import { RefreshCw, AlertCircle } from "lucide-react";

interface RetakeConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    testName: string;
    isLoading?: boolean;
}

const RetakeConfirmationModal: React.FC<RetakeConfirmationModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    testName,
    isLoading = false,
}) => {
    // Prevent background scroll
    useEffect(() => {
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

    if (!isOpen) return null;
    const getTrimmedAssessmentName = (name: string): string => {
        return name.includes(" - ") ? name.split(" - ")[0] : name;
    };
      
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 relative animate-scale-in">
                {/* Icon */}
                <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-6">
                    <RefreshCw size={32} className="text-blue-500" />
                </div>

                {/* Title */}
                <h2 className="text-2xl font-bold text-gray-900 text-center mb-3">
                    Retake Assessment
                </h2>

                {/* Test Name */}
                <p className="text-lg font-semibold text-blue-600 text-center mb-4">
                    {getTrimmedAssessmentName(testName)}
                </p>

                {/* Info Message */}
                <div className="bg-amber-50 border-l-4 border-amber-400 rounded-lg p-4 mb-6">
                    <div className="flex gap-3">
                        <AlertCircle size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-amber-800">
                            <p className="font-semibold mb-1">Important Information:</p>
                            <ul className="list-disc list-inside space-y-1 ml-2">
                                <li>A new attempt will be created</li>
                                <li>Your previous score will be preserved</li>
                                <li>You'll need to complete the test again</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="flex-1 px-6 py-3 rounded-full border-2 border-gray-200 text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isLoading}
                        className="flex-1 px-6 py-3 rounded-full bg-[#b0cb1f] text-gray-900 font-semibold text-sm hover:bg-[#c5de3a] transition-all hover:scale-[1.02] shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                            <>
                                <span className="w-4 h-4 border-2 border-gray-900/30 border-t-gray-900 rounded-full animate-spin" />
                                Starting...
                            </>
                        ) : (
                            "Start Retake"
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RetakeConfirmationModal;
