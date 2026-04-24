import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
// import IconChat from "../../../assets/icon/chat2.svg";
import ApiServices from "../../../services/ApiServices";
import Chat from "../../auth/modal/chat";

// Function to navigate to student materials with stats and selected chapter
const navigateToStudentMaterials = (
  navigate: ReturnType<typeof useNavigate>,
  stats: any,
  subjects: any[],
  selectedChapterId?: number,
) => {
  navigate("/student-materials", {
    state: {
      boardName: stats.board_name,
      className: stats.class_name,
      subjects: (subjects || []).map((s) => s.subject_name),
      subjectWisePlan: subjects,
      stats: stats,
      selectedChapterId: selectedChapterId,
    },
  });
};

// Function to navigate to practice/test section with selected chapter
// const navigateToTests = (
//   navigate: ReturnType<typeof useNavigate>,
//   stats: any,
//   subjects: any[],
//   selectedChapterId: number,
// ) => {
//   navigate("/student-materials", {
//     state: {
//       boardName: stats.board_name,
//       className: stats.class_name,
//       subjects: subjects.map((s) => s.subject_name),
//       subjectWisePlan: subjects,
//       stats: stats,
//       selectedChapterId: selectedChapterId,
//       activeResourceType: "Tests",
//     },
//   });
// };

// const navigateToTests = (
//   navigate: ReturnType<typeof useNavigate>,
//   stats: any,
//   subjects: any[],
//   selectedChapterId: number,
//   selectedSubjectName: string,
// ) => {
//   navigate("/student-materials", {
//     state: {
//       boardName: stats.board_name,
//       className: stats.class_name,
//       subjects: subjects.map((s) => s.subject_name),
//       subjectWisePlan: subjects,
//       stats: stats,
//       selectedChapterId: selectedChapterId,
//       activeResourceType: "Tests",
//       selectedSubjectName: selectedSubjectName, // ✅ ADD THIS
//     },
//   });
// };
const navigateToTests = (
  navigate: ReturnType<typeof useNavigate>,
  stats: any,
  subjects: any[],
  selectedChapterId: number,
  selectedSubjectName: string,
) => {
  const selectedSubject = (subjects || []).find(
    (s) => s.subject_name === selectedSubjectName,
  );

  const selectedChapter = selectedSubject?.chapters?.find(
    (ch: any) => ch.chapter_id === selectedChapterId,
  );

  const selectedTopicIds =
    selectedChapter?.topics
      ?.filter((t: any) => t.is_completed) // or your logic
      .map((t: any) => t.topic_id) || [];

  navigate("/parent-material", {
    state: {
      boardName: stats.board_name,
      className: stats.class_name,
      subjects: (subjects || []).map((s) => s.subject_name),
      subjectWisePlan: subjects,
      stats: stats,
      selectedChapterId: selectedChapterId,
      activeResourceType: "Tests",
      selectedSubjectName: selectedSubjectName,

      //  ADD THIS
      selectedTopicIds: selectedTopicIds,
    },
  });
};
type Priority = "High" | "Medium" | "Low";

interface ApiTopic {
  topic_id: number;
  topic_name: string;
  is_completed: boolean;
  estimated_hours: number;
  status: string;
}

interface ApiChapter {
  chapter_id: number;
  chapter_name: string;
  start_date: string;
  end_date: string;
  start_end_date: string;
  estimated_hours: number;
  remaining_hours: number;
  priority: Priority;
  progress_percentage: number;
  status: string;
  target_completion_days: number;
  topics: ApiTopic[];
}

interface ApiSubjectPlan {
  subject_id: number;
  subject_name: string;
  chapters: ApiChapter[];
}

