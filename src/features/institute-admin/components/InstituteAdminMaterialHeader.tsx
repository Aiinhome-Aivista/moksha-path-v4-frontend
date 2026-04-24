import React from "react";
// import IconChat from "../../../assets/icon/chat2.svg";

interface Props {
    subjects: string[];
    activeSubject: string;
    setActiveSubject: (v: string) => void;
    resourceTypes: string[];
    activeResourceType: string;
    setActiveResourceType: (v: string) => void;
}

const InstituteAdminMaterialHeader: React.FC<Props> = ({
    subjects,
    activeSubject,
    setActiveSubject,
    resourceTypes,
    activeResourceType,
    setActiveResourceType,
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

            {/* Subjects */}
            <div className="flex flex-wrap gap-2 mb-4">
                {subjects.map((subject) => (
                    <button
                        key={subject}
                        onClick={() => setActiveSubject(subject)}
                        className={`text-xs px-4 py-2 rounded-full ${activeSubject === subject
                            ? "bg-button-primary text-white"
                            : "bg-primary text-white hover:bg-secondary"
                            }`}
                    >
                        {subject}
                    </button>
                ))}
            </div>

            {/* Resource Types */}
            <div className="flex gap-2">
                {resourceTypes.map((type) => (
                    <button
                        key={type}
                        onClick={() => setActiveResourceType(type)}
                        className={`px-4 py-2 rounded-full text-sm font-medium ${activeResourceType === type
                            ? "bg-[#A3C627] text-white"
                            : "bg-[#464646] text-white hover:bg-[#555555]"
                            }`}
                    >
                        {type}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default InstituteAdminMaterialHeader;
