// import React, { useEffect, useState } from "react";
// // import { useNavigate } from "react-router-dom";
// import ApiServices from "../../../services/ApiServices";

// // ─── Types ───────────────────────────────────────────────────────────────────

// interface BucketPerformance {
//   below_50: number;
//   "50_60": number;
//   "60_70": number;
//   "70_80": number;
//   "80_90": number;
//   "90_100": number;
// }

// interface Subject {
//   subject_id: number;
//   subject_name: string;
// }

// interface StudentEntry {
//   avg_score: number;
//   full_name: string;
//   user_id: number;
// }

// interface SubjectPerformance {
//   detailed_list: StudentEntry[];
//   lowest_performing_student: StudentEntry | null;
//   top_performing_student: StudentEntry | null;
//   total_enrolled: number;
// }

// interface ChapterEntry {
//   chapter_id: number;
//   chapter_name: string;
//   lowest_student: { full_name: string; score: number; user_id: number };
//   top_student: { full_name: string; score: number; user_id: number };
// }

// // Fixed to match the single-object response from sp_v4
// interface ClassExamPerformance {
//   class_average_percentage: number;
//   total_class_attempts: number;
//   total_students: number;
// }

// interface CurriculumItem {
//   subject: string;
//   subject_id: number;
//   covered: number;
//   total: number;
//   coverage_percentage: number;
// }

// // ─── Subject colour palette ────────────
// const SUBJECT_COLORS = [
//   "#BADA55", "#34d399", "#60a5fa", "#f97316",
//   "#a78bfa", "#22d3ee", "#fb7185", "#fbbf24",
// ];
// const getSubjectColor = (index: number) =>
//   SUBJECT_COLORS[index % SUBJECT_COLORS.length];

// interface PendingTopic {
//   topic_id: number;
//   topic_name: string;
//   subject_name: string;
//   priority: string;
// }

// interface UpcomingChapter {
//   chapter_id: number;
//   chapter_name: string;
//   subject_name: string;
// }


// interface TeacherProfile {
//   teacher_name: string;
//   class_name: string;
//   school_name: string;
// }

// // ─── Helpers ─────────────────────────────────────────────────────────────────

// const getProgressColor = (value: number) => {
//   if (value >= 80) return "#22c55e";
//   if (value >= 65) return "#84cc16";
//   if (value >= 40) return "#f97316";
//   return "#ef4444";
// };

// const getScoreBarColor = (value: number) => {
//   if (value >= 80) return "bg-green-500";
//   if (value >= 65) return "bg-lime-500";
//   if (value >= 40) return "bg-orange-400";
//   return "bg-red-400";
// };

// const getPriorityStyle = (p: string) => {
//   if (p === "High") return "bg-red-50 text-red-600 border border-red-100";
//   if (p === "Medium") return "bg-orange-50 text-orange-600 border border-orange-100";
//   return "bg-gray-50 text-gray-500 border border-gray-100";
// };

// const getSubjectBadgeColor = (subject: string) => {
//   const map: Record<string, string> = {
//     Mathematics: "#BADA55",
//     Science: "#34d399",
//     English: "#60a5fa",
//     History: "#f97316",
//     Geography: "#a78bfa",
//     "Computer Science": "#22d3ee",
//     Hindi: "#fb7185",
//   };
//   return map[subject] ?? "#9ca3af";
// };

// const bucketLabels: {
//   key: keyof BucketPerformance;
//   label: string;
//   color: string;
// }[] = [
//     { key: "90_100", label: "90–100%", color: "#22c55e" },
//     { key: "80_90", label: "80–90%", color: "#84cc16" },
//     { key: "70_80", label: "70–80%", color: "#a3e635" },
//     { key: "60_70", label: "60–70%", color: "#facc15" },
//     { key: "50_60", label: "50–60%", color: "#fb923c" },
//     { key: "below_50", label: "Below 50%", color: "#ef4444" },
//   ];

// const STUDENTS_PER_PAGE = 4;
// // const CHAPTERS_PER_PAGE = 4;

// export const TeacherDashboard: React.FC = () => {
//   const [isLoading, setIsLoading] = useState(true);
//   const [chapterPage, setChapterPage] = useState(0);
//   const [studentPage, setStudentPage] = useState(0);
//   // const navigate = useNavigate();
//   const [profileImage, setProfileImage] = useState<string>("");
//   const [uploading, setUploading] = useState(false);
//   const fileInputRef = React.useRef<HTMLInputElement>(null);

//   const [bucketData, setBucketData] = useState<BucketPerformance | null>(null);
//   const [subjects, setSubjects] = useState<Subject[]>([]);
//   const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(null);
//   const [selectedSubjectName, setSelectedSubjectName] = useState<string>("");
//   const [subjectPerf, setSubjectPerf] = useState<SubjectPerformance | null>(null);
//   const [chapterPerf, setChapterPerf] = useState<ChapterEntry[]>([]);
//   const [classExamPerf, setClassExamPerf] = useState<ClassExamPerformance | null>(null);
//   const [subjectLoading, setSubjectLoading] = useState(false);
//   const [curriculumCoverage, setCurriculumCoverage] = useState<CurriculumItem[]>([]);
//   const [pendingTopics, setPendingTopics] = useState<PendingTopic[]>([]);
//   const [upcomingChapters, setUpcomingChapters] = useState<UpcomingChapter[]>([]);
//   const [upcomingLoading, setUpcomingLoading] = useState(false);

//   // const [rankSubjectId, setRankSubjectId] = useState<number | null>(null);
//   const [topSubjectId, setTopSubjectId] = useState<number | null>(null);
//   const [bottomSubjectId, setBottomSubjectId] = useState<number | null>(null);

//   const [topStudentLimit, setTopStudentLimit] = useState(5);
//   const [bottomStudentLimit, setBottomStudentLimit] = useState(5);

//   const [topStudents, setTopStudents] = useState<StudentEntry[]>([]);
//   const [bottomStudents, setBottomStudents] = useState<StudentEntry[]>([]);

//   const [teacherProfile, setTeacherProfile] = useState<TeacherProfile | null>(null);

//   const [topStudentsLoading, setTopStudentsLoading] = useState(false);
//   const [bottomStudentsLoading, setBottomStudentsLoading] = useState(false);


//   // ── Profile ────────────────────────────────────────────────────────────────
//   const fetchProfileImage = async () => {
//     try {
//       const res = await ApiServices.getUserProfileImage();
//       if (res.data?.status === "success" && res.data?.data?.image)
//         setProfileImage(res.data.data.image);
//     } catch {
//       /* no image */
//     }
//   };

//   const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (!file) return;
//     setProfileImage(URL.createObjectURL(file));
//     try {
//       setUploading(true);
//       const fd = new FormData();
//       fd.append("file", file);
//       await ApiServices.uploadProfilePicture(fd);
//     } catch (err) {
//       // console.error("Upload failed", err);
//     } finally {
//       setUploading(false);
//     }
//   };

//   // ── Initial load ───────────────────────────────────────────────────────────
//   useEffect(() => {
//     const init = async () => {
//       try {
//         const [bucketRes, subjectsRes, classExamRes, curriculumRes, teacherRes] = await Promise.all([
//           ApiServices.getTeacherBucketPerformance(),
//           ApiServices.getTeacherSubjects(),
//           ApiServices.getTeacherClassExamPerformance(),
//           ApiServices.getTeacherCurriculumCoverage(),
//           ApiServices.getTeacherProfile(),
//         ]);

//         if (bucketRes.data?.status === "success") setBucketData(bucketRes.data.data);

//         // FIX: The backend returns an object now, not an array. We directly set it.
//         if (classExamRes.data?.status === "success") {
//           setClassExamPerf(classExamRes.data.data);
//         }

//         if (curriculumRes.data?.status === "success") setCurriculumCoverage(curriculumRes.data.data);

//         if (subjectsRes.data?.status === "success") {
//           const list: Subject[] = subjectsRes.data.data;
//           setSubjects(list);
//           if (list.length > 0) {
//             setSelectedSubjectId(list[0].subject_id);
//             setSelectedSubjectName(list[0].subject_name);
//             setTopSubjectId(list[0].subject_id);
//             setBottomSubjectId(list[0].subject_id);
//           }
//         };

//         if (teacherRes.data?.status === "success") {
//           setTeacherProfile(teacherRes.data.data);
//         };
//       } catch (err) {
//         // console.error(err);
//       } finally {
//         setIsLoading(false);
//       }
//     };
//     init();
//     fetchProfileImage();
//   }, []);

//   // ── Subject change ─────────────────────────────────────────────────────────
//   useEffect(() => {
//     if (selectedSubjectId === null) return;

//     setStudentPage(0);
//     setChapterPage(0);

//     const fetchSubjectData = async () => {
//       setSubjectLoading(true);
//       setUpcomingLoading(true);
//       try {
//         const [spRes, cpRes, upcomingRes, pendingRes] = await Promise.all([
//           ApiServices.getTeacherSubjectPerformance(selectedSubjectId),
//           ApiServices.getTeacherChapterPerformance(selectedSubjectId),
//           ApiServices.getTeacherUpcomingChapters(selectedSubjectId),
//           ApiServices.getTeacherPendingTopics(selectedSubjectId),
//         ]);

