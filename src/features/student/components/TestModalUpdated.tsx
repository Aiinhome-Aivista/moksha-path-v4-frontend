import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
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
  type?: string;
  adaptive_level_code?: string;
  mapped_bucket?: string;
}

// API Question format
interface ApiQuestion {
  question_id: number;
  question_text: string;
  question_type: "Single-Choice MCQ" | "Multi-Choice MCQ";
  options: Record<string, string> | null;
  difficulty: string;
  marks: number;
  sl_no: number;
  adaptive_level_code?: string;
  mapped_bucket?: string;
}

// Transform API question to internal format
const transformApiQuestion = (apiQuestion: ApiQuestion): Question => {
  let options: Option[] = [];

  if (apiQuestion.options) {
    options = Object.entries(apiQuestion.options).map(([key, value]) => ({
      label: key.toUpperCase(),
      text: value as string,
    }));
  }

  return {
    id: apiQuestion.question_id,
    question: apiQuestion.question_text,
    options,
    correctAnswer: "", // Will be validated server-side
    sl_no: apiQuestion.sl_no,
    type: apiQuestion.question_type,
    adaptive_level_code: apiQuestion.adaptive_level_code,
    mapped_bucket: apiQuestion.mapped_bucket,
  };
};

interface TestModalProps {
  isOpen: boolean;
  onClose: () => void;
  testDurationMinutes?: number;
  assessmentDetails?: any;
  totalMarks?: number;
  attemptId?: number | null;
  assignmentId?: number;
  isAdaptive?: boolean;
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

const TestModalUpdated: React.FC<TestModalProps> = ({
  isOpen,
  onClose,
  testDurationMinutes,
  assessmentDetails,
  totalMarks,
  attemptId,
  assignmentId: _assignmentId,
  isAdaptive = false,
  onComplete,
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questionOrder, setQuestionOrder] = useState<number[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<number, string | string[]>
  >({});
  const [savedQuestions, setSavedQuestions] = useState<Set<number>>(new Set());
  const [skippedSet, setSkippedSet] = useState<Set<number>>(new Set());
  const [timeLeft, setTimeLeft] = useState((testDurationMinutes ?? 0) * 60);
  const [testFinished, setTestFinished] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [isCompleteFromServer, setIsCompleteFromServer] = useState(false);
  const questionStartTimeRef = useRef<number>(Date.now());
  const { showToast } = useToast();

  // Transform API questions to internal format (memoized to prevent infinite re-renders)
  const initialQuestions = useMemo(() => {
    return assessmentDetails?.questions
      ? assessmentDetails.questions.map((q: ApiQuestion) =>
        transformApiQuestion(q),
      )
      : [];
  }, [assessmentDetails]);

  const [localQuestions, setLocalQuestions] = useState<Question[]>(initialQuestions);

  // Sync localQuestions when initialQuestions change (e.g., when modal first opens)
  useEffect(() => {
    if (initialQuestions.length > 0) {
      // In adaptive mode, only sync if localQuestions is empty (initial load)
      if (!isAdaptive || localQuestions.length === 0) {
        setLocalQuestions(initialQuestions);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuestions, isAdaptive]);

  const questions = localQuestions;

  // Reset on open (only when isOpen changes from false to true)
  useEffect(() => {
    if (isOpen) {
      setCurrentQuestionIndex(0);
      if (initialQuestions.length > 0) {
        setLocalQuestions(initialQuestions);
        setQuestionOrder(initialQuestions.map((q: Question) => q.id));
      }
      setSelectedAnswers({});
      setSavedQuestions(new Set());
      setSkippedSet(new Set());
      setTimeLeft((testDurationMinutes ?? 0) * 60);
      setTestFinished(false);
      setIsCompleteFromServer(false);
      questionStartTimeRef.current = Date.now();
    }
  }, [isOpen, initialQuestions, testDurationMinutes]);

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
      let response;
      if (isAdaptive) {
        // Use adaptive specific finish API
        response = await ApiServices.finishAdaptiveAssessment({
          attempt_id: attemptId,
          subscription_id: localStorage.getItem("subscription_token"), // Assuming this is where it is
        });
      } else {
        // Original finish API
        response = await ApiServices.finishAssessment({
          attempt_id: attemptId,
        });
      }

      if (response.data?.status === "success" || response.data?.status === true) {
        const resultData = response.data.data;
        const elapsed = (testDurationMinutes ?? 0) * 60 - timeLeft;
        const mins = Math.floor(elapsed / 60);
        const secs = elapsed % 60;
        const timeTaken = `${mins}m ${secs}s`;

        const result = {
          totalQuestions: resultData.total_questions || 0,
          answered: resultData.attempted_count || 0,
          correct: resultData.correct_answers || 0,
          incorrect: resultData.incorrect_answers || 0,
          skipped: resultData.skipped_answers || 0,
          score: resultData.score_obtained || 0,
          maxScore: resultData.total_marks || 0,
          timeTaken,
          percentage: resultData.percentage || 0,
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
      setTestFinished(false); // Reset to allow retry
    }
  }, [
    attemptId,
    timeLeft,
    testDurationMinutes,
    onClose,
    onComplete,
    testFinished,
    showToast,
    isAdaptive,
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

  if (!currentQuestion) return null;

  // Progress Calculation: 
  // In adaptive mode, we increment 1 by 1. So if current is 2, total is 2 (2/2).
  const currentSlNo = currentQuestion.sl_no || (currentQuestionIndex + 1);
  const totalQuestions = (isAdaptive && totalMarks) ? totalMarks : (isAdaptive ? currentSlNo : questionOrder.length);
  const answeredCount = isAdaptive ? currentSlNo : savedQuestions.size;
  const completedPercent = isCompleteFromServer ? 100 : Math.round((answeredCount / totalQuestions) * 100);

  const handleSelectOption = (optionLabel: string) => {
    if (!currentQuestion) return;

    setSelectedAnswers((prev) => {
      const qType = currentQuestion.type;
      if (qType?.toLowerCase().includes("multi")) {
        const currentSelection = (prev[currentQuestion.id] as string[]) || [];
        const newSelection = currentSelection.includes(optionLabel)
          ? currentSelection.filter((l) => l !== optionLabel)
          : [...currentSelection, optionLabel];
        return { ...prev, [currentQuestion.id]: newSelection };
      } else {
        return { ...prev, [currentQuestion.id]: optionLabel };
      }
    });
    setSkippedSet(prev => {
      const newSet = new Set(prev);
      newSet.delete(currentQuestion.id);
      return newSet;
    });
  };



  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleSkip = async () => {
    if (isAdaptive) {
      if (isSubmitting || !attemptId) return;
      setIsSubmitting(true);

      const timeTaken = Math.floor((Date.now() - questionStartTimeRef.current) / 1000);
      const slNo = currentQuestion.sl_no || currentQuestionIndex + 1;

      try {
        // 1. Skip Adaptive Question
        const skipRes = await ApiServices.skipAssessmentQuestion({
          attempt_id: attemptId,
          question_id: currentQuestion.id,
          sl_no: slNo,
          time_taken: timeTaken,
        });

        if (skipRes.data?.status === "success" || skipRes.data?.status === true) {
          // 2. Load Next Question
          const nextRes = await ApiServices.getNextAdaptiveQuestion(attemptId);
          if (nextRes.data?.status === "success" || nextRes.data?.status === true) {
            const nextData = nextRes.data.data;
            if (nextData.is_complete) {
              setIsCompleteFromServer(true);
              setIsSubmitting(false); // Enable manual finish
            } else {
              const apiNext = {
                question_id: nextData.question_id,
                question_text: nextData.question_text,
                question_type: nextData.question_type as "Single-Choice MCQ" | "Multi-Choice MCQ",
                options: nextData.options,
                difficulty: nextData.difficulty,
                marks: nextData.marks,
                sl_no: nextData.sl_no,
                adaptive_level_code: nextData.adaptive_level_code,
                mapped_bucket: nextData.mapped_bucket,
              };
              const transformed = transformApiQuestion(apiNext);

              setLocalQuestions(prev => [...prev, transformed]);
              setQuestionOrder(prev => [...prev, transformed.id]);
              setSkippedSet(prev => new Set(prev).add(currentQuestion.id)); // Add previous question to skipped set
              setCurrentQuestionIndex(prev => prev + 1);

              showToast("Question skipped. Loading next...", "info");
              setIsSubmitting(false);
            }
          } else {
            showToast(nextRes.data?.message || "Failed to fetch next question", "error");
            setIsSubmitting(false);
          }
        } else {
          showToast(skipRes.data?.message || "Failed to skip question", "error");
          setIsSubmitting(false);
        }
      } catch (err) {
        showToast("Error processing skip", "error");
        setIsSubmitting(false);
      }
      return;
    }
    setSkippedSet((prev) => new Set(prev).add(currentQuestion.id));
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handleSubmit = async () => {
    if (isSubmitting || !attemptId) return;

    const currentSelection = selectedAnswers[currentQuestion.id];
    let answer = "";

    if (Array.isArray(currentSelection)) {
      const labels = currentSelection.map(l => l.toLowerCase()).sort().join(",");
      answer = `{${labels}}`;
    } else {
      answer = currentSelection ? `{${currentSelection.toLowerCase()}}` : "";
    }

    // On the last question, allow submitting without an answer. 
    // In adaptive mode, we also allow empty answer (which counts as a skip).
    if (!answer && !isAdaptive && currentQuestionIndex < totalQuestions - 1) {
      showToast("Please select or enter an answer to save and continue.", "error");
      return;
    }

    setIsSubmitting(true);

    // After attempting to save, decide the next step.
    if (isAdaptive) {
      const timeTaken = Math.floor(
        (Date.now() - questionStartTimeRef.current) / 1000,
      );
      const slNo = currentQuestion.sl_no || currentQuestionIndex + 1;

      const finalAnswer = answer;

      try {
        // 1. Save Adaptive Answer
        const saveRes = await ApiServices.saveAdaptiveAnswer({
          attempt_id: attemptId,
          question_id: currentQuestion.id,
          sl_no: slNo,
          answer: finalAnswer,
          time_taken: timeTaken,
        });

        if (saveRes.data?.status === "success" || saveRes.data?.status === true) {
          // 2. Load Next Question
          const nextRes = await ApiServices.getNextAdaptiveQuestion(attemptId);
          if (nextRes.data?.status === "success" || nextRes.data?.status === true) {
            const nextData = nextRes.data.data;
            if (nextData.is_complete) {
              setIsCompleteFromServer(true);
              setIsSubmitting(false); // Enable manual finish
            } else {
              const apiNext = {
                question_id: nextData.question_id,
                question_text: nextData.question_text,
                question_type: nextData.question_type as "Single-Choice MCQ" | "Multi-Choice MCQ",
                options: nextData.options,
                difficulty: nextData.difficulty,
                marks: nextData.marks,
                sl_no: nextData.sl_no,
                adaptive_level_code: nextData.adaptive_level_code,
                mapped_bucket: nextData.mapped_bucket,
              };
              const transformed = transformApiQuestion(apiNext);

              setLocalQuestions(prev => [...prev, transformed]);
              setQuestionOrder(prev => [...prev, transformed.id]);
              setCurrentQuestionIndex(prev => prev + 1);

              showToast("Next question loaded", "success");
              setIsSubmitting(false);
            }
          } else {
            showToast(nextRes.data?.message || "Failed to fetch next question", "error");
            setIsSubmitting(false);
          }
        } else {
          showToast(saveRes.data?.message || "Failed to save answer", "error");
          setIsSubmitting(false);
        }
      } catch (err) {
        showToast("Error processing next question", "error");
        setIsSubmitting(false);
      }
      return;
    }

    // ORIGINAL (NON-ADAPTIVE) LOGIC BELOW
    // If an answer was provided (for any question, including the last), save it.
    if (answer) {
      const timeTaken = Math.floor(
        (Date.now() - questionStartTimeRef.current) / 1000,
      );
      const apiQuestion = assessmentDetails?.questions?.find(
        (q: ApiQuestion) => q.question_id === currentQuestion.id,
      );
      const slNo = apiQuestion?.sl_no || currentQuestionIndex + 1;

      try {
        await ApiServices.saveAssessmentAnswer({
          attempt_id: attemptId,
          question_id: currentQuestion.id,
          sl_no: slNo,
          answer: answer,
          time_taken: timeTaken,
        });

        setSavedQuestions((prev) => new Set(prev).add(currentQuestion.id));
        setSkippedSet(prev => {
          const newSet = new Set(prev);
          newSet.delete(currentQuestion.id);
          return newSet;
        });
      } catch (error: any) {
        showToast(
          error.response?.data?.message || "Failed to save answer",
          "error",
        );
        setIsSubmitting(false); // Reset on failure
        return;
      }
    }

    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setIsSubmitting(false);
    } else {
      // This is the last question, so finish the assessment.
      await finishAssessmentAndShowResult();
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
      <div className="relative w-[98vw] max-w-[1300px] h-[90vh] bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col">

        {/* Close button */}
        <button
          onClick={handleQuit}
          className="absolute top-5 right-4 z-20 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors bg-white/50 backdrop-blur-sm sm:bg-transparent sm:backdrop-blur-none"
        >
          <X size={20} />
        </button>

        {/* ─── Mobile Header: Timer + Progress (Hidden on Desktop) ─── */}
        <div className="md:hidden flex flex-col gap-3 p-4 sm:p-5 border-b border-gray-100 shrink-0">
          <div className="flex flex-row items-center gap-4">
            <div className="px-4 py-2 max-h-[15px] rounded-xl bg-pink-50 border border-pink-100 flex items-center justify-center shrink-0">
              <span className="text-[#E91E7B] font-bold text-lg tracking-tight">
                {formatTime(timeLeft)}
              </span>
            </div>
            <div className="flex-1 pr-8">
              <div className="flex justify-between items-end mb-1.5">
                <p className="text-xs font-bold text-gray-800">Completed</p>
                <p className="text-xs font-bold text-primary">{answeredCount} / {totalQuestions}</p>
              </div>
              <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#b0cb1f] transition-all duration-300"
                  style={{ width: `${completedPercent}%` }}
                />
              </div>
            </div>
          </div>
          {/* Mobile Skipped Questions Palette */}
          {skippedSet.size > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-1 items-center">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Skipped:</span>
              {Array.from(skippedSet).map(id => {
                const qIndex = questionOrder.indexOf(id);
                const slNo = questions.find((q: Question) => q.id === id)?.sl_no || qIndex + 1;
                return (
                  <button
                    key={id}
                    onClick={() => setCurrentQuestionIndex(qIndex)}
                    className="w-6 h-6 shrink-0 rounded bg-amber-100 text-amber-700 font-bold text-[10px] flex items-center justify-center border border-amber-200 hover:bg-amber-200 transition-colors"
                  >
                    {slNo}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
          {/* ─── Desktop Left Panel: Timer + Progress (Hidden on Mobile) ─── */}
          <div className="hidden md:flex w-[260px] bg-[#f2f2f2] flex-col items-center justify-between py-8 px-6 shrink-0 z-10 border-r border-gray-200">
            {/* Desktop Timer (No Circle) */}
            <div className="flex flex-col items-center mt-4 w-full shrink-0">
              <div className="bg-white px-6 py-8 rounded-2xl border border-gray-100 shadow-sm w-full text-center">
                <span className="text-2xl font-bold text-[#E91E7B] tracking-wider font-mono block">
                  {formatTime(timeLeft)}
                </span>
                <span className="text-[10px] text-gray-400 mt-2 uppercase tracking-widest font-bold block">
                  Time Remaining
                </span>
              </div>
              {/* Adaptive Level and Bucket */}
              {currentQuestion.adaptive_level_code && (
                <div className="bg-white px-4 py-4 rounded-2xl border border-gray-100 shadow-sm w-full text-center mt-4">
                  <div className="text-sm font-semibold text-gray-700 mb-2">Adaptive Level</div>
                  <span className="text-lg font-bold text-[#b0cb1f]">{currentQuestion.adaptive_level_code}</span>
                </div>
              )}
              {currentQuestion.mapped_bucket && (
                <div className="bg-white px-4 py-4 rounded-2xl border border-gray-100 shadow-sm w-full text-center mt-4">
                  <div className="text-sm font-semibold text-gray-700 mb-2">Mapped Bucket</div>
                  <span className="text-lg font-bold text-[#E91E7B]">{currentQuestion.mapped_bucket}</span>
                </div>
              )}
            </div>

            {/* Desktop Progress & Skipped Palette */}
            <div className="w-full mt-auto flex flex-col justify-center">
              {/* Skipped Palette */}
              {skippedSet.size > 0 && (
                <div className="mb-6 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                  <p className="text-[10px] uppercase tracking-widest font-bold text-amber-600 mb-3">Skipped Questions</p>
                  <div className="flex flex-wrap gap-2">
                    {Array.from(skippedSet).map(id => {
                      const qIndex = questionOrder.indexOf(id);
                      const slNo = questions.find((q: Question) => q.id === id)?.sl_no || qIndex + 1;
                      return (
                        <button
                          key={id}
                          onClick={() => setCurrentQuestionIndex(qIndex)}
                          className="w-7 h-7 rounded bg-amber-50 text-amber-600 font-bold text-xs flex items-center justify-center border border-amber-200 hover:bg-amber-100 transition-colors cursor-pointer"
                        >
                          {slNo}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="flex justify-between items-end mb-1.5">
                <p className="text-sm font-semibold text-gray-700">Progress</p>
                <p className="text-sm font-bold text-primary">{answeredCount} / {totalQuestions}</p>
              </div>
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
              Assessment
            </h2>

            <p className="text-base sm:text-sm font-bold text-gray-800 mb-5 leading-relaxed">
              Q
              {currentQuestion.sl_no ??
                questions.findIndex((q: Question) => q.id === currentQuestion.id) + 1}
              . {currentQuestion.question}
            </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 sm:gap-y-4 mb-auto shrink-0">
                {currentQuestion.options && currentQuestion.options.map((option: Option) => {
                  const isSelected = Array.isArray(selectedAnswers[currentQuestion.id])
                    ? (selectedAnswers[currentQuestion.id] as string[]).includes(option.label)
                    : selectedAnswers[currentQuestion.id] === option.label;
                  const isMultiple = currentQuestion.type?.toLowerCase().includes("multi");

                  return (
                    <button
                      key={option.label}
                      onClick={() => handleSelectOption(option.label)}
                      className="flex items-start sm:items-center gap-3 text-left group p-2 sm:p-0 -mx-2 sm:mx-0 rounded-lg hover:bg-gray-50 sm:hover:bg-transparent transition-colors"
                    >
                      <div
                        className={`w-5 h-5 sm:w-6 sm:h-6 mt-0.5 sm:mt-0 flex items-center justify-center shrink-0 transition-all ${isMultiple ? "rounded-md" : "rounded-full"} border-2 ${isSelected
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

            {/* ─── Action Buttons ─── */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-3 mt-6 sm:mt-8 pt-4 border-t border-gray-100 sm:border-transparent shrink-0 w-full">
              <button
                onClick={handleQuit}
                disabled={isSubmitting}
                className="order-3 md:order-1 w-full md:w-auto px-6 py-3 md:py-2.5 rounded-full bg-[#464646] text-white text-base md:text-sm font-medium hover:bg-[#333] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Quit
              </button>

              <div className="order-2 md:order-2 flex gap-3 w-full md:w-auto justify-center">
                <button
                  onClick={handlePrev}
                  disabled={currentQuestionIndex === 0 || isSubmitting}
                  className="flex items-center gap-1 w-full md:w-auto px-6 py-3 md:py-2.5 rounded-full bg-[#464646] text-white text-base md:text-sm font-medium hover:bg-[#333] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={16} /> Previous
                </button>
                <button
                  onClick={handleNext}
                  disabled={currentQuestionIndex === questions.length - 1 || isSubmitting}
                  className="flex items-center gap-1 w-full md:w-auto px-6 py-3 md:py-2.5 rounded-full bg-[#464646] text-white text-base md:text-sm font-medium hover:bg-[#333] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Next <ChevronRight size={16} />
                </button>
              </div>

              <div className="order-1 md:order-3 flex flex-col md:flex-row w-full md:w-auto gap-3">
                <button
                  onClick={handleSkip}
                  disabled={isSubmitting}
                  className="w-full md:w-auto px-6 py-3 md:py-2.5 rounded-full bg-[#464646] text-white text-base md:text-sm font-medium hover:bg-[#333] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Skip
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting || isCompleteFromServer}
                  className="w-full md:w-auto px-6 py-3 md:py-2.5 rounded-full bg-[#b0cb1f] text-gray-900 text-base md:text-sm font-semibold hover:bg-[#c5de3a] transition-all sm:hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:sm:hover:scale-100"
                >
                  {isSubmitting ? "Submitting..." : (isAdaptive ? "Save & continue" : (currentQuestionIndex === totalQuestions - 1 ? "Final Submit" : "Save & continue"))}
                </button>
                {/* Manual Final Submit Button for Adaptive - Triggered only on completion or manual quit logic */}
                {isAdaptive && isCompleteFromServer && (
                  <button
                    onClick={finishAssessmentAndShowResult}
                    disabled={isSubmitting || testFinished}
                    className="w-full md:w-auto px-6 py-3 md:py-2.5 rounded-full bg-green-600 text-white text-base md:text-sm font-semibold shadow-lg scale-[1.05] transition-all sm:hover:scale-[1.1] disabled:opacity-50"
                  >
                    Final Submit
                  </button>
                )}
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

export default TestModalUpdated;