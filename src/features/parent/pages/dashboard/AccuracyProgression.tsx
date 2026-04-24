import { subjectAccuracies } from "./NewStudent";

export const AccuracyProgression = () => {
  return (
    <div className="px-4">
     <h2 className="font-semibold text-3xl text-primary">
        Accuracy by Difficulty Mock Progression
      </h2>
      <p className="font-medium text-base mb-5 text-primary">
        Highest level you answer correctly: 50% of the time
      </p>
      {subjectAccuracies.map((subAcc, i) => (
        <div key={i} className="mb-6">
          {/* Title */}
          <div className="flex justify-between text-sm mb-1">
            <span className="text-xl font-semibold">{subAcc.name}</span>
            <span
              className={`text-xs text-end font-semibold ${subAcc.level === 2
                  ? "text-gray-500"
                  : subAcc.level === 3
                    ? "text-orange-500"
                    : subAcc.level === 4
                      ? "text-green-500"
                      : "text-red-500"
                }`}
            >
              Handles L{subAcc.level}
            </span>
          </div>

          {/* Multi-level bars */}
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((lvl) => {
              return (
                <div
                  key={lvl}
                  className={`h-3 flex-1 rounded-full ${lvl < subAcc.level
                      ? "bg-green-600"
                      : lvl === subAcc.level
                        ? "bg-yellow-500"
                        : "bg-gray-300"
                    }`}
                />
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};
