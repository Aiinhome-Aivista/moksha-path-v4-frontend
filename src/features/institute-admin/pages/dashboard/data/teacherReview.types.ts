export interface TeacherScorecard {
  name: string;
  subjects: string;
  classes: string;
  bench: number;
  syllabus: number;
  mockEng: number;
  riskRes: number;
  accGwth: number;
  score: number;
  grade: string;
}

export interface StatCard {
  value: string;
  suffix?: string;
  label: string;
  subLabel: string;
  color: string;
}

export interface ScoringWeight {
  label: string;
  weight: number;
}

export interface ActionInsight {
  type: "success" | "danger" | "warning" | "info";
  text: string;
}

export interface PrincipalProfile {
  greeting: string;
  name: string;
  school: string;
  avatarUrl: string;
}

export interface DashboardMeta {
  title: string;
  academicYear: string;
}
