import React, { useState, useEffect } from "react";
import {
  FileText,
  Plus,
  Clock,
  BarChart3,
  Layers,
  Calendar,
  Trophy,
} from "lucide-react";

import TestGeneratorModal from "./TestGeneratorModal";
import type { GeneratorData } from "./TestGeneratorModal";
import TestSummaryModal from "./TestSummaryModal";

// @ts-ignore
import ApiServices from "../../../services/ApiServices";
import { useToast } from "../../../app/providers/ToastProvider";

// type TestView = "dashboard" | "result";

interface TestsProps {
  subjectId?: number;
  subjectName?: string;
  chapterIds?: number[] | null;
  chapterNames?: string[];
  allChapters?: { chapter_id?: number; name: string; topics?: any[] }[];
  allTopics?: { topic_id?: number; name: string }[];
  topicIds?: number[] | null;
  topicNames?: string[];
  classIds?: number[];
  stats?: any;
}

/*
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
*/

const InstituteAdminTestAssignPage: React.FC<TestsProps> = ({
  subjectName,
  subjectId,
  chapterIds = null,
  // chapterNames = [],
  allChapters = [],
  allTopics = [],
  classIds = [],
  stats,
}) => {
  const { showToast } = useToast();
  // const [view, _setView] = useState<TestView>("dashboard");
  const [teacherAssessments, setTeacherAssessments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<
    "All" | "Pending" | "Completed" | "Expired"
  >("All");

  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);

  const [summaryData, setSummaryData] = useState<GeneratorData | null>(null);
  const [summaryStatus, setSummaryStatus] = useState<"success" | "error">("success");
  const [summaryMessage, setSummaryMessage] = useState("");

  // Some placeholder options (could be fetched from API later)
  const difficultyOptions = ["Easy", "Medium", "Hard", "Mixed"];

  const openGenerator = () => setIsGeneratorOpen(true);
  const closeGenerator = () => setIsGeneratorOpen(false);
  const openSummary = () => setIsSummaryOpen(true);
  const closeSummary = () => setIsSummaryOpen(false);

  const handleGenerate = async (data: GeneratorData) => {
    try {
      // Format the due date to match API requirement: "YYYY-MM-DD HH:MM:SS"
      const formattedDueDate = new Date(data.due_date)
        .toISOString()
        .slice(0, 19)
        .replace("T", " ");

      const payload = {
        class_ids: classIds.length > 0 ? classIds : [(stats?.class_id || '')],
        subject_id: subjectId,
        student_ids: data.student_ids || [], // Empty array means entire class
        topic_ids: data.topic_ids,
        chapter_ids: data.chapter_ids,
        total_questions: data.questions,
        duration_minutes: data.timeLimit,
        difficulty_level: data.difficulty,
        due_date: formattedDueDate,
        test_name: data.test_name,
      };

      // console.log("Creating assessment with payload:", payload);

      let response;
      if (data.student_ids && data.student_ids.length > 0) {
        response = await ApiServices.assignAssessmentToStudents(payload);
      } else {
        response = await ApiServices.assignAssessmentToClass(payload);
      }

      if (response.data?.status === "success") {
        showToast(response.data.message || "Assessment created successfully!", "success");
        setSummaryStatus("success");
        setSummaryMessage("The assessment has been successfully assigned.");
        setSummaryData(data);
        closeGenerator();
        openSummary();
        // Refresh teacher assessments
        fetchTeacherAssessments();
      } else {
        const errorMsg = response.data?.message || "Failed to create assessment";
        showToast(errorMsg, "error");
        setSummaryStatus("error");
        setSummaryMessage(errorMsg);
        setSummaryData(data);
        closeGenerator();
        openSummary();
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || "An error occurred while creating the assessment";
      showToast(errorMsg, "error");
      setSummaryStatus("error");
      setSummaryMessage(errorMsg);
      setSummaryData(data);
      closeGenerator();
      openSummary();
    }
  };

  // Pagination State for Teacher Assessments
  const [teacherCurrentPage, setTeacherCurrentPage] = useState(1);
  const TEACHER_ITEMS_PER_PAGE = 2;

  // Reset page when assessments or filters change
  useEffect(() => {
    setTeacherCurrentPage(1);
  }, [teacherAssessments.length, subjectName, chapterIds]);

  useEffect(() => {
    setTeacherCurrentPage(1);
  }, [teacherAssessments.length]);

  // Prevent background scroll when any modal is open
  useEffect(() => {
    const scrollY = window.scrollY;
    if (isGeneratorOpen || isSummaryOpen) {
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      document.body.style.overflow = "";
      window.scrollTo(0, parseInt(document.body.style.top || "0", 10) * -1);
    }
    return () => {
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      document.body.style.overflow = "";
    };
  }, [isGeneratorOpen, isSummaryOpen]);

  // Fetch teacher assessments
  const fetchTeacherAssessments = async () => {
    try {
      setIsLoading(true);
      const response = await ApiServices.getTeacherStudentStatusDashboard();
      if (response.data?.status === "success") {
        setTeacherAssessments(response.data.data || []);
      }
    } catch (error: any) {
      // console.error("Failed to fetch teacher assessments:", error);
      showToast(
        error.response?.data?.message || "Failed to load teacher assessments",
        "error",
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch teacher assessments on component mount
  useEffect(() => {
    fetchTeacherAssessments();
  }, []);


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

  const isExpired = (assessment: any) => {
    const due = new Date(assessment.due_date);
    return due < new Date();
  };

  const filteredAssessments = teacherAssessments.filter((assessment) => {
    // Subject filter
    if (subjectName && assessment.subject_name && assessment.subject_name !== subjectName) {
      return false;
    }

    // Chapter filter (assuming teacher assessments might have chapter_ids in the payload if API returns them, otherwise skip)
    if (chapterIds && chapterIds.length > 0 && assessment.chapter_ids) {
      const hasChapter = assessment.chapter_ids.some((id: number) =>
        chapterIds.includes(id),
      );
      if (!hasChapter) return false;
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchSubject = assessment.subject_name
        ?.toLowerCase()
        .includes(query);
      const matchTestName = assessment.test_name?.toLowerCase().includes(query);

      const matchChapters = assessment.chapter_ids ? getChapterNames(assessment.chapter_ids)
        .toLowerCase()
        .includes(query) : false;

      const matchTopics = assessment.topic_ids ? getTopicNames(assessment.topic_ids)
        .toLowerCase()
        .includes(query) : false;

      if (!(matchSubject || matchTestName || matchChapters || matchTopics)) {
        return false;
      }
    }

    // Status filter
    if (statusFilter !== "All") {
      const expired = isExpired(assessment);
      const isCompleted = assessment.total_completed_students === assessment.total_assigned_students && assessment.total_assigned_students > 0;
      const isPending = !isCompleted;

      if (statusFilter === "Expired") {
        if (isCompleted || !expired) {
          return false;
        }
      } else if (statusFilter === "Pending") {
        if (!isPending || expired) {
          return false;
        }
      } else if (statusFilter === "Completed") {
        if (!isCompleted) {
          return false;
        }
      }
    }

    return true;
  });

  // Calculate stats
  const totalTests = filteredAssessments.length;
  // Calculate stats based on teacher assessments
  let sumTime = 0;
  let timeCount = 0;

  filteredAssessments.forEach(a => {
    if (a.duration_minutes) {
      sumTime += a.duration_minutes;
      timeCount++;
    }
  });

  const avgScore = "--"; // Percentage is not directly available on teacher assessments top level
  const avgTime = timeCount > 0 ? Math.round(sumTime / timeCount) : "--";

  const getTrimmedAssessmentName = (name: string): string => {
    return name.includes(" - ") ? name.split(" - ")[0] : name;
  };

  return (
    <div className="p-6">
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
              <div className="w-8 h-8 border-3 border-gray-200 border-t-[#b0cb1f] rounded-full animate-spin" />
              <p className="text-sm text-gray-500">Loading assessments...</p>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
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

              <div className="flex flex-wrap gap-3">
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
              <button
                onClick={openGenerator}
                className="flex items-center gap-2 px-6 py-2 rounded-full bg-[#b0cb1f] text-gray-900 font-semibold text-sm hover:bg-[#c5de3a] transition-all hover:scale-[1.02] shadow-md w-full sm:w-auto justify-center"
              >
                <Plus size={18} />
                Create Assessment
              </button>
            </div>

            {/* Teacher Assessment Cards Section */}
            {filteredAssessments.length > 0 ? (
              <div className="mb-8">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Created Assessments</h3>
                <div className="space-y-4">
                  {filteredAssessments
                    .slice(
                      (teacherCurrentPage - 1) * TEACHER_ITEMS_PER_PAGE,
                      teacherCurrentPage * TEACHER_ITEMS_PER_PAGE,
                    )
                    .map((assessment) => (
                      <div
                        key={assessment.set_id}
                        className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 p-6 relative overflow-hidden"
                      >
                        {/* Status Badge & Accent Line */}
                        <div
                          className={`absolute top-0 left-0 w-1 h-full ${assessment.total_completed_students === assessment.total_assigned_students && assessment.total_assigned_students > 0
                            ? "bg-green-500"
                            : isExpired(assessment)
                              ? "bg-red-500"
                              : "bg-[#b0cb1f]"
                            } `}
                        />

                        {/* Header Section */}
                        <div className="flex flex-col sm:flex-row justify-between items-start mb-6 gap-4 pl-3">
                          <div className="flex-1">
                            <h4 className="text-xl font-bold text-gray-900 leading-tight">
                              {getTrimmedAssessmentName(assessment.test_name)}
                            </h4>
                          </div>

                          <div className="flex flex-row items-end gap-4">
                            <span
                              className={`px-3 py-1.5 rounded-full text-xs font-bold tracking-wide ${assessment.total_completed_students === assessment.total_assigned_students && assessment.total_assigned_students > 0
                                ? "bg-green-100 text-green-700"
                                : isExpired(assessment)
                                  ? "bg-red-100 text-red-700"
                                  : "bg-yellow-100 text-yellow-700"
                                }`}
                            >
                              {assessment.total_completed_students}/{assessment.total_assigned_students} Completed
                            </span>
                          </div>
                        </div>

                        {/* Progress Bar and Details */}
                        <div className="mb-6 pl-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-gray-500 uppercase font-semibold">
                              Progress
                            </span>
                            <span className="text-xs font-bold text-green-600">
                              {assessment.total_completed_students}/{assessment.total_assigned_students}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-green-500 h-2 rounded-full transition-all duration-300"
                              style={{
                                width: `${assessment.total_assigned_students > 0
                                  ? (assessment.total_completed_students / assessment.total_assigned_students) * 100
                                  : 0
                                  }%`,
                              }}
                            />
                          </div>

                          {/* Student Details Accordion */}
                          {assessment.student_details && assessment.student_details.length > 0 && (
                            <details className="mt-4">
                              <summary className="cursor-pointer text-sm font-semibold text-[#b0cb1f] hover:text-[#c5de3a]">
                                View Student Details
                              </summary>
                              <div className="mt-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {assessment.student_details.map((student: any) => (
                                  <div
                                    key={student.student_id}
                                    className="bg-gray-50 rounded-xl p-3 border border-gray-100 flex justify-between items-center"
                                  >
                                    <div>
                                      <p className="text-sm font-semibold text-gray-800">
                                        {student.student_name}
                                      </p>
                                      <p className="text-xs text-gray-500">@{student.username}</p>
                                    </div>
                                    <div className="text-right flex flex-col items-end gap-1">
                                      <p className="text-sm font-bold text-gray-800">
                                        {student.score_obtained} pts
                                      </p>
                                      <span
                                        className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${student.status === "Completed"
                                          ? "bg-green-100 text-green-700"
                                          : "bg-yellow-100 text-yellow-700"
                                          }`}
                                      >
                                        {student.status}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </details>
                          )}
                        </div>

                        {/* Footer Stats Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-gray-100 pl-3">
                          <div className="flex items-center gap-2">
                            <div className="p-2 bg-blue-50 text-blue-500 rounded-lg">
                              <Calendar size={18} />
                            </div>
                            <div>
                              <p className="text-xs text-gray-400 font-medium uppercase">
                                Assigned
                              </p>
                              <p className="text-sm font-bold text-gray-700">
                                {new Date(assessment.assigned_date).toLocaleString("en-IN", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                  hour: "numeric",
                                  minute: "2-digit",
                                  hour12: true
                                })}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <div className="p-2 bg-orange-50 text-orange-500 rounded-lg">
                              <Calendar size={18} />
                            </div>
                            <div>
                              <p className="text-xs text-gray-400 font-medium uppercase">
                                Due Date
                              </p>
                              <p className="text-sm font-bold text-gray-700">
                                {new Date(assessment.due_date).toLocaleString("en-IN", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                  hour: "numeric",
                                  minute: "2-digit",
                                  hour12: true
                                })}
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
                            <div className="p-2 bg-indigo-50 text-indigo-500 rounded-lg">
                              <Layers size={18} />
                            </div>
                            <div>
                              <p className="text-xs text-gray-400 font-medium uppercase">
                                Students
                              </p>
                              <p className="text-sm font-bold text-gray-700">
                                {assessment.total_assigned_students}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>

                {/* Pagination Controls for Teacher Assessments */}
                {teacherAssessments.length > TEACHER_ITEMS_PER_PAGE && (
                  <div className="flex justify-center items-center gap-2 mt-6">
                    <button
                      onClick={() =>
                        setTeacherCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
                      disabled={teacherCurrentPage === 1}
                      className={`px-3 py-1 rounded-full border text-sm ${teacherCurrentPage === 1
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-white text-gray-700 hover:bg-gray-50"
                        } `}
                    >
                      Previous
                    </button>
                    <span className="text-sm text-gray-600">
                      Page {teacherCurrentPage} of{" "}
                      {Math.ceil(filteredAssessments.length / TEACHER_ITEMS_PER_PAGE)}
                    </span>
                    <button
                      onClick={() =>
                        setTeacherCurrentPage((prev) =>
                          Math.min(
                            prev + 1,
                            Math.ceil(
                              filteredAssessments.length / TEACHER_ITEMS_PER_PAGE,
                            ),
                          ),
                        )
                      }
                      disabled={
                        teacherCurrentPage ===
                        Math.ceil(filteredAssessments.length / TEACHER_ITEMS_PER_PAGE)
                      }
                      className={`px-3 py-1 rounded-full border text-sm ${teacherCurrentPage ===
                        Math.ceil(filteredAssessments.length / TEACHER_ITEMS_PER_PAGE)
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-white text-gray-700 hover:bg-gray-50"
                        } `}
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center mb-5">
                  <FileText size={36} className="text-gray-300" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  No Tests Found
                </h3>
                <p className="text-sm text-gray-400 mb-6 max-w-xs">
                  {searchQuery || statusFilter !== "All"
                    ? "No tests found matching your search and filter criteria."
                    : "Create your first test to get started. You can set up questions, duration, and difficulty level."}
                </p>
              </div>
            )}
          </div>
        )}

        {/* separate modal components */}
        <TestGeneratorModal
          isOpen={isGeneratorOpen}
          onClose={closeGenerator}
          onGenerate={handleGenerate}
          subjectName={subjectName}
          subjectId={subjectId}
          allChapters={allChapters}
          allTopics={allTopics}
          difficultyOptions={difficultyOptions}
        />

        <TestSummaryModal
          isOpen={isSummaryOpen}
          onClose={closeSummary}
          data={summaryData}
          status={summaryStatus}
          message={summaryMessage}
        />
      </div>
    </div>
  );
};

export default InstituteAdminTestAssignPage;