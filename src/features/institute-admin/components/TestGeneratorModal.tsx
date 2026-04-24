// import React, { useState, useEffect } from "react";
// import { Plus, X } from "lucide-react";
// import { useToast } from "../../../app/providers/ToastProvider";
// import ApiServices from "../../../services/ApiServices";

// export interface GeneratorData {
//   test_name: string;
//   subject: string;
//   chapter_ids: number[];
//   topic_ids: number[];
//   student_ids: number[];
//   questions: number | string;
//   timeLimit: number | string;
//   difficulty: string;
//   due_date: string;
// }

// interface TestGeneratorModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   onGenerate: (data: GeneratorData) => Promise<void> | void;
//   subjectName?: string;
//   subjectId?: number;
//   allChapters?: { chapter_id?: number; name: string; topics?: any[] }[];
//   allTopics?: { topic_id?: number; name: string }[];
//   difficultyOptions: string[];
// }

// const TestGeneratorModal: React.FC<TestGeneratorModalProps> = ({
//   isOpen,
//   onClose,
//   onGenerate,
//   subjectName = "",
//   allChapters = [],
//   difficultyOptions,
// }) => {
//   const { showToast } = useToast();
//   const [form, setForm] = useState<GeneratorData>({
//     test_name: "",
//     subject: subjectName,
//     chapter_ids: [],
//     topic_ids: [],
//     student_ids: [],
//     questions: 20,
//     timeLimit: 30,
//     difficulty: "",
//     due_date: "",
//   });

//   const [isGenerating, setIsGenerating] = useState(false);

//   const [selectedChapters, setSelectedChapters] = useState<number[]>([]);
//   const [availableTopics, setAvailableTopics] = useState<{ topic_id?: number; name: string }[]>([]);
//   const [students, setStudents] = useState<any[]>([]);

//   // reset when opened
//   useEffect(() => {
//     if (isOpen) {
//       // Get current date and time and add 1 day for default due date (tomorrow)
//       const now = new Date();
//       now.setDate(now.getDate() + 1);
//       // Adjust for local time offset to correctly display in datetime-local input
//       const tzOffset = now.getTimezoneOffset() * 60000;
//       const localISOTime = new Date(now.getTime() - tzOffset).toISOString().slice(0, 16);

//       setForm({
//         test_name: "",
//         subject: subjectName,
//         chapter_ids: [],
//         topic_ids: [],
//         student_ids: [],
//         questions: 20,
//         timeLimit: 30,
//         difficulty: "",
//         due_date: localISOTime,
//       });
//       setSelectedChapters([]);
//       setAvailableTopics([]);

//       const fetchStudents = async () => {
//         try {
//           const res = await ApiServices.getStudentsListByAcademics();
//           if (res.data?.status === "success") {
//             setStudents(res.data.data || []);
//           }
//         } catch (error) {
//           // console.error("Failed to fetch students", error);
//         }
//       };
//       fetchStudents();
//     }
//   }, [isOpen, subjectName]);

//   // Update available topics when chapters are selected
//   useEffect(() => {
//     if (selectedChapters.length === 0) {
//       setAvailableTopics([]);
//       setForm(prev => ({ ...prev, topic_ids: [] }));
//     } else {
//       const topics = selectedChapters.flatMap((chapterId) => {
//         const chapter = allChapters.find(ch => ch.chapter_id === chapterId);
//         const chapterTopics = chapter?.topics || [];
//         // Normalize topic structure to ensure 'name' property exists
//         return chapterTopics.map((topic: any) => ({
//           topic_id: topic.topic_id,
//           name: topic.topic_name || topic.name || 'Unnamed Topic'
//         }));
//       });
//       setAvailableTopics(topics);
//       // Reset topic selection when chapters change
//       setForm(prev => ({ ...prev, topic_ids: [] }));
//     }
//   }, [selectedChapters, allChapters]);

//   const handleChapterToggle = (chapterId: number) => {
//     const isSelected = selectedChapters.includes(chapterId);
//     const newSelection = isSelected
//       ? selectedChapters.filter(id => id !== chapterId)
//       : [...selectedChapters, chapterId];
//     setSelectedChapters(newSelection);
//     setForm(prev => ({ ...prev, chapter_ids: newSelection }));
//   };

//   const handleTopicToggle = (topicId: number) => {
//     const isSelected = form.topic_ids.includes(topicId);
//     const newSelection = isSelected
//       ? form.topic_ids.filter(id => id !== topicId)
//       : [...form.topic_ids, topicId];
//     setForm(prev => ({ ...prev, topic_ids: newSelection }));
//   };

