import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import IconChat from "../../../assets/icon/chat2.svg";
import ApiServices from "../../../services/ApiServices";
import Chat from "../../auth/modal/chat";
import {
  Calendar,
  Upload,
  Save,
  FileText,
  // FileSpreadsheet,
  Link,
  X,
  Loader2,
} from "lucide-react";
import SearchableSelect from "../../../components/common/SearchableSelect";
import { useToast } from "../../../app/providers/ToastProvider";

// type Priority = "High" | "Medium" | "Low";

interface ApiChapter {
  id: number;
  chapter: string;
  startDate: string;
  endDate: string;
  startDate_raw: string;
  endDate_raw: string;
  progress: number;
  completed: boolean;
  isSaved?: boolean;
  testMaterial: any[];
  practiceMaterial: any[];
}

interface ApiSubjectPlan {
  subject_id: number;
  subject_name: string;
  chapters: ApiChapter[];
}

const demoChaptersData = [
  {
    id: 1,
    chapter: "Set Theory",
    startDate: "--",
    startDate_raw: "",
    endDate: "--",
    endDate_raw: "",
    progress: 90,
    completed: false,
    isSaved: true,
    testMaterial: [] as { name: string; type: "pdf" | "excel" | "link" }[],
    practiceMaterial: [] as { name: string; type: "pdf" | "excel" | "link" }[],
  },
  {
    id: 2,
    chapter: "Algebra",
    startDate: "--",
    startDate_raw: "",
    endDate: "--",
    endDate_raw: "",
    progress: 85,
    completed: false,
    isSaved: true,
    testMaterial: [] as { name: string; type: "pdf" | "excel" | "link" }[],
    practiceMaterial: [] as { name: string; type: "pdf" | "excel" | "link" }[],
  },
];

