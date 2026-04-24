import { useEffect, useState } from "react";
import { AccuracyProgression } from "./AccuracyProgression";
import { DifficultyMatrix } from "./DifficultyMatrix";
import ApiServices from "../../../../services/ApiServices";
import Loader from "../../../../components/common/Loader";

interface MockExamDashboardProps {
  selectedExam: string;
}

export const MockExamDashboard = ({ selectedExam }: MockExamDashboardProps) => {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await ApiServices.getStudentMockDashboard();
        if (response.data?.status === "success") {
          setDashboardData(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching mock dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader size="lg" text="Loading dashboard data..." />
      </div>
    );
  }

  if (!dashboardData) {
    return <div className="text-center py-10 text-gray-500">No dashboard data available.</div>;
  }

  // Use selectedExam to pick data (default to MCQ if not set or invalid)
  const currentType = selectedExam?.toLowerCase() === "quiz" ? "quiz" : "mcq";
  const currentData = dashboardData[currentType];

  if (!currentData) {
    return <div className="text-center py-10 text-gray-500">No data for {selectedExam}.</div>;
  }

  // Transform level_matrix to match DifficultyMatrix expected format
  const difficultyLevels = currentData.level_matrix.map((lvl: any) => ({
    label: lvl.level === "L1" ? "L1 - Easy" : lvl.level === "L2" ? "L2 - Medium" : lvl.level === "L3" ? "L3 - Hard" : "L4 - Expert",
    attempted: lvl.attempted,
    correct: lvl.correct,
    correctColor: "#b0cb1f",
    wrong: lvl.wrong,
    wrongColor: "#FC7465",
    skipped: lvl.skipped,
    skippedColor: "#6b7280",
    percent: Math.round(lvl.accuracy),
    meanTime: lvl.avg_time
  }));

  return (
    <div className="px-1 bg-gray-100 h-[40rem] overflow-y-auto custom-scrollbar">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
        <DifficultyMatrix DifficultyData={difficultyLevels} />
        <AccuracyProgression chapters={currentData.chapters} />
      </div>
    </div>
  );
};
