import React, { useEffect, useMemo, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
// import IconChat from "../../../assets/icon/chat2.svg";
import ApiServices from "../../../services/ApiServices";
import Chat from "../../auth/modal/chat";
import TestModalUpdated from "../components/TestModalUpdated";
import { useToast } from "../../../app/providers/ToastProvider";
import { useNotification } from "../../../app/providers/NotificationProvider";
import { CheckCircle } from "lucide-react";

// ─── Interfaces ─────────────────────────────────────────────────────────────

// ─── Interfaces ─────────────────────────────────────────────────────────────

interface ApiTask {
  status: string;
  type: string;
  assignment_id?: number | null;
  assignment_count?: number;
  assignment_end_date?: string | null;
}

interface ApiPlanner {
  end_date: string | null;
  is_completed: boolean | null;
  start_date: string | null;
}

interface ApiChapter {
  chapter_id: number;
  chapter_name: string;
  planner: ApiPlanner;
  tasks: ApiTask[];
  // Compatibility fields for the UI
  status?: string;
  progress_percentage?: number;
}

interface Task {
  type: "tutorial" | "mock_test";
  progress: number;
  status?: string;
  assignment_id?: number | null;
  assignment_end_date?: string | null;
  assignment_count?: number;
}

interface ChapterDay {
  chapter_id: number;
  chapter_name: string;
  topics?: { topic_id: number; topic_name: string }[];
  tasks: Task[];
  is_overdue?: boolean;
  is_orange?: boolean;
  end_date_raw?: string | null;
  original_index?: number;
}

interface WeeklyPlanDay {
  date: string;
  day: string;
  progress: number;
  status?: string;
  chapters: ChapterDay[];
}

interface AcademicDetails {
  academic_year: string;
  board: string;
  class: string;
  institute: string;
  sections?: string[];
}

interface StudentDetails {
  id: number;
  name: string;
}

interface ApiSubjectPlan {
  subject_id: number;
  subject_name: string;
  chapters: ApiChapter[];
  weekly_plan?: WeeklyPlanDay[];
}

interface MultiChapterTest {
  assignment_id: number;
  attempt_id: number | null;
  chapters: { chapter_id: number; chapter_name: string }[];
  due_date: string;
  duration_minutes: number;
  marks_obtained: number | null;
  score: number | null;
  set_id: number;
  set_name: string;
  status: string;
  subject_id: number;
  subject_name: string;
  assigned_by_name?: string;
  total_marks: number;
  total_questions: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const getTodayDate = () => new Date().toISOString().split("T")[0];

const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short" });

const formatFullDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString("en-IN", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

const progressBarColor = (p: number) =>
  p >= 100 ? "bg-green-500" : p > 50 ? "bg-[#BADA55]" : p > 20 ? "bg-amber-400" : "bg-red-400";

const statusPill = (status?: string) => {
  switch (status?.toLowerCase()) {
    case "completed":
    case "available":
      return "bg-green-100 text-green-700 border-green-200";
    case "in_progress": return "bg-amber-100 text-amber-700 border-amber-200";
    default: return "bg-red-100 text-red-500 border-red-200";
  }
};

// ─── Generate weekly plan from chapters ──────────────────────────────────────

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const generateWeeklyPlan = (subject: ApiSubjectPlan): WeeklyPlanDay[] => {
  const today = new Date();
  const dow = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((dow === 0 ? 7 : dow) - 1));

  const weekDates: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    weekDates.push(d.toISOString().split("T")[0]);
  }

  const chapters = subject.chapters ?? [];

  return weekDates.map((dateStr, dIdx) => {
    const current = new Date(dateStr);
    current.setHours(0, 0, 0, 0);
    const todayLocal = new Date();
    todayLocal.setHours(0, 0, 0, 0);
    const isThisDayToday = current.getTime() === todayLocal.getTime();

    const normalDayChapters: ChapterDay[] = [];
    const overdueDayChapters: ChapterDay[] = [];

    chapters.forEach((ch, ci) => {
      let fallsOnDate = false;
      const chEnd = ch.planner.end_date ? new Date(ch.planner.end_date) : null;
      if (chEnd) chEnd.setHours(0, 0, 0, 0);

      if (!ch.planner.start_date || !ch.planner.end_date) {
        fallsOnDate = ci % 7 === dIdx;
      } else {
        const start = new Date(ch.planner.start_date);
        start.setHours(0, 0, 0, 0);
        fallsOnDate = current >= start && current <= chEnd!;
      }

      // Check if it's completely done (all tasks OR at least one mock test)
      const hasCompletedMockTest = ch.tasks.some(t => t.type.toLowerCase().includes("mock") && t.status === "completed");
      const isCompleted = ch.tasks.length > 0 && (ch.tasks.every((t) => t.status === "completed") || hasCompletedMockTest);

      if (current > todayLocal && isCompleted) {
        fallsOnDate = false;
      }

      // Find absolute max assignment deadline
      let maxAssignEnd: Date | null = null;
      for (const t of ch.tasks) {
        if (t.assignment_end_date) {
          const assignEnd = new Date(t.assignment_end_date);
          assignEnd.setHours(0, 0, 0, 0);
          if (!maxAssignEnd || assignEnd > maxAssignEnd) {
            maxAssignEnd = assignEnd;
          }
        }
      }

      // Unified carry-forward logic
      let isCarriedForward = false;
      if (!isCompleted && chEnd && current > chEnd) {
        if (current.getTime() === todayLocal.getTime()) {
          // Always carry incomplete past-scheduled chapters onto today
          isCarriedForward = true;
        }
        // Removed future carry-forward logic so tasks only appear on future dates when they actually become 'Today'
      }

      const tasksToAdd: Task[] = [];
      const addedTaskIds = new Set<string>();

      ch.tasks.forEach((t) => {
        const isMock = t.type.toLowerCase().includes("mock");
        const mappedType = isMock ? "mock_test" : "tutorial";
        const taskIdKey = `${mappedType}-${t.assignment_id || "none"}`;

        const mappedTask: Task = {
          type: mappedType,
          progress: t.status === "completed" ? 100 : 0,
          status: t.status,
          assignment_id: t.assignment_id,
          assignment_end_date: t.assignment_end_date,
          assignment_count: t.assignment_count,
        };

        // If it naturally falls here or is carried forward, add it!
        let addThisTask = false;
        if (fallsOnDate || isCarriedForward) {
          addThisTask = true;
        }

        if (addThisTask && !addedTaskIds.has(taskIdKey)) {
          tasksToAdd.push(mappedTask);
          addedTaskIds.add(taskIdKey);
        }
      });

      if (tasksToAdd.length > 0) {
        // Sorting of Tasks: 1. Completed, 2. Assigned/Active, 3. Pending
        tasksToAdd.sort((a, b) => {
          const getOrder = (status?: string) => {
            const s = status?.toLowerCase();
            if (s === "completed") return 1;
            if (s === "pending" || !s) return 3;
            return 2;
          };

          const orderDiff = getOrder(a.status) - getOrder(b.status);
          if (orderDiff !== 0) return orderDiff;

          if (a.type === "tutorial" && b.type === "mock_test") return -1;
          if (a.type === "mock_test" && b.type === "tutorial") return 1;

          return 0;
        });

        // Compute needsAlert: A chapter is overdue if its scheduled end date is before today.
        // The original logic `current < todayLocal` was confusing, as it would mark a chapter
        // as overdue just for being on a past day, even if its own deadline hadn't been reached yet.
        const isPastScheduledEndDate = chEnd !== null && chEnd < todayLocal;
        const needsAlert = !isCompleted && isPastScheduledEndDate;

        let isOrange = false;
        let isRed = false;

        if (needsAlert) {
          if (maxAssignEnd && todayLocal <= maxAssignEnd) {
            isOrange = true;
          } else {
            isRed = true;
          }
        }

        const chapterRecord: ChapterDay = {
          chapter_id: ch.chapter_id,
          chapter_name: ch.chapter_name,
          tasks: tasksToAdd,
          is_overdue: isRed,
          is_orange: isOrange,
          end_date_raw: ch.planner.end_date,
          original_index: ci
        };

        if ((isRed || isOrange) && !fallsOnDate) {
          overdueDayChapters.push(chapterRecord);
        } else {
          normalDayChapters.push(chapterRecord);
        }
      }
    });

    let dayChapters = [...normalDayChapters, ...overdueDayChapters];

    // Sort logic ONLY for today's view (Latest end date top, response order desc fallback)
    if (isThisDayToday) {
      dayChapters.sort((a, b) => {
        const tA = a.end_date_raw ? new Date(a.end_date_raw).getTime() : 0;
        const tB = b.end_date_raw ? new Date(b.end_date_raw).getTime() : 0;
        if (tB !== tA) return tB - tA;
        return (a.original_index ?? 0) - (b.original_index ?? 0);
      });
    }

    // const avgProgress =
    //   dayChapters.length > 0
    //     ? Math.round(
    //       dayChapters.reduce(
    //         (sum, ch) => sum + ch.tasks.reduce((s, t) => s + t.progress, 0) / (ch.tasks.length || 1),
    //         0,
    //       ) / dayChapters.length,
    //     )
    //     : 0;

    // return {
    //   date: dateStr,
    //   day: DAY_NAMES[new Date(dateStr).getDay()],
    //   progress: avgProgress,
    //   status: avgProgress >= 100 ? "completed" : avgProgress > 0 ? "in_progress" : "pending",
    //   chapters: dayChapters,
    // };
    const allDayTasks = dayChapters.flatMap((ch) => ch.tasks);

    // Filter for mock tests that have an assignment_id, as these are "assigned".
    const assignedMockTests = allDayTasks.filter(
      (t) => t.type === "mock_test" && t.assignment_id,
    );
    const totalAssignedMockTests = assignedMockTests.length;
    const completedMockTests = assignedMockTests.filter(
      (t) => t.status === "completed",
    ).length;

    const avgProgress =
      totalAssignedMockTests > 0
        ? Math.round((completedMockTests / totalAssignedMockTests) * 100)
        : 0;

    return {
      date: dateStr,
      day: DAY_NAMES[new Date(dateStr).getDay()],
      progress: avgProgress,
      status: avgProgress >= 100 ? "completed" : avgProgress > 0 ? "in_progress" : "pending",
      chapters: dayChapters,
    };
  });
};

const getPrevWeekStatus = (
  weeklyPlan: WeeklyPlanDay[],
  today: string,
): "green" | "red" | "none" => {
  const past = weeklyPlan.filter((d) => d.date < today && d.chapters.length > 0);
  if (past.length === 0) return "none";
  return past.every((d) => d.progress >= 100) ? "green" : "red";
};

const patchSubjectPlan = (sub: ApiSubjectPlan): ApiSubjectPlan => {
  // Ensure chapters is an array before mapping to prevent errors if it's null
  const patchedChapters = (sub.chapters || []).map(ch => {
    const totalTasks = ch.tasks.length;
    const completedTasks = ch.tasks.filter(t => t.status === "completed").length;
    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return {
      ...ch,
      progress_percentage: progress,
      status: progress >= 100 ? "completed" : progress > 0 ? "in_progress" : "pending"
    };
  });

  const updatedSub = { ...sub, chapters: patchedChapters };
  return {
    ...updatedSub,
    weekly_plan:
      sub.weekly_plan && sub.weekly_plan.length > 0 ? sub.weekly_plan : generateWeeklyPlan(updatedSub),
  };
};

const DayCard: React.FC<{
  day: WeeklyPlanDay;
  isSelected: boolean;
  isToday: boolean;
  isPast: boolean;
  onClick: () => void;
}> = ({ day, isSelected, isToday, isPast, onClick }) => {
  const allDone = isPast && day.progress >= 100;
  const hasPending = isPast && day.progress < 100;

  return (
    <div
      onClick={onClick}
      className={`
        relative flex-1 max-w-20 cursor-pointer rounded-2xl py-3 px-2 border-2
        flex flex-col items-center gap-1
        transition-all duration-200 select-none
        ${isSelected
          ? hasPending
            ? "bg-red-50 border-red-300 shadow-lg shadow-red-500/20 scale-[1.04]"
            : allDone
              ? "bg-green-50 border-green-300 shadow-lg shadow-green-500/20 scale-[1.04]"
              : "bg-gradient-to-b from-[#BADA55]/30 to-[#BADA55]/10 border-[#BADA55] shadow-lg shadow-[#BADA55]/20 scale-[1.04]"
          : isToday
            ? "bg-gradient-to-b from-white to-gray-50 border-primary shadow-md"
            : allDone
              ? "bg-green-50 border-green-200"
              : hasPending
                ? "bg-red-50 border-red-200"
                : "bg-white border-gray-100 hover:border-[#BADA55]/50 hover:shadow-sm"
        }
      `}
    >
      {isToday && (
        <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[8px] font-black uppercase tracking-wider bg-primary text-white px-2 py-0.5 rounded-full whitespace-nowrap shadow">
          Today
        </span>
      )}
      <p className={`text-[9px] font-black uppercase tracking-widest mt-1 ${isSelected
          ? hasPending
            ? "text-red-500"
            : allDone
              ? "text-green-600"
              : "text-[#6a9000]"
          : isToday
            ? "text-primary"
            : "text-gray-400"
        }`}>
        {day.day}
      </p>
      <p className={`text-sm font-extrabold leading-none ${isSelected
          ? hasPending
            ? "text-red-600"
            : allDone
              ? "text-green-700"
              : "text-primary"
          : isToday
            ? "text-primary"
            : "text-gray-700"
        }`}>
        {formatDate(day.date)}
      </p>
      {/* Status dot */}
      <span className={`w-2 h-2 rounded-full mt-1 ${isSelected
        ? hasPending
          ? "bg-red-500"
          : allDone
            ? "bg-green-500"
            : "bg-[#BADA55]"
        : allDone
          ? "bg-green-500"
          : hasPending
            ? "bg-red-400"
            : isToday
              ? "bg-primary"
              : "bg-gray-200"
        }`} />
    </div>
  );
};

// ─── Task Row ─────────────────────────────────────────────────────────────────

const TaskRow: React.FC<{ task: Task; onClick?: () => void }> = ({
  task,
  onClick,
}) => (
  <div
    className="flex items-center gap-2 cursor-default"
  >
    <span
      className={`w-6 h-6 rounded-lg flex items-center justify-center text-white transition-transform ${task.type === "mock_test"
        ? "bg-primary group-hover/task:scale-110"
        : "bg-[#BADA55]"
        }`}
    >
      <span className="material-symbols-outlined" style={{ fontSize: 13 }}>
        {task.type === "mock_test" ? "quiz" : "play_circle"}
      </span>
    </span>

    <span
      className="text-xs font-semibold text-gray-700 cursor-default"
    >
      {task.type === "mock_test" ? "Mock Test" : "Tutorial"}
    </span>

    {task.status && (
      <span
        className={`text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full border ${statusPill(
          task.status,
        )}`}
      >
        {task.status.replace("_", " ")}{task.type === "mock_test" && task.assignment_count ? ` - ${task.assignment_count}` : ""}
      </span>
    )}

    {/* ✅ NEW BUTTON */}
    {task.type === "mock_test" && (() => {
      let btnText = "Take Test";
      let btnClasses = "bg-[#BADA55] text-[#2b3a00] hover:bg-[#a8c94a] hover:shadow-sm";
      let isDisabled = !(task.status === "assigned" || task.status === "completed");

      if (task.status === "completed") {
        btnText = "Attempted";
        btnClasses = "bg-gray-200 text-gray-500 cursor-not-allowed";
        isDisabled = true;
      } else if (task.assignment_end_date) {
        const todayD = new Date();
        todayD.setHours(0, 0, 0, 0);
        const endD = new Date(task.assignment_end_date);
        endD.setHours(0, 0, 0, 0);
        const diffDays = Math.floor((todayD.getTime() - endD.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays > 0) {
          btnText = "Expired";
          btnClasses = "bg-red-500 text-white cursor-not-allowed";
          isDisabled = true;
        } else if (diffDays >= -5 && diffDays <= 0) {
          btnText = "Take Test";
          btnClasses = "bg-orange-400 text-white hover:bg-orange-500 hover:shadow-sm";
          isDisabled = false;
        } else {
          btnText = "Take Test";
          btnClasses = "bg-[#BADA55] text-[#2b3a00] hover:bg-[#a8c94a] hover:shadow-sm";
          isDisabled = false;
        }
      } else {
        if (isDisabled) {
          btnClasses = "bg-gray-200 text-gray-400 cursor-not-allowed";
        }
      }

      return (
        <button
          onClick={(e) => {
            e.stopPropagation(); // prevent row click conflict
            onClick?.();
          }}
          disabled={isDisabled}
          className={`ml-auto text-[10px] px-2 py-1 font-semibold rounded-md transition-all duration-200 flex-shrink-0 ${btnClasses}`}
        >
          {btnText}
        </button>
      );
    })()}
  </div>
);

// ─── Chapter Accordion ────────────────────────────────────────────────────────

const ChapterAccordion: React.FC<{
  chapter: ChapterDay;
  index: number;
  onMockTestClick?: (chapterId: number, chapterName: string, assignmentId: number | null | undefined) => void;
}> = ({ chapter, index, onMockTestClick }) => {
  const [open, setOpen] = useState(false);
  const allDone = chapter.tasks.some(t => t.type === 'mock_test' && t.status === 'completed') || (chapter.tasks.length > 0 && chapter.tasks.every((t) => t.progress >= 100));

  return (
    <div className={`rounded-2xl overflow-hidden border-[3px] transition-all duration-200 shadow-sm hover:shadow-md ${allDone ? "border-green-500 bg-green-50/60" : chapter.is_overdue ? "border-red-500 bg-red-50" : chapter.is_orange ? "border-orange-400 bg-orange-50/50" : "border-gray-100 bg-white"}`}>
      <button
        onClick={() => setOpen((p) => !p)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50/80 transition-colors"
      >
        <span className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold ${allDone ? "bg-green-500 text-white" : chapter.is_overdue ? "bg-red-100 text-red-500" : chapter.is_orange ? "bg-orange-100 text-orange-500" : "bg-[#BADA55]/20 text-[#6a9000]"}`}>
          {index + 1}
        </span>
        <span className={`flex-1 font-semibold text-sm flex items-center gap-2 ${chapter.is_overdue ? "text-red-500" : chapter.is_orange ? "text-orange-500" : "text-primary"}`}>
          <span>
            {chapter.chapter_name}{" "}
            {chapter.is_overdue && <span className="text-[10px] text-red-500 font-bold ml-1 uppercase">(Expired)</span>}
            {chapter.is_orange && <span className="text-[10px] text-orange-500 font-bold ml-1 uppercase">(Pending)</span>}
          </span>
        </span>
        <span className={`material-symbols-outlined text-lg text-gray-400 transition-transform duration-300 ${open ? "rotate-180" : "rotate-0"}`}>
          expand_more
        </span>
      </button>

      <div className={`transition-all duration-300 ease-in-out overflow-hidden ${open ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"}`}>
        <div className="px-4 pb-4 pt-2 space-y-4 border-t border-gray-100">
          {chapter.tasks && chapter.tasks.length > 0 && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">Tasks</p>
              <div className="space-y-3">
                {chapter.tasks.map((task, idx) => (
                  <TaskRow
                    key={idx}
                    task={task}
                    onClick={() =>
                      onMockTestClick?.(chapter.chapter_id, chapter.chapter_name, task.assignment_id)
                    }
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Subject Section (self-contained: calendar + details) ─────────────────────

const SubjectSection: React.FC<{
  subject: ApiSubjectPlan;
  accentColor: string;
  defaultExpanded: boolean;
  onMockTestClick?: (
    subjectId: number,
    subjectName: string,
    chapterId: number,
    chapterName: string,
    assignmentId: number | null | undefined,
  ) => void;
  multiChapterTests: MultiChapterTest[];
}> = ({ subject, accentColor, defaultExpanded, onMockTestClick, multiChapterTests }) => {
  const navigate = useNavigate();
  const today = getTodayDate();
  const weeklyPlan = subject.weekly_plan ?? [];
  const prevWeekStatus = getPrevWeekStatus(weeklyPlan, today);

  const todayEntry = weeklyPlan.find((d) => d.date === today);
  const defaultDay = todayEntry ?? weeklyPlan[0] ?? null;

  const [selectedDate, setSelectedDate] = useState<string>(defaultDay?.date ?? "");
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const selectedDayData = useMemo(() => {
    return weeklyPlan.find((d) => d.date === selectedDate) || defaultDay;
  }, [weeklyPlan, selectedDate, defaultDay]);

  const handleDayClick = (day: WeeklyPlanDay) => {
    setSelectedDate(day.date);
  };

  // ── Derived: Overall Mock Test progress
  const { overallMockTestProgress, mockTestStatus } = useMemo(() => {
    const subjectTests = multiChapterTests.filter(t => t.subject_id === subject.subject_id);
    
    if (subjectTests.length > 0) {
      const completed = subjectTests.filter(t => t.status?.toLowerCase() === "completed").length;
      const progress = Math.round((completed / subjectTests.length) * 100);
      return {
        overallMockTestProgress: progress,
        mockTestStatus: progress >= 100 ? "Completed" : "Pending"
      };
    }

    // Fallback if no multi-chapter tests exist
    return {
      overallMockTestProgress: 0,
      mockTestStatus: "Pending"
    };
  }, [multiChapterTests, subject.subject_id]);

  return (
    <div className="flex flex-col gap-3">
      {/* ── Subject Header Card ─────────────────────────────────────── */}
      <div
        className="bg-white rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between px-5 py-3 cursor-pointer select-none"
        style={{ borderLeft: `5px solid ${accentColor}` }}
        onClick={() => setIsExpanded((prev) => !prev)}
      >
        {/* LEFT: icon + name + subtitle */}
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-black text-base shadow-sm flex-shrink-0"
            style={{ background: accentColor }}
          >
            {subject.subject_name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="text-base font-extrabold text-primary leading-tight">{subject.subject_name}</h3>
            <p className="text-[11px] text-gray-400 font-medium mt-0.5">
              {subject.chapters?.length ?? 0} chapters &middot; {weeklyPlan.length} days planned
            </p>
          </div>
        </div>

        {/* MIDDLE: Prev Week badge (with left margin gap) */}
        {prevWeekStatus !== "none" && (
          <span className={`inline-flex items-center gap-1 ml-6 px-3 py-1.5 rounded-full text-[11px] font-bold border flex-shrink-0
            ${prevWeekStatus === "green"
              ? "bg-green-50 border-green-200 text-green-700"
              : "bg-red-50 border-red-200 text-red-600"}`}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 13 }}>
              {prevWeekStatus === "green" ? "verified" : "warning"}
            </span>
            {prevWeekStatus === "green" ? "Prev Week: All done ✓" : "Prev Week: Pending ⚠️"}
          </span>
        )}

        {/* RIGHT: Overall Mock Test + chevron */}
        <div className="flex items-center gap-3 flex-shrink-0 ml-auto">
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-xl px-3 py-1.5">
            <span className="material-symbols-outlined text-primary" style={{ fontSize: 16 }}>quiz</span>

            <div className="leading-tight">
              <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400">
                Overall Mock Test
              </p>

              <div className="flex items-center gap-1.5">
                <span className="text-sm font-extrabold text-primary">
                  {overallMockTestProgress}%
                </span>

                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border
        ${overallMockTestProgress >= 100
                    ? "bg-green-50 border-green-200 text-green-700"
                    : "bg-amber-50 border-amber-200 text-amber-700"}`}
                >
                  {mockTestStatus}
                </span>
              </div>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate("/overall-tests");
              }}
              disabled={!multiChapterTests.some(t => t.subject_id === subject.subject_id)}
              className={`ml-auto text-[10px] px-2 py-1 font-semibold rounded-md transition-all ${
                multiChapterTests.some(t => t.subject_id === subject.subject_id)
                  ? "bg-[#BADA55] text-[#2b3a00] hover:bg-lime-400 cursor-pointer shadow-sm"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              Take Overall Test
            </button>
          </div>
          <span className={`material-symbols-outlined text-gray-400 transition-transform duration-300 ${isExpanded ? "rotate-180" : "rotate-0"}`}>
            expand_more
          </span>
        </div>
      </div>

      {/* ── Collapsible body ─────────────────────────────────────────── */}
      <div className={`transition-all duration-300 overflow-hidden ${isExpanded ? "max-h-[2000px]" : "max-h-0"}`}>
        <div className="flex flex-col lg:flex-row gap-4">

          {/* LEFT — Weekly Calendar (independent card) */}
          <div className="w-full lg:w-[58%] bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Weekly Plan</p>
              {weeklyPlan.length > 0 && (
                <span className="text-[10px] text-gray-400 bg-gray-50 border border-gray-100 px-2.5 py-0.5 rounded-full font-semibold">
                  {formatDate(weeklyPlan[0].date)} – {formatDate(weeklyPlan[weeklyPlan.length - 1].date)}
                </span>
              )}
            </div>

            {weeklyPlan.length > 0 ? (
              <div className="flex items-stretch gap-2 overflow-x-auto pb-1 pt-4">
                {/* Prev-week card */}
                <div
                  className={`flex-shrink-0 rounded-2xl px-3 py-2 border-2 flex flex-col items-center justify-center gap-1
                  ${prevWeekStatus === "green"
                      ? "bg-green-50 border-green-200"
                      : prevWeekStatus === "red"
                        ? "bg-red-50 border-red-200"
                        : "bg-gray-50 border-gray-200"
                    }`}
                >
                  <span className={`material-symbols-outlined ${prevWeekStatus === "green" ? "text-green-500" : prevWeekStatus === "red" ? "text-red-400" : "text-gray-300"
                    }`} style={{ fontSize: 20 }}>
                    {prevWeekStatus === "green" ? "verified" : prevWeekStatus === "red" ? "warning" : "history"}
                  </span>
                  <p className="text-[8px] font-black uppercase tracking-widest text-gray-400 text-center leading-tight">Prev<br />Week</p>
                  <p className={`text-[9px] font-extrabold text-center ${prevWeekStatus === "green" ? "text-green-600" : prevWeekStatus === "red" ? "text-red-500" : "text-gray-400"
                    }`}>
                    {prevWeekStatus === "green" ? "Done" : prevWeekStatus === "red" ? "Pending" : "—"}
                  </p>
                </div>

                <div className="w-px bg-gray-100 self-stretch flex-shrink-0 rounded-full" />

                {weeklyPlan.map((day) => (
                  <DayCard
                    key={day.date}
                    day={day}
                    isSelected={selectedDate === day.date}
                    isToday={day.date === today}
                    isPast={day.date < today}
                    onClick={() => handleDayClick(day)}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-gray-300 text-center">
                <span className="material-symbols-outlined text-4xl mb-2">calendar_month</span>
                <p className="text-xs font-medium text-gray-400">No plan available</p>
              </div>
            )}

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-3 mt-4 pt-3 border-t border-gray-50">
              {[
                { color: "bg-green-500", label: "Completed" },
                { color: "bg-[#BADA55]", label: "In Progress" },
                { color: "bg-amber-400", label: "Partial" },
                { color: "bg-red-400", label: "Pending" },
              ].map(({ color, label }) => (
                <div key={label} className="flex items-center gap-1">
                  <span className={`w-2 h-2 rounded-full ${color}`} />
                  <span className="text-[10px] text-gray-400 font-medium">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT — Chapter Details (independent card) */}
          <div className="w-full lg:w-[42%] bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-5 flex flex-col">
            {/* Day header */}
            <div className="mb-4">
              {selectedDayData ? (
                <>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
                      {formatFullDate(selectedDayData.date)}
                    </p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusPill(selectedDayData.status)}`}>
                      {selectedDayData.progress}% done
                    </span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${progressBarColor(selectedDayData.progress)}`}
                      style={{ width: `${selectedDayData.progress}%` }}
                    />
                  </div>
                </>
              ) : (
                <p className="text-xs font-bold text-gray-300 uppercase tracking-widest">
                  Select a day
                </p>
              )}
            </div>

            {/* Chapters */}
            <div className="space-y-2.5 flex-1 overflow-y-auto min-h-0 pr-1 max-h-56 custom-scrollbar">
              {selectedDayData ? (
                selectedDayData.chapters.length > 0 ? (
                  selectedDayData.chapters.map((ch, idx) => (
                    <ChapterAccordion
                      key={`${ch.chapter_id}-${idx}`}
                      chapter={ch}
                      index={idx}
                      onMockTestClick={(cid, cname, aid) =>
                        onMockTestClick?.(
                          subject.subject_id,
                          subject.subject_name,
                          cid,
                          cname,
                          aid,
                        )
                      }
                    />
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <span className="material-symbols-outlined text-4xl text-gray-200 mb-2">menu_book</span>
                    <p className="text-sm font-medium text-gray-400">No chapters today</p>
                    <p className="text-xs text-gray-300">Enjoy your free day! 🌟</p>
                  </div>
                )
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <span className="material-symbols-outlined text-4xl text-gray-100 mb-2">touch_app</span>
                  <p className="text-sm font-medium text-gray-400">Click a day to view chapters</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

// ─── Accent colors for subjects ───────────────────────────────────────────────

const SUBJECT_COLORS = [
  "#BADA55", "#4F8EF7", "#F97316", "#A855F7", "#14B8A6", "#EF4444", "#F59E0B",
];

// ─── Main Component ───────────────────────────────────────────────────────────

const LearningPlanner: React.FC = () => {
  const [subjects, setSubjects] = useState<ApiSubjectPlan[]>([]);
  const hasHandledAssignmentRef = useRef<number | null>(null);
  const [multiChapterTests, setMultiChapterTests] = useState<MultiChapterTest[]>([]);
  const [academic, setAcademic] = useState<AcademicDetails | null>(null);
  const [student, setStudent] = useState<StudentDetails | null>(null);
  const [profileImage, setProfileImage] = useState<string>(" ");
  const [isLoading, setIsLoading] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const { showToast } = useToast();
  const navigate = useNavigate();
  const { refresh: refreshNotificationCount } = useNotification();

  const location = useLocation();
  const assignmentIdFromState = location.state?.assignmentId;

  // Test Modal State
  const [testModalOpen, setTestModalOpen] = useState(false);
  const [assessmentDetails, setAssessmentDetails] = useState<any>(null);
  const [attemptId, setAttemptId] = useState<number | null>(null);
  const [testDuration, setTestDuration] = useState(30);
  const [totalMarks, setTotalMarks] = useState(0);

  const handleTestModalUpdate = async (assignmentId: number): Promise<boolean> => {
    try {
      setIsLoading(true);

      // 1. Start Adaptive Assessment
      const startRes = await ApiServices.adaptiveStartAssessment({
        assignment_id: assignmentId,
      });

      if (startRes.data?.status === "success") {
        const attempt_id = startRes.data.data.attempt_id;
        setAttemptId(attempt_id);

        // 2. Get First Adaptive Question
        const questionRes = await ApiServices.getNextAdaptiveQuestion(attempt_id);

        if (questionRes.data?.status === "success") {
          const questionData = questionRes.data.data;

          if (questionData.is_complete) {
            showToast("Assessment already completed.", "info");
            return false;
          }

          setAssessmentDetails({
            questions: [{
              question_id: questionData.question_id,
              question_text: questionData.question_text,
              question_type: questionData.question_type,
              options: questionData.options,
              difficulty: questionData.difficulty,
              marks: questionData.marks,
              sl_no: questionData.sl_no,
              adaptive_level_code: questionData.adaptive_level_code,
              mapped_bucket: questionData.mapped_bucket
            }]
          });

          setTestDuration(startRes.data.data.duration_minutes);
          setTotalMarks(startRes.data.data.total_marks);
          setTestModalOpen(true);
          showToast("Adaptive test started!", "success");
          return true;
        }
      }
    } catch (error: any) {
      showToast(
        error.response?.data?.message || "Something went wrong",
        "error",
      );
    } finally {
      setIsLoading(false);
    }
    return false;
  };

  const handleMockTestClick = async (
    _subjectId: number,
    _subjectName: string,
    _chapterId: number,
    _chapterName: string,
    assignmentId: number | null | undefined,
  ) => {
    if (!assignmentId) {
      showToast("This mock test is not available yet.", "info");
      return;
    }

    try {
      setIsLoading(true);

      // 1. Start Adaptive Assessment
      const startRes = await ApiServices.adaptiveStartAssessment({
        assignment_id: assignmentId,
      });

      if (startRes.data?.status === "success") {
        const attempt_id = startRes.data.data.attempt_id;
        setAttemptId(attempt_id);

        // 2. Get First Adaptive Question
        const questionRes = await ApiServices.getNextAdaptiveQuestion(attempt_id);

        if (questionRes.data?.status === "success") {
          const questionData = questionRes.data.data;

          if (questionData.is_complete) {
            showToast("Assessment already completed.", "info");
            return;
          }

          // Transform adaptive response into expected format for the modal
          // The modal expects assessmentDetails.questions as an array
          setAssessmentDetails({
            questions: [{
              question_id: questionData.question_id,
              question_text: questionData.question_text,
              options: questionData.options,
              question_type: questionData.question_type,
              difficulty: questionData.difficulty,
              marks: questionData.marks,
              sl_no: questionData.sl_no,
              adaptive_level_code: questionData.adaptive_level_code,
              mapped_bucket: questionData.mapped_bucket
            }]
          });

          setTestDuration(startRes.data.data.duration_minutes);
          setTotalMarks(startRes.data.data.total_marks);
          setTestModalOpen(true);
          showToast("Adaptive test started!", "success");
        } else {
          showToast(questionRes.data?.message || "Failed to fetch first question", "error");
        }
      } else {
        showToast(startRes.data?.message || "Failed to start assessment", "error");
      }
    } catch (error: any) {
      showToast(
        error.response?.data?.message || "Something went wrong",
        "error",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMultiChapterTests = async () => {
    try {
      const res = await ApiServices.getMultiChapterTests();
      if (res.data?.status === "success") {
        setMultiChapterTests(res.data.data || []);
      }
    } catch { /* silent */ }
  };

  const fetchLearningPlan = async () => {
    try {
      fetchMultiChapterTests();
      const getResponse = await ApiServices.getStudentPlannerDashboard();
      const result = getResponse.data;

      // Handle both wrapped ({status, data}) and direct data responses
      const plannerData = result.status === 'success' ? result.data : result;

      if (plannerData && plannerData.subjects?.length > 0) {
        setSubjects(plannerData.subjects.map(patchSubjectPlan));
        setAcademic(plannerData.academic);
        setStudent(plannerData.student);
        return;
      }

      // If no plan, we might need to fallback to generation as before
      await ApiServices.generateLearningPlan({ topic_ids: null });

      const newGetResponse = await ApiServices.getStudentPlannerDashboard();
      const newResult = newGetResponse.data;
      const newPlannerData = newResult.status === 'success' ? newResult.data : newResult;

      if (newPlannerData && newPlannerData.subjects?.length > 0) {
        setSubjects(newPlannerData.subjects.map(patchSubjectPlan));
        setAcademic(newPlannerData.academic);
        setStudent(newPlannerData.student);
      }
    } catch {
      // silent
    }
  };

  const fetchProfileImage = async () => {
    try {
      const response = await ApiServices.getUserProfileImage();
      if (response.data?.status === "success" && response.data?.data?.image)
        setProfileImage(response.data.data.image);
    } catch { /* silent */ }
  };

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      try {
        await Promise.all([fetchLearningPlan(), fetchProfileImage()]);

        // Check if we came from notification with an assignmentId
        if (assignmentIdFromState && hasHandledAssignmentRef.current !== assignmentIdFromState) { 
          hasHandledAssignmentRef.current = assignmentIdFromState;
          const success = await handleTestModalUpdate(assignmentIdFromState);
          if (success) {
            // Clear the assignmentId from location.state after it has been handled
            navigate(location.pathname, { replace: true, state: {} });
          }
        }
      } catch (err) {
        console.error("Initialization error:", err);
      } finally {
        setIsLoading(false);
      }
    };
    init(); // Initial fetch on component mount
  }, [assignmentIdFromState, navigate, location.pathname]); // Add navigate and location.pathname to dependencies

  const getInitial = () => student?.name?.charAt(0).toUpperCase();

  const [showResultComingSoon, setShowResultComingSoon] = useState(false);
  return (
    <div className="min-h-screen p-6 relative">
      {/* ── Loading overlay ─────────────────────────────────────────── */}
      {isLoading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-xl">
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 border-4 border-gray-100 border-t-[#BADA55] rounded-full animate-spin" />
            <span className="text-sm text-gray-400 font-medium tracking-wide">
              Loading your planner…
            </span>
          </div>
        </div>
      )}

      {/* ── Header ──────────────────────────────────────────────────── */}
      <header className="flex flex-wrap justify-between items-start gap-6 pb-6">
        <div className="flex gap-4 items-start">
          <div className="w-[90px] h-[90px] rounded-full overflow-hidden flex-shrink-0 border-4 border-[#BADA55]/40 shadow-lg flex items-center justify-center bg-gray-100">
            {profileImage ? (
              <img src={profileImage} alt="Profile" className="w-full h-full object-cover" onError={() => setProfileImage("")} />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#BADA55] to-lime-500 text-white">
                <span className="text-4xl font-bold">{getInitial()}</span>
              </div>
            )}
          </div>
          {student && (
            <div className="flex flex-col gap-0.5">
              <span className="text-2xl text-[#ABB3BC] font-bold tracking-wide">Learning Planner</span>
              <h1 className="text-3xl font-bold text-primary m-0">
                Hi {student.name
                  ? student.name.split(" ").map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")
                  : ""}!
              </h1>
              {academic && (
                <>
                  <p className="text-sm text-primary font-medium m-0">{academic.institute}</p>
                  <p className="text-sm text-primary m-0">{academic.board} | {academic.class} | Section {academic.sections}</p>
                  <p className="text-sm text-primary m-0 break-words max-w-xl">
                    Subject: {subjects.map(s => s.subject_name).join(", ")}
                  </p>
                  <p className="text-sm text-primary m-0 break-words max-w-xl">
                    Academic Year: {academic.academic_year}
                  </p>
                </>
              )}
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="flex flex-wrap items-start gap-10">
          <div className="flex items-center gap-4">
            <div className="w-[6rem] h-[6rem] rounded-full bg-yellow flex items-center justify-center shadow-inner">
              <span className="text-4xl font-bold text-red">00</span>
            </div>
            <div className="leading-snug">
              <p className="text-xs font-bold mt-7 text-primary">Days Left for<br />Annual<br />Exam</p>
            </div>
          </div>

          <div className="text-center flex flex-col items-center">
            <div className="w-[4.688rem] h-[4.688rem] rounded-full bg-yellow flex items-center justify-center mb-1 shadow-inner">
              <span className="text-lg font-bold text-red">#12</span>
            </div>
            <p className="text-xs font-medium text-primary w-[4.688rem] leading-tight">Leadership Board Position</p>
          </div>
        </div>
      </header>

      {/* ── Divider ─────────────────────────────────────────────────── */}
      <div className="border-t-4 border-gray-300 mb-6" />

      {/* ── Subject Sections (stacked) ───────────────────────────────── */}
      {subjects.length > 0 ? (
        <div className="flex flex-col gap-6">
          {subjects.map((subject, idx) => (
            <SubjectSection
              key={subject.subject_id}
              subject={subject}
              accentColor={SUBJECT_COLORS[idx % SUBJECT_COLORS.length]}
              defaultExpanded={subjects.length <= 2}
              onMockTestClick={handleMockTestClick}
              multiChapterTests={multiChapterTests}
            />
          ))}
        </div>
      ) : (
        !isLoading && (
          <div className="flex flex-col items-center justify-center py-24 text-center text-gray-300">
            <span className="material-symbols-outlined text-7xl mb-4">school</span>
            <p className="text-base font-semibold text-gray-400">No learning plan found</p>
            <p className="text-sm text-gray-300 mt-1">Your plan will appear here once generated</p>
          </div>
        )
      )}

      {/* ── Chat ────────────────────────────────────────────────────── */}
      {/* <div className="fixed right-[1%] top-[80%] -translate-y-1/2 z-[100]">
        <button onClick={() => setIsChatOpen(true)} aria-label="Open chat" className="p-0 bg-transparent border-0 cursor-pointer">
          <img src={IconChat} alt="Chat" className="w-[95px]" />
        </button>
      </div> */}
      {isChatOpen && <Chat onClose={() => setIsChatOpen(false)} />}

      <TestModalUpdated
        isOpen={testModalOpen}
        onClose={() => {
          setTestModalOpen(false);
          fetchLearningPlan();
        }}
        testDurationMinutes={testDuration}
        assessmentDetails={assessmentDetails}
        totalMarks={totalMarks}
        attemptId={attemptId}
        isAdaptive={true}
        onComplete={(result) => {
          console.log("Test completed:", result);
          // Refresh data to show progress
          fetchLearningPlan();
          refreshNotificationCount();
          setShowResultComingSoon(true);
        }}
      />

      {showResultComingSoon && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 text-center relative animate-in fade-in zoom-in duration-200">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <CheckCircle size={32} className="text-green-500" />
            </div>
            <h3 className="text-xl font-bold text-primary mb-2">Assessment Submitted!</h3>
            <p className="text-gray-500 text-sm mb-6">Your result is being processed and will be available soon in the <strong>Dashboard</strong></p>
            <button
              onClick={() => {
                setShowResultComingSoon(false);
                fetchLearningPlan();
              }}
              className="w-full px-6 py-3 bg-button-primary text-primary rounded-lg font-bold hover:bg-opacity-90 transition-colors"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LearningPlanner;