// import {
//   performanceStatsData,
//   performanceDataTimeDistribution,
// } from "./NewStudent";

export const PerformanceCards = ({ performanceData }: { performanceData?: any }) => {
  const performance = Array.isArray(performanceData?.performance) ? performanceData.performance : [];
  const time_distribution = Array.isArray(performanceData?.time_distribution) ? performanceData.time_distribution : [];
  const top_stats = performanceData?.top_stats || {};

  const latestRecord = performance.length > 0 ? performance[performance.length - 1] : null;

  const stats = [
    {
      label: "Overall Score",
      value: top_stats.avg_accuracy ? `${top_stats.avg_accuracy}%` : "0%",
      icon: latestRecord?.score_trend > 0 ? "up" : latestRecord?.score_trend < 0 ? "down" : "",
      title: latestRecord ? `${latestRecord.score_trend}% this month` : "No data",
    },
    {
      label: "Module Test Completed",
      value: `${top_stats.completed_module_tests || 0}/${top_stats.total_module_tests || 0}`,
      icon: "",
      title: `${(top_stats.total_module_tests || 0) - (top_stats.completed_module_tests || 0)} pending`,
    },
    {
      label: "Mock Tests Attempted",
      value: `${top_stats.completed_mock_tests || top_stats.total_attempts || 0}/${top_stats.total_mock_tests || 5}`,
      icon: "",
      title: `${(top_stats.total_mock_tests || 5) - (top_stats.completed_mock_tests || top_stats.total_attempts || 0)} pending`,
    },
    {
      label: "Avg Difficulty",
      value: top_stats.difficulty_level || "N/A",
      icon: "",
      title: `${top_stats.difficulty_bucket || "Unknown"} difficulty scale`,
    },
  ];

  const dynamicPerformanceStatsData = latestRecord ? [
    {
      value: latestRecord.accuracy,
      suffix: "%",
      valueColor: "#505050",
      title: "Difficulty Adapt Rate",
      titleColor: "#474747",
      icon: parseFloat(latestRecord.score_trend) > 0 ? "up" : parseFloat(latestRecord.score_trend) < 0 ? "down" : "",
      subText: `${latestRecord.score_trend}% vs prev`,
      subTextColor: "#3B8263",
      borderColor: "#7BA6B3",
    },
    {
      value: latestRecord.attempt_rate,
      suffix: "%",
      valueColor: "#D3A251",
      title: "On-time Completion",
      titleColor: "#474747",
      icon: "",
      subText: "Target 20 mins max",
      subTextColor: "#D3A251",
      borderColor: "#7BA6B3",
    },
    {
      value: latestRecord.score_pct,
      suffix: "%",
      valueColor: "#B7C356",
      title: "Accuracy After Adapt",
      titleColor: "#474747",
      icon: "",
      subText: `Avg time: ${latestRecord.avg_time}m`,
      subTextColor: "#3B8263",
      borderColor: "#7BA6B3",
    },
    {
      value: latestRecord.unattempted,
      suffix: "",
      valueColor: "#B7C356",
      title: "Question Skip Rate",
      titleColor: "#474747",
      icon: latestRecord.unattempted > 0 ? "up" : "down",
      subText: latestRecord.unattempted > 0 ? "Needs improvement" : "Well managed",
      subTextColor: "#3B8263",
      borderColor: "#7BA6B3",
    },
  ] : [];

  const chartData = performance.length > 0 
    ? performance.map((item: any) => parseFloat(item.score_pct))
    : [];

const labels = performance.length > 0
  ? performance.map((item: any) => `Set ${item.set_id}`)
  : [];

const max = 100;

// Map levels to UI colors and labels (matching difficulty_level from SQL)
const levelMapping: Record<string, { color: string, label: string }> = {
  // 'L1': { color: '#EB8E02', label: 'Easy (L1-2)' },
  // 'L2': { color: '#b0cb1f', label: 'Expert (L6+)' },
  // 'L3': { color: '#ea4335', label: 'Medium (L3-4)' },
  // 'L4': { color: '#6366f1', label: 'Hard (L5)' },
  'Easy': { color: '#b0cb1f', label: 'Easy (L1)' },
  'Medium': { color: '#EB8E02', label: 'Medium (L2)' },
  'Hard': { color: '#ed6c61', label: 'Hard (L3)' },
  'Expert': { color: '#ea4335', label: 'Expert (L4)' }
};

const levelOrder = ['Easy', 'Medium', 'Hard', 'Expert'];
const dynamicTimeDistribution = (time_distribution.length > 0
  ? time_distribution
    .map((item: any) => ({
      label: levelMapping[item.level]?.label || item.level,
      value: (item.avg_time / 30) * 100, // Normalize to percentage for bar width
      color: levelMapping[item.level]?.color,
      avg: `${item.avg_time.toFixed(2)}m avg`,
      level: item.level // keep for sorting
    }))
  : [])
  .sort((a: any, b: any) => {
    const orderA = levelOrder.indexOf(a.level || a.label.split(' ')[0]);
    const orderB = levelOrder.indexOf(b.level || b.label.split(' ')[0]);
    return orderA - orderB;
  });

// Convert chart data to SVG points
const points = chartData
  .map((value: number, i: number) => {
    const x = chartData.length > 1 ? (i / (chartData.length - 1)) * 100 : 50;
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




    <div className="grid grid-cols-1 xl:grid-cols-2 m-1 gap-2 max-h-[70vh] overflow-y-auto custom-scrollbar">
      <div className="grid grid-cols-1 gap-2">
        <div className="grid grid-cols-2 gap-4 h-80">
          {dynamicPerformanceStatsData.length > 0 ? (
            dynamicPerformanceStatsData.map((item, i) => (
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
            ))
          ) : (
            <div className="col-span-2 flex items-center justify-center h-36 rounded-lg border-2 border-dashed border-gray-200">
              <p className="text-gray-400 font-medium italic">No detailed metrics available yet</p>
            </div>
          )}
        </div>

        <div className="bg-primary text-white p-4 rounded-xl w-full xl:w-[107%] z-10">
          {/* Title */}
          <h2 className="text-3xl font-bold">Mock Score Trend</h2>
          <p className="text-sm text-gray-400 mb-4">
            {performance.length} exams • {parseFloat(latestRecord?.score_trend || 0) >= 0 ? "+" : ""}{latestRecord?.score_trend || 0} pts improvement
          </p>

          {chartData.length > 0 ? (
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
                    {chartData.map((value: number, i: number) => {
                      const x = chartData.length > 1 ? (i / (chartData.length - 1)) * 100 : 50;
                      const y = 100 - (value / max) * 100;
                      return (
                        <circle key={i} cx={x} cy={y} r="1.5" fill="#facc15" />
                      );
                    })}
                  </svg>
                </div>

                {/* X-axis Labels */}
                <div className="flex justify-between text-xs text-gray-400 mt-2">
                  {labels.map((label: string, i: number) => (
                    <span key={i}>{label}</span>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-40 flex items-center justify-center rounded-lg border border-white/10">
              <p className="text-gray-400 italic">Complete more tests to see your progress trend</p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div className="p-2 col-span-2">
          <h3 className="font-extrabold mb-3 text-xl text-primary">
            Time Distribution by Question Difficulty
          </h3>

          {dynamicTimeDistribution.length > 0 ? (
            dynamicTimeDistribution.map((item: any, i: number) => (
              <div key={i} className="grid grid-cols-12 gap-2 items-center">
                <p className="text-sm col-span-3 font-semibold text-primary whitespace-nowrap">
                  {item.label}
                </p>
                <div className="w-full bg-gray-200 h-3 rounded-full col-span-6">
                  <div
                    className={`h-3 rounded-full`}
                    style={{
                      width: `${item.attempted || item.value}%`, // Fallback for width
                      backgroundColor: `${item.color}`,
                    }}
                  />
                </div>
                <p
                  className={`text-base font-semibold col-span-3 text-end whitespace-nowrap`}
                  style={{ color: `${item.color}` }}
                >
                  {item.avg}
                </p>
              </div>
            ))
          ) : (
            <div className="py-10 flex flex-col items-center justify-center opacity-60">
              <span className="material-symbols-outlined text-4xl mb-2 text-gray-400">timer_off</span>
              <p className="text-gray-500 font-medium italic text-sm">No time distribution data tracked</p>
            </div>
          )}
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
            <ul className="space-y-1 pt-8">
              <li className="w-full flex gap-4">
                <span className="material-symbols-outlined text-[#b0cb1f] text-5xl font-extrabold">
                  check
                </span>
                <p className="text-xl text-primary font-bold">
                  {parseFloat(latestRecord?.last_minute_error || 0) > 20
                    ? `Last minute pressure detected (${latestRecord?.last_minute_error || 0}% error rate). Focus on steady pacing.`
                    : "Your pacing is steady, minimizing errors in the final minutes."}
                </p>
              </li>
              <li className="w-full flex gap-4">
                <span className="material-symbols-outlined text-[#b0cb1f] text-5xl font-extrabold">
                  check
                </span>{" "}
                <p className="text-xl text-primary font-bold">
                    {parseFloat(latestRecord?.guessing_index || 0) > 0.1 
                      ? `Guessing index is ${latestRecord?.guessing_index || 0}. Work on conceptual clarity to reduce guesswork.`
                      : "Strong conceptual accuracy with minimal guessing detected."}
                </p>
              </li>
            </ul>
            <div className="mb-8">
              <p className="mt-2 text-xs text-primary font-semibold">
                {(latestRecord?.score_pct || 0) >= 80 ? "You are performing at an elite level." : "Consistently clearing L3 will help you reach"}
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
