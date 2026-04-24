import React, { useState, useEffect, useMemo } from "react";
import { X } from "lucide-react";
// @ts-ignore
import ApiServices from "../../../services/ApiServices";
import { useToast } from "../../../app/providers/ToastProvider";

export interface TestDetails {
  testName: string;
  maximumMarks: number;
  totalQuestions: number;
  durationMinutes: number;
  difficultyLevel: string;
  dueDate: string;
}

interface TestDetailsFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (details: TestDetails) => void;
  subjectId?: number;
  subjectName?: string;
  chapterIds?: number[] | null;
  chapterNames?: string[];
  topicIds?: number[] | null; //  ADD
  topicNames?: string[];
}

const TestDetailsFormModal: React.FC<TestDetailsFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  subjectId,
  subjectName,
  chapterIds = null,
  chapterNames = [],
  topicIds,
  topicNames,
}) => {
  const { showToast } = useToast();
  const [form, setForm] = useState<TestDetails>({
    testName: "",
    maximumMarks: 0,
    totalQuestions: 0,
    durationMinutes: 0,
    difficultyLevel: "Mixed",
    dueDate: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestions = useMemo(() => {
    const list: string[] = [];

    if (topicNames?.length) {
      topicNames.forEach((t) => list.push(`${t} Test`));
      if (topicNames.length > 1) {
        list.push(`Mixed Topics Test (${subjectName || 'Custom'})`);
      }
    }

    if (chapterNames?.length) {
      chapterNames.forEach((c) => list.push(`${c} Test`));
      if (chapterNames.length > 1) {
        list.push(`Mixed Chapters Test (${subjectName || 'Custom'})`);
      }
    }

    if (subjectName) {
      list.push(`${subjectName} Practice Test`);
      list.push(`${subjectName} Full Test`);
    }

    return Array.from(new Set(list));
  }, [topicNames, chapterNames, subjectName]);

  const filteredSuggestions = useMemo(() => {
    if (!form.testName) return suggestions;
    const exactMatch = suggestions.find(s => s.toLowerCase() === form.testName.toLowerCase());
    if (exactMatch) return []; // Hide suggestions if exact match exists
    return suggestions.filter(s => s.toLowerCase().includes(form.testName.toLowerCase()));
  }, [form.testName, suggestions]);

  const handleTestNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Tab" && showSuggestions && filteredSuggestions.length > 0) {
      e.preventDefault();
      setForm((prev) => ({
        ...prev,
        testName: filteredSuggestions[0],
      }));
      setShowSuggestions(false);
    }
  };

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setForm({
        testName: suggestions[0] || "",
        maximumMarks: 0,
        totalQuestions: 0,
        durationMinutes: 0,
        difficultyLevel: "Mixed",
        dueDate: "",
      });
      setShowSuggestions(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Prevent background scroll (Bulletproof Mobile Fix)
  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY;
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";
      document.body.style.overflow = "hidden";
    } else {
      const scrollY = document.body.style.top;
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      document.body.style.overflow = "";
      window.scrollTo(0, parseInt(scrollY || "0", 10) * -1);
    }
    return () => {
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (field: keyof TestDetails, value: string | number) => {
    let newValue = value;

    if (field === "maximumMarks") {
      const numVal = Number(value);
      if (numVal > 300) newValue = 300;
      if (numVal < 0) newValue = 0;
    }

    if (field === "durationMinutes") {
      const numVal = Number(value);
      if (numVal > 180) newValue = 180;
      if (numVal < 0) newValue = 0;
    }

    setForm((prev) => ({ ...prev, [field]: newValue }));
  };

  const handleSubmit = async () => {
    if (!form.testName || !form.totalQuestions || !form.durationMinutes) return;

    // Get subject_id from prop or localStorage
    let finalSubjectId = subjectId;

    if (!finalSubjectId) {
      try {
        const storedData = localStorage.getItem("user_academic_details");
        if (storedData) {
          const academicDetails = JSON.parse(storedData);
          finalSubjectId =
            academicDetails.subject_ids?.[0] ||
            academicDetails.subjects?.[0]?.subject_id;
        }
      } catch (error) {
        // console.error(
        //   "Failed to parse academic details from localStorage:",
        //   error,
        // );
      }
    }

    if (!finalSubjectId) {
      showToast(
        "Subject information not available. Please try again.",
        "error",
      );
      return;
    }

    setIsSubmitting(true);

    try {
      // Format the due_date to match API format: "YYYY-MM-DD HH:mm:ss"
      let formattedDueDate = "";
      if (form.dueDate) {
        const date = new Date(form.dueDate);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");
        const seconds = "00";
        formattedDueDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
      }

      const payload = {
        subject_id: finalSubjectId,
        chapter_ids: chapterIds,
        test_name: form.testName,
        total_questions: form.totalQuestions,
        duration_minutes: form.durationMinutes,
        difficulty_level: form.difficultyLevel,
        due_date: formattedDueDate || undefined,
        topic_ids: topicIds,
      };

      const response = await ApiServices.assignSelfAssessment(payload);

      if (response.data?.status === "success") {
        showToast(
          response.data.message || "Test created successfully!",
          "success",
        );
        onSubmit(form);
        onClose();
      } else {
        showToast(response.data?.message || "Failed to create test", "error");
      }
    } catch (error: any) {
      // console.error("Test creation error:", error);
      showToast(
        error.response?.data?.message ||
        "Failed to create test. Please try again.",
        "error",
      );
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass =
    "w-full px-4 py-3 sm:py-2.5 border border-gray-200 rounded-xl text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#b0cb1f]/50 focus:border-[#b0cb1f] transition-all bg-white";
  const labelClass = "text-sm sm:text-xs text-gray-500 font-semibold mb-1 sm:mb-1.5 block";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 overscroll-contain">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity touch-none"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[95vh] sm:max-h-[90vh] overflow-hidden border border-gray-100">
        {/* Header */}
        <div className="relative p-4 sm:px-6 sm:pt-6 sm:pb-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">Create Test</h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                Fill in the test details
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-4 sm:px-6 sm:py-5 overflow-y-auto space-y-5 sm:space-y-4">
          {/* Show selected subject and chapters info if provided */}
          {subjectId && (
            <div className="bg-blue-50 border-l-4 border-blue-400 rounded-lg p-3 sm:p-4">
              <div className="text-sm text-blue-800">
                <p className="mb-1.5 sm:mb-2">
                  <span className="font-semibold">Test scope:</span>
                </p>
                <div className="ml-2 sm:ml-4 space-y-1 max-h-32 overflow-y-auto pr-2 custom-scrollbar">
                  {subjectName && (
                    <p>
                      • <span className="font-medium">Subject:</span>{" "}
                      {subjectName}
                    </p>
                  )}
                  {chapterNames && chapterNames.length > 0 && (
                    <div>
                      <p className="font-medium">
                        • Chapters ({chapterNames.length}):
                      </p>
                      <ul className="ml-4 sm:ml-6 mt-1 space-y-0.5">
                        {chapterNames.map((name, index) => (
                          <li key={index}>- {name}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {topicNames && topicNames.length > 0 && (
                    <div>
                      <p className="font-medium">
                        • Topics ({topicNames.length}):
                      </p>
                      <ul className="ml-4 sm:ml-6 mt-1 space-y-0.5">
                        {topicNames.map((name, index) => (
                          <li key={index}>- {name}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Row 1: Test Name and Total Marks */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-4">
            <div className="sm:col-span-2 relative">
              <label className={labelClass}>Test Name</label>
              <input
                type="text"
                value={form.testName}
                onChange={(e) => {
                  handleChange("testName", e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setShowSuggestions(false)}
                placeholder="e.g. Algebra Chapter 1 Practice"
                className={inputClass}
                onKeyDown={handleTestNameKeyDown}
              />
              {showSuggestions && filteredSuggestions.length > 0 && (
                <div className="absolute left-0 top-full mt-1 w-full max-h-40 overflow-y-auto bg-white border border-gray-200 rounded-xl shadow-lg z-50 py-1 custom-scrollbar">
                  {filteredSuggestions.map((s, i) => (
                    <div
                      key={i}
                      className="px-4 py-2 sm:py-1.5 text-sm sm:text-xs text-gray-700 hover:bg-gray-50 hover:text-[#b0cb1f] cursor-pointer transition-colors"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        handleChange("testName", s);
                        setShowSuggestions(false);
                      }}
                    >
                      {s}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div>
              <label className={labelClass}>Total Marks (Max 300)</label>
              <input
                type="number"
                min="0"
                max="300"
                value={form.maximumMarks || ""}
                onChange={(e) =>
                  handleChange("maximumMarks", Number(e.target.value))
                }
                placeholder="100"
                className={inputClass}
                onKeyDown={(e) => {
                  if (["-", "+", "e", "E", "."].includes(e.key)) {
                    e.preventDefault();
                  }
                }}
              />
            </div>
          </div>

          {/* Row 2: Total Questions, Duration, Difficulty Level */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-4">
            <div>
              <label className={labelClass}>Number of Questions</label>
              <input
                type="number"
                value={form.totalQuestions || ""}
                onChange={(e) =>
                  handleChange("totalQuestions", Number(e.target.value))
                }
                placeholder="10"
                className={inputClass}
                onKeyDown={(e) => {
                  if (["-", "+", "e", "E", "."].includes(e.key)) {
                    e.preventDefault();
                  }
                }}
              />
            </div>
            <div>
              <label className={labelClass}>Duration (Max 180 min)</label>
              <input
                type="number"
                min="0"
                max="180"
                value={form.durationMinutes || ""}
                onChange={(e) =>
                  handleChange("durationMinutes", Number(e.target.value))
                }
                placeholder="20"
                className={inputClass}
                onKeyDown={(e) => {
                  if (["-", "+", "e", "E", "."].includes(e.key)) {
                    e.preventDefault();
                  }
                }}
              />
            </div>
            <div>
              <label className={labelClass}>Difficulty Level</label>
              <select
                value={form.difficultyLevel}
                onChange={(e) =>
                  handleChange("difficultyLevel", e.target.value)
                }
                className={inputClass}
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
                <option value="Mixed">Mixed</option>
              </select>
            </div>
          </div>

          {/* Row 3: Due Date */}
          <div>
            <label className={labelClass}>Due Date</label>
            <input
              type="datetime-local"
              value={form.dueDate}
              onChange={(e) => handleChange("dueDate", e.target.value)}
              className={inputClass}
              min={new Date().toISOString().slice(0, 16)}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:px-6 sm:py-4 border-t border-gray-100 shrink-0 flex flex-col-reverse sm:flex-row gap-3">
          <button
            onClick={onClose}
            className="w-full sm:flex-1 px-4 py-3 sm:py-2.5 rounded-xl border border-gray-200 text-gray-700 text-base sm:text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={
              !form.testName ||
              !form.totalQuestions ||
              !form.durationMinutes ||
              isSubmitting
            }
            className={`w-full sm:flex-1 px-4 py-3 sm:py-2.5 rounded-xl text-base sm:text-sm font-medium transition-all hover:scale-[1.02] ${!form.testName ||
                !form.totalQuestions ||
                !form.durationMinutes ||
                isSubmitting
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-[#b0cb1f] text-gray-900 shadow-lg shadow-[#b0cb1f]/20 hover:bg-[#c5de3a]"
              }`}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-gray-400/30 border-t-gray-400 rounded-full animate-spin" />
                Creating...
              </span>
            ) : (
              "Create Test"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TestDetailsFormModal;