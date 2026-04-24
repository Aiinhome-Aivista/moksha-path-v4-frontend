import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { X } from "lucide-react";
import ApiServices from "../../../services/ApiServices";
import { useToast } from "../../../app/providers/ToastProvider";

interface Option {
  label: string;
  text: string;
}

interface Question {
  id: number;
  question: string;
  options: Option[];
  correctAnswer: string;
  sl_no?: number;
}

// API Question format
interface ApiQuestion {
  question_id: number;
  question_text: string;
  question_type: "MCQ" | "TrueFalse" | "Textual";
  options: Record<string, string> | null;
  difficulty: string;
  marks: number;
  sl_no: number;
}

// Transform API question to internal format
const transformApiQuestion = (apiQuestion: ApiQuestion): Question => {
  let options: Option[] = [];

  if (apiQuestion.question_type === "MCQ" && apiQuestion.options) {
    options = Object.entries(apiQuestion.options).map(([key, value]) => ({
      label: key.toUpperCase(),
      text: value,
    }));
  } else if (apiQuestion.question_type === "TrueFalse") {
    options = [
      { label: "A", text: "True" },
      { label: "B", text: "False" },
    ];
  }
  // Textual questions don't have options

  return {
    id: apiQuestion.question_id,
    question: apiQuestion.question_text,
    options,
    correctAnswer: "", // Will be validated server-side
    sl_no: apiQuestion.sl_no,
  };
};

interface TestModalProps {
  isOpen: boolean;
  onClose: () => void;
  testDurationMinutes?: number;
  assessmentDetails?: any;
  attemptId?: number | null;
  assignmentId?: number;
  onComplete?: (result: {
    totalQuestions: number;
    answered: number;
    correct: number;
    incorrect: number;
    skipped: number;
    score: number;
    maxScore: number;
    timeTaken: string;
    percentage: number;
  }) => void;
}

