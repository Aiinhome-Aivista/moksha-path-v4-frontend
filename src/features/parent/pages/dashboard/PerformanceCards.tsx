import {
  performanceStatsData,
  performanceDataTimeDistribution,
} from "./NewStudent";

export const PerformanceCards = () => {
  const stats = [
    {
      label: "Overall Score",
      value: "74%",
      icon: "up",
      title: "5% this month",
    },
    {
      label: "Module Test Completed",
      value: "6/8",
      icon: "",
      title: "2 pending",
    },
    {
      label: "Mock Tests Attempted",
      value: "3/5",
      icon: "",
      title: "2 pending",
    },
    {
      label: "Avg Difficulty",
      value: "L3",
      icon: "",
      title: "Hard out of 4 level",
    },
  ];
  const chartData = [10, 30, 25, 45, 50, 80];
  const labels = ["12 Jan", "26 Jan", "12 Feb", "26 Feb", "12 Mar", "12 Mar"];

  const max = 100;

  // Convert data to SVG points
  const points = chartData
    .map((value, i) => {
      const x = (i / (chartData.length - 1)) * 100;
      const y = 100 - (value / max) * 100;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <>
      <div className="xl:ml-80 grid grid-cols-2 md:grid-cols-4 xl:place-items-end gap-1 2xl:gap-12 xl:relative xl:-top-6">
        {stats.map((item, i) => (
          <div key={i} className="w-56 2xl:w-60 p-1 ">
            <div className="grid grid-cols-3">
              <h3 className="text-4xl font-normal">{item.value}</h3>
              <p className="text-sm text-primary col-span-2 mb-1 flex flex-col justify-end w-full md:w-20 lg:w-full">
                {item.icon === "up" && (
                  <span className="material-symbols-outlined text-3xl leading-3">
                    keyboard_arrow_up
                  </span>
                )}
                <span>{item.title}</span>
              </p>
            </div>
            <p className="text-sm font-bold text-primary w-full md:w-28 lg:w-full">{item.label}</p>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-2 pt-6 m-1 gap-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
        <div className="grid grid-cols-1 gap-2">
          <div className="grid grid-cols-2 gap-4 h-80">
            {performanceStatsData.map((item, i) => (
              <div
                key={i}
                className="px-4 border-b-4 h-36"
                style={{ borderColor: item.borderColor }}
              >
                <h3
                  className="text-6xl font-normal"
                  style={{ color: item.valueColor }}
                >
                  {item.value}
                  <span className="text-3xl">{item.suffix}</span>
                </h3>

                <p
                  className="text-xl font-bold"
                  style={{ color: item.titleColor }}
                >
                  {item.title}
                </p>

                <p
                  className="text-sm font-bold flex items-center"
                  style={{ color: item.subTextColor }}
                >
                  {/* Icon */}
                  {item.icon === "up" && (
                    <span className="material-symbols-outlined text-5xl leading-3">
                      keyboard_arrow_up
                    </span>
                  )}

                  {item.icon === "down" && (
                    <span className="material-symbols-outlined  text-5xl leading-3">
                      keyboard_arrow_down
                    </span>
                  )}

                  {item.subText}
                </p>
              </div>
            ))}
          </div>

          <div className="bg-primary text-white p-4 rounded-xl w-full xl:w-[107%] z-10">
            {/* Title */}
            <h2 className="text-3xl font-bold">Mock Score Trend</h2>
            <p className="text-sm text-gray-400 mb-4">
              5 exams • +20 pts improvement
            </p>

            <div className="flex">
              {/* Y-axis Labels */}
              <div className="flex flex-col justify-between h-40 text-xs text-gray-400 mr-2">
                <span>100</span>
                <span>75</span>
                <span>50</span>
                <span>25</span>
                <span>0</span>
              </div>
              <div className="flex-1">
                {/* Chart */}
                <div className="w-full h-40">
                  <svg
                    viewBox="0 0 100 100"
                    className="w-full h-full"
                    preserveAspectRatio="none"
                  >
                    {/* Grid Lines */}
                    {[0, 25, 50, 75, 100].map((line, i) => (
                      <line
                        key={i}
                        x1="0"
                        y1={line}
                        x2="100"
                        y2={line}
                        stroke="#fff"
                        strokeDasharray="2,2"
                        strokeWidth="0.5"
                      />
                    ))}

                    {/* Line */}
                    <polyline
                      fill="none"
                      stroke="#facc15"
                      strokeWidth="2"
                      points={points}
                    />

                    {/* Dots */}
                    {chartData.map((value, i) => {
                      const x = (i / (chartData.length - 1)) * 100;
                      const y = 100 - (value / max) * 100;
                      return (
                        <circle key={i} cx={x} cy={y} r="1.5" fill="#facc15" />
                      );
                    })}
                  </svg>
                </div>

                {/* X-axis Labels */}
                <div className="flex justify-between text-xs text-gray-400 mt-2">
                  {labels.map((label, i) => (
                    <span key={i}>{label}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <div className="p-4 col-span-2">
            <h3 className="font-extrabold mb-3 text-xl text-primary">
              Time Distribution by Question Difficulty
            </h3>

            {performanceDataTimeDistribution.map((item, i) => (
              <div key={i} className="mb-4 grid grid-cols-8 gap-2 items-center">
                <p className="text-sm col-span-2 font-semibold text-primary">
                  {item.label}
                </p>
                <div className="w-full bg-gray-200 h-3 rounded-full col-span-5">
                  <div
                    className={`h-3 rounded-full`}
                    style={{
                      width: `${item.value}%`,
                      backgroundColor: `${item.color}`,
                    }}
                  />
                </div>
                <p
                  className={`text-base font-semibold`}
                  style={{ color: `${item.color}` }}
                >
                  {item.avg}
                </p>
              </div>
            ))}
          </div>

          <div className="h-[26rem] grid grid-cols-3 gap-4 bg-[#e0dfdf] p-4 mr-4 rounded-xl shadow">
            <div className="max-w-52 h-80">
              <h3 className="font-semibold text-2xl text-primary text-center my-2">
                Your Action
              </h3>
              <img
                src="https://thirdeyeblindproductions.com/wp-content/uploads/2025/02/Screenshot-2025-02-24-115914.png"
                className="w-full h-full xl:h-80"
              />
            </div>
            <div className="col-span-2 flex flex-col justify-between">
              <ul className="space-y-1 pt-12">
                <li className="w-full flex gap-4">
                  <span className="material-symbols-outlined text-[#b0cb1f] text-5xl font-extrabold">
                    check
                  </span>
                  <p className="text-xl text-primary  font-bold ">
                    You constantly clear L1 & L2 questions but lose accuracy at
                    L3.
                  </p>
                </li>
                <li className="w-full flex gap-4">
                  <span className="material-symbols-outlined text-[#b0cb1f] text-5xl font-extrabold">
                    check
                  </span>{" "}
                  <p className="text-xl text-primary  font-bold ">
                    The engine is routine towards L3 more frequently - this is
                    where your biggest score gains lie.
                  </p>
                </li>
              </ul>
              <div className="mb-8">
                <p className="mt-2 text-xs text-primary font-semibold">
                  If you crack 13 consistently you'll reach
                </p>
                <h2 className="mt-2 text-primary">
                  <span className="text-4xl font-extrabold"> Top 8%</span>
                  <span className="text-sm font-semibold">
                    {" "}
                    School Percentile
                  </span>
                </h2>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
