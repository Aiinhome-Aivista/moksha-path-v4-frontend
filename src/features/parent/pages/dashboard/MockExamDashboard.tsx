import { AccuracyProgression } from "./AccuracyProgression";
import { mockExamStats } from "./NewStudent";
import { DifficultyMatrix } from "./DifficultyMatrix";
import { DifficultyLevels } from "./NewStudent";

interface MockExamDashboardProps {
  selectedExam: string;
}

export const MockExamDashboard = ({ selectedExam }: MockExamDashboardProps) => {
  return (
    <div className="px-1 bg-gray-100 h-[40rem] overflow-y-auto custom-scrollbar">
    
      <div className="w-full xl:w-2/3 xl:ml-80 px-2 pb-6 grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
        {/* Left Title */}
        <div className="w-40">
          <h2 className="text-2xl font-semibold text-gray-700">
            {mockExamStats.title}
          </h2>
          <p className="text-sm text-gray-500">{mockExamStats.date}</p>
        </div>

        {/* Stats */}
        <div className="col-span-3 grid grid-cols-3">
        {mockExamStats.stats.map((item, i) => (
          <div key={i} className="flex flex-col w-fit lg:w-40 xl:w-60">
            <div className="flex flex-col xl:flex-row items-end gap-2">
              <h3 className="text-4xl text-primary">
                {item.value}
                <span className="text-lg">{item.suffix}</span>
              </h3>
              <span className={`text-sm font-medium ${item.changeColor}`}>
                {item.change}
              </span>
            </div>
            <p className="font-semibold text-sm text-primary text-end xl:text-start">{item.label}</p>
          </div>
        ))}
        </div>
      </div>
      {selectedExam === "MCQ" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <DifficultyMatrix DifficultyData={DifficultyLevels} />

          <AccuracyProgression />
          <DifficultyMatrix DifficultyData={DifficultyLevels} />

          <AccuracyProgression />
          <DifficultyMatrix DifficultyData={DifficultyLevels} />

          <AccuracyProgression />
        </div>
      )}
    </div>
  );
};