//         if (spRes.data?.status === "success") setSubjectPerf(spRes.data.data);
//         if (cpRes.data?.status === "success") setChapterPerf(cpRes.data.data);
//         if (upcomingRes.data?.status === "success") setUpcomingChapters(upcomingRes.data.data);
//         if (pendingRes.data?.status === "success") setPendingTopics(pendingRes.data.data);

//       } catch (err) {
//         // console.error(err);
//       } finally {
//         setSubjectLoading(false);
//         setUpcomingLoading(false);
//       }
//     };
//     fetchSubjectData();
//   }, [selectedSubjectId]);

//   // useEffect(() => {
//   //   if (!rankSubjectId) return;

//   //   const fetchTopBottomStudents = async () => {
//   //     try {
//   //       const res = await ApiServices.getTeacherTopBottomStudents(rankSubjectId);

//   //       if (res.data?.status === "success") {
//   //         setTopStudents(res.data.data.top_20_students || []);
//   //         setBottomStudents(res.data.data.lowest_20_students || []);
//   //       }
//   //     } catch (err) {
//   //       console.error("Top/Bottom students fetch failed", err);
//   //     }
//   //   };

//   //   fetchTopBottomStudents();
//   // }, [rankSubjectId]);

//   // ── Derived ────────────────────────────────────────────────────────────────

//   useEffect(() => {
//     if (!topSubjectId) return;

//     const fetchTopStudents = async () => {
//       setTopStudentsLoading(true);

//       try {
//         const res = await ApiServices.getTeacherTopBottomStudents(topSubjectId);

//         if (res.data?.status === "success") {
//           setTopStudents(res.data.data.top_20_students || []);
//         }
//       } catch (err) {
//         console.error(err);
//       } finally {
//         setTopStudentsLoading(false);
//       }
//     };

//     fetchTopStudents();
//   }, [topSubjectId]);

//   useEffect(() => {
//     if (!bottomSubjectId) return;

//     const fetchBottomStudents = async () => {
//       setBottomStudentsLoading(true);

//       try {
//         const res = await ApiServices.getTeacherTopBottomStudents(bottomSubjectId);

//         if (res.data?.status === "success") {
//           setBottomStudents(res.data.data.lowest_20_students || []);
//         }
//       } catch (err) {
//         console.error(err);
//       } finally {
//         setBottomStudentsLoading(false);
//       }
//     };

//     fetchBottomStudents();
//   }, [bottomSubjectId]);

//   const totalBucketStudents = bucketData
//     ? Object.values(bucketData).reduce((a, b) => a + b, 0)
//     : 0;

//   // ═══════════════════════════════════════════════════════════════════════════
//   return (
//     <div className="min-h-screen p-6 relative space-y-6 bg-[#f8f9fa]">
//       {/* ── Loading Overlay ── */}
//       {isLoading && (
//         <div className="absolute inset-0 z-50 bg-white/70 backdrop-blur-sm">
//           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-3">
//             <div className="w-10 h-10 border-4 border-gray-200 border-t-[#BADA55] rounded-full animate-spin" />
//             <span className="text-sm text-gray-500 font-medium">
//               Loading dashboard...
//             </span>
//           </div>
//         </div>
//       )}

//       {/* ── HEADER ── */}
//       <header className="relative overflow-hidden rounded-2xl from-gray-900 via-gray-800 to-gray-900 p-6">
//         <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full pointer-events-none" />
//         <div className="absolute -bottom-8 right-40 w-32 h-32 rounded-full pointer-events-none" />

//         <div className="relative flex flex-wrap items-center justify-between gap-6">
//           <div className="flex items-center gap-5">
//             <div className="relative group cursor-pointer flex-shrink-0">
//               <div className="w-[80px] h-[80px] rounded-full overflow-hidden border-2 border-[#BADA55] group-hover:border-lime-400 transition-colors duration-300 bg-gray-700 flex items-center justify-center">
//                 {uploading && (
//                   <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full">
//                     <div className="w-8 h-8 border-3 border-gray-300 border-t-[#BADA55] rounded-full animate-spin" />
//                   </div>
//                 )}
//                 {profileImage ? (
//                   <img
//                     src={profileImage}
//                     alt="Profile"
//                     className="w-full h-full object-cover"
//                     onError={() => setProfileImage("")}
//                   />
//                 ) : (
//                   <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#BADA55] to-lime-600">
//                     <span className="text-3xl font-bold text-gray-800">T</span>
//                   </div>
//                 )}
//               </div>
//               {/* <button
//                 onClick={() => fileInputRef.current?.click()}
//                 disabled={uploading}
//                 className="absolute bottom-0 right-0 bg-[#BADA55] hover:bg-lime-400 w-7 h-7 rounded-full flex items-center justify-center shadow-md border-2 border-gray-900 transition-all duration-200 group-hover:scale-110"
//               >
//                 <span
//                   style={{ fontVariationSettings: "'wght' 600, 'opsz' 20" }}
//                   className="material-symbols-outlined text-gray-800 text-sm"
//                 >
//                   photo_camera
//                 </span>
//               </button> */}
//               <input
//                 ref={fileInputRef}
//                 type="file"
//                 accept="image/*"
//                 onChange={handleImageUpload}
//                 className="hidden"
//                 disabled={uploading}
//               />
//             </div>

//             <div>
//               <p className="text-[#BADA55] text-sm font-bold uppercase tracking-widest mb-1">
//                 Teacher Portal
//               </p>
//               <h1 className="text-gray-700 text-3xl font-bold leading-tight m-0">
//                 Welcome, {teacherProfile?.teacher_name || "Teacher"}!
//               </h1>
//               <p className="text-gray-500 text-sm mt-1 m-0">
//                 {teacherProfile?.school_name} • {teacherProfile?.class_name} —{" "}
//                 {new Date().toLocaleDateString("en-IN", {
//                   weekday: "long",
//                   day: "numeric",
//                   month: "long",
//                 })}
//               </p>
//             </div>
//           </div>
//         </div>
//       </header>

//       {/* ── BENTO BOX GRID LAYOUT ── */}

//       {/* ── TOP & BOTTOM STUDENTS KPI ── */}

//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

//         {/* TOP STUDENTS */}

//         <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col hover:shadow-md transition-shadow">

//           <div className="flex items-center justify-between mb-6">

//             <div className="flex items-center gap-3 pb-1">

//               <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
//                 <span className="material-symbols-outlined text-green-600">
//                   emoji_events
//                 </span>
//               </div>

//               <div className="flex items-center gap-2 text-base font-bold text-gray-800">

//                 <span>Top</span>

//                 <select
//                   value={topStudentLimit}
//                   onChange={(e) => setTopStudentLimit(Number(e.target.value))}
//                   className="bg-gray-50 border border-gray-200 text-sm font-bold py-1 px-2 rounded-lg"
//                 >
//                   <option value={5}>5</option>
//                   <option value={10}>10</option>
//                   <option value={20}>20</option>
//                 </select>

//                 <span>Students</span>

//               </div>

//             </div>

//             {/* SUBJECT DROPDOWN (RIGHT SIDE) */}
//             <select
//               value={topSubjectId ?? ""}
//               onChange={(e) => setTopSubjectId(Number(e.target.value))}
//               className="bg-gray-50 border border-gray-200 text-sm font-bold py-1.5 px-3 rounded-lg"
//             >
//               {subjects.map((s) => (
//                 <option key={s.subject_id} value={s.subject_id}>
//                   {s.subject_name}
//                 </option>
//               ))}
//             </select>

//           </div>


//           <div className="flex flex-col gap-3">

//             {topStudentsLoading ? (

//               <div className="flex items-center justify-center py-8">
//                 <div className="w-6 h-6 border-4 border-gray-200 border-t-[#BADA55] rounded-full animate-spin" />
//               </div>

//             ) : topStudents.length === 0 ? (

//               <div className="flex items-center justify-center py-6 text-sm text-gray-400">
//                 No students found
//               </div>

//             ) : (

//               topStudents.slice(0, topStudentLimit).map((student) => {

//                 const score = Math.min(student.avg_score, 100);

//                 return (
//                   <div key={student.user_id} className="flex items-center gap-3">

//                     <div className="w-8 h-8 rounded-full bg-[#BADA55]/20 flex items-center justify-center text-sm font-bold text-gray-800">
//                       {student.full_name.charAt(0)}
//                     </div>

//                     <span className="w-32 text-sm font-bold text-gray-700 truncate">
//                       {student.full_name}
//                     </span>

//                     <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
//                       <div
//                         className={`h-full ${getScoreBarColor(score)}`}
//                         style={{ width: `${score}%` }}
//                       />
//                     </div>

//                     <span className="w-12 text-sm font-bold text-gray-800 text-right">
//                       {student.avg_score}%
//                     </span>

//                   </div>
//                 );

//               })

//             )}

//           </div>

//         </section>



//         {/* BOTTOM STUDENTS */}

//         <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col hover:shadow-md transition-shadow">

//           <div className="flex items-center justify-between mb-6">

//             <div className="flex items-center gap-3 pb-1">

//               <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
//                 <span className="material-symbols-outlined text-red-500">
//                   trending_down
//                 </span>
//               </div>

//               <h2 className="text-base font-bold text-gray-800">
//                 Students Needing Support
//               </h2>

