import React from "react";

interface Level {
  label: string;
  value: number;
  color: string;
  time: string;
}

interface SubjectCardProps {
  title: string;
  score: number;
  level: string;
  difficulty: string;
  statusColor: string;
  levels: Level[];
}

const SubjectCard: React.FC<SubjectCardProps> = ({
  title,
  score,
  level,
  difficulty,
  statusColor,
  levels,
}) => {
  return (
    <div className=" p-1 border-b-4 border-[#EDEDED]">
      {/* Top Section */}
      <div className="flex items-end gap-2 mb-2">
        <h2 className="text-7xl font-light" style={{ color: statusColor }}>
          {score}
          <span className="text-3xl font-normal">%</span>
        </h2>
        <div className="w-full items-end">
          {/* <span className="text-xs font-medium text-primary pb-4">{level}-{difficulty}</span> */}
          <span
            className={`text-xs font-semibold pb-4 ${difficulty === "Hard"
                ? "text-[#578E12]"
                : difficulty === "Medium"
                  ? "text-[#EA9003]"
                  : "text-[#80975F]"
              }`}
          >
            {level} - {difficulty}
          </span>
          {/* Progress Bar */}
          <div className="w-full h-4 bg-gray-200 rounded-full my-2">
            <div
              className="h-4 rounded-full"
              style={{
                width: `${score}%`,
                backgroundColor: statusColor,
              }}
            />
          </div>
        </div>
      </div>

      {/* Title */}
      <h3 className="font-bold text-2xl text-gray-700 mb-2">{title}</h3>

      {/* Accuracy by Level */}
      <p className="text-xs text-primary font-semibold  mb-2">
        Accuracy by Level
      </p>


      {/* Small Bars */}
      <div className="flex gap-1 mb-2 justify-around">
        {levels.map((lvl, i) => (
          <div key={i} className="flex-1">
            <p
              className="text-xl text-center mt-1"
              style={{
                color: lvl.color,
              }}
            >
              {lvl.value}
              <span className="text-sm">%</span>
            </p>
            <p className="text-sm font-bold text-center mt-1">{lvl.label}</p>
            <div className="h-2 bg-gray-200 rounded-full">
              <div
                className="h-2 rounded-full"
                style={{
                  width: `${lvl.value}%`,
                  backgroundColor: lvl.color,
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Mean Time */}
      <div className="flex justify-around mt-2 text-primary text-sm font-medium tracking-tight">
        {levels.map((lvl, i) => (
          <div className="text-center">
            <p className="text-sm text-center">Mean Time:</p>
            <p className="text-sm text-center" key={i}>
              {lvl.time}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SubjectCard;
