import React, { useState, useEffect } from "react";
import {
  FileText,
  Clock,
  BarChart3,
  Plus,
  BookOpen,
  Layers,
  Calendar,
  Trophy,
  HelpCircle,
  CheckCircle,
} from "lucide-react";
import TestModal from "./TestModal";
import TestDetailsFormModal from "./TestDetailsFormModal";
import type { TestDetails } from "./TestDetailsFormModal";
import TestResultPage from "./TestResultModal";
import type { ResultData } from "./TestResultModal";
import RetakeConfirmationModal from "./RetakeConfirmationModal";
// @ts-ignore
import ApiServices from "../../../services/ApiServices";
import { useToast } from "../../../app/providers/ToastProvider";

type TestView = "dashboard" | "result";

interface TestsProps {
  subjectId?: number;
  subjectName?: string;
  chapterIds?: number[] | null;
  chapterNames?: string[];
  allChapters?: { chapter_id?: number; name: string }[];
  allTopics?: { topic_id?: number; name: string }[];
  topicIds?: number[] | null; //  ADD
  topicNames?: string[];
  autoStartTestId?: number;
}

interface Assessment {
  retake_count: number;
  assigned_by: string;
  assignment_id: number;
  attempt_id: number | null;
  attempted_count: number;
  chapter_ids: number[];
  difficulty_level: string;
  due_date: string;
  duration_minutes: number;
  is_retake: boolean;
  percentage: number;
  score_obtained: number;
  set_name: string;
  status: string;
  subject_name: string;
  total_marks: number;
  total_questions: number;
  topic_ids: number[];
}

