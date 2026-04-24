import React from "react";
import { X } from "lucide-react";
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
  message = "The assessment has been successfully assigned.",
}) => {
  if (!isOpen || !data) return null;

  const isSuccess = status === "success";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-gray-500 hover:text-gray-700"
        >
          <X size={20} />
        </button>
        <div className="flex items-center justify-center mb-4">
          <div className={`w-12 h-12 rounded-full ${isSuccess ? 'bg-green-100' : 'bg-red-100'} flex items-center justify-center`}>
            {isSuccess ? (
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
          </div>
        </div>
        <h2 className="text-xl font-bold mb-2 text-center text-gray-900">
          {isSuccess ? "Assessment Created!" : "Assessment Failed!"}
        </h2>
        <p className={`text-sm text-center mb-4 ${isSuccess ? 'text-gray-500' : 'text-red-500'}`}>
          {message}
        </p>
        <div className="space-y-2 text-sm text-gray-700 bg-gray-50 rounded-lg p-4">
          <div className="flex justify-between">
            <span className="font-medium">Test Name:</span>
            <span>{data.test_name || "Not entered"}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Subject:</span>
            <span>{data.subject || "Not selected"}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Chapters:</span>
            <span>{data.chapter_ids.length} selected</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Topics:</span>
            <span>{data.topic_ids.length} selected</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Questions:</span>
            <span>{data.questions}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Time Limit:</span>
            <span>{data.timeLimit} min</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Difficulty:</span>
            <span>{data.difficulty || "Not selected"}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Due Date:</span>
            <span>
              {data.due_date
                ? new Date(data.due_date).toLocaleDateString("en-IN", {
                  dateStyle: "medium",
                })
                : "Not selected"}
            </span>
          </div>
        </div>
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-[#b0cb1f] text-gray-900 rounded-full text-sm font-semibold hover:bg-[#c5de3a] transition-all"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default TestSummaryModal;
