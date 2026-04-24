import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import IconChat from "../../../assets/icon/chat2.svg";
import IconLamb from "../../../assets/icon/lamb.svg";
import ApiServices from "../../../services/ApiServices";
import Chat from '../../auth/modal/chat';

// Types and Interfaces
interface Subject {
  id: number;
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

const DashboardDyn: React.FC = () => {
  // const navigate = useNavigate();
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [isSubjectsLoading, setIsSubjectsLoading] = useState(true);
  const [isAnalyticsLoading, setIsAnalyticsLoading] = useState(true);
  const [isPendingTasksLoading, setIsPendingTasksLoading] = useState(true);
  const [isStrengthLoading, setIsStrengthLoading] = useState(true);

  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [profileImage, setProfileImage] = useState<string>("");
  const [uploading, setUploading] = useState(false);

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

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
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

  // const triggerFileInput = () => {
  //   fileInputRef.current?.click();
  // };

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
    const fetchDashboardData = async () => {
      // 1. Fetch Basic Student Info & Planner Stats
      const fetchProfile = async () => {
        try {
          const response = await ApiServices.getStudentLearningPlanner();
          if (response.data?.status === "success") {
            const stats = response.data.data.stats;
            setStudentData(prev => ({
              ...prev,
              name: stats.student_name,
              school: stats.institute_name,
              board: stats.board_name,
              class: stats.class_name,
              daysLeft: stats.days_left,
              progressScore: stats.chapters_assigned > 0 ? Math.round((stats.completed_count / stats.chapters_assigned) * 100) : 0,
            }));
          }
        } catch (error) {
          // console.error("Failed to fetch profile stats", error);
        } finally {
          setIsProfileLoading(false);
        }
      };

      // 1.5. Fetch Student Subjects
      const fetchSubjects = async () => {
        try {
          const subjectsRes = await ApiServices.getStudentSubjects();
          const subjects: Subject[] = subjectsRes.data?.data || [];
          const subjectNames = subjects.map((s: Subject) => s.subject_name).join(", ");
          setStudentData(prev => ({ ...prev, subjects: subjectNames, subjectsArray: subjects }));
        } catch (error) {
          // console.error("Failed to fetch subjects", error);
        } finally {
          setIsSubjectsLoading(false);
        }
      };

      // 2. Fetch Analytics Data
      const fetchAnalytics = async () => {
        try {
          const [
            confidenceRes,
            progressRes,
            consistencyRes,
            readinessRes,
            scoresRes,
          ] = await Promise.all([
            ApiServices.getAnalyticsConfidence(),
            ApiServices.getAnalyticsProgressingAbility(),
            ApiServices.getAnalyticsConsistency(),
            ApiServices.getAnalyticsExamReadiness(),
            ApiServices.getAnalyticsSubjectAverageScore(),
          ]);

          const scores: SubjectScore[] = scoresRes.data?.data || [];
          const mathScore = scores.find((s: SubjectScore) => s.subject_name === "Mathematics")?.average_percentage || 0;
          const confidenceList: Confidence[] = confidenceRes.data?.data || [];

          // Calculate Science Average (Physics, Chemistry, Biology)
          const scienceSubjects = ["Physics", "Chemistry", "Biology"];
          const scienceScores = scores.filter((s: SubjectScore) => scienceSubjects.includes(s.subject_name));
          const scienceAvg = scienceScores.length
            ? scienceScores.reduce((acc: number, curr: SubjectScore) => acc + curr.average_percentage, 0) / scienceScores.length
            : 0;

          setStudentData(prev => ({
            ...prev,
            progressScore: progressRes.data?.data?.progress_percentage || prev.progressScore,
            scienceAvg: Math.round(scienceAvg),
            mathematicsScore: Math.round(mathScore)
          }));

          setAnalyticsData((prev: any) => ({
            ...prev,
            confidence: confidenceList,
            consistency: consistencyRes.data?.data?.consistency_score_percentage || 0,
            examReadiness: readinessRes.data?.data?.exam_readiness_percentage || 0,
            subjectScores: scores,
          }));
        } catch (error) {
          // console.error("Failed to fetch analytics", error);
        } finally {
          setIsAnalyticsLoading(false);
        }
      };

      // 3. Fetch Strengths & Weaknesses
      const fetchStrengths = async () => {
        try {
          const strengthRes = await ApiServices.getAnalyticsStrengthWeakness();
          const strengthsData = strengthRes.data?.data?.strengths || [];
          const weaknessesData = strengthRes.data?.data?.weaknesses || [];
          const derivedStrengths = strengthsData.slice(0, 5).map((s: any) => s.chapter_name);
          const derivedImprovements = weaknessesData.slice(0, 5).map((s: any) => s.chapter_name);

          setAnalyticsData(prev => ({
            ...prev,
            strengths: derivedStrengths.length > 0 ? derivedStrengths : [],
            improvements: derivedImprovements.length > 0 ? derivedImprovements : []
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
          const pendingRes = await ApiServices.getAnalyticsPendingTasks();
          setAnalyticsData(prev => ({
            ...prev,
            pendingTasks: pendingRes.data?.data || [],
          }));
        } catch (error) {
          // console.error("Failed to fetch pending tasks", error);
        } finally {
          setIsPendingTasksLoading(false);
        }
      };

      // Execute all fetches
      fetchProfile();
      fetchSubjects();
      fetchAnalytics();
      fetchStrengths();
      fetchPendingTasks();
    };

    fetchDashboardData();
    fetchProfileImage();
  }, []);

  // Skill ratings (out of 5)
  const skillRatings = [
    { name: "Concept Understanding - 4/5", rating: 4 },
    { name: "Problem Solving - 3/5", rating: 3 },
    { name: "Application Questions -3/5", rating: 3 },
    { name: "Exam Time Management - 2/5", rating: 2 },
  ];

  // Star rating component
  const StarRating = ({
    rating,
    maxRating = 5,
  }: {
    rating: number;
    maxRating?: number;
  }) => (
    <div className="flex gap-0.5">
      {[...Array(maxRating)].map((_, i) => (
        <span
          key={i}
          style={{ fontVariationSettings: "'wght' 300, 'opsz' 20" }}
          className={`material-symbols-outlined text-sm ${i < rating ? "text-yellow-400" : "text-gray-300"}`}
        >
          star
        </span>
      ))}
    </div>
  );

  const getProgressColor = (value: number) => {
    if (value >= 80) return "bg-green-500";
    if (value >= 65) return "bg-lime-500";
    return "bg-gradient-to-r from-red-500 via-orange-400 to-yellow-400";
  };

  // Get first letter of name for avatar fallback
  const getInitial = () => {
    return studentData.name?.charAt(0).toUpperCase();
  };

  // Mini loader component for inline use
  const SectionLoader = ({ message }: { message?: string }) => (
    <div className="flex flex-col items-center gap-2 py-4">
      <div className="w-6 h-6 border-2 border-gray-200 border-t-[#BADA55] rounded-full animate-spin"></div>
      {message && <span className="text-[10px] text-gray-400 font-medium">{message}</span>}
    </div>
  );

  return (
    <div className=" min-h-screen p-6 relative">
      {/* Header Section */}
      <header className="flex flex-wrap justify-between items-start mb-8 gap-6">
        <div className="flex gap-4 items-start">
          {/* Avatar with Upload Badge */}
          <div className="relative group cursor-pointer">
            {/* Avatar Circle */}
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

            {/* Upload Badge - Bottom Right Corner */}
            {/* <button
              onClick={triggerFileInput}
              disabled={uploading}
              className="absolute bottom-0 right-0 bg-[#BADA55] hover:bg-lime-500 disabled:opacity-70 disabled:cursor-not-allowed w-[32px] h-[32px] rounded-full flex items-center justify-center shadow-lg border-2 border-white transition-all duration-300 transform group-hover:scale-110 active:scale-95"
              title="Change profile picture"
            >
              {uploading ? (
                <div className="w-4 h-4 border-2 border-gray-600 border-t-white rounded-full animate-spin"></div>
              ) : (
                <span
                  style={{ fontVariationSettings: "'wght' 600, 'opsz' 20" }}
                  className="material-symbols-outlined text-gray-700 text-lg"
                >
                  photo_camera
                </span>
              )}
            </button> */}

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
            {isProfileLoading ? (
               <div className="h-24 flex items-center">
                  <div className="w-5 h-5 border-2 border-gray-200 border-t-[#BADA55] rounded-full animate-spin"></div>
               </div>
            ) : (
              <>
                <h1 className="text-3xl font-bold text-primary m-0">
                  Hi {studentData.name.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')} !
                </h1>
                <p className="text-base text-primary font-medium m-0">
                  {studentData.school}
                </p>
                <p className="text-base text-primary font-medium m-0">
                  {studentData.board} | {studentData.class}
                </p>
              </>
            )}
            
            {isSubjectsLoading ? (
               <div className="h-6 flex items-center mt-1">
                  <div className="w-4 h-4 border-2 border-gray-200 border-t-[#BADA55] rounded-full animate-spin"></div>
               </div>
            ) : (
              <p className="text-base font-medium text-primary m-0 break-words max-w-xl">
                Subjects: {studentData.subjects}
              </p>
            )}
          </div>
        </div>

        {/* Days Badge */}
        <div className="flex items-center gap-2 pt-8 pl-10 pr-0 -mr-auto">
          {isProfileLoading ? (
             <div className="w-[100px] h-[100px] flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-gray-200 border-t-[#BADA55] rounded-full animate-spin"></div>
             </div>
          ) : (
            <div className="flex items-center justify-center bg-highlighter w-[100px] h-[100px] rounded-full p-6">
              <span className="text-5xl left-[4px] font-bold text-red-500 drop-shadow-sm">
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

        {/* Progress Badge */}
        <div className="flex items-center gap-4 pr-2 pt-9 pl-10 -ml-8 -mr-auto ">
          <div className="relative w-[100px] h-[100px]">
            {isAnalyticsLoading ? (
               <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-gray-200 border-t-[#BADA55] rounded-full animate-spin"></div>
               </div>
            ) : (
              <>
                <svg width="100" height="100" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="40" cy="40" r="38" fill="#FFED00" stroke="#E5D600" strokeWidth="1" />
                  <line x1="12" y1="68" x2="68" y2="12" stroke="white" strokeWidth="3" />
                </svg>
                <span className="absolute top-[21px] left-[18px] text-xl font-bold text-red-500">
                  {studentData.progressScore}
                </span>
                <span className="absolute bottom-[19px] right-[15px] text-lg font-bold text-primary">
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
<div className="flex items-center pr-3 ml-auto mr-4 mt-10">
  <div className="flex gap-24 items-end">
    {isSubjectsLoading ? (
      <div className="flex gap-4 items-center h-[120px] w-full justify-center">
          <SectionLoader message="Loading subjects..." />
      </div>
    ) : studentData.subjectsArray?.length > 0 ? (
      studentData.subjectsArray.map((subject: Subject, index: number) => {
        const subjectScore =
          analyticsData.subjectScores.find(
            (s: SubjectScore) => s.subject_name === subject.subject_name
          )?.average_percentage;

        return (
          <div
            key={subject.id || index} 
            className="flex flex-col items-center justify-end text-center min-h-[120px] w-[100px]"
          >
            <div className="flex items-center justify-center bg-highlighter w-[70px] h-[70px] rounded-full mb-2">
              {isAnalyticsLoading && subjectScore === undefined ? (
                <div className="w-4 h-4 border-2 border-gray-200 border-t-red-500 rounded-full animate-spin"></div>
              ) : (
                <span className="text-xl font-bold text-red-500">
                  {Math.round(subjectScore || 0)}%
                </span>
              )}
            </div>
            <span
              className="text-xs font-bold text-primary mt-1 uppercase tracking-wider max-w-[100px] break-words whitespace-normal text-center"
              style={{
                wordBreak: "break-word",
                lineHeight: "1.2",
                minHeight: "38px",
                display: "inline-block",
              }}
            >
              {subject.subject_name}
            </span>
          </div>
        );
      })
    ) : (
      <div className="flex items-center justify-center h-[120px] w-full">
        <span className="text-xs text-gray-400">No subjects found</span>
      </div>
    )}
  </div>
</div>
      </header>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
        <section>
          <div className="border-t-4 border-[#555555] mb-2 w-[600px]"></div>

          <div className="grid grid-cols-2 gap-8 mb-2">
            {/* Skill Ratings */}
            <div>
              <h3 className="text-sm font-semibold text-gray-800 mb-2">
                Skill Rating
              </h3>
              <ul className="list-none p-0 m-0">
                {skillRatings.map((skill, index) => (
                  <li
                    key={index}
                    className="flex justify-between items-center py-1 text-sm font-medium text-primary"
                  >
                    <span>• {skill.name}</span>
                    <StarRating rating={skill.rating} />
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-bold text-primary mb-2">
                Subject Confidence Sliders
              </h3>
              {isAnalyticsLoading ? (
                <SectionLoader />
              ) : (
                <ul className="list-none p-0 m-0">
                  {analyticsData.confidence?.length > 0 ? (
                    analyticsData.confidence.map((subject: Confidence, index: number) => (
                      <li
                        key={index}
                        className="flex justify-between items-center py-1 text-xs text-primary"
                      >
                        <span>• {subject.subject_name}</span>
                        <span className="font-bold text-primary w-10 text-right pr-20">
                          {Math.round(subject.confidence_score)}%
                        </span>
                      </li>
                    ))
                  ) : (
                    <p className="text-xs text-gray-400 py-2">No confidence data available</p>
                  )}
                </ul>
              )}
            </div>
          </div>

          <div className="mt-8 flex justify-between items-center w-full pr-10">
            {/* Left Side: The question text */}
            <p className="text-sm text-primary font-bold">
              Describe what you find difficult or easy?
            </p>

            {/* Right Side: The action button */}
            {/* <button
              onClick={() => navigate("/learning-planner")}
              className="bg-[#BADA55] hover:bg-lime-500 text-gray-800 px-10 py-3 rounded-full text-sm font-bold shadow-sm transition-all duration-300 hover:-translate-y-0.5"
            >
              Save & Update Learning Plan
            </button> */}
          </div>
        </section>

        <section className="flex flex-col md:flex-row justify-between items-start gap-8 pt-1">
          {/* Left Side: Title and Insight */}
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-primary leading-tight mb-4">
              Academic
              <br />
              Readiness Score
            </h2>

            <div className="flex gap-4 items-center">
              <div className="p-2.5 bg-gray-100 rounded-full shadow-sm flex items-center justify-center">
                <img src={IconLamb} alt="Insight" className="w-12 h-12" />
              </div>
              <p className="text-sm font-bold text-[#57A7B3] leading-tight">
                Focus on Physics numericals
                <br />
                to boost your overall score
              </p>
            </div>
          </div>

          {/* Right Side: The Two Large Score Circles */}
          <div className="flex gap-20 items-center md:ml-auto md:pr-8 mt-9 transform translate-x-4">
            <div className="text-center relative ">
              {isAnalyticsLoading ? (
                <div className="w-[70px] h-[70px] flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-gray-200 border-t-[#BADA55] rounded-full animate-spin"></div>
                </div>
              ) : (
                <div className="flex items-center justify-center bg-highlighter w-[70px] h-[70px] rounded-full mx-auto">
                  <span className=" text-xl font-bold text-red-500">{Math.round(analyticsData.consistency)}%</span>
                </div>
              )}
              <span className="block text-xs font-bold text-primary mt-3 uppercase tracking-wider">
                Consistency
              </span>
            </div>

            <div className="text-center relative -pr-8">
              {isAnalyticsLoading ? (
                <div className="w-[70px] h-[70px] flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-gray-200 border-t-[#BADA55] rounded-full animate-spin"></div>
                </div>
              ) : (
                <div className="flex items-center justify-center bg-highlighter w-[70px] h-[70px] rounded-full mx-auto">
                  <span className="text-xl font-bold text-red-500">{Math.round(analyticsData.examReadiness)}%</span>
                </div>
              )}
              <span className="block text-xs font-bold text-primary mt-3 uppercase tracking-wider">
                Exam Readiness
              </span>
            </div>
          </div>
        </section>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        <section>
          <h2 className="text-base font-bold text-gray-800 mb-4 pb-2 border-b-4 border-[#555555]">
            Subject Performance Snapshot
          </h2>
          <div className="mb-4 min-h-[100px]">
            {isAnalyticsLoading ? (
              <SectionLoader />
            ) : (
              analyticsData.subjectScores?.length > 0 ? (
                analyticsData.subjectScores.map((subject: SubjectScore, index: number) => (
                  <div key={index} className="flex items-center gap-2 mb-2">
                    <span className="w-28 text-xs text-gray-800 flex-shrink-0 text-left">
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
                <p className="text-xs text-gray-400">No performance data available</p>
              )
            )}
          </div>
          <button className="bg-gradient-to-r from-lime-300 to-lime-500 text-primary  border-none px-6 py-2.5 rounded-full text-xs font-semibold cursor-pointer transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-lime-500/40">
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
                    analyticsData.strengths.map((item: string, index: number) => (
                      <li
                        key={index}
                        className="text-xs text-gray-500 py-0.5 leading-relaxed"
                      >
                        • {item}
                      </li>
                    ))
                  ) : (
                    <li className="text-xs text-gray-400">No strengths identified yet</li>
                  )}
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-800 mb-2">
                  Needs Improvement
                </h3>
                <ul className="list-none p-0 m-0">
                  {analyticsData.improvements?.length > 0 ? (
                    analyticsData.improvements.map((item: string, index: number) => (
                      <li
                        key={index}
                        className="text-xs text-gray-500 py-0.5 leading-relaxed"
                      >
                        • {item}
                      </li>
                    ))
                  ) : (
                    <li className="text-xs text-gray-400">No improvement areas identified</li>
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
                analyticsData.pendingTasks.slice(0, 5).map((action: PendingTask, index: number) => (
                  <li
                    key={index}
                    className="text-xs text-gray-500 py-1 leading-relaxed"
                  >
                    {action.task_name} <span className="text-[10px] text-gray-400">({action.subject_name})</span>
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
          aria-label="Open chat"
          className="p-0 bg-transparent border-0 cursor-pointer"
        >
          <img src={IconChat} alt="Chat" className="w-[95px]" />
        </button>
      </div> */}
      {isChatOpen && (
        <Chat onClose={() => setIsChatOpen(false)} />
      )}

    </div>
  );
};

export default DashboardDyn;