const Tests: React.FC<TestsProps> = ({
  subjectId,
  subjectName,
  chapterIds = null,
  chapterNames = [],
  allChapters = [],
  allTopics = [],
  topicIds = null, //  ADD
  topicNames = [], //  ADD
  autoStartTestId,
}) => {
  const { showToast } = useToast();
  const [view, setView] = useState<TestView>("dashboard");
  const [showTestModal, setShowTestModal] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [resultData, setResultData] = useState<ResultData | null>(null);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAssessment, setSelectedAssessment] =
    useState<Assessment | null>(null);
  const [attemptId, setAttemptId] = useState<number | null>(null);
  const [assessmentDetails, setAssessmentDetails] = useState<any>(null);

  // CHANGED: Instead of a boolean, we store the ID of the specific test that is loading
  const [startingTestId, setStartingTestId] = useState<number | null>(null);

  const [showRetakeModal, setShowRetakeModal] = useState(false);
  const [retakeAssessment, setRetakeAssessment] = useState<Assessment | null>(
    null,
  );
  const [isRetaking, setIsRetaking] = useState(false);
  const [statusFilter, setStatusFilter] = useState<
    "All" | "Pending" | "Completed" | "Expired"
  >("All");
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 2;

  // Reset page when assessments or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [assessments.length, subjectName, chapterIds]);

  // Fetch assessments on component mount
  useEffect(() => {
    const fetchAssessments = async () => {
      try {
        setIsLoading(true);
        const response = await ApiServices.getStudentAssessments();
        if (response.data?.status === "success") {
          setAssessments(response.data.data || []);
        }
      } catch (error: any) {
        // console.error("Failed to fetch assessments:", error);
        showToast(
          error.response?.data?.message || "Failed to load assessments",
          "error",
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssessments();
  }, []);

  const handleFormSubmit = async (_details: TestDetails) => {
    setShowFormModal(false);
    // Refresh assessments list after creating new test
    try {
      const response = await ApiServices.getStudentAssessments();
      if (response.data?.status === "success") {
        setAssessments(response.data.data || []);
      }
    } catch (error) {
      // console.error("Failed to refresh assessments:", error);
    }
  };

  // Search State
  const [searchQuery, setSearchQuery] = useState("");
  // Helper to get names from IDs
  const getChapterNames = (ids: number[]) => {
    if (!ids || ids.length === 0) return "N/A";
    const names = ids.map((id) => {
      const chapter = allChapters.find((c) => c.chapter_id === id);
      return chapter ? chapter.name : id; // Fallback to ID if name not found
    });
    return names.join(", ");
  };

  const getTopicNames = (ids: number[]) => {
    if (!ids || ids.length === 0) return "N/A";
    const names = ids.map((id) => {
      const topic = allTopics.find((t) => t.topic_id === id);
      return topic ? topic.name : id; // Fallback to ID if name not found
    });
    return names.join(", ");
  };

  const isExpired = (assessment: Assessment) => {
    const due = new Date(assessment.due_date + " " + new Date().getFullYear());

    return due < new Date();
  };

  const hasAutoStarted = React.useRef(false);

  useEffect(() => {
    if (
      autoStartTestId &&
      assessments.length > 0 &&
      !hasAutoStarted.current &&
      startingTestId === null
    ) {
      const match = assessments.find(
        (a) => a.assignment_id === autoStartTestId,
      );
      if (match) {
        hasAutoStarted.current = true;
        if (match.status === "Pending" && !isExpired(match)) {
          handleStartTest(match);
        }
      }
    }
  }, [assessments, autoStartTestId, startingTestId]);

  const filteredAssessments = assessments.filter((assessment) => {
    // Subject filter
    if (subjectName && assessment.subject_name !== subjectName) {
      return false;
    }

    // Chapter filter
    if (chapterIds !== null && chapterIds !== undefined) {
      if (chapterIds.length === 0) return false;
      const hasChapter = assessment.chapter_ids.some((id) =>
        chapterIds.includes(id),
      );
      if (!hasChapter) return false;
    }

    // Topic filter   ADD THIS BLOCK
    if (topicIds && topicIds.length > 0) {
      const hasTopic = assessment.topic_ids?.some((id) =>
        topicIds.includes(id),
      );
      if (!hasTopic) return false;
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchSubject = assessment.subject_name
        ?.toLowerCase()
        .includes(query);
      const matchTestName = assessment.set_name?.toLowerCase().includes(query);

      const matchChapters = getChapterNames(assessment.chapter_ids)
        .toLowerCase()
        .includes(query);

      const matchTopics = getTopicNames(assessment.topic_ids)
        .toLowerCase()
        .includes(query);

      if (!(matchSubject || matchTestName || matchChapters || matchTopics)) {
        return false;
      }
    }

    // Status filter
    if (statusFilter !== "All") {
      const expired = isExpired(assessment);

      if (statusFilter === "Expired") {
        //  exclude completed tests
        if (assessment.status === "Completed" || !expired) {
          return false;
        }
      } else if (statusFilter === "Pending") {
        // only pending AND not expired
        if (assessment.status !== "Pending" || expired) {
          return false;
        }
      } else if (statusFilter === "Completed") {
        if (assessment.status !== "Completed") {
          return false;
        }
      }
    }

    return true;
  });

  // Calculate stats
  const totalTests = filteredAssessments.length;
  const completedTests = filteredAssessments.filter(
    (a) => a.status === "Completed" || a.attempted_count > 0,
  );
  const avgScore =
    completedTests.length > 0
      ? (
        completedTests.reduce((sum, a) => sum + a.percentage, 0) /
        completedTests.length
      ).toFixed(1)
      : "--";
  const avgTime =
    completedTests.length > 0
      ? Math.round(
        completedTests.reduce((sum, a) => sum + a.duration_minutes, 0) /
        completedTests.length,
      )
      : "--";

  const handleTestComplete = (result: ResultData) => {
    setResultData(result);
    setView("result");
  };

  const handleDone = async () => {
    setResultData(null);
    setView("dashboard");

    // Refresh assessments list after completing test
    try {
      const response = await ApiServices.getStudentAssessments();
      if (response.data?.status === "success") {
        setAssessments(response.data.data || []);
      }
    } catch (error: any) {
      // console.error("Failed to refresh assessments:", error);
      showToast(
        error.response?.data?.message || "Failed to refresh assessments",
        "error",
      );
    }
  };

  const handleStartTest = async (assessment: Assessment) => {
    if (startingTestId !== null) return; // Prevent double clicks

    setStartingTestId(assessment.assignment_id); // Set the specific ID loading
    setSelectedAssessment(assessment);

    try {
      // Step 1: Start the assessment
      const startResponse = await ApiServices.startAssessment({
        assignment_id: assessment.assignment_id,
      });

      if (startResponse.data?.status === "success") {
        const { attempt_id } = startResponse.data.data;
        setAttemptId(attempt_id);

        // Step 2: Get assessment details/questions
        const detailsResponse = await ApiServices.getAssessmentDetails(
          assessment.assignment_id,
        );

        if (detailsResponse.data?.status === "success") {
          setAssessmentDetails(detailsResponse.data.data);
          setShowTestModal(true);
          showToast("Assessment started successfully!", "success");
        } else {
          showToast(
            detailsResponse.data?.message ||
            "Failed to load assessment details",
            "error",
          );
        }
      } else {
        showToast(
          startResponse.data?.message || "Failed to start assessment",
          "error",
        );
      }
    } catch (error: any) {
      // console.error("Failed to start assessment:", error);
      showToast(
        error.response?.data?.message ||
        "Failed to start assessment. Please try again.",
        "error",
      );
    } finally {
      setStartingTestId(null); // Clear loading state when done
    }
  };

  const handleRetakeTest = (assessment: Assessment) => {
    setRetakeAssessment(assessment);
    setShowRetakeModal(true);
  };

  const handleConfirmRetake = async () => {
    if (!retakeAssessment || isRetaking) return;

    setIsRetaking(true);

    try {
      // Step 1: Call retake API
      const retakeResponse = await (ApiServices as any).retakeAssessment({
        assignment_id: retakeAssessment.assignment_id,
      });

      if (retakeResponse.data?.status === "success") {
        const { new_assignment_id, new_attempt_id } = retakeResponse.data.data;

        setShowRetakeModal(false);
        setRetakeAssessment(null);

        // Step 2: Get assessment details for new assignment
        const detailsResponse =
          await ApiServices.getAssessmentDetails(new_assignment_id);

        if (detailsResponse.data?.status === "success") {
          setSelectedAssessment({
            ...retakeAssessment,
            assignment_id: new_assignment_id,
          });
          setAttemptId(new_attempt_id);
          setAssessmentDetails(detailsResponse.data.data);
          setShowTestModal(true);
          showToast("Retake started successfully!", "success");
        } else {
          showToast(
            detailsResponse.data?.message ||
            "Failed to load assessment details",
            "error",
          );
        }
      } else {
        showToast(
          retakeResponse.data?.message || "Failed to start retake",
          "error",
        );
      }
    } catch (error: any) {
      // console.error("Failed to start retake:", error);
      showToast(
        error.response?.data?.message ||
        "Failed to start retake. Please try again.",
        "error",
      );
    } finally {
      setIsRetaking(false);
    }
  };
  const getTrimmedAssessmentName = (name: string): string => {
    return name.includes(" - ") ? name.split(" - ")[0] : name;
  };

  return (
    <div className="p-6">
      {/* Dashboard View */}
      {view === "dashboard" && (
        <div>
          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                <FileText size={22} className="text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{totalTests}</p>
                <p className="text-xs text-gray-500">Total Tests</p>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center">
                <BarChart3 size={22} className="text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {avgScore}
                  {avgScore !== "--" ? "%" : ""}
                </p>
                <p className="text-xs text-gray-500">Avg. Score</p>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center">
                <Clock size={22} className="text-orange-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {avgTime}
                  {avgTime !== "--" ? " min" : ""}
                </p>
                <p className="text-xs text-gray-500">Avg. Time</p>
              </div>
            </div>
          </div>

          {/* Assessments List or Empty State */}
          {isLoading ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 flex items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-[3px] border-gray-200 border-t-[#b0cb1f] rounded-full animate-spin" />
                <p className="text-sm text-gray-500">Loading assessments...</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Search and Create Test Section */}
              <div className="flex justify-between items-center gap-4 mb-4">
                {/* Search Input */}
                <div className="relative w-full md:w-[400px]">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg
                      className="h-5 w-5 text-gray-400"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <input
                    type="text"
                    className="block w-full pl-11 pr-4 py-2 border border-gray-300 rounded-full leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-[#b0cb1f] focus:border-[#b0cb1f] sm:text-sm transition duration-150 ease-in-out shadow-sm"
                    placeholder="Select subject or chapter to search for related tests..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <div className="flex gap-3">
                  {["All", "Pending", "Completed", "Expired"].map((status) => (
                    <button
                      key={status}
                      onClick={() => setStatusFilter(status as any)}
                      className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition ${statusFilter === status
                        ? "bg-[#b0cb1f] text-gray-900 border-[#b0cb1f]"
                        : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                        }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>

                {/* Create Test Button */}
                <button
                  onClick={() => setShowFormModal(true)}
                  className="flex items-center gap-2 px-6 py-2 rounded-full bg-[#b0cb1f] text-gray-900 font-semibold text-sm hover:bg-[#c5de3a] transition-all hover:scale-[1.02] shadow-md w-full sm:w-auto justify-center"
                >
                  <Plus size={18} />
                  Create Test
                </button>
              </div>

              {/* Empty State for Search */}
              {filteredAssessments.length === 0 ? (
                searchQuery ? (
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
                    <p className="text-gray-500">
                      No tests found matching "{searchQuery}"
                    </p>
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 flex flex-col items-center justify-center text-center">
                    <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center mb-5">
                      <FileText size={36} className="text-gray-300" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      No Tests Yet
                    </h3>
                    <p className="text-sm text-gray-400 mb-6 max-w-xs">
                      {subjectName && chapterIds !== null && chapterIds.length === 0
                        ? "Please select a chapter to view tests."
                        : subjectName && chapterIds && chapterIds.length > 0
                          ? `No tests available for ${subjectName} - ${chapterNames.join(", ")}.Please select another option.`
                          : subjectName
                            ? `No tests available for ${subjectName}.Please select another subject.`
                            : "Create your first test to get started. You can set up questions, duration, and difficulty level."}
                    </p>
                  </div>
                )
              ) : (
                filteredAssessments
                  .slice(
                    (currentPage - 1) * ITEMS_PER_PAGE,
                    currentPage * ITEMS_PER_PAGE,
                  )
                  .map((assessment) => (
                    <div
                      key={assessment.assignment_id}
                      className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 p-6 relative overflow-hidden"
                    >
                      {/* Status Badge & Accent Line */}
                      <div
                        className={`absolute top-0 left-0 w-1 h-full ${assessment.status === "Completed"
                          ? "bg-green-500"
                          : assessment.status === "Pending"
                            ? "bg-[#b0cb1f]"
                            : "bg-gray-300"
                          } `}
                      />

                      {/* Header Section */}
                      <div className="flex flex-col sm:flex-row justify-between items-start mb-6 gap-4 pl-3">
                        <div className="flex-1">
                          <h4 className="text-xl font-bold text-gray-900 leading-tight">
                            {getTrimmedAssessmentName(assessment.set_name)}
                          </h4>
                        </div>

                        <div className="flex flex-row items-end gap-4">
                          {assessment.status === "Completed" && (
                            <div className=" flex justify-start">
                              <span className="px-2 py-1 bg-green-100 text-primary text-xs font-semibold rounded-full border border-green-200">
                                Score: {assessment.percentage}%
                              </span>
                            </div>
                          )}
                          <span
                            className={`px-3 py-1.5 rounded-full text-xs font-bold tracking-wide ${assessment.status === "Completed"
                              ? "bg-green-100 text-primary"
                              : assessment.status === "Pending"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-gray-100 text-gray-600"
                              } `}
                          >
                            {assessment.status === "Pending" &&
                              isExpired(assessment)
                              ? "Expired"
                              : assessment.status}
                          </span>

                          <button
                            onClick={() => {
                              if (assessment.status === "Completed") {
                                handleRetakeTest(assessment);
                              } else if (assessment.status === "Pending") {
                                handleStartTest(assessment);
                              }
                            }}
                            disabled={
                              startingTestId !== null || // disable all buttons if any API call is loading
                              (assessment.status === "Pending" &&
                                isExpired(assessment))
                            }
                            className={`px-6 py-1.5 rounded-full font-bold text-sm shadow-md transition-all flex items-center gap-4 ${startingTestId === null && // if no test is currently loading
                              !(
                                assessment.status === "Pending" &&
                                isExpired(assessment)
                              )
                              ? "bg-[#b0cb1f] text-gray-900 hover:bg-[#c5de3a] hover:scale-[1.02] active:scale-[0.98]"
                              : "bg-gray-100 text-gray-400 cursor-not-allowed"
                              } `}
                          >
                            {startingTestId === assessment.assignment_id ? ( // Show spinner ONLY on this specific clicked button
                              <>
                                <span className="w-4 h-4 border-2 border-gray-600/30 border-t-gray-600 rounded-full animate-spin" />
                                Loading...
                              </>
                            ) : assessment.status === "Completed" ? (
                              <>Retake Test</>
                            ) : assessment.status === "Pending" ? (
                              assessment.attempted_count > 0 ? (
                                <>Continue Test</>
                              ) : (
                                <>Start Test</>
                              )
                            ) : (
                              <>View Details</>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Content Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 pl-3">
                        {/* Chapters */}
                        <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                          <div className="flex items-start gap-3">
                            <div className="mt-1 p-1.5 bg-blue-100 text-blue-600 rounded-lg">
                              <BookOpen size={16} />
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
                                Chapters
                              </p>
                              <p className="text-sm text-gray-800 font-medium leading-relaxed">
                                {getChapterNames(assessment.chapter_ids)}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Topics */}
                        <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                          <div className="flex items-start gap-3">
                            <div className="mt-1 p-1.5 bg-purple-100 text-purple-600 rounded-lg">
                              <Layers size={16} />
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
                                Topics
                              </p>
                              <p className="text-sm text-gray-800 font-medium leading-relaxed">
                                {getTopicNames(assessment.topic_ids)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Footer Stats */}
                      <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-2">
                          <div className="p-2 bg-orange-50 text-orange-500 rounded-lg">
                            <Calendar size={18} />
                          </div>
                          <div>
                            <p className="text-xs text-gray-400 font-medium uppercase">
                              Due Date
                            </p>
                            <p className="text-sm font-bold text-gray-700">
                              {new Date(
                                assessment.due_date +
                                " " +
                                new Date().getFullYear(),
                              ).toLocaleDateString("en-IN", {
                                month: "short",
                                day: "numeric",
                              })}
                              <span className="text-gray-400 font-normal ml-1 text-[9px]">
                                {new Date(
                                  assessment.due_date +
                                  " " +
                                  new Date().getFullYear(),
                                ).toLocaleTimeString("en-IN", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                                {" (IST)"}
                              </span>
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="p-2 bg-indigo-50 text-indigo-500 rounded-lg">
                            <HelpCircle size={18} />
                          </div>
                          <div>
                            <p className="text-xs text-gray-400 font-medium uppercase">
                              Total Questions
                            </p>
                            <p className="text-sm font-bold text-gray-700">
                              {assessment.total_questions}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="p-2 bg-pink-50 text-pink-500 rounded-lg">
                            <Clock size={18} />
                          </div>
                          <div>
                            <p className="text-xs text-gray-400 font-medium uppercase">
                              Duration
                            </p>
                            <p className="text-sm font-bold text-gray-700">
                              {assessment.duration_minutes} min
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="p-2 bg-teal-50 text-teal-500 rounded-lg">
                            <Trophy size={18} />
                          </div>
                          <div>
                            <p className="text-xs text-gray-400 font-medium uppercase">
                              Total Marks
                            </p>
                            <p className="text-sm font-bold text-gray-700">
                              {assessment.total_marks}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="p-2 bg-rose-50 text-rose-500 rounded-lg">
                            <BarChart3 size={18} />
                          </div>
                          <div>
                            <p className="text-xs text-gray-400 font-medium uppercase">
                              Difficulty
                            </p>
                            <p className="text-sm font-bold text-gray-700">
                              {assessment.difficulty_level}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="p-2 bg-emerald-50 text-emerald-500 rounded-lg">
                            <CheckCircle size={18} />
                          </div>
                          <div>
                            <p className="text-xs text-gray-400 font-medium uppercase">
                              Retake
                            </p>
                            <p className="text-sm font-bold text-gray-700">
                              {assessment.retake_count}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
              )}

              {/* Pagination Controls */}
              {filteredAssessments.length > ITEMS_PER_PAGE && (
                <div className="flex justify-center items-center gap-2 mt-6">
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                    className={`px-3 py-1 rounded-full border text-sm ${currentPage === 1
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-white text-gray-700 hover:bg-gray-50"
                      } `}
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-600">
                    Page {currentPage} of{" "}
                    {Math.ceil(filteredAssessments.length / ITEMS_PER_PAGE)}
                  </span>
                  <button
                    onClick={() =>
                      setCurrentPage((prev) =>
                        Math.min(
                          prev + 1,
                          Math.ceil(
                            filteredAssessments.length / ITEMS_PER_PAGE,
                          ),
                        ),
                      )
                    }
                    disabled={
                      currentPage ===
                      Math.ceil(filteredAssessments.length / ITEMS_PER_PAGE)
                    }
                    className={`px-3 py-1 rounded-full border text-sm ${currentPage ===
                      Math.ceil(filteredAssessments.length / ITEMS_PER_PAGE)
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-white text-gray-700 hover:bg-gray-50"
                      } `}
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Result Page View */}
      {view === "result" && resultData && (
        <TestResultPage result={resultData} onDone={handleDone} />
      )}

      {/* Form Modal */}
      <TestDetailsFormModal
        isOpen={showFormModal}
        onClose={() => setShowFormModal(false)}
        onSubmit={handleFormSubmit}
        subjectId={subjectId}
        subjectName={subjectName}
        chapterIds={chapterIds}
        chapterNames={chapterNames}
        topicIds={topicIds} // ADD THIS
        topicNames={topicNames}
      />

      {/* Test Modal */}
      <TestModal
        isOpen={showTestModal}
        onClose={() => {
          setShowTestModal(false);
          setSelectedAssessment(null);
          setAssessmentDetails(null);
          setAttemptId(null);
        }}
        testDurationMinutes={selectedAssessment?.duration_minutes || 30}
        onComplete={handleTestComplete}
        assessmentDetails={assessmentDetails}
        attemptId={attemptId}
        assignmentId={selectedAssessment?.assignment_id}
      />

      {/* Retake Confirmation Modal */}
      <RetakeConfirmationModal
        isOpen={showRetakeModal}
        onClose={() => {
          setShowRetakeModal(false);
          setRetakeAssessment(null);
        }}
        onConfirm={handleConfirmRetake}
        testName={retakeAssessment?.set_name || ""}
        isLoading={isRetaking}
      />
    </div>
  );
};

export default Tests;
