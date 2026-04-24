import { dashboardData } from "./mockData";

interface RemediationTabProps {
  data?: any;
}

const RemediationTab = ({ data }: RemediationTabProps) => {
  // Use API data if available, otherwise fall back to mock data
  const displayData = data || dashboardData;

  // Extract summary and matrix data
  const summary = displayData?.summary || {};
  const matrix = displayData?.matrix || [];
  const recommendations = displayData?.recommendations || [];

  // Build summary stats array
  const summaryStats = [
    { label: 'Excellent', value: summary.excellent || 0, color: 'text-[#4CAF50]', bgColor: 'bg-[#4CAF50]' },
    { label: 'Watch Zone', value: summary.watch_zone || 0, color: 'text-[#FFC107]', bgColor: 'bg-[#FFC107]' },
    { label: 'At-Risk', value: summary.at_risk || 0, color: 'text-[#FF9800]', bgColor: 'bg-[#FF9800]' },
    { label: 'Critical', value: summary.critical || 0, color: 'text-[#F44336]', bgColor: 'bg-[#F44336]' },
  ];

  const getActionStyle = (action: string) => {
    if (action === 'SCHEDULE') return 'bg-[#f39c12] text-white';
    if (action === 'ASSIGN') return 'bg-[#ff6b6b] text-white';
    return 'bg-white text-gray-600 border border-gray-300';
  };

  return (
    <div className="space-y-2 animate-in fade-in duration-500 pr-6 pl-6">
      
      {/* 1. TOP SECTION: Title and Student Buckets */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 border-b border-gray-100">
        
        {/* Left Side: Title & Subtitle */}
        <div className="flex-shrink-0 pt-4">
          <h2 className="text-1xl font-black text-cyan-600">
            Remediation Plan & Student Buckets
          </h2>
          <p className="text-xs text-gray-400 font-bold tracking-tight">
            Priority actions, at-risk matrix and improvement strategies
          </p>
        </div>

        {/* Right Side: 4 Student Bucket Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 items-start gap-8 pb-4">
          {summaryStats.map((item: any, i: number) => (
            <div key={i} className="flex flex-col w-44">
              <span className={`text-4xl font-medium leading-none tracking-tighter ${item.color}`}>
                {item.value}
              </span>
              
              <span className="text-sm font-bold text-gray-800 mt-0.5 leading-none tracking-tight">
                {item.label}
              </span>
              
              <div className="flex justify-between items-center w-full mt-1">
                <span className="text-xs text-gray-500 font-medium">
                  students
                </span>
                <span className="text-xs text-gray-400 font-medium">
                  {Math.round((item.value / (summary.excellent || 1 + summary.watch_zone || 1 + summary.at_risk || 1 + summary.critical || 1)) * 100)}% of class
                </span>
              </div>

              {/* Progress Bar Line */}
              <div className="w-full h-[3px] bg-gray-500 mt-1 overflow-hidden">
                <div className={`h-full ${item.bgColor}`} style={{ width: `${Math.round((item.value / (summary.excellent || 1 + summary.watch_zone || 1 + summary.at_risk || 1 + summary.critical || 1)) * 100)}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. TABLE SECTION: Clean, No Borders, Centered columns */}
      <div className="">
        <h3 className="text-[1.1rem] font-bold text-gray-800 mb-2 tracking-tight">Remediation Priority Matrix</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="border-y-4 border-gray-300 dark:border-secondary-700">
              <tr className="border-y-2 border-gray-100 text-gray-800 text-[16px] font-bold tracking-tight">
                <th className="py-2 pl-2 font-bold">Class</th>
                <th className="py-2 font-bold">Subject</th>
                <th className="py-2 font-bold">Chapter</th>
                <th className="py-2 text-center font-bold">Accuracy</th>
                <th className="py-2 text-center font-bold">Benchmark</th>
                <th className="py-2 text-center font-bold">Gap</th>
                <th className="py-2 text-center font-bold">At-Risk</th>
                <th className="py-2 text-center font-bold pr-2">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-300">
              {matrix.map((item: any, i: number) => (
                <tr key={i} className="">
                  <td className="py-2 pl-2 text-[13px] font-bold text-gray-600">
                    {item.class}
                  </td>
                  <td className="py-2 text-[13px] font-bold text-gray-800">{item.subject}</td>
                  <td className="py-2 text-[13px] font-bold text-gray-800">{item.chapter}</td>
                  <td className="py-2 text-[13px] font-bold text-[#F44336] text-center">{item.accuracy}%</td>
                  <td className="py-2 text-[13px] text-gray-600 font-bold text-center">{item.benchmark}%</td>
                  <td className="py-2 text-[13px]  font-bold text-[#F44336] text-center">{item.gap}%</td>
                  <td className="py-2 text-[13px] text-gray-700 font-bold text-center">{item.at_risk_students}</td>
                  <td className="py-2 pr-2 text-center">
                    {/* Action Buttons */}
                    <button className={`w-[100px] py-1.5 rounded-full text-xs font-black tracking-wider transition-all ${getActionStyle(item.action)}`}>
                      {item.action}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. RECOMMENDED PLANS (Green Cards at bottom) */}
      <div className="">
        <h3 className="text-[1.1rem] font-bold text-gray-800 mb-4 tracking-tight">Recommended Remediation Plans</h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {recommendations.map((plan: any, idx: number) => (
            <div key={idx} className="bg-[#bada55] p-5 rounded-[1.2rem] flex gap-4 items-start shadow-sm border border-[#a8c64a]">
              <div className="bg-white text-[#8ba832] w-7 h-7 rounded-full flex items-center justify-center font-black flex-shrink-0 text-xs shadow-sm">
                {idx + 1}
              </div>
              <div>
                <p className="text-sm font-black text-gray-800 leading-tight mb-1">{plan.title}</p>
                <p className="text-[11px] font-bold text-gray-700 leading-tight opacity-90">{plan.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      
    </div>
  );
};

export default RemediationTab;