const TeacherLearningPlanner: React.FC = () => {
  const [subjects, setSubjects] = useState<ApiSubjectPlan[]>([]);
  const [activeSubject, setActiveSubject] = useState("");
  const { showToast } = useToast();

  const [classOptions, setClassOptions] = useState<
    { id: number; name: string }[]
  >([]);
  const [sectionOptions, setSectionOptions] = useState<
    { id: number; name: string }[]
  >([]);
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [selectedSection, setSelectedSection] = useState<string>("");

  const [savingChapterId, setSavingChapterId] = useState<number | null>(null);
  const [isMockModalOpen, setIsMockModalOpen] = useState(false);
  const [selectedMockChapterIds, setSelectedMockChapterIds] = useState<
    number[]
  >([]);
  const [demoChapters, setDemoChapters] =
    useState<ApiChapter[]>(demoChaptersData);
  const [isGeneratingTest, setIsGeneratingTest] = useState(false);

  // ─── UNIFIED UPLOAD MODAL STATE ────────────────────────────────────────────────
  const [uploadForm, setUploadForm] = useState<{
    isOpen: boolean;
    chapterId: number | null;
    category: "testMaterial" | "practiceMaterial";
    sourceType: "file" | "link";
    file: File | null;
    linkUrl: string;
    displayName: string;
    description: string; // <-- Description state bound here
  }>({
    isOpen: false,
    chapterId: null,
    category: "testMaterial",
    sourceType: "file",
    file: null,
    linkUrl: "",
    displayName: "",
    description: "",
  });

  useEffect(() => {
    if (isMockModalOpen) {
      const completedIds = demoChapters
        .filter((ch) => ch.completed)
        .map((ch) => ch.id);
      setSelectedMockChapterIds(completedIds);
    }
  }, [isMockModalOpen, demoChapters]);

  useEffect(() => {
    if (uploadForm.isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [uploadForm.isOpen]);

  const toggleDemoChapter = (id: number) => {
    setSubjects((prev) =>
      prev.map((sub) => ({
        ...sub,
        chapters: sub.chapters.map((ch: any) =>
          ch.id === id || ch.chapter_id === id
            ? {
              ...ch,
              completed: !ch.completed,
              is_completed: !ch.completed,
              isSaved: false,
            }
            : ch,
        ),
      })),
    );
  };

  const handleUploadSubmit = async () => {
    const {
      chapterId,
      category,
      sourceType,
      file,
      linkUrl,
      displayName,
      description,
    } = uploadForm;
    if (!chapterId) return;

    // Validation
    if (sourceType === "file" && !file) {
      showToast("Please select a file to upload.", "error");
      return;
    }
    if (sourceType === "link" && !linkUrl.trim()) {
      showToast("Please enter a valid URL.", "error");
      return;
    }
    if (!displayName.trim()) {
      showToast("Please enter a display name.", "error");
      return;
    }

    const currentSubjectValidate = subjects.find((s) => s.subject_name === activeSubject);
    const allExistingMaterials: any[] = [...backendMaterials];
    currentSubjectValidate?.chapters.forEach((ch: any) => {
      allExistingMaterials.push(...(ch.testMaterial || []));
      allExistingMaterials.push(...(ch.practiceMaterial || []));
      allExistingMaterials.push(...((ch as any).study_material || []));
      allExistingMaterials.push(...((ch as any).practice_material || []));
      allExistingMaterials.push(...((ch as any).study_materials || []));
      allExistingMaterials.push(...((ch as any).practice_materials || []));
    });

    const newNameClean = displayName.trim().toLowerCase();
    const isDuplicateNameSubmit = allExistingMaterials.some((mat: any) => {
      const matchName = String(mat.name || mat.title || mat.display_name || mat.file_name || "").trim().toLowerCase();
      if (!matchName) return false;
      return matchName === newNameClean || matchName.replace(/\.[^/.]+$/, "") === newNameClean.replace(/\.[^/.]+$/, "");
    });

    if (isDuplicateNameSubmit) {
      showToast("This display name already exists.", "error");
      return;
    }
    if (!description.trim()) {
      showToast("Please enter a description.", "error");
      return;
    }

    const finalName = displayName.trim();

    const type =
      sourceType === "file" && file
        ? file.name.endsWith(".xls") ||
          file.name.endsWith(".xlsx") ||
          file.type === "application/vnd.ms-excel" ||
          file.type ===
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          ? "excel"
          : "pdf"
        : "link";

    setIsLoading(true);

    try {
      const formData = new FormData();

      // 1. Append Required IDs (Matches your Postman screenshot perfectly)
      formData.append("chapter_id", chapterId.toString());
      formData.append("board_id", stats?.board_id?.toString() || "");
      formData.append("institute_id", stats?.institute_id?.toString() || "");

      const currentClassObj = classOptions.find(
        (c) => c.name === selectedClass,
      );
      formData.append(
        "class_id",
        currentClassObj?.id?.toString() || stats?.class_id?.toString() || "",
      );

      const currentSectionObj = sectionOptions.find(
        (s) => s.name === selectedSection,
      );
      formData.append(
        "section_id",
        currentSectionObj?.id?.toString() ||
        stats?.section_id?.toString() ||
        "",
      );

      const currentSubject = subjects.find(
        (s) => s.subject_name === activeSubject,
      );
      formData.append(
        "subject_id",
        currentSubject?.subject_id?.toString() || "",
      );

      // 2. Append Title & Description (Exactly as shown in your Postman body)
      formData.append("title", finalName);
      formData.append("description", description.trim());

      // 3. Handle File vs Link correctly
      if (sourceType === "link") {
        formData.append("file_type", "link");
        formData.append("link_url", linkUrl.trim());
      } else if (file) {
        const backendCategory =
          category === "testMaterial" ? "study_material" : "practice_material";
        formData.append("file_type", backendCategory);
        formData.append("files", file);
      }

      // Execute the API Call
      const res = await ApiServices.uploadStudyMaterial(formData);

      if (res.data?.status === "success") {
        showToast("Material uploaded successfully", "success");
        fetchBackendMaterials();

        // Optimistically update the local state
        setSubjects((prev) =>
          prev.map((sub) => ({
            ...sub,
            chapters: sub.chapters.map((ch: any) =>
              ch.id === chapterId || ch.chapter_id === chapterId
                ? {
                  ...ch,
                  [category]: [
                    ...(ch[category] || []),
                    { name: finalName, type },
                  ],
                }
                : ch,
            ),
          })),
        );

        // Close modal
        setUploadForm({ ...uploadForm, isOpen: false });
      } else {
        showToast(res.data?.message || "Failed to upload material", "error");
      }
    } catch (error) {
      showToast("An error occurred while uploading material", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const today = new Date().toISOString().split("T")[0];

  const handleDateChange = (
    id: number,
    field: "startDate" | "endDate",
    value: string,
  ) => {
    if (!value) return;
    const date = new Date(value);
    const formattedDate = date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

    setSubjects((prev) =>
      prev.map((sub) => ({
        ...sub,
        chapters: sub.chapters.map((ch: any) =>
          ch.id === id || ch.chapter_id === id
            ? {
              ...ch,
              [field]: formattedDate,
              [`${field}_raw`]: value,
              isSaved: false,
            }
            : ch,
        ),
      })),
    );
  };

  const [profileImage, setProfileImage] = useState<string>(" ");
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [backendMaterials, setBackendMaterials] = useState<any[]>([]);

  const fetchLearningPlan = async () => {
    try {
      setIsLoading(true);
      const response = await ApiServices.getTeacherPlannerData();
      const result = response.data;

      if (result.status === "success") {
        const data = result.data;
        const plannerMap = new Map();
        (data.chapter_planner || []).forEach((item: any) => {
          plannerMap.set(item.chapter_id, item);
        });

        const plans = (data.subject_wise_chapters || [])
          .filter(
            (sub: any) =>
              Array.isArray(sub.chapters) && sub.chapters.length > 0,
          )
          .map((sub: any) => ({
            ...sub,
            chapters: (sub.chapters || []).map((ch: any) => {
              const plannerData = plannerMap.get(ch.id || ch.chapter_id);
              const rawStart = plannerData?.start_date || ch.start_date || "";
              const rawEnd = plannerData?.end_date || ch.end_date || "";

              return {
                ...ch,
                id: ch.id || ch.chapter_id,
                chapter: ch.name || ch.chapter_name,
                startDate: rawStart
                  ? new Date(rawStart).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })
                  : "--",
                endDate: rawEnd
                  ? new Date(rawEnd).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })
                  : "--",
                startDate_raw: rawStart,
                endDate_raw: rawEnd,
                progress: ch.progress_percentage || 0,
                completed: plannerData
                  ? plannerData.is_completed
                  : ch.is_completed || false,
                isSaved: true,
                testMaterial: ch.testMaterial || [],
                practiceMaterial: ch.practiceMaterial || [],
              };
            }),
          }));

        setSubjects(plans);

        setStats({
          teacher_name: data.teacher?.name,
          institute_name: data.institute?.name,
          institute_id: data.institute?.id,
          board_name: data.board?.name,
          board_id: data.board?.id,
          class_name: data.dropdowns?.classes?.[0]?.name,
          class_id: data.dropdowns?.classes?.[0]?.id,
          section_name: data.dropdowns?.sections?.[0]?.name,
          section_id: data.dropdowns?.sections?.[0]?.id,
          subscription_id: data.subscription_id,
          student_ids: data.student_ids || [],
          test_config: data.test_config || {},
        });

        if (data.dropdowns) {
          setClassOptions(data.dropdowns.classes || []);
          setSectionOptions(data.dropdowns.sections || []);
        }

        if (plans.length > 0) {
          setActiveSubject((prev) => prev || plans[0]?.subject_name || "");
        }
      }
    } catch (error) {
      // Handle error
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProfileImage = async () => {
    try {
      const response = await ApiServices.getUserProfileImage();
      if (response.data?.status === "success" && response.data?.data?.image) {
        setProfileImage(response.data.data.image);
      }
    } catch (error) {
      // Handle error
    }
  };

  const fetchBackendMaterials = async () => {
    try {
      const response = await ApiServices.getTeacherStudyMaterial();
      if (response.data?.status === "success") {
        setBackendMaterials(response.data?.data?.data || []);
      }
    } catch (error) { }
  };

  useEffect(() => {
    fetchLearningPlan();
    fetchProfileImage();
    fetchBackendMaterials();
  }, []);

  useEffect(() => {
    const activePlan = subjects.find((s) => s.subject_name === activeSubject);
    if (activePlan) {
      setDemoChapters(activePlan.chapters);
    } else {
      setDemoChapters([]);
    }
  }, [activeSubject, subjects]);

  const handleSave = async (row: any) => {
    const payload = {
      chapter_id: row.id,
      start_date: row.startDate_raw || null,
      end_date: row.endDate_raw || null,
      is_completed: row.completed,
    };
    setSavingChapterId(row.id);
    try {
      const res = await ApiServices.upsertTeacherPlanner(payload);

      if (res.data?.status === "success") {
        showToast("Chapter planner updated successfully", "success");
        fetchLearningPlan();

        if (row.completed === true) {
          try {
            setIsGeneratingTest(true);

            let due_date = null;
            if (row.endDate_raw && stats?.test_config?.validity_date) {
              const dateObj = new Date(row.endDate_raw);
              dateObj.setDate(dateObj.getDate() + stats.test_config.validity_date);
              due_date = dateObj.toISOString().split("T")[0];
            } else if (row.endDate_raw) {
              due_date = row.endDate_raw;
            }

            const currentSubjectId = subjects.find(s => s.subject_name === activeSubject)?.subject_id;

            const genRes = await ApiServices.createAdaptiveSet({
              set_name: `${row.chapter} - Adaptive Test`,
              institute_id: stats?.institute_id,
              board_id: stats?.board_id,
              class_id: stats?.class_id,
              subject_id: currentSubjectId,
              total_marks: stats?.test_config?.total_marks || null,
              duration_minutes: stats?.test_config?.duration_minutes || null,
              number_of_questions: stats?.test_config?.number_of_questions || null,
              max_attempt_count: stats?.test_config?.max_attempt_count || null,
              chapters_array: [row.id],
              topics_array: null,
              student_ids: stats?.student_ids || [],
              due_date: due_date
            });

            if (genRes.data?.status !== "success") {
              showToast(genRes.data?.message || "Failed to create adaptive set", "error");
            }
          } catch (err) {
            showToast("Error while creating adaptive set", "error");
          } finally {
            setIsGeneratingTest(false);
          }
        }
      } else {
        showToast(res.data?.message || "Failed to update", "error");
      }
    } catch (error) {
      showToast("An error occurred while saving", "error");
    } finally {
      setSavingChapterId(null);
    }
  };

  const handleGenerateMockTest = async () => {
    if (selectedMockChapterIds.length <= 1) {
      showToast("Please select more than 1 completed chapter to generate the mock test.", "error");
      return;
    }

    try {
      setIsGeneratingTest(true);

      const currentSubjectId = subjects.find(
        (s) => s.subject_name === activeSubject,
      )?.subject_id;

      const payload = {
        subject_id: currentSubjectId,
        chapters_array: selectedMockChapterIds,
        student_ids: stats?.student_ids || [],
        total_questions: stats?.test_config?.number_of_questions,
        total_marks: stats?.test_config?.total_marks,
        duration: stats?.test_config?.duration_minutes,
      };

      const res = await ApiServices.createSubjectWiseAdaptiveSet(payload);

      if (res.data?.status === "success") {
        showToast(res.data?.message || "Overall Mock test created successfully", "success");
        setIsMockModalOpen(false);
      } else {
        showToast(res.data?.message || "Generation failed", "error");
        setIsMockModalOpen(false);
      }
    } catch (err) {
      showToast("Error while generating mock test", "error");
    } finally {
      setIsGeneratingTest(false);
    }
  };

  useEffect(() => {
    if (stats) {
      if (!selectedClass && stats.class_name)
        setSelectedClass(stats.class_name);
      if (!selectedSection && stats.section_name)
        setSelectedSection(stats.section_name);
    }
  }, [stats]);

  const getInitial = () => {
    return (
      stats?.teacher_name?.charAt(0).toUpperCase() ||
      stats?.student_name?.charAt(0).toUpperCase() ||
      ""
    );
  };

  const isDuplicateDisplayName = (() => {
    if (!uploadForm.displayName.trim()) return false;

    const currentSubjectValidate = subjects.find((s) => s.subject_name === activeSubject);
    const allExistingMaterials: any[] = [...backendMaterials];
    currentSubjectValidate?.chapters.forEach((ch: any) => {
      allExistingMaterials.push(...(ch.testMaterial || []));
      allExistingMaterials.push(...(ch.practiceMaterial || []));
      allExistingMaterials.push(...((ch as any).study_material || []));
      allExistingMaterials.push(...((ch as any).practice_material || []));
      allExistingMaterials.push(...((ch as any).study_materials || []));
      allExistingMaterials.push(...((ch as any).practice_materials || []));
    });

    const newNameClean = uploadForm.displayName.trim().toLowerCase();
    return allExistingMaterials.some((mat: any) => {
      const matchName = String(mat.name || mat.title || mat.display_name || mat.file_name || "").trim().toLowerCase();
      if (!matchName) return false;
      return matchName === newNameClean || matchName.replace(/\.[^/.]+$/, "") === newNameClean.replace(/\.[^/.]+$/, "");
    });
  })();

  return (
    <div className="min-h-screen p-6 relative">
      {isLoading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-xl">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-gray-200 border-t-[#BADA55] rounded-full animate-spin"></div>
            <span className="text-sm text-gray-500 font-medium">
              Loading Syllabus planner...
            </span>
          </div>
        </div>
      )}

      {isGeneratingTest && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-xl">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-gray-200 border-t-[#BADA55] rounded-full animate-spin"></div>
            <span className="text-sm text-gray-500 font-medium">
              Generating your test... This may take a moment.
            </span>
          </div>
        </div>
      )}

      {/* Header Section */}
      <header className="flex flex-wrap justify-between items-end gap-6 pb-6">
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
                Syllabus Planner
              </span>
              <h1 className="text-4xl font-bold text-primary m-0">
                Hi{" "}
                {stats.teacher_name
                  ? stats.teacher_name
                    ?.split(" ")
                    .map(
                      (word: string) =>
                        word.charAt(0).toUpperCase() + word.slice(1),
                    )
                    .join(" ")
                  : ""}{" "}
                !
              </h1>
              <p className="text-sm text-primary font-medium m-0">
                {stats.institute_name}{" "}
                {stats.board_name && `| ${stats.board_name}`}
              </p>
              <div className="flex flex-col gap-2 mt-2">
                <div className="flex gap-2">
                  <div className="m-0">
                    <SearchableSelect
                      options={classOptions.map((c) => ({
                        label: c.name,
                        value: c.name,
                      }))}
                      value={selectedClass}
                      onChange={(val) => setSelectedClass(val as string)}
                      placeholder="Select Class"
                      className="px-2 py-2 w-full appearance-none bg-white border border-gray-200 rounded-lg text-sm text-primary font-medium focus:outline-none focus:ring-2 focus:ring-[#BADA55]/60 shadow-sm"
                    />
                  </div>
                  <div className="m-0 min-w-20">
                    <SearchableSelect
                      options={sectionOptions.map((s) => ({
                        label: s.name,
                        value: s.name,
                      }))}
                      value={selectedSection}
                      onChange={(val) => setSelectedSection(val as string)}
                      placeholder="Select Section"
                      className="px-2 py-2 w-full appearance-none bg-white border border-gray-200 rounded-lg text-sm text-primary font-medium focus:outline-none focus:ring-2 focus:ring-[#BADA55]/60 shadow-sm"
                    />
                  </div>
                  <div className="m-0 min-w-40">
                    <SearchableSelect
                      options={subjects.map((s) => ({
                        label: s.subject_name,
                        value: s.subject_name,
                      }))}
                      value={activeSubject}
                      onChange={(val) => setActiveSubject(val as string)}
                      placeholder="Select Subject"
                      className="px-2 py-2 w-full appearance-none bg-white border border-gray-200 rounded-lg text-sm text-primary font-medium focus:outline-none focus:ring-2 focus:ring-[#BADA55]/60 shadow-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Stats Badges */}
        <div className="flex justify-end items-end gap-20">
          <button
            onClick={() => setIsMockModalOpen(true)}
            disabled={
              demoChapters.filter((ch) => ch.completed && ch.isSaved).length < 2
            }
            className="w-full p-2 bg-button-primary text-primary rounded-lg font-bold hover:bg-opacity-90 transition-colors border-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Generate Overall Mock
          </button>
        </div>
      </header>

      <div className="overflow-x-auto mb-6 border-t-4 border-gray-300 ">
        <table className="w-full border-collapse text-sm">
          <thead className="border-b-2 border-gray-300">
            <tr>
              <th className="text-center py-3 px-2 font-bold text-primary text-lg whitespace-nowrap">
                Sl No.
              </th>
              <th className="text-center py-3 px-2 font-bold text-primary text-lg whitespace-nowrap">
                Chapter Name
              </th>
              <th className="text-right py-3 px-2 font-bold text-primary text-lg whitespace-nowrap">
                Start Date
              </th>
              <th className="text-right py-3 px-2 font-bold text-primary text-lg whitespace-nowrap">
                End Date
              </th>
              <th className="text-center py-3 px-2 font-bold text-primary text-lg whitespace-nowrap">
                Upload Material
              </th>
              <th className="text-center py-3 px-2 font-bold text-primary text-lg whitespace-nowrap">
                Completion Status
              </th>
              <th className="text-center py-3 px-2 font-bold text-primary text-lg whitespace-nowrap">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {demoChapters.map((row, i) => (
              <tr key={i} className="border-b hover:bg-gray-50">
                <td className="py-3 px-2 text-center">{i + 1}</td>

                <td className="py-3 px-2 text-center font-medium">
                  {row.chapter}
                </td>

                <td className="py-3 px-2 text-center">
                  <div className={`flex justify-end items-center gap-2 
                      ${row.completed && row.isSaved === true
                      ? "opacity-50 cursor-not-allowed"
                      : "cursor-pointer"
                    }`}>
                    {row.startDate || "—"}
                    <label
                      className={`relative ${row.completed && row.isSaved === true ? "cursor-not-allowed" : "cursor-pointer"}`}
                    >
                      <input
                        type="date"
                        min={today}
                        disabled={row.completed && row.isSaved === true}
                        className={`absolute inset-0 opacity-0 w-full h-full z-10 ${row.completed && row.isSaved === true ? "cursor-not-allowed" : "cursor-pointer"}`}
                        onChange={(e) =>
                          handleDateChange(row.id, "startDate", e.target.value)
                        }
                      />
                      <Calendar
                        size={16}
                        className={`${row.completed && row.isSaved === true ? "text-gray-400" : "text-primary"} pointer-events-none`}
                      />
                    </label>
                  </div>
                </td>

                <td className="py-3 px-2 text-center">
                  <div className={`flex justify-end items-center gap-2 
  ${row.completed && row.isSaved === true
                      ? "cursor-not-allowed"
                      : "cursor-pointer"
                    }`}>
                    {row.endDate || "—"}
                    <label
                      className={`relative ${row.completed && row.isSaved === true ? "cursor-not-allowed" : "cursor-pointer"}`}
                    >
                      <input
                        type="date"
                        min={today}
                        disabled={row.completed && row.isSaved === true}
                        className={`absolute inset-0 opacity-0 w-full h-full z-10 ${row.completed && row.isSaved === true ? "cursor-not-allowed" : "cursor-pointer"}`}
                        onChange={(e) =>
                          handleDateChange(row.id, "endDate", e.target.value)
                        }
                      />
                      <Calendar
                        size={16}
                        className={`${row.completed && row.isSaved === true ? "text-gray-400" : "text-primary"} pointer-events-none`}
                      />
                    </label>
                  </div>
                </td>
                {/* 
                <td className="py-3 px-2 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <button
                      onClick={() =>
                        setUploadForm({
                          ...uploadForm,
                          isOpen: true,
                          chapterId: row.id,
                          displayName: "",
                          description: "",
                        })
                      }
                      className="cursor-pointer flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 bg-blue-50 px-2 py-1 rounded-md transition-colors border-none"
                    >
                      <Upload size={12} />
                      <span>Upload</span>
                    </button>

                    {row.testMaterial.length > 0 && (
                      <div className="flex flex-col mt-1 gap-1">
                        <span className="text-[9px] font-bold text-gray-400 uppercase">
                          Study
                        </span>
                        {row.testMaterial.map((mat, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-1 text-[10px] text-gray-500 max-w-[120px]"
                            title={mat.name}
                          >
                            {mat.type === "pdf" && <FileText size={10} />}
                            {mat.type === "excel" && (
                              <FileSpreadsheet
                                size={10}
                                className="text-green-600"
                              />
                            )}
                            {mat.type === "link" && <Link size={10} />}
                            <span className="truncate">{mat.name}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {row.practiceMaterial.length > 0 && (
                      <div className="flex flex-col mt-2 gap-1 border-t border-gray-100 pt-1">
                        <span className="text-[9px] font-bold text-gray-400 uppercase">
                          Practice
                        </span>
                        {row.practiceMaterial.map((mat, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-1 text-[10px] text-gray-500 max-w-[120px]"
                            title={mat.name}
                          >
                            {mat.type === "pdf" && <FileText size={10} />}
                            {mat.type === "excel" && (
                              <FileSpreadsheet
                                size={10}
                                className="text-green-600"
                              />
                            )}
                            {mat.type === "link" && <Link size={10} />}
                            <span className="truncate">{mat.name}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </td> */}
                <td className="py-3 px-2 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <button
                      onClick={() =>
                        setUploadForm({
                          ...uploadForm,
                          isOpen: true,
                          chapterId: row.id,
                          displayName: "",
                          description: "",
                        })
                      }
                      className="cursor-pointer flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 bg-blue-50 px-2 py-1 rounded-md transition-colors border-none"
                    >
                      <Upload size={12} />
                      <span>Upload</span>
                    </button>

                    {row.testMaterial.length > 0 && (
                      <div
                        className="flex gap-2 cursor-pointer"
                        title={row.testMaterial
                          .map((m: any) => m.name)
                          .join(",\n")}
                      >
                        <span className="text-[9px] font-bold text-primary">
                          Study
                        </span>
                        <span className="text-xs text-blue-700 font-medium underline decoration-dotted">
                          {row.testMaterial.length}{" "}
                          {row.testMaterial.length === 1 ? "file" : "files"}
                        </span>
                      </div>
                    )}
                    {row.practiceMaterial.length > 0 && (
                      <div
                        className="flex gap-2 cursor-pointer"
                        title={row.practiceMaterial
                          .map((m: any) => m.name)
                          .join(",\n")}
                      >
                        <span className="text-[9px] font-bold text-primary">
                          Practice
                        </span>
                        <span className="text-xs text-green-700 font-medium underline decoration-dotted">
                          {row.practiceMaterial.length}{" "}
                          {row.practiceMaterial.length === 1 ? "file" : "files"}
                        </span>
                      </div>
                    )}
                  </div>
                </td>

                <td className="py-3 px-2 text-center">
                  <input
                    type="checkbox"
                    checked={row.completed}
                    onChange={() => {
                      if (row.startDate_raw && row.endDate_raw)
                        toggleDemoChapter(row.id);
                    }}
                    disabled={
                      !row.startDate_raw ||
                      !row.endDate_raw ||
                      (row.completed && row.isSaved === true)
                    }
                    className="w-4 h-4 accent-secondary disabled:accent-[#AAA] cursor-pointer disabled:cursor-not-allowed opacity-100"

                  />
                </td>

                <td className="py-3 px-2 text-center">
                  <button
                    onClick={() => handleSave(row)}
                    disabled={
                      !row.startDate_raw ||
                      !row.endDate_raw ||
                      savingChapterId !== null ||
                      (row.completed && row.isSaved === true)
                    }
                    className="p-2 inline-flex items-center px-2 py-0.5 rounded-full text-sm font-medium text-secondary hover:text-blue-600 transition-colors border-none bg-transparent disabled:text-[#AAA] cursor-pointer disabled:cursor-not-allowed"
                  >
                    {savingChapterId === row.id ? (
                      <Loader2
                        size={20}
                        className="animate-spin text-blue-500"
                      />
                    ) : (
                      <Save size={20} strokeWidth={2} />
                    )}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isChatOpen && <Chat onClose={() => setIsChatOpen(false)} />}

      {/* ─── UNIFIED UPLOAD MODAL ────────────────────────────────────── */}
      {uploadForm.isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative animate-in fade-in zoom-in duration-200">
            <button
              onClick={() =>
                setUploadForm({
                  ...uploadForm,
                  isOpen: false,
                  file: null,
                  linkUrl: "",
                  displayName: "",
                  description: "",
                })
              }
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 bg-transparent hover:bg-gray-100 rounded-full transition-all z-10 border-none cursor-pointer"
            >
              <X size={20} />
            </button>

            <h3 className="text-xl font-bold text-primary mb-6 text-center">
              Upload Material
            </h3>

            <div className="space-y-4">
              {/* Material Category */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
                  Category
                </label>
                <div className="flex gap-3">
                  <button
                    onClick={() =>
                      setUploadForm({ ...uploadForm, category: "testMaterial" })
                    }
                    className={`flex-1 py-2.5 rounded-lg border text-sm font-semibold transition-all border-none cursor-pointer ${uploadForm.category === "testMaterial"
                      ? "bg-blue-50 border-blue-500 text-blue-700 ring-2 ring-blue-500/20"
                      : "border-gray-200 text-gray-500 hover:bg-gray-50 bg-white"
                      }`}
                  >
                    Study Material
                  </button>
                  <button
                    onClick={() =>
                      setUploadForm({
                        ...uploadForm,
                        category: "practiceMaterial",
                      })
                    }
                    className={`flex-1 py-2.5 rounded-lg border text-sm font-semibold transition-all border-none cursor-pointer ${uploadForm.category === "practiceMaterial"
                      ? "bg-green-50 border-green-500 text-green-700 ring-2 ring-green-500/20"
                      : "border-gray-200 text-gray-500 hover:bg-gray-50 bg-white"
                      }`}
                  >
                    Practice Material
                  </button>
                </div>
              </div>

              {/* Source Type */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
                  Source Type
                </label>
                <div className="flex gap-3">
                  <button
                    onClick={() =>
                      setUploadForm({ ...uploadForm, sourceType: "file" })
                    }
                    className={`flex-1 py-2.5 rounded-lg border text-sm font-semibold transition-all border-none cursor-pointer flex items-center justify-center gap-2 ${uploadForm.sourceType === "file"
                      ? "bg-[#F7FAE9] border-[#BADA55] text-gray-800 ring-2 ring-[#BADA55]/40"
                      : "border-gray-200 text-gray-500 hover:bg-gray-50 bg-white"
                      }`}
                  >
                    <FileText size={16} /> Local File
                  </button>
                  <button
                    onClick={() =>
                      setUploadForm({ ...uploadForm, sourceType: "link" })
                    }
                    className={`flex-1 py-2.5 rounded-lg border text-sm font-semibold transition-all border-none cursor-pointer flex items-center justify-center gap-2 ${uploadForm.sourceType === "link"
                      ? "bg-[#F7FAE9] border-[#BADA55] text-gray-800 ring-2 ring-[#BADA55]/40"
                      : "border-gray-200 text-gray-500 hover:bg-gray-50 bg-white"
                      }`}
                  >
                    <Link size={16} /> External Link
                  </button>
                </div>
              </div>

              {/* Display Name (Mandatory) */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                  Display Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={uploadForm.displayName}
                  onChange={(e) =>
                    setUploadForm({
                      ...uploadForm,
                      displayName: e.target.value,
                    })
                  }
                  placeholder="Enter a name for this material..."
                  className={`w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 transition-all bg-white text-sm ${isDuplicateDisplayName
                    ? "border-red-500 focus:ring-red-500/60"
                    : "border-gray-200 focus:ring-[#BADA55]/60"
                    }`}
                />
                {isDuplicateDisplayName && (
                  <p className="text-red-500 text-xs mt-1">This display name already exists.</p>
                )}
              </div>

              {/* Description (Mandatory) */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={uploadForm.description}
                  onChange={(e) =>
                    setUploadForm({
                      ...uploadForm,
                      description: e.target.value,
                    })
                  }
                  placeholder="Add a brief description..."
                  rows={2}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#BADA55]/60 transition-all bg-white text-sm resize-none"
                />
              </div>

              {/* File or Link Input */}
              {uploadForm.sourceType === "file" ? (
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                    Select File
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.xls,.xlsx"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      setUploadForm({
                        ...uploadForm,
                        file: file,
                        displayName:
                          file && !uploadForm.displayName
                            ? file.name
                            : uploadForm.displayName,
                      });
                    }}
                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#BADA55]/20 file:text-[#6a8412] hover:file:bg-[#BADA55]/30 cursor-pointer"
                  />
                  <p className="text-[10px] text-gray-400 mt-1.5">
                    Accepted formats: PDF, Excel (.xls, .xlsx)
                  </p>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                    URL / Link
                  </label>
                  <input
                    type="url"
                    value={uploadForm.linkUrl}
                    onChange={(e) =>
                      setUploadForm({ ...uploadForm, linkUrl: e.target.value })
                    }
                    placeholder="https://..."
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#BADA55]/60 transition-all bg-white text-sm"
                  />
                </div>
              )}

              {/* Submit Button */}
              <button
                onClick={handleUploadSubmit}
                disabled={isLoading}
                className="w-full py-3.5 mt-2 bg-[#BADA55] text-gray-900 rounded-lg font-bold hover:bg-lime-400 flex items-center justify-center gap-2 transition-colors border-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-70 shadow-sm"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>Uploading...</span>
                  </>
                ) : (
                  "Confirm Upload"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Overall Mock Selection Modal */}
      {isMockModalOpen && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-6 relative animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setIsMockModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 bg-transparent hover:bg-gray-100 rounded-full transition-all z-10 border-none cursor-pointer"
            >
              <X size={20} />
            </button>

            <h2 className="text-2xl font-bold text-primary mb-6">
              Generate Overall Mock
            </h2>

            <div className="max-h-60 overflow-y-auto custom-scrollbar border border-gray-200 rounded-lg mb-6">
              <table className="w-full border-collapse">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="py-3 px-4 text-left font-bold text-gray-600 border-b w-20">
                      Select
                    </th>
                    <th className="py-3 px-4 text-left font-bold text-gray-600 border-b">
                      Chapter Name
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {demoChapters.map((ch) => (
                    <tr
                      key={ch.id}
                      className="border-b hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <input
                          type="checkbox"
                          checked={selectedMockChapterIds.includes(ch.id)}
                          disabled={!ch.completed || !ch.isSaved}
                          onChange={() => {
                            setSelectedMockChapterIds((prev) =>
                              prev.includes(ch.id)
                                ? prev.filter((id) => id !== ch.id)
                                : [...prev, ch.id],
                            );
                          }}
                          className={`w-4 h-4 accent-[#BADA55] ${!ch.completed || !ch.isSaved ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
                        />
                      </td>
                      <td
                        className={`py-3 px-4 text-sm font-medium ${!ch.completed || !ch.isSaved ? "text-gray-400 italic" : "text-gray-700"}`}
                      >
                        {ch.chapter}{" "}
                        {!ch.completed
                          ? "(Incomplete)"
                          : !ch.isSaved
                            ? "(Not Saved)"
                            : ""}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsMockModalOpen(false)}
                disabled={isGeneratingTest}
                className="px-6 py-2 rounded-lg font-bold text-gray-500 hover:bg-gray-100 transition-colors border-none cursor-pointer bg-transparent disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleGenerateMockTest}
                disabled={isGeneratingTest}
                className="px-8 py-3 bg-[#BADA55] text-gray-900 rounded-lg font-bold hover:bg-opacity-90 transition-all shadow-md hover:shadow-lg border-none cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isGeneratingTest ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  "Submit"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherLearningPlanner;
