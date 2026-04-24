import { dashboardData } from "./mockData";

interface OverviewTabProps {
  data?: any;
}

const OverviewTab = ({ data }: OverviewTabProps) => {
  // Use API data if available, otherwise fall back to mock data
  const displayData = data || dashboardData;

  const getStatusStyle = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'GOOD':
      case 'ON TRACK': return 'bg-green-600';
      case 'WATCH': return 'bg-orange-400';
      case 'ACTION': return 'bg-red-500';
      default: return 'bg-gray-400';
    }
  };

  const renderTable = (title: string, tableData: any[], syllabus: string, mock: string) => (
    <div className="bg-color-secondary pt-6 pb-6 rounded-3xl  border border-gray-100 flex-1">
      <div className="flex justify-between items-end mb-4">
        <h3 className="text-xl font-black text-gray-800 tracking-tight">{title}</h3>
        <p className="text-[12px] text-gray-700 font-bold ">
          Syllabus: <span className="text-[10px] text-gray-400">{syllabus} complete</span> | Mock: <span className="text-[10px] text-gray-400">{mock}</span>
        </p>
      </div>
      
      <table className="w-full text-left">
        <thead className="border-y-4 border-gray-300">
          <tr className="text-gray-700 text-[14px] font-black tracking-widest">
            <th className="p-2 text-center">Section</th>
            <th className="p-2 text-center">Students</th>
            <th className="p-2 text-center">Class Avg</th>
            <th className="p-2 text-center">Benchmark</th>
            <th className="p-2 text-center">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-300">
          {(tableData || []).map((item, i) => (
            <tr key={i} className=" transition-all duration-200">
              <td className="py-3.5 text-sm font-bold text-gray-700 text-center">
                {item.section_name || item.section}
              </td>
              <td className="text-sm font-bold text-gray-700 text-center">
                {item.students}
              </td>
              <td className="text-sm font-bold text-gray-700 text-center">
                {item.class_avg || item.avg}%
              </td>
              <td className="text-sm font-bold text-gray-700 text-center">
                {item.benchmark}%
              </td>
              <td className="text-center">
                <span className={`inline-block w-24 text-center py-1.5 rounded-full text-[9px] font-black text-white  transform group-hover:scale-105 transition-transform ${getStatusStyle(item.status)}`}>
                  {item.status?.toUpperCase()}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  // Extract overview stats from the API data
  const overviewStats = displayData?.overview || {};
  const subjectOverview = displayData?.subject_overview || [];

  // Build dynamic stats array
  const topStats = [
    {
      value: overviewStats.total_students || 0,
      label: 'Total Students',
      sublabel: `Across ${subjectOverview.length || 0} sections`,
      color: '#1f2937'
    },
    {
      value: overviewStats.subjects_taught || 0,
      label: 'Subjects Taught',
      sublabel: (overviewStats.subject_list || []).join(' · ') || 'No subjects',
      color: '#00a8cc'
    },
    {
      value: `${Math.round(overviewStats.syllabus_on_track_pct || 0)}%`,
      label: 'Syllabus On-track',
      sublabel: 'Avg across subjects',
      color: '#f39c12'
    },
    {
      value: overviewStats.at_risk_students || 0,
      label: 'At-risk Students',
      sublabel: 'Needs action',
      color: '#ef4444'
    },
    {
      value: `${Math.round(overviewStats.mock_engagement_pct || 0)}%`,
      label: 'Mock Engagement',
      sublabel: 'Above school avg',
      color: '#22c55e'
    }
  ];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* 1. Page Sub-Header and Top Stats in one responsive row */}
       <div className="bg-color-secondary rounded-3xl border border-gray-100 flex flex-col xl:flex-row justify-between items-center gap-12">
        <div className="flex-shrink-0 pt-2 px-6 ">
          <h2 className="text-1xl font-black text-cyan-600 tracking-tight leading-none">Student & Subject Overview</h2>
          <div className="text-[10px] text-gray-400 font-bold tracking-tight mt-1">
            <p>Performance summary across all classes</p>
            <p>{new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 flex-1 w-full max-w-7xl pl-4">
          {topStats.map((stat: any, i: number) => (
            <div key={i} className="flex flex-col justify-center">
              {/* 1. Large Number (Value) with Dynamic Color */}
              <p className="text-4xl lg:text-5xl font-black leading-none tracking-tight" style={{ color: stat.color }}>
                {stat.value}
              </p>
              
              <div className="mt-2">
                {/* 2. Label */}
                <p className="text-[11px] font-bold leading-tight text-gray-800">
                  {stat.label}
                </p>
                
                {/* 3. Sub-label */}
                <p className="text-[9px] text-gray-500 mt-1 font-medium leading-tight">
                  {stat.sublabel}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Subject Tables Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 px-2">
        {subjectOverview.map((subject: any, idx: number) => (
          <div key={idx}>
            {renderTable(
              subject.subject_name,
              subject.sections || [],
              `${Math.round((subject.completed_chapters || 0) / (subject.total_chapters || 1) * 100) || 0}%`,
              '91%'
            )}
          </div>
        ))}
      </div>

      {/* 3. RECOMMENDATIONS FOOTER */}
      {(displayData?.recommendations || []).map((item: any, i: number) => (
        <div key={i} className="bg-[#FCEA0A] rounded-[1rem] p-6 pb-2 flex items-center justify-between shadow-sm mx-6 border border-yellow-300 ">
          
          <div className="flex items-start gap-4">
            {/* Orange Chevron Icon Box */}
            <div className="bg-[#f39c12] text-white w-7 h-7 flex items-center justify-center rounded-[6px] flex-shrink-0 shadow-sm mt-0.5">
              <svg 
                width="14" height="14" viewBox="0 0 24 24" fill="none" 
                stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"
              >
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </div>
            
            {/* Alert Text Content */}
            <div className="flex flex-col text-gray-900">
              
              {/* Top Line: Title and Stats from Data */}
              <div className="flex items-center gap-3">
                <span className="text-sm font-black tracking-wide">{item.title}</span>
              </div>
              
              {/* Bottom Line: Recommendation from Data */}
              <div className="text-[10px] font-bold mt-0.5 text-gray-700">
                {item.description}
              </div>
              
            </div>
          </div>

          {/* Right Side: Action Button */}
          <div className="pl-4">
            <button className="bg-[#f39c12] text-white px-8 py-2 rounded-full text-[10px] font-black  tracking-wider shadow-sm hover:scale-105 transition-transform active:scale-95">
              VIEW
            </button>
          </div>
          
        </div>
      ))}
    </div>
  );
};

export default OverviewTab;