import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import IconChat from "../../../assets/icon/chat2.svg";
import IconLamb from "../../../assets/icon/lamb.svg";
import ApiServices from "../../../services/ApiServices";
import Chat from "../../auth/modal/chat";

// Types and Interfaces
interface Child {
  student_id: number;
  full_name: string;
  username: string;
  [key: string]: any;
}

interface ParentProfile {
  class_name: string;
  parent_name: string;
  school_name: string;
  board_name: string;
  subjects: string[];
}

interface Subject {
  id?: number;
  subject_name: string;
  [key: string]: any;
}

interface Confidence {
  subject_id: number;
  subject_name: string;
  confidence_score: number;
}

interface SubjectScore {
  subject_id: number;
  subject_name: string;
  average_percentage: number;
}

interface PendingTask {
  task_name: string;
  subject_name: string;
  [key: string]: any;
}

interface StudentData {
  name: string;
  school: string;
  board: string;
  class: string;
  subjects: string;
  subjectsArray: Subject[];
  daysLeft: number;
  examName: string;
  progressScore: number;
  scienceAvg: number;
  mathematicsScore: number;
}

interface AnalyticsData {
  confidence: Confidence[];
  consistency: number;
  examReadiness: number;
  pendingTasks: PendingTask[];
  subjectScores: SubjectScore[];
  strengths: string[];
  improvements: string[];
}