//               {/* COUNT DROPDOWN AFTER TITLE */}
//               <select
//                 value={bottomStudentLimit}
//                 onChange={(e) => setBottomStudentLimit(Number(e.target.value))}
//                 className="bg-gray-50 border border-gray-200 text-sm font-bold py-1 px-2 rounded-lg"
//               >
//                 <option value={5}>5</option>
//                 <option value={10}>10</option>
//                 <option value={20}>20</option>
//               </select>

//             </div>

//             {/* SUBJECT DROPDOWN */}
//             <select
//               value={bottomSubjectId ?? ""}
//               onChange={(e) => setBottomSubjectId(Number(e.target.value))}
//               className="bg-gray-50 border border-gray-200 text-sm font-bold py-1.5 px-3 rounded-lg"
//             >
//               {subjects.map((s) => (
//                 <option key={s.subject_id} value={s.subject_id}>
//                   {s.subject_name}
//                 </option>
//               ))}
//             </select>

//           </div>


//           <div className="flex flex-col gap-3">

//             {bottomStudentsLoading ? (

//               <div className="flex items-center justify-center py-8">
//                 <div className="w-6 h-6 border-4 border-gray-200 border-t-red-400 rounded-full animate-spin" />
//               </div>

//             ) : bottomStudents.length === 0 ? (

//               <div className="flex items-center justify-center py-6 text-sm text-gray-400">
//                 No students found
//               </div>

//             ) : (

//               bottomStudents.slice(0, bottomStudentLimit).map((student) => {

//                 const score = Math.min(student.avg_score, 100);

//                 return (
//                   <div key={student.user_id} className="flex items-center gap-3">

//                     <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-sm font-bold text-red-600">
//                       {student.full_name.charAt(0)}
//                     </div>

//                     <span className="w-32 text-sm font-bold text-gray-700 truncate">
//                       {student.full_name}
//                     </span>

//                     <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
//                       <div
//                         className={`h-full ${getScoreBarColor(score)}`}
//                         style={{ width: `${score}%` }}
//                       />
//                     </div>

//                     <span className="w-12 text-sm font-bold text-gray-800 text-right">
//                       {student.avg_score}%
//                     </span>

//                   </div>
//                 );

//               })

//             )}

//           </div>

//         </section>

//       </div>
//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

//         {/* 1. CURRICULUM COVERAGE */}
//         <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col hover:shadow-md transition-shadow">
//           <div className="flex items-center gap-3 mb-6">
//             <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
//               <span className="material-symbols-outlined text-blue-500">menu_book</span>
//             </div>
//             <h2 className="text-base font-bold text-gray-800 tracking-wide m-0">Curriculum</h2>
//           </div>

//           {curriculumCoverage.length > 0 ? (
//             <div className="flex flex-col gap-5 flex-1">
//               {curriculumCoverage.map((item, idx) => {
//                 const pct = Math.round(item.coverage_percentage);
//                 const color = getSubjectColor(idx);
//                 return (
//                   <div key={item.subject_id} className="group">
//                     <div className="flex items-center justify-between mb-2">
//                       <div className="flex items-center gap-2">
//                         <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }}></div>
//                         <span className="text-sm font-semibold text-gray-700">{item.subject}</span>
//                       </div>
//                       <span className="text-xs font-bold" style={{ color }}>{pct}%</span>
//                     </div>
//                     <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
//                       <div
//                         className="h-full rounded-full transition-all duration-1000 ease-out"
//                         style={{ width: `${pct}%`, backgroundColor: color }}
//                       />
//                     </div>
//                     <p className="text-[10px] text-gray-400 mt-1 text-right">{item.covered} of {item.total} Ch.</p>
//                   </div>
//                 );
//               })}
//             </div>
//           ) : (
//             !isLoading && (
//               <div className="flex flex-1 flex-col items-center justify-center text-gray-400 gap-2 py-6">
//                 <span className="material-symbols-outlined text-3xl text-gray-200">auto_stories</span>
//                 <span className="text-sm">No curriculum data.</span>
//               </div>
//             )
//           )}
//         </section>

//         {/* 2. SCORE BUCKET */}
//         <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col hover:shadow-md transition-shadow">
//           <div className="flex items-center justify-between mb-6">
//             <div className="flex items-center gap-3">
//               <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center">
//                 <span className="material-symbols-outlined text-emerald-500">stacked_bar_chart</span>
//               </div>
//               <h2 className="text-base font-bold text-gray-800 tracking-wide m-0">Score Spread</h2>
//             </div>
//             <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
//               {totalBucketStudents} Students
//             </span>
//           </div>

//           <div className="flex flex-col gap-3 flex-1 justify-center">
//             {bucketLabels.map(({ key, label, color }) => {
//               const count = bucketData ? bucketData[key] : 0;
//               const pct = totalBucketStudents > 0 ? (count / totalBucketStudents) * 100 : 0;
//               return (
//                 <div key={key} className="flex items-center gap-3 group">
//                   <span className="w-16 text-xs text-gray-500 font-medium">{label}</span>
//                   <div className="flex-1 h-3 bg-gray-50 rounded-full overflow-hidden">
//                     <div
//                       className="h-full rounded-full transition-all duration-1000"
//                       style={{ width: `${Math.max(pct, count > 0 ? 4 : 0)}%`, backgroundColor: color }}
//                     />
//                   </div>
//                   <span className="w-6 text-xs font-bold text-right text-gray-700">{count}</span>
//                 </div>
//               );
//             })}

//             <div className="mt-5 pt-5 border-t border-gray-100">
//               {classExamPerf && classExamPerf.total_students > 0 ? (
//                 <div className="grid grid-cols-2 gap-3">
//                   <div className="bg-gray-50 p-3 rounded-xl flex items-center gap-3">
//                     <div className="relative w-10 h-10 flex-shrink-0">
//                       <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
//                         <circle cx="18" cy="18" r="14" fill="none" stroke="#e5e7eb" strokeWidth="4" />
//                         <circle cx="18" cy="18" r="14" fill="none" stroke={getProgressColor(classExamPerf.class_average_percentage)} strokeWidth="4" strokeDasharray={`${(classExamPerf.class_average_percentage / 100) * 88} 100`} strokeLinecap="round" />
//                       </svg>
//                       <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-gray-700">
//                         {Math.round(classExamPerf.class_average_percentage)}%
//                       </span>
//                     </div>
//                     <div>
//                       <p className="text-[10px] font-semibold text-gray-400 uppercase">Avg Score</p>
//                       <p className="text-xs font-bold text-gray-800">Overall</p>
//                     </div>
//                   </div>
//                   <div className="bg-gray-50 p-3 rounded-xl flex items-center gap-3">
//                     <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500">
//                       <span className="material-symbols-outlined text-lg">edit_document</span>
//                     </div>
//                     <div>
//                       <p className="text-[10px] font-semibold text-gray-400 uppercase">Attempts</p>
//                       <p className="text-[11px] font-bold text-gray-800">
//                         {classExamPerf.total_class_attempts} / {classExamPerf.total_students} Std.
//                       </p>
//                     </div>
//                   </div>
//                 </div>
//               ) : (
//                 <div className="bg-gray-50 p-4 rounded-xl text-center flex items-center justify-center gap-2">
//                   <span className="material-symbols-outlined text-gray-400 text-lg">info</span>
//                   <span className="text-xs text-gray-500 font-medium">No class exams recorded.</span>
//                 </div>
//               )}
//             </div>
//           </div>
//         </section>

//         {/* 3. PENDING TOPICS */}
//         <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col hover:shadow-md transition-shadow">
//           <div className="flex items-center gap-3 mb-6">
//             <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center">
//               <span className="material-symbols-outlined text-orange-500">notification_important</span>
//             </div>
//             <h2 className="text-base font-bold text-gray-800 tracking-wide m-0">Pending Tasks</h2>
//           </div>

//           {pendingTopics.length > 0 ? (
//             <div className="flex flex-col gap-3 overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
//               {pendingTopics.map((item, idx) => (
//                 <div key={`${item.topic_id}-${idx}`} className="flex items-start gap-3 p-3 bg-white border border-gray-100 rounded-xl hover:border-[#BADA55]/50 transition-colors group">
//                   <div className="mt-1 w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: getSubjectBadgeColor(item.subject_name) }} />
//                   <div className="flex-1 min-w-0">
//                     <p className="text-sm font-bold text-gray-800 leading-tight mb-1">{item.topic_name}</p>
//                     <div className="flex items-center justify-between">
//                       <p className="text-[10px] text-gray-500 font-medium">{item.subject_name}</p>
//                       <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${getPriorityStyle(item.priority)}`}>
//                         {item.priority}
//                       </span>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           ) : (
//             <div className="flex flex-1 flex-col items-center justify-center text-gray-400 gap-2 py-6">
//               <span className="material-symbols-outlined text-4xl text-emerald-200">task_alt</span>
//               <p className="text-sm">All caught up!</p>
//             </div>
//           )}
//         </section>

