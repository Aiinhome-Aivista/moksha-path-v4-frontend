import React, { useState, useEffect, useRef } from "react";
import ApiServices from "../../../../services/ApiServices.jsx";

interface Tab {
  name: string;
  key: string;
}

interface HeaderProfileProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  selectedSubject: string;
  onSubjectSelect: (subject: string) => void;
  selectedExam: string;
  onExamSelect: (exam: string) => void;
}

interface StudentProfile {
  student_name: string;
  school_name: string;
  board_name: string;
  class_name: string;
}

interface Subject {
  subject_id: number;
  subject_name: string;
}

export const HeaderProfile: React.FC<HeaderProfileProps> = ({
  activeTab,
  onTabChange,
  selectedSubject,
  onSubjectSelect,
  selectedExam,
  onExamSelect,
}) => {
  const [showDropdown, setShowDropdown] = React.useState(false);
  const [showExamDropdown, setShowExamDropdown] = useState(false);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [profileImage, setProfileImage] = useState<string>("");
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [subjectsList, setSubjectsList] = useState<Subject[]>([]);
  
  const subjectDropdownRef = useRef<HTMLDivElement>(null);
  const examDropdownRef = useRef<HTMLDivElement>(null);

  // ✅ Hardcoded map of subjects and their notification counts
  const notifications: Record<string, number> = {
    "Mathematics": 3,
    "Science": 1,
    "English": 5
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await ApiServices.getStudentProfile();
        if (response.data && response.data.status === "success") {
          setProfile(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching student profile:", error);
      }
    };
    fetchProfile();
  }, []);

  useEffect(() => {
    const fetchProfileImage = async () => {
      setIsImageLoading(true);
      try {
        const imageRes = await ApiServices.getUserProfileImage();
        let imgData = imageRes.data?.data?.image || imageRes.data?.data?.profile_image;
        
        // ✅ Safely handle both Base64 strings and actual HTTP URLs
        if (imageRes.data?.status === "success" && imgData && imgData.trim() !== "") {
          if (!imgData.startsWith("http") && !imgData.startsWith("data:")) {
            imgData = `data:image/jpeg;base64,${imgData}`;
          }
          setProfileImage(imgData);
        }
      } catch (error) {
        console.error("Failed to fetch student profile image", error);
      } finally {
        setIsImageLoading(false);
      }
    };
    fetchProfileImage();
  }, []);

  // ✅ Robustly fetch subjects
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const response = await ApiServices.getStudentSubjectsTabInfo();
        
        if (response.data?.status === "success") {
          // Handle various possible API wrapping structures
          const fetchedSubjects = 
            response.data.data?.subjects || 
            response.data.subjects || 
            (Array.isArray(response.data.data) ? response.data.data : []);

          if (Array.isArray(fetchedSubjects) && fetchedSubjects.length > 0) {
            setSubjectsList(fetchedSubjects);
            
            // Auto-select the first subject if none is selected currently
            if (!selectedSubject) {
              onSubjectSelect(fetchedSubjects[0].subject_name);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching student subjects:", error);
      }
    };
    fetchSubjects();
  }, [selectedSubject, onSubjectSelect]); // Re-run if selectedSubject or onSubjectSelect changes

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        subjectDropdownRef.current &&
        !subjectDropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
      if (
        examDropdownRef.current &&
        !examDropdownRef.current.contains(event.target as Node)
      ) {
        setShowExamDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const tabs: Tab[] = [
    { name: "Performance Overview", key: "performance" },
    { name: "Subjects", key: "subject" },
    { name: "Mock Exams", key: "exam" },
    { name: "Remediation", key: "remediation" },
  ];

  const examList = ["MCQ", "Quiz"];

  // ✅ Fallbacks: Get data from local storage immediately so the UI isn't blank while loading
  const localUser = JSON.parse(localStorage.getItem("active_profile") || "{}");
  const displayName = profile?.student_name || localUser?.student_name || localUser?.name || localUser?.full_name || "";
  const displayInitial = displayName ? displayName.charAt(0).toUpperCase() : "S";
  const displaySchool = profile?.school_name || localUser?.institute_name || "Loading Info...";
  const displayBoard = profile?.board_name || localUser?.board_name || "";
  const displayClass = profile?.class_name || localUser?.class_name || "";

  return (
    <>
      <div className="grid grid-cols-1 mb-1 lg:grid-cols-3 xl:grid-cols-4 items-center relative -ml-6">
        
        {/* ─── Profile Card ────────────────────────────────────────────── */}
        <div className="flex items-center gap-4 bg-[#212b36] text-white p-4 h-24 z-10 min-w-72 rounded-tr-full rounded-br-full shadow-md">
          <div className="relative flex-shrink-0">
            {profileImage ? (
              <img
                src={profileImage}
                className="w-20 h-20 rounded-full border-2 border-white object-cover shadow-sm bg-white"
                alt="profile"
                onError={() => setProfileImage("")} 
              />
            ) : (
              <div className="w-20 h-20 rounded-full border-2 border-white bg-[#BADA55] flex items-center justify-center text-[#2b3a00] text-3xl font-black shadow-sm">
                {isImageLoading ? (
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  displayInitial
                )}
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0 pr-4">
            <h2 className="text-lg font-bold truncate">
              Hi {displayName}!
            </h2>
            <p className="text-[11px] text-gray-300 leading-snug mt-0.5 truncate">
              {displaySchool} <br/>
              {displayBoard ? `(${displayBoard}) | ` : ""}{displayClass}
            </p>
            <span className="text-[10px] font-bold text-[#BADA55] uppercase tracking-widest mt-1 block">
              Top 10%
            </span>
          </div>
        </div>

        {/* ─── Tabs ─────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-around py-1 bg-[#ECECED] rounded-tr-full rounded-br-full shadow lg:col-span-2 xl:col-span-3">
          <h1 className="pl-6 text-[#00bcd4] font-black text-lg tracking-tight whitespace-nowrap hidden lg:hidden xl:block">
            My Dashboard
          </h1>
          {tabs.map((tab) => {
            if (tab.key === "subject") {
              return (
                <div key={tab.key} className="relative" ref={subjectDropdownRef}>
                  <button
                    onClick={() => {
                      onTabChange(tab.key);
                      // If no subject is selected yet, force select the first one when the tab is clicked
                      if (!selectedSubject && subjectsList.length > 0) {
                        onSubjectSelect(subjectsList[0].subject_name);
                      }
                      setShowDropdown(!showDropdown);
                      setShowExamDropdown(false);
                    }}
                    className={`px-2 py-1 flex items-center rounded-full text-lg font-bold ${
                      activeTab === tab.key
                        ? "bg-[#E59003] text-white px-6"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {activeTab === "subject" && selectedSubject ? selectedSubject : tab.name}
                    <span className="material-symbols-outlined ml-1">
                      keyboard_arrow_down
                    </span>
                  </button>

                  {showDropdown && (
                    <div
                      className="absolute top-12 left-0 bg-white shadow-lg rounded-lg w-full z-50 overflow-hidden"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {subjectsList.length > 0 ? (
                        subjectsList.map((sub) => {
                          const count = notifications[sub.subject_name];
                          
                          return (
                            <div
                              key={sub.subject_id}
                              onClick={() => {
                                onSubjectSelect(sub.subject_name);
                                setShowDropdown(false);
                              }}
                              className={`flex items-center justify-between px-4 py-2.5 text-sm cursor-pointer font-medium transition-colors ${
                                selectedSubject === sub.subject_name
                                  ? "bg-lime-50 text-lime-800"
                                  : "text-gray-700 hover:bg-gray-100"
                              }`}
                            >
                              <span>{sub.subject_name}</span>
                              <div className="flex items-center gap-2">
                                {/* ✅ Number Badge */}
                                {count && count > 0 && (
                                  <span className="flex items-center justify-center bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px]">
                                    {count}
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="px-4 py-2.5 text-sm text-left text-gray-400 italic">
                          No subjects found
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            }

            if (tab.key === "exam") {
              return (
                <div key={tab.key} className="relative" ref={examDropdownRef}>
                  <button
                    onClick={() => {
                      onTabChange(tab.key);
                      if (!selectedExam) {
                        onExamSelect(examList[0]);
                      }
                      setShowExamDropdown(!showExamDropdown);
                      setShowDropdown(false);
                    }}
                    className={`px-2 py-1 flex items-center rounded-full text-lg font-bold ${
                      activeTab === tab.key
                        ? "bg-[#E59003] text-white px-6"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {activeTab === "exam" && selectedExam ? selectedExam : tab.name}
                    <span className="material-symbols-outlined ml-1">
                      keyboard_arrow_down
                    </span>
                  </button>

                  {showExamDropdown && (
                    <div
                      className="absolute top-12 left-0 bg-white shadow-lg rounded-lg w-full z-50 overflow-hidden"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {examList.map((exam, i) => (
                        <div
                          key={i}
                          onClick={() => {
                            onExamSelect(exam);
                            setShowExamDropdown(false);
                          }}
                          className={`flex items-center justify-between px-4 py-2.5 text-sm cursor-pointer font-medium transition-colors ${
                            selectedExam === exam
                              ? "bg-lime-100 text-lime-800"
                              : "text-gray-700 hover:bg-gray-100"
                          }`}
                        >
                          <span>{exam}</span>
                          {selectedExam === exam && (
                            <span className="material-symbols-outlined text-lime-600 text-base">check</span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            }
            
            // Other tabs (normal)
            return (
              <button
                key={tab.key}
                onClick={() => {
                  onTabChange(tab.key);
                  setShowDropdown(false);
                  setShowExamDropdown(false);
                }}
                className={`px-2 py-1 rounded-full text-lg font-bold ${
                  activeTab === tab.key
                    ? "bg-[#E59003] text-white px-6"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {tab.name}
              </button>
            );
          })}
        </div>
        
        {activeTab === "subject" && selectedSubject && (
          <div className="relative left-[30rem] -top-9 px-4 mt-2">
            <h2 className="text-2xl font-semibold text-primary">
              {selectedSubject}
            </h2>
          </div>
        )}
        
      </div>
    </>
  );
};