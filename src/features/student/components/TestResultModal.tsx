import React from "react";
import { CheckCircle, XCircle, SkipForward, Trophy } from "lucide-react";

export interface ResultData {
  totalQuestions: number;
  answered: number;
  correct: number;
  incorrect: number;
  skipped: number;
  score: number;
  maxScore: number;
  timeTaken: string;
  percentage: number;
}

interface TestResultPageProps {
  result: ResultData;
  onDone: () => void;
}

const TestResultPage: React.FC<TestResultPageProps> = ({ result, onDone }) => {
  const getGrade = (pct: number) => {
    if (pct >= 90)
      return {
        label: "Excellent!",
        color: "text-green-600",
        bg: "bg-green-50",
      };
    if (pct >= 75)
      return {
        label: "Great Job!",
        color: "text-blue-600",
        bg: "bg-blue-50",
      };
    if (pct >= 50)
      return {
        label: "Good Effort!",
        color: "text-yellow-600",
        bg: "bg-yellow-50",
      };
    return {
      label: "Keep Practicing!",
      color: "text-red-500",
      bg: "bg-red-50",
    };
  };

  const grade = getGrade(result.percentage);

  // Circle progress for score
  const circumference = 2 * Math.PI * 54;
  const progressOffset = circumference * (1 - result.percentage / 100);

  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* Header */}
      <div
        className={`rounded-2xl sm:rounded-3xl ${grade.bg} p-6 sm:p-8 text-center mb-5 sm:mb-6`}
      >
        <Trophy
          size={48}
          className={`mx-auto mb-2 sm:mb-3 transform scale-75 sm:scale-100 ${grade.color}`}
        />
        <h2 className={`text-xl sm:text-2xl font-bold ${grade.color}`}>
          {grade.label}
        </h2>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">Test Completed</p>
      </div>

      {/* Score Circle */}
      <div className="flex justify-center py-4 sm:py-6">
        <div className="relative w-[120px] h-[120px] sm:w-[140px] sm:h-[140px]">
          <svg
            className="w-full h-full -rotate-90"
            viewBox="0 0 120 120"
          >
            <circle
              cx="60"
              cy="60"
              r="54"
              fill="none"
              stroke="#e8e8e8"
              strokeWidth="8"
            />
            <circle
              cx="60"
              cy="60"
              r="54"
              fill="none"
              stroke={
                result.percentage >= 75
                  ? "#b0cb1f"
                  : result.percentage >= 50
                    ? "#f59e0b"
                    : "#ef4444"
              }
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={progressOffset}
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl sm:text-3xl font-bold text-gray-900">
              {result.percentage}%
            </span>
            <span className="text-[9px] sm:text-[10px] text-gray-400 font-medium mt-0.5">
              SCORE
            </span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-5 sm:mb-6">
        <div className="bg-green-50 rounded-xl sm:rounded-2xl p-3 sm:p-5 text-center">
          <CheckCircle
            size={20}
            className="mx-auto mb-1.5 sm:mb-2 text-green-500 sm:w-6 sm:h-6"
          />
          <p className="text-xl sm:text-2xl font-bold text-green-700">
            {result.correct}
          </p>
          <p className="text-[10px] sm:text-xs text-green-600 font-medium">
            Correct
          </p>
        </div>
        <div className="bg-red-50 rounded-xl sm:rounded-2xl p-3 sm:p-5 text-center">
          <XCircle
            size={20}
            className="mx-auto mb-1.5 sm:mb-2 text-red-500 sm:w-6 sm:h-6"
          />
          <p className="text-xl sm:text-2xl font-bold text-red-700">
            {result.incorrect}
          </p>
          <p className="text-[10px] sm:text-xs text-red-600 font-medium">
            Incorrect
          </p>
        </div>
        <div className="bg-gray-50 rounded-xl sm:rounded-2xl p-3 sm:p-5 text-center">
          <SkipForward
            size={20}
            className="mx-auto mb-1.5 sm:mb-2 text-gray-500 sm:w-6 sm:h-6"
          />
          <p className="text-xl sm:text-2xl font-bold text-gray-700">
            {result.skipped}
          </p>
          <p className="text-[10px] sm:text-xs text-gray-600 font-medium">
            Skipped
          </p>
        </div>
      </div>

      {/* Details */}
      <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6 space-y-2.5 sm:space-y-3 mb-6 sm:mb-8">
        <div className="flex justify-between text-xs sm:text-sm">
          <span className="text-gray-500">Total Questions</span>
          <span className="font-semibold text-gray-800">
            {result.totalQuestions}
          </span>
        </div>
        <div className="flex justify-between text-xs sm:text-sm">
          <span className="text-gray-500">Answered</span>
          <span className="font-semibold text-gray-800">
            {result.answered}
          </span>
        </div>
        <div className="flex justify-between text-xs sm:text-sm">
          <span className="text-gray-500">Score</span>
          <span className="font-semibold text-gray-800">
            {result.score} / {result.maxScore}
          </span>
        </div>
        <div className="flex justify-between text-xs sm:text-sm">
          <span className="text-gray-500">Time Taken</span>
          <span className="font-semibold text-gray-800">
            {result.timeTaken}
          </span>
        </div>
      </div>

      {/* Done Button */}
      <div className="flex justify-center">
        <button
          onClick={onDone}
          className="w-full sm:w-auto px-12 py-3.5 sm:py-3 rounded-full bg-[#b0cb1f] text-gray-900 font-semibold text-base sm:text-base hover:bg-[#c5de3a] transition-all sm:hover:scale-[1.02] shadow-md"
        >
          Done
        </button>
      </div>
    </div>
  );
};

export default TestResultPage;