//         {/* 4. SUBJECT PERFORMANCE */}
//         <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:col-span-2 flex flex-col hover:shadow-md transition-shadow">
//           <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
//             <div className="flex items-center gap-3">
//               <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center">
//                 <span className="material-symbols-outlined text-purple-500">groups</span>
//               </div>
//               <h2 className="text-base font-bold text-gray-800 tracking-wide m-0">Subject Analysis</h2>
//             </div>
//             {subjects.length > 0 && (
//               <select
//                 value={selectedSubjectId ?? ""}
//                 onChange={(e) => {
//                   const id = Number(e.target.value);
//                   setSelectedSubjectId(id);
//                   setSelectedSubjectName(subjects.find((s) => s.subject_id === id)?.subject_name ?? "");
//                 }}
//                 className="bg-gray-50 border border-gray-200 text-gray-700 text-sm font-bold py-2 px-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#BADA55] cursor-pointer hover:bg-gray-100 transition-colors"
//               >
//                 {subjects.map((s) => (
//                   <option key={s.subject_id} value={s.subject_id}>{s.subject_name}</option>
//                 ))}
//               </select>
//             )}
//           </div>

//           {subjectLoading ? (
//             <div className="flex items-center justify-center py-10">
//               <div className="w-8 h-8 border-4 border-gray-200 border-t-[#BADA55] rounded-full animate-spin" />
//             </div>
//           ) : subjectPerf && subjectPerf.detailed_list.length > 0 ? (
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

//               <div className="flex flex-col gap-4">
//                 {subjectPerf.top_performing_student && (
//                   <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100 rounded-xl p-4 relative overflow-hidden">
//                     <div className="flex items-center gap-2 mb-2">
//                       <span className="material-symbols-outlined text-green-600 text-lg">military_tech</span>
//                       <span className="text-[11px] font-bold text-green-700 uppercase tracking-wide">Top Student</span>
//                     </div>
//                     <h3 className="text-sm font-bold text-gray-900 truncate">{subjectPerf.top_performing_student.full_name}</h3>
//                     <p className="text-2xl font-extrabold text-green-600 mt-1">{subjectPerf.top_performing_student.avg_score.toFixed(1)}%</p>
//                   </div>
//                 )}
//                 {subjectPerf.lowest_performing_student && (
//                   <div className="bg-gradient-to-br from-red-50 to-rose-50 border border-red-100 rounded-xl p-4 relative overflow-hidden">
//                     <div className="flex items-center gap-2 mb-2">
//                       <span className="material-symbols-outlined text-red-500 text-lg">health_and_safety</span>
//                       <span className="text-[11px] font-bold text-red-700 uppercase tracking-wide">Needs Support</span>
//                     </div>
//                     <h3 className="text-sm font-bold text-gray-900 truncate">{subjectPerf.lowest_performing_student.full_name}</h3>
//                     <p className="text-2xl font-extrabold text-red-600 mt-1">{subjectPerf.lowest_performing_student.avg_score.toFixed(1)}%</p>
//                   </div>
//                 )}
//               </div>

//               <div className="md:col-span-2 flex flex-col bg-gray-50 rounded-xl p-4 border border-gray-100">
//                 <div className="flex items-center justify-between mb-4">
//                   <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Class Roster</span>
//                   <span className="text-[10px] font-bold text-gray-700 bg-white border border-gray-200 px-2 py-1 rounded">Total: {subjectPerf.total_enrolled}</span>
//                 </div>

//                 {(() => {
//                   const list = subjectPerf.detailed_list;
//                   const totalPages = Math.ceil(list.length / STUDENTS_PER_PAGE);
//                   const paginated = list.slice(studentPage * STUDENTS_PER_PAGE, (studentPage + 1) * STUDENTS_PER_PAGE);

//                   return (
//                     <div className="flex flex-col h-full justify-between">
//                       <div className="flex flex-col gap-2.5">
//                         {paginated.map((student) => {
//                           const bar = Math.min(student.avg_score, 100);
//                           return (
//                             <div key={student.user_id} className="flex items-center gap-3 bg-white p-3 rounded-lg border border-gray-100 hover:border-[#BADA55]/50 transition-colors">
//                               <div className="w-8 h-8 rounded-full bg-[#BADA55]/20 flex items-center justify-center text-sm font-bold text-gray-800 flex-shrink-0">
//                                 {student.full_name.charAt(0).toUpperCase()}
//                               </div>
//                               <span className="w-32 text-sm font-bold text-gray-700 truncate">{student.full_name}</span>
//                               <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
//                                 <div className={`h-full rounded-full transition-all duration-700 ${getScoreBarColor(bar)}`} style={{ width: `${Math.max(bar, 2)}%` }} />
//                               </div>
//                               <span className="w-12 text-sm font-bold text-gray-800 text-right">{student.avg_score.toFixed(1)}</span>
//                             </div>
//                           );
//                         })}
//                       </div>

//                       {totalPages > 1 && (
//                         <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-200">
//                           <span className="text-[11px] font-medium text-gray-500">Page {studentPage + 1} of {totalPages}</span>
//                           <div className="flex gap-2">
//                             <button onClick={() => setStudentPage((p) => Math.max(p - 1, 0))} disabled={studentPage === 0} className="w-7 h-7 rounded bg-white border border-gray-300 flex items-center justify-center text-gray-600 disabled:opacity-40 hover:bg-gray-50">
//                               <span className="material-symbols-outlined text-sm">chevron_left</span>
//                             </button>
//                             <button onClick={() => setStudentPage((p) => Math.min(p + 1, totalPages - 1))} disabled={studentPage === totalPages - 1} className="w-7 h-7 rounded bg-white border border-gray-300 flex items-center justify-center text-gray-600 disabled:opacity-40 hover:bg-gray-50">
//                               <span className="material-symbols-outlined text-sm">chevron_right</span>
//                             </button>
//                           </div>
//                         </div>
//                       )}
//                     </div>
//                   );
//                 })()}
//               </div>
//             </div>
//           ) : (
//             <div className="flex flex-1 flex-col items-center justify-center text-gray-400 gap-2 py-6">
//               <span className="material-symbols-outlined text-4xl text-gray-200">group_off</span>
//               <span className="text-sm">No student performance data found.</span>
//             </div>
//           )}
//         </section>

//         {/* 5. UPCOMING CHAPTERS */}
//         <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col hover:shadow-md transition-shadow">
//           <div className="flex items-center gap-3 mb-6">
//             <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center">
//               <span className="material-symbols-outlined text-indigo-500">schedule</span>
//             </div>
//             <h2 className="text-base font-bold text-gray-800 tracking-wide m-0">Up Next</h2>
//           </div>

//           {upcomingLoading ? (
//             <div className="flex items-center justify-center py-10">
//               <div className="w-8 h-8 border-4 border-gray-200 border-t-[#BADA55] rounded-full animate-spin" />
//             </div>
//           ) : upcomingChapters.length > 0 ? (
//             <div className="flex flex-col gap-3 flex-1">
//               {upcomingChapters.map((chapter, i) => (
//                 <div key={chapter.chapter_id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100 hover:bg-[#BADA55]/10 hover:border-[#BADA55]/30 transition-all">
//                   <div className="w-6 h-6 rounded bg-white border border-gray-200 text-[10px] font-bold text-gray-600 flex items-center justify-center mt-0.5">
//                     {i + 1}
//                   </div>
//                   <div>
//                     <p className="text-sm font-bold text-gray-800 leading-tight mb-1">{chapter.chapter_name}</p>
//                     <p className="text-[10px] font-semibold text-gray-500 uppercase">{chapter.subject_name}</p>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           ) : (
//             <div className="flex flex-1 flex-col items-center justify-center text-gray-400 gap-2 py-6">
//               <span className="material-symbols-outlined text-4xl text-gray-200">event_busy</span>
//               <p className="text-sm">No upcoming chapters.</p>
//             </div>
//           )}

//           {/* <button onClick={() => navigate("/teacher-material")} className="mt-4 w-full py-3 rounded-xl bg-[#BADA55] hover:bg-[#a5c24a] text-gray-900 text-sm font-bold transition-colors flex items-center justify-center gap-2">
//             <span className="material-symbols-outlined text-sm">explore</span> Explore Materials
//           </button> */}
//           {/* <button
//             onClick={() => navigate("/teacher/teacherlearning-planner")}
//             className="mt-4 w-40 py-2.5 rounded-xl bg-[#BADA55] hover:bg-lime-500 text-gray-800 text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5 shadow-sm hover:shadow-md hover:-translate-y-0.5"
//           >
//             <span className="material-symbols-outlined text-sm">menu_book</span>
//             View Learning Planner
//           </button> */}
//         </section>

//         {/* 6. CHAPTER ANALYSIS */}
//         <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:col-span-3 flex flex-col hover:shadow-md transition-shadow">
//           <div className="flex items-center justify-between mb-6">
//             <div className="flex items-center gap-3">
//               <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center">
//                 <span className="material-symbols-outlined text-rose-500">troubleshoot</span>
//               </div>
//               <h2 className="text-base font-bold text-gray-800 tracking-wide m-0">Chapter Analysis</h2>
//             </div>
//             {selectedSubjectName && (
//               <span className="text-xs font-bold text-gray-700 bg-gray-100 px-3 py-1 rounded-full border border-gray-200">
//                 {selectedSubjectName}
//               </span>
//             )}
//           </div>

//           {subjectLoading ? (
//             <div className="flex items-center justify-center py-10">
//               <div className="w-8 h-8 border-4 border-gray-200 border-t-[#BADA55] rounded-full animate-spin" />
//             </div>
//           ) : chapterPerf.length > 0 ? (
//             (() => {
//               const itemsPerRow = 3;
//               const totalChapterPages = Math.ceil(chapterPerf.length / itemsPerRow);
//               const paginatedChapters = chapterPerf.slice(chapterPage * itemsPerRow, (chapterPage + 1) * itemsPerRow);

