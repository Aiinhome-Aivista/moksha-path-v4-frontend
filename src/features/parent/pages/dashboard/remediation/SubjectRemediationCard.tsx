/* Helper */
const getColor = (percent: number) => {
  if (percent > 80) return "text-gray-500";
  if (percent > 60) return "text-orange-500";
  if (percent > 45) return "text-green-500";
  return "text-red-500";
};

const SubjectRemediationCard = ({ data }: any) => {
  return (
    <div className=" px-4 border-b-2">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-3xl text-primary font-semibold">{data.title}</h3>
        <span className="text-sm font-bold text-red">{data.priority}</span>
      </div>

      {/* Score + Progress */}
      <div className="flex items-center gap-12 mt-2">
        <h2 className={`text-5xl font-light ${getColor(data.percent)}`}>
          {data.percent}%
        </h2>
       
        <div className="w-full">
          <span className="text-xs text-gray-500">{data.level}</span>
          <div className="w-full h-4 bg-gray-200 rounded-full mb-2">
            <div
              className="h-4 bg-[#ea4335] rounded-full"
              style={{ width: `${data.percent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Levels */}
      <div className="flex gap-1 mt-4">
        {data.levels.map((lvl: any, i: number) => (
          <div key={i} className="flex-1">
            <h4 className="text-2xl text-center font-medium">
              {lvl.value}
              <span className="text-sm ">%</span>
            </h4>
            <p className="text-sm text-center font-semibold">{lvl.label}</p>
            <div className="h-2 bg-gray-200 rounded">
              <div
                className="h-2 rounded"
                style={{
                  width: `${lvl.value}%`,
                  backgroundColor: lvl.color,
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="mt-4 space-y-1">
        {data.actions.map((act: any, i: number) => (
          <div
            key={i}
            className={`p-2 rounded-lg text-sm flex gap-4 ${
              i === 0
                ? "bg-button-primary"
                : i === 1
                ? "bg-highlighter"
                : "bg-lime-100"
            }`}
          >
            <div className="font-bold bg-white w-12 h-12 flex items-center justify-center rounded-full text-xl shrink-0">
              {i + 1}
            </div>
            <div>
              <p className="font-bold">{act.title}</p>
              <p className="font-medium">{act.subtitle}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SubjectRemediationCard;