//   const handleStudentToggle = (studentId: number) => {
//     const isSelected = form.student_ids.includes(studentId);
//     const newSelection = isSelected
//       ? form.student_ids.filter(id => id !== studentId)
//       : [...form.student_ids, studentId];
//     setForm(prev => ({ ...prev, student_ids: newSelection }));
//   };

//   const handleSubmit = async () => {
//     // Validation
//     if (!form.test_name.trim()) {
//       showToast("Please enter a test name", "error");
//       return;
//     }
//     if (form.chapter_ids.length === 0) {
//       showToast("Please select at least one chapter", "error");
//       return;
//     }
//     if (form.topic_ids.length === 0) {
//       showToast("Please select at least one topic", "error");
//       return;
//     }
//     if (!form.questions || Number(form.questions) <= 0) {
//       showToast("Please enter a valid number of questions", "error");
//       return;
//     }
//     if (!form.timeLimit || Number(form.timeLimit) <= 0) {
//       showToast("Please enter a valid time limit", "error");
//       return;
//     }
//     if (!form.difficulty) {
//       showToast("Please select difficulty level", "error");
//       return;
//     }
//     if (!form.due_date) {
//       showToast("Please select due date", "error");
//       return;
//     }

//     try {
//       setIsGenerating(true);
//       await onGenerate({
//         ...form,
//         questions: Number(form.questions),
//         timeLimit: Number(form.timeLimit),
//       });
//     } finally {
//       setIsGenerating(false);
//     }
//   };

//   const getChapterName = (chapterId: number) => {
//     const chapter = allChapters.find(ch => ch.chapter_id === chapterId);
//     return chapter?.name || `Chapter ${chapterId}`;
//   };

//   const getTopicName = (topicId: number) => {
//     // Search through all chapters and their topics to find the topic name
//     for (const chapter of allChapters) {
//       if (chapter.topics && Array.isArray(chapter.topics)) {
//         const topic = chapter.topics.find((t: any) => t.topic_id === topicId);
//         if (topic) {
//           return topic.topic_name || topic.name || `Topic ${topicId}`;
//         }
//       }
//     }
//     return `Topic ${topicId}`;
//   };

//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
//       <div className="bg-white rounded-2xl w-full max-w-6xl relative max-h-[90vh] flex flex-col">
//         <div className="p-5 border-b border-gray-200">
//           <button
//             onClick={onClose}
//             className="absolute top-4 right-4 p-1.5 text-gray-500 hover:text-gray-700 z-10"
//           >
//             <X size={20} />
//           </button>
//           <h2 className="text-xl font-bold">Create Assessment</h2>
//         </div>
//         <div className="flex-1 overflow-y-auto p-5">
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:items-start">
//             {/* form inputs */}
//             <div className="space-y-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">
//                   Test Name *
//                 </label>
//                 <input
//                   type="text"
//                   value={form.test_name}
//                   onChange={(e) =>
//                     setForm((p) => ({ ...p, test_name: e.target.value }))
//                   }
//                   placeholder="Enter test name"
//                   className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md bg-white shadow-sm focus:outline-none focus:ring-[#b0cb1f] focus:border-[#b0cb1f] text-sm"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700">
//                   Subject
//                 </label>
//                 <input
//                   type="text"
//                   value={subjectName}
//                   disabled
//                   className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md bg-gray-100 shadow-sm text-sm text-gray-700"
//                 />
//               </div>

//               <div>
//                 <div className="flex justify-between items-end mb-2">
//                   <label className="block text-sm font-medium text-gray-700">
//                     Assign to Students
//                   </label>
//                   {students.length > 0 && (
//                     <button
//                       onClick={(e) => {
//                         e.preventDefault();
//                         if (form.student_ids.length === students.length) {
//                           setForm(p => ({ ...p, student_ids: [] }));
//                         } else {
//                           const allIds = students.map(s => s.student_id);
//                           setForm(p => ({ ...p, student_ids: allIds }));
//                         }
//                       }}
//                       className="text-xs text-[#b0cb1f] hover:underline font-semibold"
//                     >
//                       {form.student_ids.length === students.length ? "Deselect All" : "Select All"}
//                     </button>
//                   )}
//                 </div>
//                 <div className={`border border-gray-300 rounded-md p-3 max-h-48 overflow-y-auto ${students.length === 0 ? 'bg-gray-50' : 'bg-white'}`}>
//                   {students.length === 0 ? (
//                     <p className="text-sm text-gray-500">No students available</p>
//                   ) : (
//                     <div className="space-y-2">
//                       {students.map((student) => (
//                         <label
//                           key={student.student_id}
//                           className="flex items-start gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded-md transition"
//                         >
//                           <input
//                             type="checkbox"
//                             checked={form.student_ids.includes(student.student_id)}
//                             onChange={() => handleStudentToggle(student.student_id)}
//                             className="mt-0.5 h-4 w-4 text-[#b0cb1f] border-gray-300 rounded focus:ring-[#b0cb1f]"
//                           />
//                           <span className="text-sm text-gray-700 flex-1">{student.student_name}</span>
//                         </label>
//                       ))}
//                     </div>
//                   )}
//                 </div>
//                 <p className="text-xs text-gray-500 mt-1">
//                   {form.student_ids.length === 0 ? "Assigning to entire class" : `${form.student_ids.length} student(s) selected`}
//                 </p>
//               </div>