//               return (
//                 <div className="flex flex-col flex-1">
//                   <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
//                     {paginatedChapters.map((chapter) => (
//                       <div key={chapter.chapter_id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:border-[#BADA55] hover:shadow-md transition-all">
//                         <p className="text-sm font-bold text-gray-800 mb-4 h-10 line-clamp-2">{chapter.chapter_name}</p>
//                         <div className="flex flex-col gap-3">
//                           <div className="flex items-center justify-between bg-green-50/50 p-2.5 rounded-lg border border-green-100">
//                             <div className="flex items-center gap-2">
//                               <span className="material-symbols-outlined text-green-500 text-sm">trending_up</span>
//                               <span className="text-xs font-semibold text-gray-700 truncate w-24">{chapter.top_student.full_name}</span>
//                             </div>
//                             <span className="text-xs font-bold text-green-600">{chapter.top_student.score.toFixed(1)}%</span>
//                           </div>
//                           <div className="flex items-center justify-between bg-red-50/50 p-2.5 rounded-lg border border-red-100">
//                             <div className="flex items-center gap-2">
//                               <span className="material-symbols-outlined text-red-500 text-sm">trending_down</span>
//                               <span className="text-xs font-semibold text-gray-700 truncate w-24">{chapter.lowest_student.full_name}</span>
//                             </div>
//                             <span className="text-xs font-bold text-red-600">{chapter.lowest_student.score.toFixed(1)}%</span>
//                           </div>
//                         </div>
//                       </div>
//                     ))}
//                   </div>

//                   {totalChapterPages > 1 && (
//                     <div className="flex items-center justify-center mt-6 gap-3">
//                       <button onClick={() => setChapterPage((p) => Math.max(p - 1, 0))} disabled={chapterPage === 0} className="w-8 h-8 rounded-full bg-white border border-gray-300 flex items-center justify-center text-gray-600 disabled:opacity-40 hover:bg-gray-50 shadow-sm">
//                         <span className="material-symbols-outlined text-sm">arrow_back</span>
//                       </button>
//                       <span className="text-xs font-bold text-gray-500">
//                         {chapterPage + 1} / {totalChapterPages}
//                       </span>
//                       <button onClick={() => setChapterPage((p) => Math.min(p + 1, totalChapterPages - 1))} disabled={chapterPage === totalChapterPages - 1} className="w-8 h-8 rounded-full bg-white border border-gray-300 flex items-center justify-center text-gray-600 disabled:opacity-40 hover:bg-gray-50 shadow-sm">
//                         <span className="material-symbols-outlined text-sm">arrow_forward</span>
//                       </button>
//                     </div>
//                   )}
//                 </div>
//               );
//             })()
//           ) : (
//             <div className="flex flex-1 flex-col items-center justify-center text-gray-400 gap-2 py-6">
//               <span className="material-symbols-outlined text-4xl text-gray-200">layers_clear</span>
//               <span className="text-sm">No chapter data available.</span>
//             </div>
//           )}
//         </section>

//       </div>
//     </div>
//   );
// };



import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
import ApiServices from "../../../services/ApiServices";

// ─── Types ───────────────────────────────────────────────────────────────────

interface BucketPerformance {
  below_50: number;
  "50_60": number;
  "60_70": number;
  "70_80": number;
  "80_90": number;
  "90_100": number;
}

interface Subject {
  subject_id: number;
  subject_name: string;
}

interface StudentEntry {
  avg_score: number;
  full_name: string;
  user_id: number;
}

interface SubjectPerformance {
  detailed_list: StudentEntry[];
  lowest_performing_student: StudentEntry | null;
  top_performing_student: StudentEntry | null;
  total_enrolled: number;
}

interface ChapterEntry {
  chapter_id: number;
  chapter_name: string;
  lowest_student: { full_name: string; score: number; user_id: number };
  top_student: { full_name: string; score: number; user_id: number };
}

// Fixed to match the single-object response from sp_v4
interface ClassExamPerformance {
  class_average_percentage: number;
  total_class_attempts: number;
  total_students: number;
}

interface CurriculumItem {
  subject: string;
  subject_id: number;
  covered: number;
  total: number;
  coverage_percentage: number;
}

// ─── Subject colour palette ────────────
const SUBJECT_COLORS = [
  "#BADA55",
  "#34d399",
  "#60a5fa",
  "#f97316",
  "#a78bfa",
  "#22d3ee",
  "#fb7185",
  "#fbbf24",
];
const getSubjectColor = (index: number) =>
  SUBJECT_COLORS[index % SUBJECT_COLORS.length];

interface PendingTopic {
  topic_id: number;
  topic_name: string;
  subject_name: string;
  priority: string;
}

interface UpcomingChapter {
  chapter_id: number;
  chapter_name: string;
  subject_name: string;
}

interface TeacherProfile {
  teacher_name: string;
  class_name: string;
  school_name: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const getProgressColor = (value: number) => {
  if (value >= 80) return "#22c55e";
  if (value >= 65) return "#84cc16";
  if (value >= 40) return "#f97316";
  return "#ef4444";
};

const getScoreBarColor = (value: number) => {
  if (value >= 80) return "bg-green-500";
  if (value >= 65) return "bg-lime-500";
  if (value >= 40) return "bg-orange-400";
  return "bg-red-400";
};

const getPriorityStyle = (p: string) => {
  if (p === "High") return "bg-red-50 text-red-600 border border-red-100";
  if (p === "Medium")
    return "bg-orange-50 text-orange-600 border border-orange-100";
  return "bg-gray-50 text-gray-500 border border-gray-100";
};

const getSubjectBadgeColor = (subject: string) => {
  const map: Record<string, string> = {
    Mathematics: "#BADA55",
    Science: "#34d399",
    English: "#60a5fa",
    History: "#f97316",
    Geography: "#a78bfa",
    "Computer Science": "#22d3ee",
    Hindi: "#fb7185",
  };
  return map[subject] ?? "#9ca3af";
};

const bucketLabels: {
  key: keyof BucketPerformance;
  label: string;
  color: string;
}[] = [
  { key: "90_100", label: "90–100%", color: "#22c55e" },
  { key: "80_90", label: "80–90%", color: "#84cc16" },
  { key: "70_80", label: "70–80%", color: "#a3e635" },
  { key: "60_70", label: "60–70%", color: "#facc15" },
  { key: "50_60", label: "50–60%", color: "#fb923c" },
  { key: "below_50", label: "Below 50%", color: "#ef4444" },
];

const STUDENTS_PER_PAGE = 4;
// const CHAPTERS_PER_PAGE = 4;

export const TeacherDashboardDyn: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [chapterPage, setChapterPage] = useState(0);
  const [studentPage, setStudentPage] = useState(0);
  // const navigate = useNavigate();
  const [profileImage, setProfileImage] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const [bucketData, setBucketData] = useState<BucketPerformance | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(
    null,
  );
  const [selectedSubjectName, setSelectedSubjectName] = useState<string>("");
  const [subjectPerf, setSubjectPerf] = useState<SubjectPerformance | null>(
    null,
  );
  const [chapterPerf, setChapterPerf] = useState<ChapterEntry[]>([]);
  const [classExamPerf, setClassExamPerf] =
    useState<ClassExamPerformance | null>(null);
  const [subjectLoading, setSubjectLoading] = useState(false);
  const [curriculumCoverage, setCurriculumCoverage] = useState<
    CurriculumItem[]
  >([]);
  const [pendingTopics, setPendingTopics] = useState<PendingTopic[]>([]);
  const [upcomingChapters, setUpcomingChapters] = useState<UpcomingChapter[]>(
    [],
  );
  const [upcomingLoading, setUpcomingLoading] = useState(false);

  // const [rankSubjectId, setRankSubjectId] = useState<number | null>(null);
  const [topSubjectId, setTopSubjectId] = useState<number | null>(null);
  const [bottomSubjectId, setBottomSubjectId] = useState<number | null>(null);

  const [topStudentLimit, setTopStudentLimit] = useState(5);
  const [bottomStudentLimit, setBottomStudentLimit] = useState(5);

  const [topStudents, setTopStudents] = useState<StudentEntry[]>([]);
  const [bottomStudents, setBottomStudents] = useState<StudentEntry[]>([]);

  const [teacherProfile, setTeacherProfile] = useState<TeacherProfile | null>(
    null,
  );

  const [topStudentsLoading, setTopStudentsLoading] = useState(false);
  const [bottomStudentsLoading, setBottomStudentsLoading] = useState(false);

