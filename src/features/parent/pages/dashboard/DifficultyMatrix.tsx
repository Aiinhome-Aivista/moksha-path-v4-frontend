interface DifficultyLevel {
  label: string;
  attempted: number;
  correct: number;
  correctColor: string;
  wrong: number;
  wrongColor: string;
  skipped: number;
  skippedColor: string;
  percent: number;
}

interface DifficultyMatrixProps {
  DifficultyData: DifficultyLevel[];
}

export const DifficultyMatrix = ({ DifficultyData }: DifficultyMatrixProps) => {
  return (
    <div className="px-4">
      <h2 className="font-semibold text-3xl text-primary">
        Difficulty Performance Matrix
      </h2>
      <p className="font-medium text-base mb-5 text-primary">
        How you performed at each adaptive difficulty tier-
      </p>

      {DifficultyData.map((lvl, i) => (
        <div key={i} className="mb-10 grid grid-cols-9 2xl:grid-cols-10">
          {/* Top Row */}
          <div className="col-span-2">
            <p className="font-medium text-lg">Label</p>
              <h2 className="flex justify-between mb-1 font-semibold text-xl">{lvl.label}</h2>

            {/* Mean Time */}
            <p className="text-xs text-primary mt-1">Mean Time: 5 sec</p>
          </div>

          <div className=" col-span-6 2xl:col-span-7">
            {/* Stats */}
            <div className="flex gap-4 justify-around text-xs text-gray-500 mb-1">
              <div className="flex flex-col items-center">
                <p className="text-primary text-sm font-semibold">Attempted</p>
                <span className="text-2xl"> {lvl.attempted}</span>
              </div>
             <div className="flex flex-col items-center">
                <p className="text-sm font-semibold" style={{color: lvl.correctColor}}>Correct</p>
                <span className="text-2xl" style={{color: lvl.correctColor}}>{lvl.correct}</span>
              </div>
             <div className="flex flex-col items-center">
                <p className="text-sm font-semibold" style={{color: lvl.wrongColor}}>Wrong</p>
                <span className="text-2xl" style={{color: lvl.wrongColor}}>{lvl.wrong}</span>
              </div>
             <div className="flex flex-col items-center">
                <p className="text-sm font-semibold" style={{color: lvl.skippedColor}}>Skipped</p>
                <span className="text-2xl" style={{color: lvl.skippedColor}}>{lvl.skipped}</span>
              </div>
            </div>
            {/* Progress Bar */}
            <div className="flex w-full h-2 bg-gray-200 rounded">
              <div
                className={`h-2 rounded`}
                style={{ width: `${(lvl.correct / lvl.attempted) * 100}%`,backgroundColor: `${lvl.correctColor}` }}
              />
              <div
                className={`h-2 rounded`}
                style={{ width: `${(lvl.wrong / lvl.attempted) * 100}%`,backgroundColor: `${lvl.wrongColor}` }}
              />
              <div
                className={`h-2 rounded`}
                style={{ width: `${(lvl.skipped / lvl.attempted) * 100}%` }}
              />
            </div>
          </div>

          <h2
            className={`text-6xl text-end flex items-center ${
              lvl.percent > 80
                ? "text-primary"
                : lvl.percent > 60
                ? "text-[#D99427]"
                : lvl.percent > 45
                ? "text-green-500"
                : "text-[#FC7465]"
            }`}
          >
            {lvl.percent}
            <span className="text-2xl">%</span>
          </h2>
        </div>
      ))}
    </div>
  );
};