//               <div>
//                 <div className="flex justify-between items-end mb-2">
//                   <label className="block text-sm font-medium text-gray-700">
//                     Select Chapters *
//                   </label>
//                   {allChapters.length > 0 && (
//                     <button
//                       onClick={(e) => {
//                         e.preventDefault();
//                         if (selectedChapters.length === allChapters.length) {
//                           setSelectedChapters([]);
//                           setForm(p => ({ ...p, chapter_ids: [] }));
//                         } else {
//                           const allIds = allChapters.map(c => c.chapter_id!);
//                           setSelectedChapters(allIds);
//                           setForm(p => ({ ...p, chapter_ids: allIds }));
//                         }
//                       }}
//                       className="text-xs text-[#b0cb1f] hover:underline font-semibold"
//                     >
//                       {selectedChapters.length === allChapters.length ? "Deselect All" : "Select All"}
//                     </button>
//                   )}
//                 </div>
//                 <div className="border border-gray-300 rounded-md bg-white p-3 max-h-48 overflow-y-auto">
//                   {allChapters.length === 0 ? (
//                     <p className="text-sm text-gray-500">No chapters available</p>
//                   ) : (
//                     <div className="space-y-2">
//                       {allChapters.map((chapter) => (
//                         <label
//                           key={chapter.chapter_id}
//                           className="flex items-start gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded-md transition"
//                         >
//                           <input
//                             type="checkbox"
//                             checked={selectedChapters.includes(chapter.chapter_id!)}
//                             onChange={() => handleChapterToggle(chapter.chapter_id!)}
//                             className="mt-0.5 h-4 w-4 text-[#b0cb1f] border-gray-300 rounded focus:ring-[#b0cb1f]"
//                           />
//                           <span className="text-sm text-gray-700 flex-1">{chapter.name}</span>
//                         </label>
//                       ))}
//                     </div>
//                   )}
//                 </div>
//                 <p className="text-xs text-gray-500 mt-1">
//                   {selectedChapters.length} chapter(s) selected
//                 </p>
//               </div>

//               <div>
//                 <div className="flex justify-between items-end mb-2">
//                   <label className="block text-sm font-medium text-gray-700">
//                     Select Topics *
//                   </label>
//                   {availableTopics.length > 0 && (
//                     <button
//                       onClick={(e) => {
//                         e.preventDefault();
//                         if (form.topic_ids.length === availableTopics.length) {
//                           setForm(p => ({ ...p, topic_ids: [] }));
//                         } else {
//                           const allIds = availableTopics.map(t => t.topic_id!);
//                           setForm(p => ({ ...p, topic_ids: allIds }));
//                         }
//                       }}
//                       className="text-xs text-[#b0cb1f] hover:underline font-semibold"
//                     >
//                       {form.topic_ids.length === availableTopics.length ? "Deselect All" : "Select All"}
//                     </button>
//                   )}
//                 </div>
//                 <div className={`border border-gray-300 rounded-md p-3 max-h-48 overflow-y-auto ${availableTopics.length === 0 ? 'bg-gray-50' : 'bg-white'
//                   }`}>
//                   {availableTopics.length === 0 ? (
//                     <p className="text-sm text-gray-500">Select chapters first</p>
//                   ) : (
//                     <div className="space-y-2">
//                       {availableTopics.map((topic) => (
//                         <label
//                           key={topic.topic_id}
//                           className="flex items-start gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded-md transition"
//                         >
//                           <input
//                             type="checkbox"
//                             checked={form.topic_ids.includes(topic.topic_id!)}
//                             onChange={() => handleTopicToggle(topic.topic_id!)}
//                             className="mt-0.5 h-4 w-4 text-[#b0cb1f] border-gray-300 rounded focus:ring-[#b0cb1f]"
//                           />
//                           <span className="text-sm text-gray-700 flex-1">{topic.name}</span>
//                         </label>
//                       ))}
//                     </div>
//                   )}
//                 </div>
//                 <p className="text-xs text-gray-500 mt-1">
//                   {form.topic_ids.length} topic(s) selected
//                 </p>
//               </div>