const ParentLearningPlanner: React.FC = () => {
  const [subjects, setSubjects] = useState<ApiSubjectPlan[]>([]);
  const [activeSubject, setActiveSubject] = useState("");
  const [expandedChapters, setExpandedChapters] = useState<Set<number>>(
    new Set(),
  );

  const [profileImage, setProfileImage] = useState<string>(" ");
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const navigate = useNavigate();

  const toggleChapterAccordion = (chapterId: number) => {
    setExpandedChapters((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(chapterId)) {
        newSet.delete(chapterId);
      } else {
        newSet.add(chapterId);
      }
      return newSet;
    });
  };

  // const fetchLearningPlan = async () => {
  //   try {
  //     const getResponse = await ApiServices.getTeacherLearningPlanner();
  //     const getResult = getResponse.data;
  //     if (
  //       getResult.status === "success" &&
  //       getResult.data.subject_wise_plan?.length > 0
  //     ) {
  //       // console.log("Using existing learning plan");

  //       setSubjects(getResult.data.subject_wise_plan);
  //       setStats(getResult.data.stats);
  //       setActiveSubject(
  //         (prev) => prev || getResult.data.subject_wise_plan[0].subject_name,
  //       );
  //       return;
  //     }

  //     // const generateResponse = await ApiServices.generateLearningPlan({
  //     //   topic_ids: null,
  //     // });
  //     // console.log("Generate Plan Response:", generateResponse);
  //     const newGetResponse = await ApiServices.getTeacherLearningPlanner();

  //     // console.log("New GET Response:", newGetResponse);

  //     const newGetResult = newGetResponse.data;
  //     // console.log("New GET Result Data:", newGetResult);

  //     if (newGetResult.status === "success") {
  //       setSubjects(newGetResult.data.subject_wise_plan);
  //       setStats(newGetResult.data.stats);
  //       setActiveSubject(
  //         (prev) => prev || newGetResult.data.subject_wise_plan[0].subject_name,
  //       );
  //     }
  //   } catch (error) {
  //     // console.error("Learning Planner Error:", error);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const fetchLearningPlan = async () => {
    try {
      const response = await ApiServices.getTeacherLearningPlanner();
      const result = response.data;

      if (result.status === "success") {
        const plans = result.data?.subject_wise_plan || [];

        setSubjects(plans);
        setStats(result.data?.stats);

        if (plans.length > 0) {
          setActiveSubject((prev) => prev || plans[0]?.subject_name || "");
        }
      }
    } catch (error) {
      // console.error("Learning Planner Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProfileImage = async () => {
    try {
      const response = await ApiServices.getUserProfileImage();

      if (response.data?.status === "success" && response.data?.data?.image) {
        setProfileImage(response.data.data.image); // base64 image
      }
    } catch (error) {
      // console.error("Failed to fetch profile image", error);
    }
  };

  useEffect(() => {
    fetchLearningPlan();
    fetchProfileImage();
  }, []);

  const updateTopic = async (
    chapterId: number,
    topicId: number,
    isCompleted: boolean,
  ) => {
    const payload = [
      {
        chapter_id: chapterId,
        topic_id: topicId,
        status: isCompleted ? "Pending" : "Completed",
      },
    ];

    try {
      await ApiServices.updateTopicStatus(payload);

      //  Fetch updated data from backend
      await fetchLearningPlan();

      // Update UI locally after success
      setSubjects((prev) =>
        prev.map((sub) => ({
          ...sub,
          chapters: (sub.chapters || []).map((ch) =>
            ch.chapter_id === chapterId
              ? {
                ...ch,
                topics: (ch.topics || []).map((t) =>
                  t.topic_id === topicId
                    ? { ...t, is_completed: !isCompleted }
                    : t,
                ),
              }
              : ch,
          ),
        })),
      );
    } catch (err) {
      // console.error("Update topic failed", err);
    }
  };

  // const updatePriority = async (
  //   chapterId: number,
  //   currentPriority: "High" | "Medium" | "Low",
  // ) => {
  //   const nextPriority = getNextPriority(currentPriority);

  //   const payload = {
  //     chapter_id: chapterId,
  //     priority: nextPriority,
  //   };

  //   try {
  //     //  API call
  //     await ApiServices.updateChapterPriority(payload);

  //     //  Update UI after success
  //     setSubjects((prev) =>
  //       prev.map((sub) => ({
  //         ...sub,
  //         chapters: sub.chapters.map((ch) =>
  //           ch.chapter_id === chapterId
  //             ? { ...ch, priority: nextPriority }
  //             : ch,
  //         ),
  //       })),
  //     );
  //   } catch (error) {
  //     console.error("Priority update failed", error);
  //   }
  // };

  // const getPriorityClasses = (priority: string) => {
  //   switch (priority.toLowerCase()) {
  //     case "high":
  //       return "bg-red-500 text-white";
  //     case "medium":
  //       return "bg-[#EF7F1A] text-white";
  //     case "low":
  //       return "bg-[#FFED00] text-primary";
  //     default:
  //       return "bg-gray-200 text-gray-700";
  //   }
  // };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return "bg-green-500";
    if (progress >= 50) return "bg-yellow-400";
    if (progress >= 30) return "bg-orange-500";
    return "bg-red-500";
  };

  // const getNextPriority = (
  //   current: "High" | "Medium" | "Low",
  // ): "High" | "Medium" | "Low" => {
  //   if (current === "High") return "Medium";
  //   if (current === "Medium") return "Low";
  //   return "High";
  // };

  // Get first letter of name for avatar fallback
  const getInitial = () => {
    return stats?.teacher_name?.charAt(0).toUpperCase() || stats?.student_name?.charAt(0).toUpperCase() || "";
  };

  return (
    <div className="min-h-screen p-6 relative">
      {isLoading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-xl">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-gray-200 border-t-[#BADA55] rounded-full animate-spin"></div>
            <span className="text-sm text-gray-500 font-medium">
              Loading learning planner...
            </span>
          </div>
        </div>
      )}
      {/* Header Section */}
      <header className="flex flex-wrap justify-between items-start gap-6 pb-6">
        <div className="flex gap-4 items-start">
          {/* Avatar */}
          <div className="w-[90px] h-[90px] rounded-full overflow-hidden flex-shrink-0 border-3 border-gray-200 flex items-center justify-center bg-gray-100">
            {profileImage ? (
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

          {/* Profile Info */}

          {stats && (
            <div className="flex flex-col gap-0.5 ">
              <span className="text-2xl text-[#ABB3BC] font-bold tracking-wide">
                Learning Planner
              </span>
              <h1 className="text-3xl font-bold text-primary m-0">
                Hi{" "}
                {stats.teacher_name
                  ? stats.teacher_name
                    .split(" ")
                    .map(
                      (word: string) =>
                        word.charAt(0).toUpperCase() + word.slice(1),
                    )
                    .join(" ")
                  : ""}{" "}
                !
              </h1>
              <p className="text-sm text-primary font-medium m-0">
                {stats.institute_name}
              </p>
              <p className="text-sm text-primary m-0">
                {stats.board_name} | {stats.class_name}
              </p>
              <p className="text-sm text-primary m-0  break-words max-w-xl">
                Subject: {(stats?.subject_name || []).join(", ")}{" "}
              </p>
            </div>
          )}
        </div>

        {/* Stats Badges */}
        <div className="flex flex-wrap items-center gap-10">
          {stats && (
            <div className="flex items-center gap-4">
              <div className="w-[6rem] h-[6rem] rounded-full bg-yellow flex items-center justify-center">
                <span className="text-4xl font-bold text-red">
                  {stats.days_left}
                </span>
              </div>

              <div className="leading-snug">
                <p className="text-xs font-bold mt-7 text-primary">
                  Days Left for
                  <br />
                  Annual
                  <br />
                  Exam
                </p>
                <br />
                <strong>{stats.examName}</strong>
              </div>
            </div>
          )}
          {stats && (
            <>
              {/* Chapters Assigned */}
              <div className="text-center">
                <div className="w-[4.688rem] h-[4.688rem] rounded-full bg-yellow flex items-center justify-center mx-auto mb-1">
                  <span className="text-lg font-bold text-red">
                    {stats.chapters_assigned_globally}
                  </span>
                </div>
                <p className="text-xs font-medium text-primary">
                  Chapters Assigned
                </p>
              </div>

              {/* Completed */}
              <div className="text-center">
                <div className="w-[4.688rem] h-[4.688rem] rounded-full bg-yellow flex items-center justify-center mx-auto mb-1">
                  <span className="text-lg font-bold text-red">
                    {stats?.completed_count ? stats.completed_count : 0}
                  </span>
                </div>
                <p className="text-xs font-medium text-primary">Completed</p>
              </div>

              {/* Pending */}
              <div className="text-center">
                <div className="w-[4.688rem] h-[4.688rem] rounded-full bg-yellow flex items-center justify-center mx-auto mb-1">
                  <span className="text-lg font-bold text-red">
                    {stats?.pending_count ? stats.pending_count : 0}
                  </span>
                </div>
                <p className="text-xs font-medium text-primary">Pending</p>
              </div>
            </>
          )}
        </div>
      </header>
      <div className="flex flex-wrap gap-3 items-center justify-center mb-6">
        {(subjects || []).map((subject) => (
          <button
            key={subject.subject_name}
            onClick={() => setActiveSubject(subject.subject_name)}
            className={`px-6 py-2.5 rounded-full text-sm font-medium cursor-pointer transition-all duration-300 border-none
      ${activeSubject === subject.subject_name
                ? "bg-button-primary text-primary font-semibold"
                : "bg-primary text-white font-semibold"
              }`}
          >
            {subject.subject_name}
          </button>
        ))}

        {/* <div className="ml-auto cursor-pointer p-2">
          <img src="/vec.svg" alt="Filter" />
        </div> */}
      </div>
      <div className="overflow-x-auto mb-6 border-t-4 border-gray-300 ">
        <table className="w-full border-collapse text-sm">
          <thead className="border-b-2 border-gray-300">
            <tr>
              <th className="text-left py-3 px-2 font-bold text-primary text-lg whitespace-nowrap">
                Sl No.
              </th>
              <th className="text-left py-3 px-2 font-bold text-primary text-lg whitespace-nowrap">
                Chapter Name
              </th>
              <th className="text-left py-3 px-2 font-bold text-primary text-lg whitespace-nowrap">
                Core Topics
              </th>
              {/* <th className="text-left py-3 px-2 font-bold text-primary text-lg whitespace-nowrap">
                Priority
              </th> */}
              <th className="text-left py-3 px-2 font-bold text-primary text-lg whitespace-nowrap">
                Start-End Date
              </th>
              <th className="text-left py-3 px-2 font-bold text-primary text-lg whitespace-nowrap">
                Progress %
              </th>
              <th className="text-left py-3 px-2 font-bold text-primary text-lg whitespace-nowrap">
                Materials
              </th>
              <th className="text-center py-3 px-2 font-bold text-primary text-lg whitespace-nowrap">
                Practice
              </th>
              <th className="text-left py-3 px-2 font-bold text-primary text-lg whitespace-nowrap">
                Ask AI
              </th>
            </tr>
          </thead>
          <tbody>
            {(subjects || [])
              .filter((sub) => sub.subject_name === activeSubject)
              .flatMap((sub) => sub.chapters || [])
              .map((chapter, index) => (
                <React.Fragment key={chapter.chapter_id}>
                  <tr className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="py-3 px-2 text-primary font-medium">
                      <button
                        onClick={() =>
                          toggleChapterAccordion(chapter.chapter_id)
                        }
                        className="flex items-center gap-1 cursor-pointer hover:bg-gray-100 p-1 rounded transition-colors"
                        title="Expand/Collapse"
                      >
                        <span
                          className="material-symbols-outlined text-base"
                          style={{
                            transform: expandedChapters.has(chapter.chapter_id)
                              ? "rotate(90deg)"
                              : "rotate(0deg)",
                            transition: "transform 0.2s",
                          }}
                        >
                          arrow_forward_ios
                        </span>
                        <span>{index + 1}</span>
                      </button>
                    </td>

                    <td className="py-3 px-2 font-bold text-primary">
                      {chapter.chapter_name}
                    </td>
                    <td className="py-3 px-2 text-xs">
                      {expandedChapters.has(chapter.chapter_id)
                        ? `${chapter.topics?.length || 0} topics`
                        : (chapter.topics || [])
                          .slice(0, 2)
                          .map((t) => t.topic_name)
                          .join(", ")}

                      {!expandedChapters.has(chapter.chapter_id) &&
                        (chapter.topics?.length || 0) > 2 &&
                        "..."}
                    </td>
                    {/* <td className="py-3 px-2 text-xs">
                      {expandedChapters.has(chapter.chapter_id)
                        ? `${chapter.topics.length} topics`
                        : chapter.topics
                            .slice(0, 2)
                            .map((t) => t.topic_name)
                            .join(", ")}
                      {!expandedChapters.has(chapter.chapter_id) &&
                        chapter.topics.length > 2 &&
                        "..."}
                    </td> */}
                    {/* <td className="py-3 px-2">
                      <span
                        onClick={() =>
                          updatePriority(chapter.chapter_id, chapter.priority)
                        }
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold cursor-pointer select-none transition-opacity hover:opacity-80 ${getPriorityClasses(
                          chapter.priority,
                        )}`}
                        title="Click to change priority"
                      >
                        {chapter.priority}
                      </span>
                    </td> */}
                    <td className="py-3 px-2 text-xs">
                      <div className="flex justify-center items-center gap-2 w-full">
                        {chapter.start_end_date}
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-2 relative group/progress">
                        <div className="w-20 h-2 bg-gray-200 rounded overflow-hidden cursor-pointer">
                          <div
                            className={`h-full ${getProgressColor(
                              chapter.progress_percentage,
                            )}`}
                            style={{
                              width: `${chapter.progress_percentage}%`,
                            }}
                          />
                        </div>
                        <span className="text-xs text-gray-500">
                          {chapter?.progress_percentage
                            ? `${chapter.progress_percentage}%`
                            : "0%"}
                        </span>
                        {/* Tooltip on hover */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-[#1B3156] text-white text-xs rounded-lg shadow-lg whitespace-nowrap opacity-0 invisible group-hover/progress:opacity-100 group-hover/progress:visible transition-all duration-200 pointer-events-none z-10">
                          {chapter?.remaining_hours
                            ? `${chapter.remaining_hours} hrs left`
                            : "0 hrs left"}
                          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#1B3156]"></div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      <div className="flex justify-center items-center gap-2 w-full">
                        <img
                          src="/viewmat2.svg"
                          alt="View Materials"
                          className="w-5 h-5 cursor-pointer hover:opacity-80 transition-opacity"
                          title="View Materials"
                          onClick={() =>
                            navigateToStudentMaterials(
                              navigate,
                              stats,
                              subjects,
                              chapter.chapter_id,
                            )
                          }
                        />
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      <div className="flex justify-center items-center gap-2 w-full">
                        <span
                          onClick={() =>
                            navigateToTests(
                              navigate,
                              stats,
                              subjects,
                              chapter.chapter_id,
                              activeSubject,
                            )
                          }
                          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold cursor-pointer select-none transition-opacity hover:opacity-80 ${chapter.status === "Completed"
                              ? "bg-green-500 text-white"
                              : "bg-green-500 text-white"
                            }`}
                          title="Click to take tests"
                        >
                          {chapter.status === "Completed"
                            ? "Completed"
                            : "Tests"}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-2 text-center">
                      <div className="flex justify-center items-center gap-2 w-full">
                        <img src="/emoji.svg" alt="Ask AI" />
                      </div>
                    </td>
                  </tr>

                  {/* Expandable Row */}
                  {expandedChapters.has(chapter.chapter_id) && (
                    <tr className="border-b-2 border-gray-300">
                      <td colSpan={9} className="py-4 px-6">
                        <div className="space-y-3">
                          <h4 className="font-semibold text-primary mb-3">
                            Topics in {chapter.chapter_name}
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {(chapter.topics || []).map((topic) => (
                              <div
                                key={topic.topic_id}
                                onClick={() =>
                                  updateTopic(
                                    chapter.chapter_id,
                                    topic.topic_id,
                                    topic.is_completed,
                                  )
                                }
                                className="flex items-center gap-2 cursor-pointer"
                              >
                                {topic.is_completed ? (
                                  <span className="w-5 h-5 rounded-full border-2 border-green-500 bg-green-500 flex items-center justify-center text-white text-xs flex-shrink-0">
                                    ✓
                                  </span>
                                ) : (
                                  <span className="w-5 h-5 rounded-full border-2 border-gray-300 flex-shrink-0" />
                                )}
                                <div className="flex-1">
                                  <p
                                    className={`text-sm font-medium ${topic.is_completed
                                        ? "line-through text-gray-400"
                                        : "text-primary"
                                      }`}
                                  >
                                    {topic.topic_name}
                                  </p>
                                  {/* <p className="text-xs text-gray-500">
                                    Status: {topic.status}
                                  </p> */}
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Chapter Summary */}
                          {/* <div className="mt-4 p-3 bg-white rounded-lg border border-gray-200">
                            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                              <div>
                                <p className="text-xs text-gray-600 font-medium">
                                  Total Topics
                                </p>
                                <p className="text-lg font-bold text-primary">
                                  {chapter.topics.length}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-600 font-medium">
                                  Completed
                                </p>
                                <p className="text-lg font-bold text-green-600">
                                  {
                                    chapter.topics.filter(
                                      (t) => t.is_completed,
                                    ).length
                                  }
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-600 font-medium">
                                  Estimated Hours
                                </p>
                                <p className="text-lg font-bold text-blue-600">
                                  {chapter.estimated_hours}h
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-600 font-medium">
                                  Remaining Hours
                                </p>
                                <p className="text-lg font-bold text-red-600">
                                  {chapter.remaining_hours}h
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-600 font-medium">
                                  Days to Complete
                                </p>
                                <p className="text-lg font-bold text-orange-600">
                                  {chapter.target_completion_days}
                                </p>
                              </div>
                            </div>
                          </div> */}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
          </tbody>
        </table>
      </div>
      <div className="grid grid-cols-1 text-[#AFAFAF] md:grid-cols-2 gap-20 p-6 bg-white rounded-lg mb-6 ml-auto w-fit">
        <div>
          <h4 className="text-sm font-bold mb-3">Primary Actions</h4>
          <p className="text-xs my-1 leading-relaxed">
            <strong className="">Study →</strong> Opens Vidya Kosh (videos +
            notes)
          </p>
          <p className="text-xs my-1 leading-relaxed">
            <strong className="">Practice →</strong> Chapter-wise tests &
            numericals
          </p>
          <p className="text-xs  my-1 leading-relaxed">
            <strong className="">Test →</strong> Timed ICSE-style assessment
          </p>
        </div>
        <div>
          <h4 className="text-sm font-bold text-[#AFAFAF] mb-3">
            Secondary Actions
          </h4>
          <p className="text-xs my-1 leading-relaxed">
            <strong className="">Revise →</strong> Opens Vidya Kosh (videos +
            notes)
          </p>
          <p className="text-xs my-1 leading-relaxed">
            <strong className="">Ask AI →</strong> Chapter-wise tests &
            numericals
          </p>
          <p className="text-xs my-1 leading-relaxed">
            <strong className="">Plan →</strong> Timed ICSE-style assessment
          </p>
        </div>
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
      {isChatOpen && <Chat onClose={() => setIsChatOpen(false)} />}
    </div>
  );
};

export default ParentLearningPlanner;
