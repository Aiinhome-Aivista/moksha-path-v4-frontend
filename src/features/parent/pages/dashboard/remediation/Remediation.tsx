import SubjectRemediationCard from "./SubjectRemediationCard";
import RemediationFooter from "./RemediationFooter";
import { remediationSubjects } from "../NewStudent";

const Remediation = () => {
  return (
    <div className="p-4 bg-gray-100 min-h-screen space-y-4">
      {/* Top Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {remediationSubjects.map((sub, i) => (
          <SubjectRemediationCard key={i} data={sub} />
        ))}
      </div>

      {/* Bottom Cards */}
        <RemediationFooter />
    </div>
  );
};

export default Remediation;