//               <div className="flex gap-4">
//                 <div className="flex-1">
//                   <label className="block text-sm font-medium text-gray-700">
//                     Number of Questions
//                   </label>
//                   <input
//                     type="number"
//                     value={form.questions}
//                     onChange={(e) =>
//                       setForm((p) => ({
//                         ...p,
//                         questions: e.target.value === "" ? "" : Number(e.target.value),
//                       }))
//                     }
//                     min="1"
//                     className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md bg-white shadow-sm text-sm focus:outline-none focus:ring-[#b0cb1f] focus:border-[#b0cb1f]"
//                   />
//                 </div>
//                 <div className="flex-1">
//                   <label className="block text-sm font-medium text-gray-700">
//                     Time Limit (minutes)
//                   </label>
//                   <input
//                     type="number"
//                     value={form.timeLimit}
//                     onChange={(e) =>
//                       setForm((p) => ({
//                         ...p,
//                         timeLimit: e.target.value === "" ? "" : Number(e.target.value),
//                       }))
//                     }
//                     min="1"
//                     className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md bg-white shadow-sm text-sm focus:outline-none focus:ring-[#b0cb1f] focus:border-[#b0cb1f]"
//                   />
//                 </div>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700">
//                   Difficulty Level *
//                 </label>
//                 <select
//                   value={form.difficulty}
//                   onChange={(e) =>
//                     setForm((p) => ({ ...p, difficulty: e.target.value }))
//                   }
//                   className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md bg-white shadow-sm focus:outline-none focus:ring-[#b0cb1f] focus:border-[#b0cb1f] text-sm"
//                 >
//                   <option value="">Choose difficulty</option>
//                   {difficultyOptions.map((d) => (
//                     <option key={d} value={d}>
//                       {d}
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700">
//                   Due Date & Time *
//                 </label>
//                 <input
//                   type="datetime-local"
//                   min={new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16)}
//                   value={form.due_date}
//                   onChange={(e) =>
//                     setForm((p) => ({ ...p, due_date: e.target.value }))
//                   }
//                   className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md bg-white shadow-sm focus:outline-none focus:ring-[#b0cb1f] focus:border-[#b0cb1f] text-sm"
//                 />
//               </div>
//             </div>

//             {/* summary panel */}
//             <div className="bg-gradient-to-br from-blue-50 to-gray-50 rounded-xl p-3 border border-blue-100 sticky top-0">
//               <h3 className="text-lg font-bold text-gray-800 mb-2">Test Summary</h3>
//               <div className="space-y-3">
//                 <div className="flex items-center justify-between">
//                   <span className="text-sm font-medium text-gray-600">Test Name:</span>
//                   <span className="text-sm text-gray-800 font-semibold">
//                     {form.test_name || "Not entered"}
//                   </span>
//                 </div>
//                 <div className="flex items-center justify-between">
//                   <span className="text-sm font-medium text-gray-600">Subject:</span>
//                   <span className="text-sm text-gray-800 font-semibold">
//                     {subjectName || "Not selected"}
//                   </span>
//                 </div>
//                 <div className="flex flex-col gap-1">
//                   <span className="text-sm font-medium text-gray-600">Chapters:</span>
//                   <span className="text-xs text-gray-700">
//                     {form.chapter_ids.length === 0
//                       ? "None selected"
//                       : form.chapter_ids.length === allChapters.length
//                         ? "All chapters selected"
//                         : form.chapter_ids.map((id) => getChapterName(id)).join(", ")}
//                   </span>
//                 </div>
//                 <div className="flex flex-col gap-1">
//                   <span className="text-sm font-medium text-gray-600">Topics:</span>
//                   <span className="text-xs text-gray-700">
//                     {form.topic_ids.length === 0
//                       ? "None selected"
//                       : form.topic_ids.length === availableTopics.length
//                         ? "All topics selected"
//                         : form.topic_ids.map((id) => getTopicName(id)).join(", ")}
//                   </span>
//                 </div>
//                 <hr className="my-2 border-blue-200" />
//                 <div className="flex items-center justify-between">
//                   <span className="text-sm font-medium text-gray-600">Questions:</span>
//                   <span className="text-sm font-bold text-[#b0cb1f]">{form.questions}</span>
//                 </div>
//                 <div className="flex items-center justify-between">
//                   <span className="text-sm font-medium text-gray-600">Time:</span>
//                   <span className="text-sm font-bold text-[#b0cb1f]">{form.timeLimit} min</span>
//                 </div>
//                 <div className="flex items-center justify-between">
//                   <span className="text-sm font-medium text-gray-600">Difficulty:</span>
//                   <span className="text-sm font-bold text-[#b0cb1f]">
//                     {form.difficulty || "Not Selected"}
//                   </span>
//                 </div>
//                 <div className="flex flex-col gap-1">
//                   <span className="text-sm font-medium text-gray-600">Due Date:</span>
//                   <span className="text-xs text-gray-700">
//                     {form.due_date
//                       ? new Date(form.due_date).toLocaleString("en-IN", {
//                         dateStyle: "medium",
//                         timeStyle: "short",
//                       })
//                       : "Not selected"}
//                   </span>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         <div className="sticky bottom-0 bg-white border-t border-gray-200 p-5 rounded-b-2xl">
//           <button
//             onClick={handleSubmit}
//             disabled={isGenerating}
//             className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-full text-gray-900 font-semibold text-sm transition-all shadow-md ${isGenerating ? 'bg-gray-300 cursor-not-allowed' : 'bg-[#b0cb1f] hover:bg-[#c5de3a] hover:scale-[1.02]'}`}
//           >
//             {isGenerating ? (
//               <>
//                 <div className="w-5 h-5 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
//                 Generating...
//               </>
//             ) : (
//               <>
//                 <Plus size={18} />
//                 Generate Test &amp; Assign
//               </>
//             )}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default TestGeneratorModal;

