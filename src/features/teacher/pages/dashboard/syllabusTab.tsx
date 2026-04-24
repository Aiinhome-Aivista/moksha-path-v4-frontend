import { dashboardData } from "./mockData";

interface SyllabusTabProps {
  data?: any;
}

const SyllabusTab = ({ data }: SyllabusTabProps) => {
  // Use API data if available, otherwise fall back to mock data
  const displayData = data || dashboardData;
  
  // Extract syllabus data
  const syllabusData = displayData?.syllabus || [];

  // Helper to render a single column (Subject)
  const renderColumn = (subjectData: any) => {
    const chapters = subjectData?.chapters || [];
    
    // Map status to color
    const getStatusColor = (status: string) => {
      if (status === 'GOOD') return 'bg-green-700';
      if (status === 'ACTION') return 'bg-red-400';
      if (status === 'WATCH') return 'bg-orange-400';
      return 'bg-gray-300';
    };

    const getStatusTextColor = (status: string) => {
      if (status === 'GOOD') return 'text-green-700';
      if (status === 'ACTION') return 'text-red-400';
      if (status === 'WATCH') return 'text-orange-400';
      return 'text-gray-400';
    };

    return (
      <div className="flex-1">
        {/* Subject Header */}
        <div className="mb-6 border-b-4 border-gray-200 pb-3">
          <h3 className="text-2xl font-black text-gray-800 tracking-tight">
            {subjectData.subject_name} <span className="text-gray-primary font-medium ml-1"> | {subjectData.class_name}-{subjectData.section_name}</span>
          </h3>
          <div className="flex items-center gap-4 mt-1 text-[12px] font-bold tracking-tight text-gray-700 ">
            <span>Syllabus: <span className="text-gray-500 font-medium">{subjectData.overall_completion_pct || 0}% complete</span></span>
            <span className="h-3 w-[1px] bg-gray-300"></span>
            <span>{subjectData.completed_chapters || 0} of {subjectData.total_chapters || 0} chapters</span>
          </div>
        </div>

        {/* Progress Bars List */}
        <div className="space-y-4">
          {chapters.map((chapter: any, i: number) => (
            <div key={i} className="flex items-center gap-2 group py-1">
              {/* Chapter Name */}
              <span className={`w-32 text-sm font-bold leading-tight ${chapter.completion_pct === 0 ? 'text-gray-300 italic' : 'text-gray-700'}`}>
                {chapter.chapter_name}
              </span>

              {/* Progress Bar Container */}
              <div className="flex-1 h-4 bg-gray-200 rounded-full relative overflow-hidden shadow-inner">
                {chapter.completion_pct > 0 ? (
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ${getStatusColor(chapter.status)}`} 
                    style={{ width: `${chapter.completion_pct}%` }} 
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center">
                    <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest ">Not started</span>
                  </div>
                )}
                
                {/* Benchmark marker line - thin vertical line as seen in dummy */}
                <div className="absolute left-[80%] top-0 bottom-0 w-[2px] bg-gray-400/40 z-10" />
              </div>

              {/* Percentage Display */}
              <div className="w-16 flex items-baseline justify-end gap-0.5">
                <span className={`text-2xl font-black ${chapter.completion_pct === 0 ? 'text-gray-200' : getStatusTextColor(chapter.status)}`}>
                  {chapter.completion_pct}
                </span>
                <span className={`text-[10px] font-bold ${chapter.completion_pct === 0 ? 'text-gray-200' : getStatusTextColor(chapter.status)} opacity-70`}>%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="animate-in fade-in duration-500 pr-6 pl-6">
      {/* 2. Main White Card */}
      <div className=" border border-gray-100 p-3">
        {/* 1. Page Title */}
        <div className="mb-8 pl-2">
          <h2 className="text-2xl font-black text-cyan-600 ">Syllabus Coverage</h2>
          <p className="text-xs text-gray-400 font-bold tracking-tight">
            Chapter-level progress vs academic benchmark
          </p>
        </div>

        <div className="flex flex-col xl:flex-row gap-16">
          {/* Render subjects dynamically */}
          {syllabusData.map((subject: any, idx: number) => (
            <div key={idx} className="flex-1 min-w-[350px]">
              {renderColumn(subject)}
            </div>
          ))}
          
          {/* If only one subject, render placeholder for second column */}
          {syllabusData.length === 1 && (
            <div className="flex-1">
              <div className="text-center text-gray-400 py-8">
                <p className="text-sm font-bold">No additional subjects</p>
              </div>
            </div>
          )}
        </div>

        {/* 3. Legend Section */}
        <div className="mt-12 pt-8 border-t border-gray-100 flex justify-center gap-10 items-center">
          {[
            { color: 'bg-green-600', label: '≥ Benchmark' },
            { color: 'bg-orange-400', label: 'Within 10%' },
            { color: 'bg-red-400', label: 'Below 10%+' },
            { color: 'bg-gray-200', label: 'Not Started' },
          ].map((dot, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${dot.color}`} />
              <span className="text-[11px] font-black text-gray-400 uppercase tracking-wider">{dot.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SyllabusTab;