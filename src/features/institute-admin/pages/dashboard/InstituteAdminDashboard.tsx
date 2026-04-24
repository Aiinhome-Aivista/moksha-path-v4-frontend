import React from "react";
import {
  dashboardMeta,
  principalProfile,
  statCards,
  teacherScorecards,
  scoringWeights,
  actionInsights,
} from "./data/teacherReview.data";
import type { ActionInsight } from "./data/teacherReview.types";
import { DashboardHeader } from "../../../../components/common/DashboardHeader";

// --- Helpers ---
const gradeColor = (grade: string) => {
  if (grade === "A" || grade === "A-") return "text-green-600 font-bold";
  if (grade.startsWith("B")) return "text-blue-600 font-bold";
  if (grade.startsWith("C")) return "text-orange-500 font-bold";
  return "text-red-500 font-bold";
};

const insightIcon = (type: ActionInsight["type"]) => {
  switch (type) {
    case "success": return { icon: "●", color: "text-green-500" };
    case "danger": return { icon: "●", color: "text-red-500" };
    case "warning": return { icon: "●", color: "text-orange-400" };
    case "info": return { icon: "○", color: "text-blue-400" };
  }
};

// --- Component ---
const InstituteAdminDashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <DashboardHeader
        profile={principalProfile}
        meta={dashboardMeta}
        profileAltText="Principal Profile"
      />
      <div className="flex flex-col gap-5 px-12 py-3">
  {/* Stat row */}
  <div className="flex w-full justify-end gap-44">
    {statCards.map((stat, i) => (
      <div key={i} className=" text-start">
        <p
          className={`font-extrabold leading-none ${
            i === 0 ? "text-4xl text-gray-900" : "text-3xl"
          } ${stat.color}`}
        >
          {stat.value}
          {stat.suffix && (
            <span
              className={`${
                i === 0 ? "text-xl" : "text-base"
              } font-bold`}
            >
              {stat.suffix}
            </span>
          )}
        </p>

        <p className="text-sm font-bold text-primary mt-0.5">
          {stat.label}
        </p>
        <p className="text-xs text-primary font-semibold">
          {stat.subLabel}
        </p>
      </div>
    ))}
  </div>
</div>


      {/* ── SCORECARD TABLE ────────────────────────────── */}
      <div className="rounded-xl mb-5 overflow-hidden">
        <div className="px-12 pt-4 pb-1">
          <span className="font-bold text-sm text-gray-800">Teacher Performance Scorecards</span>
          <span className="text-xs text-gray-400 ml-2">Each Benchmarked in Own Domain</span>
        </div>

        <div className="overflow-x-auto px-12">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-t-4 border-[#E0E0E0] border-b-4 border-[#E0E0E0] text-primary text-sm font-bold">
                <th className="px-4 py-1 text-left">Teacher</th>
                <th className="px-4 py-1 text-left">
                  Subjects<br />
                  <span className="font-normal text-primary">(Own benchmark)</span>
                </th>
                <th className="px-4 py-1 text-left">Classes</th>
                <th className="px-4 py-1 text-left">Bench%</th>
                <th className="px-4 py-1 text-left">Syllabus%</th>
                <th className="px-4 py-1 text-left">Mock Eng%</th>
                <th className="px-4 py-1 text-left">Risk Res%</th>
                <th className="px-4 py-1 text-left">Acc Gwth%</th>
                <th className="px-4 py-1 text-left">Score</th>
                <th className="px-4 py-1 text-left">Grade</th>
              </tr>
            </thead>
            <tbody>
              {teacherScorecards.map((t, i) => (
                <tr key={i} className="border-b border-gray-300 hover:bg-gray-50 text-xs font-bold transition-colors">
                  <td className="px-4 py-1.5 font-bold text-primary whitespace-nowrap">{t.name}</td>
                  <td className="px-4 py-1.5 text-primary">{t.subjects}</td>
                  <td className="px-4 py-1.5 text-primary">{t.classes}</td>
                  <td className="px-4 py-1.5 text-primary">{t.bench}%</td>
                  <td className="px-4 py-1.5 text-primary">{t.syllabus}%</td>
                  <td className="px-4 py-1.5 text-primary">{t.mockEng}%</td>
                  <td className="px-4 py-1.5 text-primary">{t.riskRes}%</td>
                  <td className="px-4 py-1.5 text-primary">{t.accGwth}%</td>
                  <td className="px-4 py-1.5 font-bold text-primary">{t.score}</td>
                  <td className={`px-4 py-1.5 ${gradeColor(t.grade)}`}>{t.grade}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── BOTTOM ROW ────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 px-12">

        {/* Scoring Guide */}
        <div className="bg-[#f5f9e8] border border-[#d4e68a] rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            {/* Gauge icon */}
            <svg width="36" height="36" viewBox="0 0 36 36" className="shrink-0">
              <path d="M3 20 A15 15 0 0 1 33 20" fill="none" stroke="#c5de4a" strokeWidth="5" strokeLinecap="round" />
              <path d="M18 20 L12 10" stroke="#333" strokeWidth="2" strokeLinecap="round" />
              <circle cx="18" cy="20" r="2" fill="#333" />
            </svg>
            <div>
              <p className="font-bold text-sm text-gray-800">Scoring Guide</p>
              <p className="text-[10px] text-gray-500">(within own subject benchmark):</p>
            </div>
          </div>

          {/* Weight bar */}
          <div className="flex w-full h-4 rounded-xl overflow-hidden mb-2">
            {scoringWeights.map((w, i) => {
              const colors = ["bg-yellow-400", "bg-lime-400", "bg-green-400", "bg-teal-400", "bg-cyan-400"];
              return (
                <div
                  key={i}
                  className={`${colors[i]} flex items-center justify-center text-[9px] font-bold text-white`}
                  style={{ width: `${w.weight}%` }}
                >
                  {w.weight}%
                </div>
              );
            })}
          </div>

          {/* Labels */}
          <div className="flex justify-between mt-1">
            {scoringWeights.map((w, i) => (
              <p key={i} className="text-[9px] text-gray-600 text-center" style={{ width: `${w.weight}%` }}>
                {w.label.split("\n").map((line, j) => (
                  <span key={j} className="block leading-tight">{line}</span>
                ))}
              </p>
            ))}
          </div>
        </div>

        {/* Principal's Action Insights */}
        <div className="pl-5">
          <p className="font-bold text-sm text-gray-800 mb-3">Principal's Action Insights</p>
          <ul className="space-y-2">
            {actionInsights.map((insight, i) => {
              const { icon, color } = insightIcon(insight.type);
              return (
                <li key={i} className="flex items-start gap-2 text-xs text-gray-700 leading-snug">
                  <span className={`${color} text-base leading-none mt-0.5 shrink-0`}>{icon}</span>
                  <span>{insight.text}</span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default InstituteAdminDashboard;