import React, { useState, useEffect, useMemo } from "react";
import { Plus, X } from "lucide-react";
import { useToast } from "../../../app/providers/ToastProvider";
import ApiServices from "../../../services/ApiServices";

export interface GeneratorData {
  test_name: string;
  subject: string;
  chapter_ids: number[];
  topic_ids: number[];
  student_ids: number[];
  questions: number | string;
  timeLimit: number | string;
  difficulty: string;
  due_date: string;
}

interface TestGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (data: GeneratorData) => Promise<void> | void;
  subjectName?: string;
  subjectId?: number;
  allChapters?: { chapter_id?: number; name: string; topics?: any[] }[];
  allTopics?: { topic_id?: number; name: string }[];
  difficultyOptions: string[];
}

const TestGeneratorModal: React.FC<TestGeneratorModalProps> = ({
  isOpen,
  onClose,
  onGenerate,
  subjectName = "",
  allChapters = [],
  difficultyOptions,
}) => {
  const { showToast } = useToast();
  const [form, setForm] = useState<GeneratorData>({
    test_name: "",
    subject: subjectName,
    chapter_ids: [],
    topic_ids: [],
    student_ids: [],
    questions: 20,
    timeLimit: 30,
    difficulty: "",
    due_date: "",
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [showTestNameSuggestions, setShowTestNameSuggestions] = useState(true);

  const [selectedChapters, setSelectedChapters] = useState<number[]>([]);
  const [availableTopics, setAvailableTopics] = useState<
    { topic_id?: number; name: string }[]
  >([]);
  const [students, setStudents] = useState<any[]>([]);

  // reset when opened
  useEffect(() => {
    if (isOpen) {
      // Get current date and time and add 1 day for default due date (tomorrow)
      const now = new Date();
      now.setDate(now.getDate() + 1);
      // Adjust for local time offset to correctly display in datetime-local input
      const tzOffset = now.getTimezoneOffset() * 60000;
      const localISOTime = new Date(now.getTime() - tzOffset)
        .toISOString()
        .slice(0, 16);

      setForm({
        test_name: "",
        subject: subjectName,
        chapter_ids: [],
        topic_ids: [],
        student_ids: [],
        questions: 20,
        timeLimit: 30,
        difficulty: "",
        due_date: localISOTime,
      });
      setSelectedChapters([]);
      setAvailableTopics([]);

      const fetchStudents = async () => {
        try {
          const res = await ApiServices.getStudentsListByAcademics();
          if (res.data?.status === "success") {
            setStudents(res.data.data || []);
          }
        } catch (error) {
          // console.error("Failed to fetch students", error);
        }
      };
      fetchStudents();
    }
  }, [isOpen, subjectName]);

  const testNameSuggestions = useMemo(() => {
    if (!form.test_name) return [];

    const search = form.test_name.toLowerCase();

    const baseNames = [subjectName, ...allChapters.map((c) => c.name)].filter(
      Boolean,
    );

    const testTypes = [
      "Test",
      "Practice Test",
      "MCQ Test",
      "Assessment",
      "Quiz",
      "Mock Test",
    ];

    const results: string[] = [];

    baseNames.forEach((name) => {
      testTypes.forEach((type) => {
        const suggestion = `${name} ${type}`;

        if (suggestion.toLowerCase().includes(search)) {
          results.push(suggestion);
        }
      });
    });

    return results.slice(0, 8);
  }, [form.test_name, subjectName, allChapters]);

  // Update available topics when chapters are selected
  useEffect(() => {
    if (selectedChapters.length === 0) {
      setAvailableTopics([]);
      setForm((prev) => ({ ...prev, topic_ids: [] }));
    } else {
      const topics = selectedChapters.flatMap((chapterId) => {
        const chapter = allChapters.find((ch) => ch.chapter_id === chapterId);
        const chapterTopics = chapter?.topics || [];
        // Normalize topic structure to ensure 'name' property exists
        return chapterTopics.map((topic: any) => ({
          topic_id: topic.topic_id,
          name: topic.topic_name || topic.name || "Unnamed Topic",
        }));
      });
      setAvailableTopics(topics);
      // Reset topic selection when chapters change
      setForm((prev) => ({ ...prev, topic_ids: [] }));
    }
  }, [selectedChapters, allChapters]);

  const handleTestNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (
      e.key === "Tab" &&
      showTestNameSuggestions &&
      testNameSuggestions.length > 0
    ) {
      e.preventDefault();
      setForm((p) => ({ ...p, test_name: testNameSuggestions[0] }));
      setShowTestNameSuggestions(false);
    }
  };

  const handleChapterToggle = (chapterId: number) => {
    const isSelected = selectedChapters.includes(chapterId);
    const newSelection = isSelected
      ? selectedChapters.filter((id) => id !== chapterId)
      : [...selectedChapters, chapterId];
    setSelectedChapters(newSelection);
    setForm((prev) => ({ ...prev, chapter_ids: newSelection }));
  };

  const handleTopicToggle = (topicId: number) => {
    const isSelected = form.topic_ids.includes(topicId);
    const newSelection = isSelected
      ? form.topic_ids.filter((id) => id !== topicId)
      : [...form.topic_ids, topicId];
    setForm((prev) => ({ ...prev, topic_ids: newSelection }));
  };

  const handleStudentToggle = (studentId: number) => {
    const isSelected = form.student_ids.includes(studentId);
    const newSelection = isSelected
      ? form.student_ids.filter((id) => id !== studentId)
      : [...form.student_ids, studentId];
    setForm((prev) => ({ ...prev, student_ids: newSelection }));
  };

  const handleSubmit = async () => {
    // Validation
    if (!form.test_name.trim()) {
      showToast("Please enter a test name", "error");
      return;
    }
    if (form.chapter_ids.length === 0) {
      showToast("Please select at least one chapter", "error");
      return;
    }
    if (form.topic_ids.length === 0) {
      showToast("Please select at least one topic", "error");
      return;
    }
    if (!form.questions || Number(form.questions) <= 0) {
      showToast("Please enter a valid number of questions", "error");
      return;
    }
    if (!form.timeLimit || Number(form.timeLimit) <= 0) {
      showToast("Please enter a valid time limit", "error");
      return;
    }
    if (!form.difficulty) {
      showToast("Please select difficulty level", "error");
      return;
    }
    if (!form.due_date) {
      showToast("Please select due date", "error");
      return;
    }

    try {
      setIsGenerating(true);
      await onGenerate({
        ...form,
        questions: Number(form.questions),
        timeLimit: Number(form.timeLimit),
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const getChapterName = (chapterId: number) => {
    const chapter = allChapters.find((ch) => ch.chapter_id === chapterId);
    return chapter?.name || `Chapter ${chapterId}`;
  };

  const getTopicName = (topicId: number) => {
    // Search through all chapters and their topics to find the topic name
    for (const chapter of allChapters) {
      if (chapter.topics && Array.isArray(chapter.topics)) {
        const topic = chapter.topics.find((t: any) => t.topic_id === topicId);
        if (topic) {
          return topic.topic_name || topic.name || `Topic ${topicId}`;
        }
      }
    }
    return `Topic ${topicId}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
      <div className="bg-white rounded-2xl w-full max-w-6xl relative max-h-[90vh] flex flex-col">
        <div className="p-5 border-b border-gray-200">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-gray-500 hover:text-gray-700 z-10"
          >
            <X size={20} />
          </button>
          <h2 className="text-xl font-bold">Create Assessment</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:items-start">
            {/* form inputs */}
            <div className="space-y-4">
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700">
                  Test Name *
                </label>
                <input
                  type="text"
                  value={form.test_name}
                  onChange={(e) => {
                    setForm((p) => ({ ...p, test_name: e.target.value }));
                    setShowTestNameSuggestions(true);
                  }}
                  placeholder="Enter test name"
                  onKeyDown={handleTestNameKeyDown}
                  className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md bg-white shadow-sm focus:outline-none focus:ring-[#b0cb1f] focus:border-[#b0cb1f] text-sm"
                />

                {showTestNameSuggestions && testNameSuggestions.length > 0 && (
                  <div className="absolute left-0 top-full mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                    {testNameSuggestions.map((item, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => {
                          setForm((p) => ({ ...p, test_name: item }));
                          setShowTestNameSuggestions(false);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors first:rounded-t-lg last:rounded-b-lg"
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Subject
                </label>
                <input
                  type="text"
                  value={subjectName}
                  disabled
                  className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md bg-gray-100 shadow-sm text-sm text-gray-700"
                />
              </div>

              <div>
                <div className="flex justify-between items-end mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Assign to Students
                  </label>
                  {students.length > 0 && (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        if (form.student_ids.length === students.length) {
                          setForm((p) => ({ ...p, student_ids: [] }));
                        } else {
                          const allIds = students.map((s) => s.student_id);
                          setForm((p) => ({ ...p, student_ids: allIds }));
                        }
                      }}
                      className="text-xs text-[#b0cb1f] hover:underline font-semibold"
                    >
                      {form.student_ids.length === students.length
                        ? "Deselect All"
                        : "Select All"}
                    </button>
                  )}
                </div>
                <div
                  className={`border border-gray-300 rounded-md p-3 max-h-48 overflow-y-auto ${students.length === 0 ? "bg-gray-50" : "bg-white"}`}
                >
                  {students.length === 0 ? (
                    <p className="text-sm text-gray-500">
                      No students available
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {students.map((student) => (
                        <label
                          key={student.student_id}
                          className="flex items-start gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded-md transition"
                        >
                          <input
                            type="checkbox"
                            checked={form.student_ids.includes(
                              student.student_id,
                            )}
                            onChange={() =>
                              handleStudentToggle(student.student_id)
                            }
                            className="mt-0.5 h-4 w-4 text-[#b0cb1f] border-gray-300 rounded focus:ring-[#b0cb1f]"
                          />
                          <span className="text-sm text-gray-700 flex-1">
                            {student.student_name}
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {form.student_ids.length === 0
                    ? "Assigning to entire class"
                    : `${form.student_ids.length} student(s) selected`}
                </p>
              </div>

              <div>
                <div className="flex justify-between items-end mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Select Chapters *
                  </label>
                  {allChapters.length > 0 && (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        if (selectedChapters.length === allChapters.length) {
                          setSelectedChapters([]);
                          setForm((p) => ({ ...p, chapter_ids: [] }));
                        } else {
                          const allIds = allChapters.map((c) => c.chapter_id!);
                          setSelectedChapters(allIds);
                          setForm((p) => ({ ...p, chapter_ids: allIds }));
                        }
                      }}
                      className="text-xs text-[#b0cb1f] hover:underline font-semibold"
                    >
                      {selectedChapters.length === allChapters.length
                        ? "Deselect All"
                        : "Select All"}
                    </button>
                  )}
                </div>
                <div className="border border-gray-300 rounded-md bg-white p-3 max-h-48 overflow-y-auto">
                  {allChapters.length === 0 ? (
                    <p className="text-sm text-gray-500">
                      No chapters available
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {allChapters.map((chapter) => (
                        <label
                          key={chapter.chapter_id}
                          className="flex items-start gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded-md transition"
                        >
                          <input
                            type="checkbox"
                            checked={selectedChapters.includes(
                              chapter.chapter_id!,
                            )}
                            onChange={() =>
                              handleChapterToggle(chapter.chapter_id!)
                            }
                            className="mt-0.5 h-4 w-4 text-[#b0cb1f] border-gray-300 rounded focus:ring-[#b0cb1f]"
                          />
                          <span className="text-sm text-gray-700 flex-1">
                            {chapter.name}
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {selectedChapters.length} chapter(s) selected
                </p>
              </div>

              <div>
                <div className="flex justify-between items-end mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Select Topics *
                  </label>
                  {availableTopics.length > 0 && (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        if (form.topic_ids.length === availableTopics.length) {
                          setForm((p) => ({ ...p, topic_ids: [] }));
                        } else {
                          const allIds = availableTopics.map(
                            (t) => t.topic_id!,
                          );
                          setForm((p) => ({ ...p, topic_ids: allIds }));
                        }
                      }}
                      className="text-xs text-[#b0cb1f] hover:underline font-semibold"
                    >
                      {form.topic_ids.length === availableTopics.length
                        ? "Deselect All"
                        : "Select All"}
                    </button>
                  )}
                </div>
                <div
                  className={`border border-gray-300 rounded-md p-3 max-h-48 overflow-y-auto ${
                    availableTopics.length === 0 ? "bg-gray-50" : "bg-white"
                  }`}
                >
                  {availableTopics.length === 0 ? (
                    <p className="text-sm text-gray-500">
                      Select chapters first
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {availableTopics.map((topic) => (
                        <label
                          key={topic.topic_id}
                          className="flex items-start gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded-md transition"
                        >
                          <input
                            type="checkbox"
                            checked={form.topic_ids.includes(topic.topic_id!)}
                            onChange={() => handleTopicToggle(topic.topic_id!)}
                            className="mt-0.5 h-4 w-4 text-[#b0cb1f] border-gray-300 rounded focus:ring-[#b0cb1f]"
                          />
                          <span className="text-sm text-gray-700 flex-1">
                            {topic.name}
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {form.topic_ids.length} topic(s) selected
                </p>
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Number of Questions
                  </label>
                  <input
                    type="number"
                    value={form.questions}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        questions:
                          e.target.value === "" ? "" : Number(e.target.value),
                      }))
                    }
                    min="1"
                    className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md bg-white shadow-sm text-sm focus:outline-none focus:ring-[#b0cb1f] focus:border-[#b0cb1f]"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Time Limit (minutes)
                  </label>
                  <input
                    type="number"
                    value={form.timeLimit}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        timeLimit:
                          e.target.value === "" ? "" : Number(e.target.value),
                      }))
                    }
                    min="1"
                    className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md bg-white shadow-sm text-sm focus:outline-none focus:ring-[#b0cb1f] focus:border-[#b0cb1f]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Difficulty Level *
                </label>
                <select
                  value={form.difficulty}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, difficulty: e.target.value }))
                  }
                  className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md bg-white shadow-sm focus:outline-none focus:ring-[#b0cb1f] focus:border-[#b0cb1f] text-sm"
                >
                  <option value="">Choose difficulty</option>
                  {difficultyOptions.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Due Date & Time *
                </label>
                <input
                  type="datetime-local"
                  min={new Date(
                    new Date().getTime() -
                      new Date().getTimezoneOffset() * 60000,
                  )
                    .toISOString()
                    .slice(0, 16)}
                  value={form.due_date}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, due_date: e.target.value }))
                  }
                  className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md bg-white shadow-sm focus:outline-none focus:ring-[#b0cb1f] focus:border-[#b0cb1f] text-sm"
                />
              </div>
            </div>

            {/* summary panel */}
            <div className="bg-gradient-to-br from-blue-50 to-gray-50 rounded-xl p-3 border border-blue-100 sticky top-0">
              <h3 className="text-lg font-bold text-gray-800 mb-2">
                Test Summary
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">
                    Test Name:
                  </span>
                  <span className="text-sm text-gray-800 font-semibold">
                    {form.test_name || "Not entered"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">
                    Subject:
                  </span>
                  <span className="text-sm text-gray-800 font-semibold">
                    {subjectName || "Not selected"}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-medium text-gray-600">
                    Chapters:
                  </span>
                  <span className="text-xs text-gray-700">
                    {form.chapter_ids.length === 0
                      ? "None selected"
                      : form.chapter_ids.length === allChapters.length
                        ? "All chapters selected"
                        : form.chapter_ids
                            .map((id) => getChapterName(id))
                            .join(", ")}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-medium text-gray-600">
                    Topics:
                  </span>
                  <span className="text-xs text-gray-700">
                    {form.topic_ids.length === 0
                      ? "None selected"
                      : form.topic_ids.length === availableTopics.length
                        ? "All topics selected"
                        : form.topic_ids
                            .map((id) => getTopicName(id))
                            .join(", ")}
                  </span>
                </div>
                <hr className="my-2 border-blue-200" />
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">
                    Questions:
                  </span>
                  <span className="text-sm font-bold text-[#b0cb1f]">
                    {form.questions}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">
                    Time:
                  </span>
                  <span className="text-sm font-bold text-[#b0cb1f]">
                    {form.timeLimit} min
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">
                    Difficulty:
                  </span>
                  <span className="text-sm font-bold text-[#b0cb1f]">
                    {form.difficulty || "Not Selected"}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-medium text-gray-600">
                    Due Date:
                  </span>
                  <span className="text-xs text-gray-700">
                    {form.due_date
                      ? new Date(form.due_date).toLocaleString("en-IN", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })
                      : "Not selected"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-5 rounded-b-2xl">
          <button
            onClick={handleSubmit}
            disabled={isGenerating}
            className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-full text-gray-900 font-semibold text-sm transition-all shadow-md ${isGenerating ? "bg-gray-300 cursor-not-allowed" : "bg-[#b0cb1f] hover:bg-[#c5de3a] hover:scale-[1.02]"}`}
          >
            {isGenerating ? (
              <>
                <div className="w-5 h-5 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Plus size={18} />
                Generate Test &amp; Assign
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TestGeneratorModal;