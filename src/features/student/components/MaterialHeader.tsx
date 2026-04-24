import React from "react";
import { RotateCcw } from "lucide-react";

interface Props {
    subjects: string[];
    activeSubject: string;
    setActiveSubject: (v: string) => void;
    resourceTypes: string[];
    activeResourceType: string;
    setActiveResourceType: (v: string) => void;
    onRefresh?: () => void;
    isRefreshing?: boolean;
}

const MaterialsHeader: React.FC<Props> = ({
    // subjects,
    // activeSubject,
    // setActiveSubject,
    resourceTypes,
    activeResourceType,
    setActiveResourceType,
    onRefresh,
    isRefreshing = false,
}) => {


    return (
        <div className="mb-6">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 mb-1">
                        Learn through <span className="text-[#57A7B3]">Videos</span>,
                        <span className="text-[#57A7B3]"> Notes</span>, and
                        <span className="text-[#57A7B3]"> Structured Resources</span>
                    </h1>
                    <p className="text-sm text-gray-500">
                        Access high-quality video lessons, learning materials, and notes -
                        organised by subject, chapter, and difficulty level.
                    </p>
                </div>
            </div>

            {/* Resource Types */}
            <div className="flex justify-between items-center">
            <div className="flex gap-2">
                {resourceTypes.map((type) => (
                    <button
                        key={type}
                        onClick={() => setActiveResourceType(type)}
                        className={`px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 ${activeResourceType === type
                            ? "bg-[#A3C627] text-white"
                            : "bg-[#464646] text-white hover:bg-[#555555]"
                            }`}
                    >
                        {type}
                    </button>
                ))}  
            </div>
             <div className="flex items-center justify-end gap-2">
                    {onRefresh && (
                        <button
                            onClick={onRefresh}
                            disabled={isRefreshing}
                            className="flex items-center gap-2 px-4 py-2 bg-primary border border-gray-200 rounded-full text-sm font-medium text-white hover:bg-[#A3C627] hover:text-white hover:border-[#F27927]/30 transition-all duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed group border-none cursor-pointer"
                            title="Refresh Materials"
                        >
                            <RotateCcw
                                size={16}
                                className={`${isRefreshing ? "animate-spin" : "group-hover:rotate-180"} transition-transform duration-500`}
                            />
                            <span>{isRefreshing ? "Refreshing..." : "Refresh"}</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MaterialsHeader;
