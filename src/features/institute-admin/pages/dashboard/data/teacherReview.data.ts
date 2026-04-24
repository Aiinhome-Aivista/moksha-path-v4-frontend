import type {
  TeacherScorecard,
  StatCard,
  ScoringWeight,
  ActionInsight,
  PrincipalProfile,
  DashboardMeta,
} from "./teacherReview.types";

export const dashboardMeta: DashboardMeta = {
  title: "Dashboard: Teacher Performance Review",
  academicYear: "AY 2025-26",
};

export const principalProfile: PrincipalProfile = {
  greeting: "Greetings,",
  name: "Pabitra Sarkar !",
  school: "St. Thomas School for Boys (CICSE)",
  avatarUrl:
    "https://www.picsman.ai/blog/wp-content/uploads/2025/01/free-passport-photo-maker-1.webp",
};

export const statCards: StatCard[] = [
  {
    value: "847",
    label: "Overall Score",
    subLabel: "8 Classes, 24 Sections",
    color: "text-gray-800",
  },
  {
    value: "12",
    label: "Active Teachers",
    subLabel: "MoksPath engaged",
    color: "text-cyan-500",
  },
  {
    value: "79",
    suffix: "%",
    label: "Avg Benchmark Att.",
    subLabel: "Across all subjects",
    color: "text-cyan-500",
  },
  {
    value: "83",
    suffix: "%",
    label: "Syllabus On-Track",
    subLabel: "School-wide avg",
    color: "text-cyan-500",
  },
  {
    value: "68",
    suffix: "%",
    label: "At-Risk Recovery",
    subLabel: "Of flagged students",
    color: "text-orange-400",
  },
];

export const teacherScorecards: TeacherScorecard[] = [
  {
    name: "Ms. Priya Sharma",
    subjects: "Mathematics, Science",
    classes: "8, 10",
    bench: 62,
    syllabus: 83,
    mockEng: 88,
    riskRes: 45,
    accGwth: 72,
    score: 72,
    grade: "B+",
  },
  {
    name: "Mr. Arjun Nair",
    subjects: "English, Literature",
    classes: "6, 7, 8",
    bench: 78,
    syllabus: 91,
    mockEng: 84,
    riskRes: 68,
    accGwth: 76,
    score: 80,
    grade: "A",
  },
  {
    name: "Ms. Sunita Rao",
    subjects: "Physics, Chemistry",
    classes: "9, 10",
    bench: 71,
    syllabus: 80,
    mockEng: 79,
    riskRes: 55,
    accGwth: 68,
    score: 73,
    grade: "B+",
  },
  {
    name: "Mr. Vikram Patel",
    subjects: "History, Geography",
    classes: "8, 9",
    bench: 74,
    syllabus: 87,
    mockEng: 76,
    riskRes: 60,
    accGwth: 71,
    score: 75,
    grade: "B+",
  },
  {
    name: "Ms. Kavitha Iyer",
    subjects: "Biology",
    classes: "10",
    bench: 82,
    syllabus: 90,
    mockEng: 92,
    riskRes: 74,
    accGwth: 78,
    score: 84,
    grade: "A",
  },
  {
    name: "Mr. Rahul Gupta",
    subjects: "Mathematics",
    classes: "6, 7",
    bench: 55,
    syllabus: 70,
    mockEng: 72,
    riskRes: 38,
    accGwth: 60,
    score: 60,
    grade: "C+",
  },
  {
    name: "Ms. Deepa Singh",
    subjects: "Hindi, Sanskrit",
    classes: "8, 9, 10",
    bench: 80,
    syllabus: 88,
    mockEng: 80,
    riskRes: 65,
    accGwth: 74,
    score: 78,
    grade: "A",
  },
  {
    name: "Mr. Suresh Kumar",
    subjects: "Computer Science",
    classes: "9, 10",
    bench: 77,
    syllabus: 85,
    mockEng: 88,
    riskRes: 62,
    accGwth: 73,
    score: 78,
    grade: "A-",
  },
];

export const scoringWeights: ScoringWeight[] = [
  { label: "Benchmark\nAttainment", weight: 25 },
  { label: "Syllabus\nTimeliness", weight: 20 },
  { label: "Mock\nEngagement", weight: 20 },
  { label: "At-Risk\nResolution", weight: 20 },
  { label: "Accuracy\nGrowth", weight: 15 },
];

export const actionInsights: ActionInsight[] = [
  {
    type: "success",
    text: "Ms. Kavitha Iyer (Biology, A) and Mr. Arjun Nair (English, A) lead on all 5 dimensions — consider as department leads.",
  },
  {
    type: "danger",
    text: "Mr. Rahul Gupta (Maths 6-7, C+): Benchmark attainment 55%, Risk resolution 38%. Structured support plan recommended.",
  },
  {
    type: "warning",
    text: "Ms. Priya Sharma's at-risk resolution (45%) needs focus — strong in delivery, weaker in follow-up. Coaching advised.",
  },
  {
    type: "info",
    text: "School-wide syllabus timeliness at 83% — up from 74% last term. MoksPath pacing alerts are showing measurable impact.",
  },
  {
    type: "info",
    text: "Mock engagement below 80% for 3 teachers. Standardise a mock review protocol across departments.",
  },
];