  // ── Profile ────────────────────────────────────────────────────────────────
  const fetchProfileImage = async () => {
    try {
      const res = await ApiServices.getUserProfileImage();
      if (res.data?.status === "success" && res.data?.data?.image)
        setProfileImage(res.data.data.image);
    } catch {
      /* no image */
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setProfileImage(URL.createObjectURL(file));
    try {
      setUploading(true);
      const fd = new FormData();
      fd.append("file", file);
      await ApiServices.uploadProfilePicture(fd);
    } catch (err) {
      // console.error("Upload failed", err);
    } finally {
      setUploading(false);
    }
  };

  // ── Initial load ───────────────────────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      try {
        const [
          bucketRes,
          subjectsRes,
          classExamRes,
          curriculumRes,
          teacherRes,
        ] = await Promise.all([
          ApiServices.getTeacherBucketPerformance(),
          ApiServices.getTeacherSubjects(),
          ApiServices.getTeacherClassExamPerformance(),
          ApiServices.getTeacherCurriculumCoverage(),
          ApiServices.getTeacherProfile(),
        ]);

        if (bucketRes.data?.status === "success")
          setBucketData(bucketRes.data.data);

        // FIX: The backend returns an object now, not an array. We directly set it.
        if (classExamRes.data?.status === "success") {
          setClassExamPerf(classExamRes.data.data);
        }

        if (curriculumRes.data?.status === "success")
          setCurriculumCoverage(curriculumRes.data.data);

        if (subjectsRes.data?.status === "success") {
          const list: Subject[] = subjectsRes.data.data;
          setSubjects(list);
          if (list.length > 0) {
            setSelectedSubjectId(list[0].subject_id);
            setSelectedSubjectName(list[0].subject_name);
            setTopSubjectId(list[0].subject_id);
            setBottomSubjectId(list[0].subject_id);
          }
        }

        if (teacherRes.data?.status === "success") {
          setTeacherProfile(teacherRes.data.data);
        }
      } catch (err) {
        // console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    init();
    fetchProfileImage();
  }, []);

  // ── Subject change ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (selectedSubjectId === null) return;

    setStudentPage(0);
    setChapterPage(0);

    const fetchSubjectData = async () => {
      setSubjectLoading(true);
      setUpcomingLoading(true);
      try {
        const [spRes, cpRes, upcomingRes, pendingRes] = await Promise.all([
          ApiServices.getTeacherSubjectPerformance(selectedSubjectId),
          ApiServices.getTeacherChapterPerformance(selectedSubjectId),
          ApiServices.getTeacherUpcomingChapters(selectedSubjectId),
          ApiServices.getTeacherPendingTopics(selectedSubjectId),
        ]);

        if (spRes.data?.status === "success") setSubjectPerf(spRes.data.data);
        if (cpRes.data?.status === "success") setChapterPerf(cpRes.data.data);
        if (upcomingRes.data?.status === "success")
          setUpcomingChapters(upcomingRes.data.data);
        if (pendingRes.data?.status === "success")
          setPendingTopics(pendingRes.data.data);
      } catch (err) {
        // console.error(err);
      } finally {
        setSubjectLoading(false);
        setUpcomingLoading(false);
      }
    };
    fetchSubjectData();
  }, [selectedSubjectId]);

  // useEffect(() => {
  //   if (!rankSubjectId) return;

  //   const fetchTopBottomStudents = async () => {
  //     try {
  //       const res = await ApiServices.getTeacherTopBottomStudents(rankSubjectId);

  //       if (res.data?.status === "success") {
  //         setTopStudents(res.data.data.top_20_students || []);
  //         setBottomStudents(res.data.data.lowest_20_students || []);
  //       }
  //     } catch (err) {
  //       console.error("Top/Bottom students fetch failed", err);
  //     }
  //   };

  //   fetchTopBottomStudents();
  // }, [rankSubjectId]);

  // ── Derived ────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!topSubjectId) return;

    const fetchTopStudents = async () => {
      setTopStudentsLoading(true);

      try {
        const res = await ApiServices.getTeacherTopBottomStudents(topSubjectId);

        if (res.data?.status === "success") {
          setTopStudents(res.data.data.top_20_students || []);
        }
      } catch (err) {
        // console.error(err);
      } finally {
        setTopStudentsLoading(false);
      }
    };

    fetchTopStudents();
  }, [topSubjectId]);

  useEffect(() => {
    if (!bottomSubjectId) return;

    const fetchBottomStudents = async () => {
      setBottomStudentsLoading(true);

      try {
        const res =
          await ApiServices.getTeacherTopBottomStudents(bottomSubjectId);

        if (res.data?.status === "success") {
          setBottomStudents(res.data.data.lowest_20_students || []);
        }
      } catch (err) {
        // console.error(err);
      } finally {
        setBottomStudentsLoading(false);
      }
    };

    fetchBottomStudents();
  }, [bottomSubjectId]);

  const totalBucketStudents = bucketData
    ? Object.values(bucketData).reduce((a, b) => a + b, 0)
    : 0;

  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen p-6 pt-6 relative space-y-6 ">
      {/* ── Loading Overlay ── */}
      {isLoading && (
        <div className="absolute inset-0 z-50 bg-white/70 backdrop-blur-sm">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-gray-200 border-t-[#BADA55] rounded-full animate-spin" />
            <span className="text-sm text-gray-500 font-medium">
              Loading dashboard...
            </span>
          </div>
        </div>
      )}

      {/* ── HEADER ── */}
      <header className="relative overflow-hidden rounded-2xl from-gray-900 via-gray-800 to-gray-900 p-1">
        <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full pointer-events-none" />
        <div className="absolute -bottom-8 right-40 w-32 h-32 rounded-full pointer-events-none" />

        <div className="relative flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="relative group cursor-pointer flex-shrink-0">
              <div className="w-[80px] h-[80px] rounded-full overflow-hidden border-2 border-[#BADA55] group-hover:border-lime-400 transition-colors duration-300 bg-gray-700 flex items-center justify-center">
                {uploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full">
                    <div className="w-8 h-8 border-3 border-gray-300 border-t-[#BADA55] rounded-full animate-spin" />
                  </div>
                )}
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt="Profile"
                    className="w-full h-full object-cover"
                    onError={() => setProfileImage("")}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#BADA55] to-lime-600">
                    <span className="text-3xl font-bold text-gray-800">T</span>
                  </div>
                )}
              </div>
              {/* <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="absolute bottom-0 right-0 bg-[#BADA55] hover:bg-lime-400 w-7 h-7 rounded-full flex items-center justify-center shadow-md border-2 border-gray-900 transition-all duration-200 group-hover:scale-110"
              >
                <span
                  style={{ fontVariationSettings: "'wght' 600, 'opsz' 20" }}
                  className="material-symbols-outlined text-gray-800 text-sm"
                >
                  photo_camera
                </span>
              </button> */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                disabled={uploading}
              />
            </div>

            <div>
              <p className="text-[#BADA55] text-sm font-bold uppercase tracking-widest mb-1">
                Teacher Portal
              </p>
              <h1 className="text-gray-700 text-3xl font-bold leading-tight m-0">
                Welcome, {teacherProfile?.teacher_name || "Teacher"}!
              </h1>
              <p className="text-gray-500 text-sm mt-1 m-0">
                {teacherProfile?.school_name} • {teacherProfile?.class_name} —{" "}
                {new Date().toLocaleDateString("en-IN", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* ── BENTO BOX GRID LAYOUT ── */}

      {/* ── TOP & BOTTOM STUDENTS KPI ── */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/*1. TOP STUDENTS */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col hover:shadow-md transition-shadow h-72">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3 pb-1">
              <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
                <span className="material-symbols-outlined text-green-600">
                  emoji_events
                </span>
              </div>

              <div className="flex items-center gap-2 text-base font-bold text-gray-800">
                <span>Top</span>

                <select
                  value={topStudentLimit}
                  onChange={(e) => setTopStudentLimit(Number(e.target.value))}
                  className="bg-gray-50 border border-gray-200 text-sm font-bold py-1 px-2 rounded-lg"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                </select>

                <span>Students</span>
              </div>
            </div>

            {/* SUBJECT DROPDOWN (RIGHT SIDE) */}
            <select
              value={topSubjectId ?? ""}
              onChange={(e) => setTopSubjectId(Number(e.target.value))}
              className="bg-gray-50 border border-gray-200 text-sm font-bold py-1.5 px-3 rounded-lg"
            >
              {subjects.map((s) => (
                <option key={s.subject_id} value={s.subject_id}>
                  {s.subject_name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1 overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
            {topStudentsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-6 h-6 border-4 border-gray-200 border-t-[#BADA55] rounded-full animate-spin" />
              </div>
            ) : topStudents.length === 0 ? (
              <div className="flex items-center justify-center py-6 text-sm text-gray-400">
                No students found
              </div>
            ) : (
              topStudents.slice(0, topStudentLimit).map((student) => {
                const score = Math.min(student.avg_score, 100);

                return (
                  <div
                    key={student.user_id}
                    className="flex items-center gap-3"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#BADA55]/20 flex items-center justify-center text-sm font-bold text-gray-800">
                      {student.full_name.charAt(0)}
                    </div>

                    <span className="w-32 text-sm font-bold text-gray-700 truncate">
                      {student.full_name}
                    </span>

                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${getScoreBarColor(score)}`}
                        style={{ width: `${score}%` }}
                      />
                    </div>

                    <span className="w-12 text-sm font-bold text-gray-800 text-right">
                      {student.avg_score}%
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* 2. Students Needing Support */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col hover:shadow-md transition-shadow h-72">
          <div className="flex items-center justify-between mb-4 gap-3">
            <div className="flex items-center gap-3 pb-1">
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
                <span className="material-symbols-outlined text-red-500">
                  trending_down
                </span>
              </div>

              <h2 className="text-base font-bold text-gray-800">
                Students Needing Support
              </h2>

              {/* COUNT DROPDOWN AFTER TITLE */}
              <select
                value={bottomStudentLimit}
                onChange={(e) => setBottomStudentLimit(Number(e.target.value))}
                className="bg-gray-50 border border-gray-200 text-sm font-bold py-1 px-2 rounded-lg"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
              </select>
            </div>

            {/* SUBJECT DROPDOWN */}
            <select
              value={bottomSubjectId ?? ""}
              onChange={(e) => setBottomSubjectId(Number(e.target.value))}
              className="bg-gray-50 border border-gray-200 text-sm font-bold py-1.5 px-3 rounded-lg"
            >
              {subjects.map((s) => (
                <option key={s.subject_id} value={s.subject_id}>
                  {s.subject_name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1 overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
            {bottomStudentsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-6 h-6 border-4 border-gray-200 border-t-red-400 rounded-full animate-spin" />
              </div>
            ) : bottomStudents.length === 0 ? (
              <div className="flex items-center justify-center py-6 text-sm text-gray-400">
                No students found
              </div>
            ) : (
              bottomStudents.slice(0, bottomStudentLimit).map((student) => {
                const score = Math.min(student.avg_score, 100);

                return (
                  <div
                    key={student.user_id}
                    className="flex items-center gap-3"
                  >
                    <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-sm font-bold text-red-600">
                      {student.full_name.charAt(0)}
                    </div>

                    <span className="w-32 text-sm font-bold text-gray-700 truncate">
                      {student.full_name}
                    </span>

                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${getScoreBarColor(score)}`}
                        style={{ width: `${score}%` }}
                      />
                    </div>

                    <span className="w-12 text-sm font-bold text-gray-800 text-right">
                      {student.avg_score}%
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* 3. CURRICULUM COVERAGE */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col hover:shadow-md transition-shadow h-72">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
              <span className="material-symbols-outlined text-blue-500">
                menu_book
              </span>
            </div>
            <h2 className="text-base font-bold text-gray-800 tracking-wide m-0">
              Curriculum
            </h2>
          </div>

          {curriculumCoverage.length > 0 ? (
            <div className="flex flex-col gap-1 flex-1 overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
              {curriculumCoverage.map((item, idx) => {
                const pct = Math.round(item.coverage_percentage);
                const color = getSubjectColor(idx);
                return (
                  <div key={item.subject_id} className="group">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: color }}
                        ></div>
                        <span className="text-sm font-semibold text-gray-700">
                          {item.subject}
                        </span>
                      </div>
                      <span className="text-xs font-bold" style={{ color }}>
                        {pct}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${pct}%`, backgroundColor: color }}
                      />
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1 text-right">
                      {item.covered} of {item.total} Ch.
                    </p>
                  </div>
                );
              })}
            </div>
          ) : (
            !isLoading && (
              <div className="flex flex-1 flex-col items-center justify-center text-gray-400 gap-2 py-6">
                <span className="material-symbols-outlined text-3xl text-gray-200">
                  auto_stories
                </span>
                <span className="text-sm">No curriculum data.</span>
              </div>
            )
          )}
        </section>

        {/* 4. SCORE BUCKET */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col hover:shadow-md transition-shadow h-80">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center">
                <span className="material-symbols-outlined text-emerald-500">
                  stacked_bar_chart
                </span>
              </div>
              <h2 className="text-base font-bold text-gray-800 tracking-wide m-0">
                Score Spread
              </h2>
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
              {totalBucketStudents} Students
            </span>
          </div>

          <div className="flex flex-col gap-1 flex-1 overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
            {bucketLabels.map(({ key, label, color }) => {
              const count = bucketData ? bucketData[key] : 0;
              const pct =
                totalBucketStudents > 0
                  ? (count / totalBucketStudents) * 100
                  : 0;
              return (
                <div key={key} className="flex items-center gap-3 group">
                  <span className="w-16 text-xs text-gray-500 font-medium">
                    {label}
                  </span>
                  <div className="flex-1 h-3 bg-gray-50 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-1000"
                      style={{
                        width: `${Math.max(pct, count > 0 ? 4 : 0)}%`,
                        backgroundColor: color,
                      }}
                    />
                  </div>
                  <span className="w-6 text-xs font-bold text-right text-gray-700">
                    {count}
                  </span>
                </div>
              );
            })}

            <div className="mt-5 pt-5 border-t border-gray-100">
              {classExamPerf && classExamPerf.total_students > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 p-3 rounded-xl flex items-center gap-3">
                    <div className="relative w-10 h-10 flex-shrink-0">
                      <svg
                        viewBox="0 0 36 36"
                        className="w-full h-full -rotate-90"
                      >
                        <circle
                          cx="18"
                          cy="18"
                          r="14"
                          fill="none"
                          stroke="#e5e7eb"
                          strokeWidth="4"
                        />
                        <circle
                          cx="18"
                          cy="18"
                          r="14"
                          fill="none"
                          stroke={getProgressColor(
                            classExamPerf.class_average_percentage,
                          )}
                          strokeWidth="4"
                          strokeDasharray={`${(classExamPerf.class_average_percentage / 100) * 88} 100`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-gray-700">
                        {Math.round(classExamPerf.class_average_percentage)}%
                      </span>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold text-gray-400 uppercase">
                        Avg Score
                      </p>
                      <p className="text-xs font-bold text-gray-800">Overall</p>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-xl flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500">
                      <span className="material-symbols-outlined text-lg">
                        edit_document
                      </span>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold text-gray-400 uppercase">
                        Attempts
                      </p>
                      <p className="text-[11px] font-bold text-gray-800">
                        {classExamPerf.total_class_attempts} /{" "}
                        {classExamPerf.total_students} Std.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 p-4 rounded-xl text-center flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-gray-400 text-lg">
                    info
                  </span>
                  <span className="text-xs text-gray-500 font-medium">
                    No class exams recorded.
                  </span>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* 5. PENDING TOPICS */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col hover:shadow-md transition-shadow h-80 ">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center">
              <span className="material-symbols-outlined text-orange-500">
                notification_important
              </span>
            </div>
            <h2 className="text-base font-bold text-gray-800 tracking-wide m-0">
              Pending Tasks
            </h2>
          </div>

          {pendingTopics.length > 0 ? (
            <div className="flex flex-col gap-1 overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
              {pendingTopics.map((item, idx) => (
                <div
                  key={`${item.topic_id}-${idx}`}
                  className="flex items-start gap-3 p-2 bg-white border border-gray-100 rounded-xl hover:border-[#BADA55]/50 transition-colors group"
                >
                  <div
                    className="mt-1 w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{
                      backgroundColor: getSubjectBadgeColor(item.subject_name),
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-800 leading-tight mb-1">
                      {item.topic_name}
                    </p>
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] text-gray-500 font-medium">
                        {item.subject_name}
                      </p>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${getPriorityStyle(item.priority)}`}
                      >
                        {item.priority}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center text-gray-400 gap-2 py-6">
              <span className="material-symbols-outlined text-4xl text-emerald-200">
                task_alt
              </span>
              <p className="text-sm">All caught up!</p>
            </div>
          )}
        </section>

        {/* 6. UPCOMING NEXT CHAPTERS */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col hover:shadow-md transition-shadow h-80">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center">
              <span className="material-symbols-outlined text-indigo-500">
                schedule
              </span>
            </div>
            <h2 className="text-base font-bold text-gray-800 tracking-wide m-0">
              Up Next
            </h2>
          </div>

          {upcomingLoading ? (
            <div className="flex items-center justify-center py-10">
              <div className="w-8 h-8 border-4 border-gray-200 border-t-[#BADA55] rounded-full animate-spin" />
            </div>
          ) : upcomingChapters.length > 0 ? (
            <div className="flex flex-col gap-1 flex-1 overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
              {upcomingChapters.map((chapter, i) => (
                <div
                  key={chapter.chapter_id}
                  className="flex items-start gap-3 p-3 bg-gray-50 border border-gray-100 rounded-xl hover:bg-[#BADA55]/10 hover:border-[#BADA55]/30 transition-all"
                >
                  <div className="w-6 h-6 rounded bg-white border border-gray-200 text-[10px] font-bold text-gray-600 flex items-center justify-center mt-0.5">
                    {i + 1}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-800 leading-tight mb-1">
                      {chapter.chapter_name}
                    </p>
                    <p className="text-[10px] font-semibold text-gray-500 uppercase">
                      {chapter.subject_name}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center text-gray-400 gap-2 py-6">
              <span className="material-symbols-outlined text-4xl text-gray-200">
                event_busy
              </span>
              <p className="text-sm">No upcoming chapters.</p>
            </div>
          )}

          {/* <button onClick={() => navigate("/teacher-material")} className="mt-4 w-full py-3 rounded-xl bg-[#BADA55] hover:bg-[#a5c24a] text-gray-900 text-sm font-bold transition-colors flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-sm">explore</span> Explore Materials
          </button> */}
          {/* <button
            onClick={() => navigate("/teacher/teacherlearning-planner")}
            className="mt-4 w-40 py-2.5 rounded-xl bg-[#BADA55] hover:bg-lime-500 text-gray-800 text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5 shadow-sm hover:shadow-md hover:-translate-y-0.5"
          >
            <span className="material-symbols-outlined text-sm">menu_book</span>
            View Learning Planner
          </button> */}
        </section>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 7. SUBJECT ANALYSIS */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col hover:shadow-md transition-shadow h-72">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center">
                <span className="material-symbols-outlined text-purple-500">
                  groups
                </span>
              </div>
              <h2 className="text-base font-bold text-gray-800 tracking-wide m-0">
                Subject Analysis
              </h2>
            </div>
            {subjects.length > 0 && (
              <select
                value={selectedSubjectId ?? ""}
                onChange={(e) => {
                  const id = Number(e.target.value);
                  setSelectedSubjectId(id);
                  setSelectedSubjectName(
                    subjects.find((s) => s.subject_id === id)?.subject_name ??
                      "",
                  );
                }}
                className="bg-gray-50 border border-gray-200 text-gray-700 text-sm font-bold py-2 px-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#BADA55] cursor-pointer hover:bg-gray-100 transition-colors"
              >
                {subjects.map((s) => (
                  <option key={s.subject_id} value={s.subject_id}>
                    {s.subject_name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {subjectLoading ? (
            <div className="flex items-center justify-center py-10">
              <div className="w-8 h-8 border-4 border-gray-200 border-t-[#BADA55] rounded-full animate-spin" />
            </div>
          ) : subjectPerf && subjectPerf.detailed_list.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
              <div className="flex flex-col gap-4">
                {subjectPerf.top_performing_student && (
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100 rounded-xl p-4 relative overflow-hidden">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="material-symbols-outlined text-green-600 text-lg">
                        military_tech
                      </span>
                      <span className="text-[11px] font-bold text-green-700 uppercase tracking-wide">
                        Top Student
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-gray-900 truncate">
                      {subjectPerf.top_performing_student.full_name}
                    </h3>
                    <p className="text-2xl font-extrabold text-green-600 mt-1">
                      {subjectPerf.top_performing_student.avg_score.toFixed(1)}%
                    </p>
                  </div>
                )}
                {subjectPerf.lowest_performing_student && (
                  <div className="bg-gradient-to-br from-red-50 to-rose-50 border border-red-100 rounded-xl p-4 relative overflow-hidden">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="material-symbols-outlined text-red-500 text-lg">
                        health_and_safety
                      </span>
                      <span className="text-[11px] font-bold text-red-700 uppercase tracking-wide">
                        Needs Support
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-gray-900 truncate">
                      {subjectPerf.lowest_performing_student.full_name}
                    </h3>
                    <p className="text-2xl font-extrabold text-red-600 mt-1">
                      {subjectPerf.lowest_performing_student.avg_score.toFixed(
                        1,
                      )}
                      %
                    </p>
                  </div>
                )}
              </div>

              <div className="md:col-span-2 flex flex-col bg-gray-50 rounded-xl p-4 border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                    Class Roster
                  </span>
                  <span className="text-[10px] font-bold text-gray-700 bg-white border border-gray-200 px-2 py-1 rounded">
                    Total: {subjectPerf.total_enrolled}
                  </span>
                </div>

                {(() => {
                  const list = subjectPerf.detailed_list;
                  const totalPages = Math.ceil(list.length / STUDENTS_PER_PAGE);
                  const paginated = list.slice(
                    studentPage * STUDENTS_PER_PAGE,
                    (studentPage + 1) * STUDENTS_PER_PAGE,
                  );

                  return (
                    <div className="flex flex-col h-full justify-between">
                      <div className="flex flex-col gap-2.5">
                        {paginated.map((student) => {
                          const bar = Math.min(student.avg_score, 100);
                          return (
                            <div
                              key={student.user_id}
                              className="flex items-center gap-3 bg-white p-3 rounded-lg border border-gray-100 hover:border-[#BADA55]/50 transition-colors"
                            >
                              <div className="w-8 h-8 rounded-full bg-[#BADA55]/20 flex items-center justify-center text-sm font-bold text-gray-800 flex-shrink-0">
                                {student.full_name.charAt(0).toUpperCase()}
                              </div>
                              <span className="w-32 text-sm font-bold text-gray-700 truncate">
                                {student.full_name}
                              </span>
                              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all duration-700 ${getScoreBarColor(bar)}`}
                                  style={{ width: `${Math.max(bar, 2)}%` }}
                                />
                              </div>
                              <span className="w-12 text-sm font-bold text-gray-800 text-right">
                                {student.avg_score.toFixed(1)}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      {totalPages > 1 && (
                        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-200">
                          <span className="text-[11px] font-medium text-gray-500">
                            Page {studentPage + 1} of {totalPages}
                          </span>
                          <div className="flex gap-2">
                            <button
                              onClick={() =>
                                setStudentPage((p) => Math.max(p - 1, 0))
                              }
                              disabled={studentPage === 0}
                              className="w-7 h-7 rounded bg-white border border-gray-300 flex items-center justify-center text-gray-600 disabled:opacity-40 hover:bg-gray-50"
                            >
                              <span className="material-symbols-outlined text-sm">
                                chevron_left
                              </span>
                            </button>
                            <button
                              onClick={() =>
                                setStudentPage((p) =>
                                  Math.min(p + 1, totalPages - 1),
                                )
                              }
                              disabled={studentPage === totalPages - 1}
                              className="w-7 h-7 rounded bg-white border border-gray-300 flex items-center justify-center text-gray-600 disabled:opacity-40 hover:bg-gray-50"
                            >
                              <span className="material-symbols-outlined text-sm">
                                chevron_right
                              </span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            </div>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center text-gray-400 gap-2 py-6">
              <span className="material-symbols-outlined text-4xl text-gray-200">
                group_off
              </span>
              <span className="text-sm">
                No student performance data found.
              </span>
            </div>
          )}
        </section>

        {/* 8. CHAPTER ANALYSIS */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col hover:shadow-md transition-shadow h-72 ">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center">
                <span className="material-symbols-outlined text-rose-500">
                  troubleshoot
                </span>
              </div>
              <h2 className="text-base font-bold text-gray-800 tracking-wide m-0">
                Chapter Analysis
              </h2>
            </div>
            {selectedSubjectName && (
              <span className="text-xs font-bold text-gray-700 bg-gray-100 px-3 py-1 rounded-full border border-gray-200">
                {selectedSubjectName}
              </span>
            )}
          </div>

          {subjectLoading ? (
            <div className="flex items-center justify-center py-10">
              <div className="w-8 h-8 border-4 border-gray-200 border-t-[#BADA55] rounded-full animate-spin" />
            </div>
          ) : chapterPerf.length > 0 ? (
            (() => {
              const itemsPerRow = 3;
              const totalChapterPages = Math.ceil(
                chapterPerf.length / itemsPerRow,
              );
              const paginatedChapters = chapterPerf.slice(
                chapterPage * itemsPerRow,
                (chapterPage + 1) * itemsPerRow,
              );

              return (
                <div className="flex flex-col flex-1 overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {paginatedChapters.map((chapter) => (
                      <div
                        key={chapter.chapter_id}
                        className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:border-[#BADA55] hover:shadow-md transition-all"
                      >
                        <p className="text-sm font-bold text-gray-800 mb-1 h-10 line-clamp-2">
                          {chapter.chapter_name}
                        </p>
                        <div className="flex flex-col gap-3">
                          <div className="flex items-center justify-between bg-green-50/50 p-2.5 rounded-lg border border-green-100">
                            <div className="flex items-center gap-2">
                              <span className="material-symbols-outlined text-green-500 text-sm">
                                trending_up
                              </span>
                              <span className="text-xs font-semibold text-gray-700 truncate w-24">
                                {chapter.top_student.full_name}
                              </span>
                            </div>
                            <span className="text-xs font-bold text-green-600">
                              {chapter.top_student.score.toFixed(1)}%
                            </span>
                          </div>
                          <div className="flex items-center justify-between bg-red-50/50 p-2.5 rounded-lg border border-red-100">
                            <div className="flex items-center gap-2">
                              <span className="material-symbols-outlined text-red-500 text-sm">
                                trending_down
                              </span>
                              <span className="text-xs font-semibold text-gray-700 truncate w-24">
                                {chapter.lowest_student.full_name}
                              </span>
                            </div>
                            <span className="text-xs font-bold text-red-600">
                              {chapter.lowest_student.score.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {totalChapterPages > 1 && (
                    <div className="flex items-center justify-center mt-6 gap-3">
                      <button
                        onClick={() =>
                          setChapterPage((p) => Math.max(p - 1, 0))
                        }
                        disabled={chapterPage === 0}
                        className="w-8 h-8 rounded-full bg-white border border-gray-300 flex items-center justify-center text-gray-600 disabled:opacity-40 hover:bg-gray-50 shadow-sm"
                      >
                        <span className="material-symbols-outlined text-sm">
                          arrow_back
                        </span>
                      </button>
                      <span className="text-xs font-bold text-gray-500">
                        {chapterPage + 1} / {totalChapterPages}
                      </span>
                      <button
                        onClick={() =>
                          setChapterPage((p) =>
                            Math.min(p + 1, totalChapterPages - 1),
                          )
                        }
                        disabled={chapterPage === totalChapterPages - 1}
                        className="w-8 h-8 rounded-full bg-white border border-gray-300 flex items-center justify-center text-gray-600 disabled:opacity-40 hover:bg-gray-50 shadow-sm"
                      >
                        <span className="material-symbols-outlined text-sm">
                          arrow_forward
                        </span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })()
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center text-gray-400 gap-2 py-6">
              <span className="material-symbols-outlined text-4xl text-gray-200">
                layers_clear
              </span>
              <span className="text-sm">No chapter data available.</span>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};