import React, { useState, useEffect } from "react";
import ApiServices from "../../../services/ApiServices";
import { useNavigate } from "react-router-dom";
import { CheckCircle } from "lucide-react";

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

const OverallTests: React.FC = () => {
  const [multiChapterTests, setMultiChapterTests] = useState<MultiChapterTest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const fetchMultiChapterTests = async () => {
    setIsLoading(true);
    try {
      const res = await ApiServices.getMultiChapterTests();
      if (res.data?.status === "success") {
        setMultiChapterTests(res.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching multi-chapter tests:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMultiChapterTests();
  }, []);

  const handleStartTest = (assignmentId: number) => {
    navigate("/learning-planner", {
      state: {
        assignmentId,
        fromOverallTests: true
      }
    });
  };

  const formatDueDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const day = date.getDate();
    const month = date.toLocaleString('en-IN', { month: 'short' });
    const year = date.getFullYear();
    const time = date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false });
    return `${day} ${month} ${year} ${time}`;
  };

  return (
    <div className="min-h-screen p-6 space-y-8 bg-gray-50/50">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold text-gray-800">Overall Tests</h1>
        <p className="text-gray-500 text-sm">Review and start your assigned multi-chapter adaptive assessments.</p>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="w-12 h-12 border-4 border-gray-100 border-t-[#BADA55] rounded-full animate-spin" />
          <span className="text-sm text-gray-400 font-medium">Loading assessments…</span>
        </div>
      ) : multiChapterTests.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {multiChapterTests.map((test) => {
            const isPending = test.status === "assigned" || test.status === "Pending";
            return (
              <div
                key={test.assignment_id}
                className={`bg-white rounded-2xl border shadow-sm p-6 space-y-4 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${isPending
                  ? "border-l-4 border-l-amber-400"
                  : "border-l-4 border-l-green-500"
                  }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-lg font-bold text-gray-800 line-clamp-2">{test.set_name}</p>
                    <p className="text-xs font-semibold text-gray-400 mt-1">
                      {test.subject_name} {test.assigned_by_name ? `• ${test.assigned_by_name}` : ''}
                    </p>
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${isPending ? "bg-amber-50 text-amber-700" : "bg-green-50 text-green-700"}`}>
                    {isPending ? "Pending" : "Completed"}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                    <p className="text-gray-400 font-bold uppercase text-[9px] mb-1">Due Date</p>
                    <p className="text-sm font-bold text-gray-700">{formatDueDate(test.due_date)}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                    <p className="text-gray-400 font-bold uppercase text-[9px] mb-1">Duration</p>
                    <p className="text-sm font-bold text-gray-700">{test.duration_minutes} mins</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                    <p className="text-gray-400 font-bold uppercase text-[9px] mb-1">Questions</p>
                    <p className="text-sm font-bold text-gray-700">{test.total_questions}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                    <p className="text-gray-400 font-bold uppercase text-[9px] mb-1">Marks</p>
                    <p className="text-sm font-bold text-gray-700">{test.marks_obtained || 0}/{test.total_marks}</p>
                  </div>
                </div>

                {isPending ? (
                  <button
                    onClick={() => handleStartTest(test.assignment_id)}
                    className="w-full py-3 bg-[#BADA55] hover:bg-lime-400 text-gray-800 text-sm font-extrabold rounded-xl transition-all shadow-md active:scale-95"
                  >
                    Start Test
                  </button>
                ) : (
                  <div className="flex items-center justify-center gap-2 text-sm font-bold bg-green-50 text-green-700 py-3 rounded-xl border border-green-100">
                    <CheckCircle size={18} />
                    Test Completed
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-32 text-center text-gray-300">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-5xl text-gray-300">quiz</span>
          </div>
          <p className="text-lg font-semibold text-gray-400">No overall tests found</p>
          <p className="text-sm text-gray-300 mt-1">Check back later or contact your teacher if you expect a test.</p>
          <button 
            onClick={() => navigate("/learning-planner")}
            className="mt-6 px-6 py-2 bg-white border-2 border-gray-100 rounded-full text-gray-500 font-bold hover:border-[#BADA55] hover:text-[#BADA55] transition-all"
          >
            Go to Learning Planner
          </button>
        </div>
      )}
    </div>
  );
};

export default OverallTests;