const ParentDashboard: React.FC = () => {
  // const navigate = useNavigate();
  const [isChildrenLoading, setIsChildrenLoading] = useState(true);
  const [isParentProfileLoading, setIsParentProfileLoading] = useState(true);
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [isLearningPlannerLoading, setIsLearningPlannerLoading] =
    useState(true);
  const [isAnalyticsLoading, setIsAnalyticsLoading] = useState(true);
  const [isStrengthLoading, setIsStrengthLoading] = useState(true);
  const [isPendingTasksLoading, setIsPendingTasksLoading] = useState(true);

  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [profileImage, setProfileImage] = useState<string>("");

  // Parent profile state
  const [parentProfile, setParentProfile] = useState<ParentProfile>({
    class_name: "",
    parent_name: "",
    school_name: "",
    board_name: "",
    subjects: [],
  });
  const [uploading, setUploading] = useState(false);

  // Children dropdown
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<number | null>(null);

  // Student data
  const [studentData, setStudentData] = useState<StudentData>({
    name: "User",
    school: "",
    board: "",
    class: "",
    subjects: "",
    subjectsArray: [],
    daysLeft: 0,
    examName: "Annual Exam",
    progressScore: 0,
    scienceAvg: 0,
    mathematicsScore: 0,
  });

  // Analytics Data State
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    confidence: [],
    consistency: 0,
    examReadiness: 0,
    pendingTasks: [],
    subjectScores: [],
    strengths: [],
    improvements: [],
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setProfileImage(previewUrl);

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", file);
      const response = await ApiServices.uploadProfilePicture(formData);
      if (response.data?.status === "success") {
        // console.log("Upload success");
      }
    } catch (err) {
      // console.error("Upload failed", err);
    } finally {
      setUploading(false);
    }
  };

  const fetchProfileImage = async () => {
    try {
      setIsImageLoading(true);
      const response = await ApiServices.getUserProfileImage();
      if (response.data?.status === "success" && response.data?.data?.image) {
        setProfileImage(response.data.data.image); // base64 image
      }
    } catch (error) {
      // console.error("Failed to fetch profile image", error);
    } finally {
      setIsImageLoading(false);
    }
  };

  useEffect(() => {
    const fetchChildren = async () => {
      try {
        setIsChildrenLoading(true);
        const res = await ApiServices.getParentChildren();
        if (res.data?.status === "success" || res.data?.code === 200) {
          const list: Child[] = res.data.data || [];
          setChildren(list);
          if (list.length > 0) {
            setSelectedChildId(list[0].student_id);
          }
        }
      } catch (err: any) {
        // console.error("Failed to fetch children", err);
      } finally {
        setIsChildrenLoading(false);
      }
    };

    const fetchParentProfile = async () => {
      try {
        setIsParentProfileLoading(true);
        const res = await ApiServices.getParentProfile();
        if (res.data?.status === "success" && res.data?.code === 200) {
          const data = res.data.data;
          setParentProfile({
            class_name: data.class_name || "",
            parent_name: data.parent_name || "",
            school_name: data.school_name || "",
            board_name: data.board_name || "",
            // subjects: data.subjects || [],
            subjects: data.subjects
              ? data.subjects.split(",").map((s: string) => s.trim())
              : [],
          });
        }
      } catch (err) {
        // console.error("Error fetching parent profile", err);
      } finally {
        setIsParentProfileLoading(false);
      }
    };

    fetchChildren();
    fetchProfileImage();
    fetchParentProfile();
  }, []);

  useEffect(() => {
    // if (selectedChildId === null) return;

    if (children.length === 0) {
      setIsLearningPlannerLoading(false);
      setIsAnalyticsLoading(false);
      setIsStrengthLoading(false);
      setIsPendingTasksLoading(false);
      return;
    }
    if (!selectedChildId) return;

    const fetchDashboardData = async (studentId: number) => {
      // 1. Fetch Basic Student Info & Planner Stats
      const fetchLearningPlanner = async () => {
        try {
          setIsLearningPlannerLoading(true);
          const response = await ApiServices.getStudentLearningPlanner();
          if (response.data?.status === "success") {
            const stats = response.data.data.stats;
            setStudentData((prev) => ({
              ...prev,
              name: stats.student_name,
              school: stats.institute_name,
              board: stats.board_name,
              class: stats.class_name,
              daysLeft: stats.days_left,
              progressScore:
                stats.chapters_assigned > 0
                  ? Math.round(
                      (stats.completed_count / stats.chapters_assigned) * 100,
                    )
                  : 0,
            }));
          }
        } catch (error) {
          // console.error("Failed to fetch planner stats", error);
        } finally {
          setIsLearningPlannerLoading(false);
        }
      };

      // 2. Fetch Analytics Data
      const fetchAnalytics = async (sId: number) => {
        try {
          setIsAnalyticsLoading(true);
          const [
            confidenceRes,
            progressRes,
            consistencyRes,
            readinessRes,
            scoresRes,
          ] = await Promise.all([
            ApiServices.getParentConfidence(sId),
            ApiServices.getAnalyticsProgressingAbility(),
            ApiServices.getParentConsistency(sId),
            ApiServices.getParentExamReadiness(sId),
            ApiServices.getParentAverageScore(sId),
          ]);

          const scores: SubjectScore[] = scoresRes.data?.data || [];
          const subjectNames = scores
            .map((s: SubjectScore) => s.subject_name)
            .join(", ");
          const mathScore =
            scores.find((s: SubjectScore) => s.subject_name === "Mathematics")
              ?.average_percentage || 0;
          const confidenceList: Confidence[] = confidenceRes.data?.data || [];

          // Calculate Science Average
          const scienceSubjects = ["Physics", "Chemistry", "Biology"];
          const scienceScores = scores.filter((s: SubjectScore) =>
            scienceSubjects.includes(s.subject_name),
          );
          const scienceAvg = scienceScores.length
            ? scienceScores.reduce(
                (acc: number, curr: SubjectScore) =>
                  acc + curr.average_percentage,
                0,
              ) / scienceScores.length
            : 0;

          setStudentData((prev) => ({
            ...prev,
            progressScore:
              progressRes.data?.data?.progress_percentage || prev.progressScore,
            subjects: subjectNames,
            subjectsArray: scores,
            scienceAvg: Math.round(scienceAvg),
            mathematicsScore: Math.round(mathScore),
          }));

          setAnalyticsData((prev) => ({
            ...prev,
            confidence: confidenceList,
            consistency:
              consistencyRes.data?.data?.consistency_score_percentage || 0,
            examReadiness:
              readinessRes.data?.data?.exam_readiness_percentage || 0,
            subjectScores: scores,
          }));
        } catch (error) {
          // console.error("Failed to fetch analytics", error);
        } finally {
          setIsAnalyticsLoading(false);
        }
      };

      // 3. Fetch Strengths & Weaknesses
      const fetchStrengths = async (sId: number) => {
        try {
          setIsStrengthLoading(true);
          const strengthRes = await ApiServices.getParentStrengthWeakness(sId);
          const strengthsData = strengthRes.data?.data?.strengths || [];
          const weaknessesData = strengthRes.data?.data?.weaknesses || [];
          const derivedStrengths = strengthsData
            .slice(0, 5)
            .map((s: any) => s.chapter_name);
          const derivedImprovements = weaknessesData
            .slice(0, 5)
            .map((s: any) => s.chapter_name);

          setAnalyticsData((prev) => ({
            ...prev,
            strengths: derivedStrengths.length > 0 ? derivedStrengths : [],
            improvements:
              derivedImprovements.length > 0 ? derivedImprovements : [],
          }));
        } catch (error) {
          // console.error("Failed to fetch strengths", error);
        } finally {
          setIsStrengthLoading(false);
        }
      };

      // 4. Fetch Pending Tasks
      const fetchPendingTasks = async () => {
        try {
          setIsPendingTasksLoading(true);
          const pendingRes = await ApiServices.getAnalyticsPendingTasks();
          setAnalyticsData((prev) => ({
            ...prev,
            pendingTasks: pendingRes.data?.data || [],
          }));
        } catch (error) {
          // console.error("Failed to fetch pending tasks", error);
        } finally {
          setIsPendingTasksLoading(false);
        }
      };

      fetchLearningPlanner();
      fetchAnalytics(studentId);
      fetchStrengths(studentId);
      fetchPendingTasks();
    };

    fetchDashboardData(selectedChildId!);
  }, [, children, selectedChildId]);

  const getProgressColor = (value: number) => {
    if (value >= 80) return "bg-green-500";
    if (value >= 65) return "bg-lime-500";
    return "bg-gradient-to-r from-red-500 via-orange-400 to-yellow-400";
  };

  const getInitial = () => {
    return parentProfile.parent_name?.charAt(0).toUpperCase();
  };

  // Mini loader component for inline use
  const SectionLoader = ({ message }: { message?: string }) => (
    <div className="flex flex-col items-center gap-2 py-4">
      <div className="w-6 h-6 border-2 border-gray-200 border-t-[#BADA55] rounded-full animate-spin"></div>
      {message && (
        <span className="text-[10px] text-gray-400 font-medium">{message}</span>
      )}
    </div>
  );

  return (
    <div className=" min-h-screen p-6 relative">
      {/* Header Section */}
      <header className="flex flex-wrap justify-between items-start mb-8 gap-6">
        <div className="flex gap-4 items-start">
          {/* Avatar Area */}
          <div className="relative group cursor-pointer">
            <div className="w-[90px] h-[90px] rounded-full overflow-hidden flex-shrink-0 border-3 border-gray-200 group-hover:border-[#BADA55] transition-colors duration-300 bg-gray-100 flex items-center justify-center">
              {isImageLoading || uploading ? (
                <div className="absolute inset-0 flex items-center justify-center bg-white/50 rounded-full">
                  <div className="w-8 h-8 border-3 border-gray-200 border-t-[#BADA55] rounded-full animate-spin"></div>
                </div>
              ) : profileImage ? (
                <img
                  src={profileImage}
                  alt="Profile"
                  className="w-full h-full object-cover"
                  onError={() => setProfileImage("")}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#BADA55] to-lime-500 text-white">
                  <span className="text-4xl font-bold">{getInitial()}</span>
                </div>
              )}
            </div>
            {/* Hidden File Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              aria-label="Upload profile picture"
              disabled={uploading}
            />
          </div>

          {/* Profile Info */}
          <div className="flex flex-col gap-0.5 min-w-[200px]">
            <span className=" text-2xl text-[#ABB3BC] font-bold tracking-wide">
              My Dashboard
            </span>
            {isParentProfileLoading ? (
              <div className="h-24 flex items-center">
                <div className="w-5 h-5 border-2 border-gray-200 border-t-[#BADA55] rounded-full animate-spin"></div>
              </div>
            ) : (
              <>
                <h1 className="text-3xl font-bold text-primary m-0">
                  Hi{" "}
                  {parentProfile.parent_name
                    .split(" ")
                    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(" ")}{" "}
                  !
                </h1>
                <p className="text-sm text-primary font-medium m-0">
                  {parentProfile.school_name}
                </p>
                <p className="text-sm text-primary m-0">
                  {parentProfile.board_name} | {parentProfile.class_name}
                </p>
                <p className="text-sm text-primary m-0 break-words max-w-xl">
                  Subjects: {parentProfile.subjects.join(", ")}
                </p>
              </>
            )}
            <div className="flex flex-col gap-1 mt-4 lg:mt-0 text-left">
              <label className="text-sm text-primary tracking-wider">
                Select Your Child
              </label>
              <div className="relative">
                {isChildrenLoading ? (
                  <div className="flex items-center h-8">
                    <div className="w-4 h-4 border-2 border-gray-200 border-t-[#BADA55] rounded-full animate-spin"></div>
                  </div>
                ) : (
                  <select
                    value={selectedChildId ?? ""}
                    onChange={(e) => setSelectedChildId(Number(e.target.value))}
                    className="appearance-none bg-white border border-gray-200 rounded-lg px-4 py-1.5 pr-8 text-sm font-medium text-primary shadow-sm focus:outline-none focus:ring-2 focus:ring-[#BADA55] focus:border-[#BADA55] hover:border-[#BADA55] transition-all cursor-pointer min-w-[120px]"
                  >
                    {children.length === 0 && <option value="">None</option>}
                    {children.map((child) => (
                      <option
                        key={child.student_id}
                        value={child.student_id}
                        title={child.full_name}
                      >
                        {child.full_name.length > 20
                          ? child.full_name.substring(0, 20) + "..."
                          : child.full_name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Badges */}
        <div className="flex items-center gap-2 pt-8 pl-10 pr-8 -mr-auto">
          {isLearningPlannerLoading ? (
            <div className="w-[80px] h-[80px] flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-gray-200 border-t-[#BADA55] rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="flex items-center justify-center bg-highlighter w-[80px] h-[80px] rounded-full pl-2">
              <span className="text-3xl font-bold text-red-500 drop-shadow-sm">
                {studentData.daysLeft}
              </span>
            </div>
          )}
          <span className="text-xs font-bold text-primary leading-tight">
            Days left for
            <br />
            Annual
            <br />
            Exam
          </span>
        </div>

        <div className="flex items-center gap-4 pr-8 pt-8 pl-10 -mr-auto">
          <div className="relative w-[80px] h-[80px]">
            {isAnalyticsLoading ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-gray-200 border-t-[#BADA55] rounded-full animate-spin"></div>
              </div>
            ) : (
              <>
                <svg
                  width="80"
                  height="80"
                  viewBox="0 0 80 80"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle
                    cx="40"
                    cy="40"
                    r="38"
                    fill="#FFED00"
                    stroke="#E5D600"
                    strokeWidth="1"
                  />
                  <line
                    x1="12"
                    y1="68"
                    x2="68"
                    y2="12"
                    stroke="white"
                    strokeWidth="3"
                  />
                </svg>
                <span className="absolute top-[12px] left-[18px] text-xl font-bold text-red-500">
                  {studentData.progressScore}
                </span>
                <span className="absolute bottom-[12px] right-[8px] text-lg font-bold text-primary">
                  100
                </span>
              </>
            )}
          </div>
          <span className="text-xs font-bold text-primary leading-snug">
            You are
            <br />
            progressing
            <br />
            steadily
          </span>
        </div>

        {/* Score Badges */}
        <div className="flex items-center pr-2 ml-auto mr-4 mt-11">
          <div className="flex gap-24">
            {isAnalyticsLoading && studentData.subjectsArray?.length === 0 ? (
              <div className="flex items-center h-[120px] w-full justify-center">
                <SectionLoader message="Scores" />
              </div>
            ) : studentData.subjectsArray?.length > 0 ? (
              studentData.subjectsArray.map((subject, index) => {
                const subjectScore = analyticsData.subjectScores.find(
                  (s) => s.subject_name === subject.subject_name,
                )?.average_percentage;
                return (
                  <div
                    key={index}
                    className="flex flex-col items-center justify-end text-center min-h-[120px] w-[100px]"
                  >
                    <div className="flex items-center justify-center bg-highlighter w-[70px] h-[70px] rounded-full mb-2">
                      {isAnalyticsLoading && subjectScore === undefined ? (
                        <div className="w-4 h-4 border-2 border-gray-200 border-t-[#BADA55] rounded-full animate-spin"></div>
                      ) : (
                        <span className="text-xl font-bold text-red-500">
                          {Math.round(subjectScore || 0)}%
                        </span>
                      )}
                    </div>
                    <span className="block text-xs font-bold text-primary mt-1 uppercase tracking-wider max-w-[100px] break-words whitespace-normal text-center">
                      {subject.subject_name}
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="flex items-center h-[120px] w-full justify-center">
                <span className="text-xs text-gray-400">No subjects</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <section>
          <div className="border-t-4 border-[#555555] mb-2 w-[600px]"></div>
          <div className="grid grid-cols-2 gap-8 mb-2">
            {/* Confidence Slider */}
            <div>
              <h3 className="text-sm font-semibold text-gray-800 mb-2">
                Subject Confidence Sliders
              </h3>
              {isAnalyticsLoading && analyticsData.confidence?.length === 0 ? (
                <SectionLoader />
              ) : (
                <ul className="list-none p-0 m-0">
                  {analyticsData.confidence?.length > 0 ? (
                    analyticsData.confidence.map((subject, index) => (
                      <li
                        key={index}
                        className="flex justify-between items-center py-1 text-xs text-gray-600"
                      >
                        <span>• {subject.subject_name}</span>
                        <span className="font-bold text-gray-800 w-10 text-right pr-20">
                          {Math.round(subject.confidence_score)}%
                        </span>
                      </li>
                    ))
                  ) : (
                    <p className="text-xs text-gray-400 py-2">
                      No confidence data
                    </p>
                  )}
                </ul>
              )}
            </div>
          </div>
        </section>

        <section className="flex justify-between items-start gap-8 pt-2">
          <div className="flex-1">
            <h2 className="text-3xl font-bold text-gray-800 leading-tight mb-1">
              Academic
              <br />
              Readiness Score
            </h2>
            <div className="flex gap-4 items-center">
              <div className="p-2.5 bg-gray-100 rounded-full shadow-sm flex items-center justify-center">
                <img src={IconLamb} alt="Insight" className="w-12 h-12" />
              </div>
              <p className="text-sm font-bold text-cyan-600 leading-tight">
                Focus on weak areas
                <br />
                to boost overall score
              </p>
            </div>
          </div>

          <div className="flex gap-14 items-center pl-2 -mr-auto mt-8">
            <div className="text-center relative">
              {isAnalyticsLoading ? (
                <div className="w-[70px] h-[70px] flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-gray-200 border-t-[#BADA55] rounded-full animate-spin"></div>
                </div>
              ) : (
                <div className="flex items-center justify-center bg-highlighter w-[70px] h-[70px] rounded-full mx-auto">
                  <span className="text-xl font-bold text-red-500">
                    {Math.round(analyticsData.consistency)}%
                  </span>
                </div>
              )}
              <span className="block text-xs font-bold text-primary mt-3 uppercase tracking-wider">
                Consistency
              </span>
            </div>

            <div className="text-center relative pr-4">
              {isAnalyticsLoading ? (
                <div className="w-[70px] h-[70px] flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-gray-200 border-t-[#BADA55] rounded-full animate-spin"></div>
                </div>
              ) : (
                <div className="flex items-center justify-center bg-highlighter w-[70px] h-[70px] rounded-full mx-auto">
                  <span className="text-xl font-bold text-red-500">
                    {Math.round(analyticsData.examReadiness)}%
                  </span>
                </div>
              )}
              <span className="block text-xs font-bold text-primary mt-3 uppercase tracking-wider">
                Exam Readiness
              </span>
            </div>
          </div>
        </section>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <section>
          <h2 className="text-base font-bold text-gray-800 mb-4 pb-2 border-b-4 border-[#555555]">
            Subject Performance Snapshot
          </h2>
          <div className="mb-4">
            {isAnalyticsLoading && analyticsData.subjectScores?.length === 0 ? (
              <SectionLoader />
            ) : analyticsData.subjectScores?.length > 0 ? (
              analyticsData.subjectScores.map((subject, index) => (
                <div key={index} className="flex items-center gap-2 mb-2">
                  <span className="w-20 text-xs text-gray-800 flex-shrink-0">
                    {subject.subject_name}
                  </span>
                  <div className="flex-1 h-[18px] bg-gray-200 rounded overflow-hidden">
                    <div
                      className={`h-full rounded transition-all duration-500 ${getProgressColor(subject.average_percentage)}`}
                      style={{ width: `${subject.average_percentage}%` }}
                    ></div>
                  </div>
                  <span className="w-10 text-xs text-gray-800 text-right flex-shrink-0">
                    {Math.round(subject.average_percentage)}%
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-400 py-4">No performance data</p>
            )}
          </div>
          <button className="bg-gradient-to-r from-lime-500 to-lime-600 text-primary border-none px-6 py-2.5 rounded-full text-xs font-semibold cursor-pointer transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-lime-500/40">
            Detailed Analysis
          </button>
        </section>

        <section>
          <h2 className="text-base font-bold text-gray-800 mb-4 pb-2 border-b-4 border-[#555555]">
            Strengths & Improvement Areas
          </h2>
          {isStrengthLoading ? (
            <SectionLoader />
          ) : (
            <div className="grid grid-cols-2 gap-6 mb-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-800 mb-2">
                  Strengths
                </h3>
                <ul className="list-none p-0 m-0">
                  {analyticsData.strengths?.length > 0 ? (
                    analyticsData.strengths.map((item, index) => (
                      <li
                        key={index}
                        className="text-xs text-gray-500 py-0.5 leading-relaxed"
                      >
                        • {item}
                      </li>
                    ))
                  ) : (
                    <li className="text-xs text-gray-400">No strengths</li>
                  )}
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-800 mb-2">
                  Needs Improvement
                </h3>
                <ul className="list-none p-0 m-0">
                  {analyticsData.improvements?.length > 0 ? (
                    analyticsData.improvements.map((item, index) => (
                      <li
                        key={index}
                        className="text-xs text-gray-500 py-0.5 leading-relaxed"
                      >
                        • {item}
                      </li>
                    ))
                  ) : (
                    <li className="text-xs text-gray-400">No improvements</li>
                  )}
                </ul>
              </div>
            </div>
          )}
          <button className="bg-gradient-to-r from-lime-300 to-lime-500 text-primary border-none px-6 py-2.5 rounded-full text-xs font-semibold cursor-pointer transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-lime-500/40">
            Start Recommended Practice
          </button>
        </section>

        <section>
          <h2 className="text-base font-bold text-gray-800 mb-4 pb-2 border-b-4 border-[#555555]">
            Your next best actions
          </h2>
          {isPendingTasksLoading ? (
            <SectionLoader />
          ) : (
            <ul className="list-none p-0 m-0 mb-4">
              {analyticsData.pendingTasks?.length > 0 ? (
                analyticsData.pendingTasks.slice(0, 5).map((action, index) => (
                  <li
                    key={index}
                    className="text-xs text-gray-500 py-1 leading-relaxed"
                  >
                    {action.task_name}{" "}
                    <span className="text-[10px] text-gray-400">
                      ({action.subject_name})
                    </span>
                  </li>
                ))
              ) : (
                <li className="text-xs text-gray-400 py-2">No pending tasks</li>
              )}
            </ul>
          )}
          <div className="flex gap-3 pt-4">
            <button className="bg-gradient-to-r from-lime-300 to-lime-500 text-primary border-none px-6 py-2.5 rounded-full text-xs font-semibold cursor-pointer transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-lime-500/40">
              Guide Me Now
            </button>
            <button className="bg-gray-800 text-white border-none px-6 py-2.5 rounded-full text-xs font-semibold cursor-pointer transition-all duration-300 hover:bg-gray-700 hover:-translate-y-0.5">
              Remind Me Later
            </button>
          </div>
        </section>
      </div>

      {/* <div className="fixed right-[1%] top-[80%] -translate-y-1/2 z-[100]">
        <button
          onClick={() => setIsChatOpen(true)}
          className="p-0 bg-transparent border-0 cursor-pointer"
        >
          <img src={IconChat} alt="Chat" className="w-[95px]" />
        </button>
      </div> */}
      {isChatOpen && <Chat onClose={() => setIsChatOpen(false)} />}
    </div>
  );
};

export default ParentDashboard;
