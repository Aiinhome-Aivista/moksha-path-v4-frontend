import SubjectCard from "./SubjectCard";
import { mathSubjects } from "../NewStudent";

interface SubjectGridProps {
  selectedSubject: string;
}

const SubjectGrid: React.FC<SubjectGridProps> = ({ selectedSubject }) => {

  let data: any[] = [];

  if (selectedSubject === "Mathematics") {
    data = mathSubjects;
  }

  return (
    <>
      <div className="px-8 py-2 text-lg font-semibold text-gray-700">
        Selected Subject: {selectedSubject || "None"}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-8">
        {data.length > 0 ? (
          data.map((sub, i) => (
            <SubjectCard key={i} {...sub} />
          ))
        ) : (
          <p className="text-gray-500">No data available</p>
        )}
      </div>
    </>
  );
};

export default SubjectGrid;