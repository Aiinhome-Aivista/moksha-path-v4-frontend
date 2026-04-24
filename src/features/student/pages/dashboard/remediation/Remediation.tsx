import { useEffect, useState } from "react";
import SubjectRemediationCard from "./SubjectRemediationCard";
import RemediationFooter from "./RemediationFooter";
import ApiServices from "../../../../../services/ApiServices";
import Loader from "../../../../../components/common/Loader";

const Remediation = () => {
  const [remediationData, setRemediationData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRemediation = async () => {
      setIsLoading(true);
      try {
        const response = await ApiServices.getStudentChapterRemediation();
        if (response.data?.status === "success") {
          setRemediationData(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching remediation data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRemediation();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <Loader size="xl" text="Fetching remediation data..." />
      </div>
    );
  }

  // Map API data to the format expected by SubjectRemediationCard
  const mappedRemediation = remediationData.map((item: any) => ({
    title: item.chapter_name,
    priority: item.priority,
    percent: Math.round(item.overall_accuracy),
    level: item.current_level,
    levels: [
      { label: "L1", value: Math.round(item.levels.L1 || 0), color: "#4caf50" },
      { label: "L2", value: Math.round(item.levels.L2 || 0), color: "#fbc02d" },
      { label: "L3", value: Math.round(item.levels.L3 || 0), color: "#ff9800" },
      { label: "L4", value: Math.round(item.levels.L4 || 0), color: "#ea4335" }
    ],
    actions: item.recommendations.map((rec: string) => ({
      title: rec,
      subtitle: "" // Subtitle is not provided by API
    }))
  }));

  return (
    <div className="p-4 bg-gray-100 min-h-screen space-y-4">
      {/* Top Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {mappedRemediation.map((sub, i) => (
          <SubjectRemediationCard key={i} data={sub} />
        ))}
      </div>

      {/* Bottom Cards */}
      <RemediationFooter />
    </div>
  );
};

export default Remediation;
