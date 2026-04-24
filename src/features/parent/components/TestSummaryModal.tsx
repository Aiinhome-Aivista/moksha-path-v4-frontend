import React from "react";
import { X, CheckCircle, AlertCircle } from "lucide-react";
import type { GeneratorData } from "./TestGeneratorModal";

interface TestSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: GeneratorData | null;
  status?: "success" | "error";
  message?: string;
}

const TestSummaryModal: React.FC<TestSummaryModalProps> = ({
  isOpen,
  onClose,
  data,
  status = "success",
  message = "Assessment created successfully!",
}) => {
  if (!isOpen || !data) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-gray-500 hover:text-gray-700"
        >
          <X size={20} />
        </button>

        <div className="flex flex-col items-center mb-6">
          {status === "success" ? (
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="text-green-500 w-8 h-8" />
            </div>
          ) : (
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="text-red-500 w-8 h-8" />
            </div>
          )}
          <h2 className={`text-xl font-bold text-center ${status === "success" ? "text-green-600" : "text-red-500"}`}>
            {status === "success" ? "Success!" : "Action Failed"}
          </h2>
          <p className="text-sm text-gray-500 text-center mt-2 px-4">
            {message}
          </p>
        </div>

        {status === "success" && (
          <div className="bg-gray-50 rounded-xl p-4 space-y-3 mb-6">
            <h3 className="text-sm font-bold text-gray-800 border-b pb-2 mb-2">Test Details</h3>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Test Name:</span>
              <span className="font-semibold text-gray-800">{data.test_name || "N/A"}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Subject:</span>
              <span className="font-semibold text-gray-800">{data.subject || "N/A"}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Children:</span>
              <span className="font-semibold text-gray-800">{data.student_ids?.length || 0} selected</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Questions:</span>
              <span className="font-semibold text-[#b0cb1f]">{data.questions}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Duration:</span>
              <span className="font-semibold text-[#b0cb1f]">{data.timeLimit} min</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Due Date:</span>
              <span className="font-semibold text-gray-800">
                {data.due_date ? new Date(data.due_date).toLocaleDateString() : "N/A"}
              </span>
            </div>
          </div>
        )}

        <div className="flex justify-center">
          <button
            onClick={onClose}
            className="px-8 py-2.5 bg-gray-900 text-white rounded-full text-sm font-semibold hover:bg-gray-800 transition-colors w-full"
          >
            {status === "success" ? "Done" : "Close"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TestSummaryModal;