const TestModal: React.FC<TestModalProps> = ({
  isOpen,
  onClose,
  testDurationMinutes = 30,
  assessmentDetails,
  attemptId,
  assignmentId: _assignmentId,
  onComplete,
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questionOrder, setQuestionOrder] = useState<number[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<number, string>
  >({});
  const [textualAnswers, setTextualAnswers] = useState<
    Record<number, string>
  >({});
  const [timeLeft, setTimeLeft] = useState(testDurationMinutes * 60);
  const [testFinished, setTestFinished] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const questionStartTimeRef = useRef<number>(Date.now());
  const { showToast } = useToast();

  // Transform API questions to internal format (memoized to prevent infinite re-renders)
  const questions = useMemo(() => {
    return assessmentDetails?.questions
      ? assessmentDetails.questions.map((q: ApiQuestion) =>
        transformApiQuestion(q),
      )
      : [];
  }, [assessmentDetails]);

  // Reset on open
  useEffect(() => {
    if (isOpen) {
      setCurrentQuestionIndex(0);
      setQuestionOrder(questions.map((q: Question) => q.id));
      setSelectedAnswers({});
      setTextualAnswers({});
      setTimeLeft(testDurationMinutes * 60);
      setTestFinished(false);
      questionStartTimeRef.current = Date.now();
    }
  }, [isOpen, testDurationMinutes, questions]);

  // Track question start time when question changes
  useEffect(() => {
    questionStartTimeRef.current = Date.now();
  }, [currentQuestionIndex]);

  // Countdown timer
  useEffect(() => {
    if (!isOpen || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen, timeLeft]);

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

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const secs = (seconds % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  }, []);

  const finishAssessmentAndShowResult = useCallback(async () => {
    if (testFinished || !attemptId) return;
    setTestFinished(true);

    try {
      const response = await ApiServices.finishAssessment({
        attempt_id: attemptId,
      });

      if (response.data?.status === "success") {
        const resultData = response.data.data;
        const elapsed = testDurationMinutes * 60 - timeLeft;
        const mins = Math.floor(elapsed / 60);
        const secs = elapsed % 60;
        const timeTaken = `${mins}m ${secs}s`;

        const result = {
          totalQuestions: resultData.total_questions,
          answered: resultData.attempted_count,
          correct: resultData.correct_answers || 0,
          incorrect: resultData.incorrect_answers || 0,
          skipped: resultData.skipped_answers || 0,
          score: resultData.score_obtained,
          maxScore: resultData.total_marks,
          timeTaken,
          percentage: resultData.percentage,
        };

        showToast(response.data.message || "Assessment completed!", "success");
        onClose();
        if (onComplete) {
          onComplete(result);
        }
      }
    } catch (error: any) {
      showToast(
        error.response?.data?.message || "Failed to submit assessment",
        "error",
      );
    }
  }, [
    attemptId,
    timeLeft,
    testDurationMinutes,
    onClose,
    onComplete,
    testFinished,
    showToast,
  ]);

  // Auto-submit when time runs out
  useEffect(() => {
    if (isOpen && timeLeft === 0 && !testFinished) {
      finishAssessmentAndShowResult();
    }
  }, [isOpen, timeLeft, testFinished, finishAssessmentAndShowResult]);

  if (!isOpen || questionOrder.length === 0) return null;

  const currentQuestionId = questionOrder[currentQuestionIndex];
  const currentQuestion = questions.find(
    (q: Question) => q.id === currentQuestionId,
  );

  // Fallback while useEffect synchronizes questionOrder
  if (!currentQuestion) return null;

  const isTextualQuestion = currentQuestion.options.length === 0;
  const totalQuestions = questionOrder.length;
  const answeredCount = isTextualQuestion
    ? Object.keys(textualAnswers).length + Object.keys(selectedAnswers).length
    : Object.keys(selectedAnswers).length + Object.keys(textualAnswers).length;
  const completedPercent = Math.round((answeredCount / totalQuestions) * 100);

  // Timer circle progress (For Desktop only now)
  const totalTime = testDurationMinutes * 60;
  const timerProgress = timeLeft / totalTime;
  const circumference = 2 * Math.PI * 70;
  const strokeDashoffset = circumference * (1 - timerProgress);

  const handleSelectOption = (optionLabel: string) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: optionLabel,
    }));
  };

  const handleTextualAnswer = (text: string) => {
    setTextualAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: text,
    }));
  };

  const handleSkip = () => {
    setQuestionOrder((prev) => {
      const newOrder = [...prev];
      const [skipped] = newOrder.splice(currentQuestionIndex, 1);
      newOrder.push(skipped);
      return newOrder;
    });
  };

  const handleSubmit = async () => {
    if (isSubmitting || !attemptId) return;

    const answer = isTextualQuestion
      ? textualAnswers[currentQuestion.id]
      : selectedAnswers[currentQuestion.id];

    if (!answer) {
      showToast("Please select or enter an answer", "error");
      return;
    }

    const timeTaken = Math.floor(
      (Date.now() - questionStartTimeRef.current) / 1000,
    );

    const apiQuestion = assessmentDetails?.questions?.find(
      (q: ApiQuestion) => q.question_id === currentQuestion.id,
    );
    const slNo = apiQuestion?.sl_no || currentQuestionIndex + 1;

    setIsSubmitting(true);

    try {
      await ApiServices.saveAssessmentAnswer({
        attempt_id: attemptId,
        question_id: currentQuestion.id,
        sl_no: slNo,
        answer: answer,
        time_taken: timeTaken,
      });

      if (currentQuestionIndex < totalQuestions - 1) {
        setCurrentQuestionIndex((prev) => prev + 1);
      } else {
        await finishAssessmentAndShowResult();
      }
    } catch (error: any) {
      showToast(
        error.response?.data?.message || "Failed to save answer",
        "error",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuit = () => setShowExitConfirm(true);
  const handleConfirmExit = async () => {
    setShowExitConfirm(false);
    await finishAssessmentAndShowResult();
  };
  const handleCancelExit = () => setShowExitConfirm(false);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 overscroll-contain">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity touch-none" />

      {/* Modal Container */}
      <div className="relative w-full max-w-[850px] bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col max-h-[95vh] sm:max-h-[90vh]">

        {/* Close button */}
        <button
          onClick={handleQuit}
          className="absolute top-5 right-4 z-20 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors bg-white/50 backdrop-blur-sm sm:bg-transparent sm:backdrop-blur-none"
        >
          <X size={20} />
        </button>

        {/* ─── Mobile Header: Timer + Progress (Hidden on Desktop) ─── */}
        <div className="md:hidden flex flex-row items-center gap-4 p-4 sm:p-5 border-b border-gray-100 shrink-0">
          {/* Mobile Timer Badge */}
          <div className="w-[52px] h-[52px] rounded-full border-[3px] border-[#E91E7B] flex items-center justify-center shrink-0">
            <span className="text-[#E91E7B] font-bold text-sm tracking-tight">
              {formatTime(timeLeft)}
            </span>
          </div>

          {/* Mobile Progress Bar */}
          <div className="flex-1 pr-8">
            <p className="text-xs font-bold text-gray-800 mb-1.5">
              Completed {completedPercent}%
            </p>
            <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#b0cb1f] transition-all duration-300"
                style={{ width: `${completedPercent}%` }}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row min-h-0 sm:min-h-[420px] flex-1 overflow-hidden">
          {/* ─── Desktop Left Panel: Timer + Progress (Hidden on Mobile) ─── */}
          <div className="hidden md:flex w-[260px] bg-[#f2f2f2] flex-col items-center justify-between py-8 px-6 shrink-0 z-10 border-r border-gray-200">
            {/* Desktop Circular Timer */}
            <div className="flex flex-col items-center mt-4 shrink-0">
              <div className="relative w-[170px] h-[170px]">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
                  <circle cx="80" cy="80" r="70" fill="none" stroke="#e8e8e8" strokeWidth="8" />
                  <circle
                    cx="80" cy="80" r="70" fill="none" stroke="#E91E7B" strokeWidth="8"
                    strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
                    className="transition-all duration-1000 ease-linear"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-bold text-[#E91E7B] tracking-wider font-mono">
                    {formatTime(timeLeft)}
                  </span>
                  <span className="text-xs text-gray-400 mt-1">left until break</span>
                </div>
              </div>
            </div>

            {/* Desktop Progress bar */}
            <div className="w-full mt-auto flex flex-col justify-center">
              <p className="text-sm font-semibold text-gray-700 mb-1.5">
                Completed {completedPercent}%
              </p>
              <div className="w-full h-2 bg-gray-300 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#b0cb1f] rounded-full transition-all duration-300"
                  style={{ width: `${completedPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* ─── Right Panel: Question Area ─── */}
          <div className="flex-1 flex flex-col p-5 sm:p-8 overflow-y-auto">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 pr-8 sm:pr-0">
              Header
            </h2>

            <p className="text-base sm:text-sm font-bold text-gray-800 mb-5 leading-relaxed">
              Q
              {currentQuestion.sl_no ??
                questions.findIndex((q: Question) => q.id === currentQuestion.id) + 1}
              . {currentQuestion.question}
            </p>

            {isTextualQuestion ? (
              <div className="mb-auto shrink-0">
                <textarea
                  value={textualAnswers[currentQuestion.id] || ""}
                  onChange={(e) => handleTextualAnswer(e.target.value)}
                  placeholder="Enter your answer here..."
                  className="w-full h-32 sm:h-40 px-4 py-3 border border-gray-300 rounded-xl text-base sm:text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#b0cb1f] focus:border-[#b0cb1f] transition-all"
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 sm:gap-y-4 mb-auto shrink-0">
                {currentQuestion.options.map((option: Option) => {
                  const isSelected = selectedAnswers[currentQuestion.id] === option.label;
                  return (
                    <button
                      key={option.label}
                      onClick={() => handleSelectOption(option.label)}
                      className="flex items-start sm:items-center gap-3 text-left group p-2 sm:p-0 -mx-2 sm:mx-0 rounded-lg hover:bg-gray-50 sm:hover:bg-transparent transition-colors"
                    >
                      <div
                        className={`w-5 h-5 sm:w-6 sm:h-6 mt-0.5 sm:mt-0 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${isSelected
                          ? "bg-[#b0cb1f] border-[#b0cb1f]"
                          : "border-gray-300 bg-white group-hover:border-[#b0cb1f]"
                          }`}
                      >
                        {isSelected && (
                          <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <span className="text-base sm:text-sm text-gray-700 font-medium">
                        {option.label}. {option.text}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* ─── Action Buttons ─── */}
            <div className="flex flex-col md:flex-row items-center gap-3 md:gap-0 mt-6 sm:mt-8 pt-4 border-t border-gray-100 sm:border-transparent shrink-0 w-full">
              {/* Flex order adjusts so Mobile displays vertically: Submit -> Skip -> Quit */}
              <button
                onClick={handleQuit}
                disabled={isSubmitting}
                className="order-3 md:order-1 w-full md:w-auto px-6 py-3 md:py-2.5 rounded-full bg-[#464646] text-white text-base md:text-sm font-medium hover:bg-[#333] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Quit
              </button>

              <div className="order-1 md:order-2 flex flex-col md:flex-row w-full md:w-auto md:ml-auto gap-3">
                <button
                  onClick={handleSkip}
                  disabled={isSubmitting}
                  className="order-2 md:order-1 w-full md:w-auto px-6 py-3 md:py-2.5 rounded-full bg-[#464646] text-white text-base md:text-sm font-medium hover:bg-[#333] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Skip for now
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="order-1 md:order-2 w-full md:w-auto px-6 py-3 md:py-2.5 rounded-full bg-[#b0cb1f] text-gray-900 text-base md:text-sm font-semibold hover:bg-[#c5de3a] transition-all sm:hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:sm:hover:scale-100"
                >
                  {isSubmitting ? "Submitting..." : "Submit"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Exit Confirmation Dialog */}
      {showExitConfirm && (
        <div className="absolute inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={handleCancelExit} />
          <div className="relative bg-white rounded-2xl p-5 sm:p-6 max-w-md w-full shadow-2xl animate-[fadeIn_0.15s_ease-out]">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Quit Assessment?</h3>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to Quit? Your assessment will be submitted
              and you won't be able to continue.
            </p>
            <div className="flex flex-col-reverse sm:flex-row gap-3 justify-end">
              <button
                onClick={handleCancelExit}
                className="w-full sm:w-auto px-5 py-2.5 sm:py-2 rounded-full bg-gray-200 text-gray-700 text-base sm:text-sm font-medium hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmExit}
                className="w-full sm:w-auto px-5 py-2.5 sm:py-2 rounded-full bg-[#E91E7B] text-white text-base sm:text-sm font-medium hover:bg-[#d11a6d] transition-colors"
              >
                Quit & Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestModal;