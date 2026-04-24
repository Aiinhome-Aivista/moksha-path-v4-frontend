import React, { useState, useRef, useEffect } from "react";
//import { Check } from "lucide-react";

interface Props {
  board: string;
  className: string;
  activeSubject: string;
  chapters: { name: string }[];
  coreTopics: { name: string }[];

  selectedChapters: number[];
  setSelectedChapters: (v: number[]) => void;
  selectedTopics: number[];
  setSelectedTopics: (v: number[]) => void;
  sectionName: (string | { section_id: number; section_name: string })[];
  subjects: string[];
  setActiveSubject: (subject: string) => void;
}

const MaterialsSidebar: React.FC<Props> = ({
  board,
  className,
  // chapters,
  // coreTopics,
  // selectedChapters,
  // setSelectedChapters,
  // selectedTopics,
  // setSelectedTopics,
  // sectionName,
  subjects,
  activeSubject,
  setActiveSubject,
}) => {
  const [isSubjectDropdownOpen, setIsSubjectDropdownOpen] = useState(false);
  const subjectDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        subjectDropdownRef.current &&
        !subjectDropdownRef.current.contains(event.target as Node)
      ) {
        setIsSubjectDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Prevent body scroll when dropdown is open
  useEffect(() => {
    const handleScroll = () => setIsSubjectDropdownOpen(false);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  // useEffect(() => {
  //   if (isSubjectDropdownOpen) {
  //     const scrollY = window.scrollY;
  //     document.body.style.position = "fixed";
  //     document.body.style.top = `-${scrollY}px`;
  //     document.body.style.width = "100%";
  //     document.body.style.overflow = "hidden";
  //   } else {
  //     const scrollY = document.body.style.top;
  //     document.body.style.position = "";
  //     document.body.style.top = "";
  //     document.body.style.width = "";
  //     document.body.style.overflow = "";
  //     window.scrollTo(0, parseInt(scrollY || "0", 10) * -1);
  //   }
  //   return () => {
  //     document.body.style.position = "";
  //     document.body.style.top = "";
  //     document.body.style.width = "";
  //     document.body.style.overflow = "";
  //   };
  // }, [isSubjectDropdownOpen]);

  // Handle chapter selection toggle
  // const toggleChapterSelection = (index: number) => {
  //   if (selectedChapters.includes(index)) {
  //     setSelectedChapters(selectedChapters.filter((i) => i !== index));
  //   } else {
  //     setSelectedChapters([...selectedChapters, index]);
  //   }
  // };

  // Handle select all chapters
  // const toggleSelectAllChapters = () => {
  //   if (selectedChapters.length === chapters.length) {
  //     setSelectedChapters([]);
  //   } else {
  //     setSelectedChapters(chapters.map((_, index) => index));
  //   }
  // };

  // Handle topic selection toggle
  // const toggleTopicSelection = (index: number) => {
  //   if (selectedTopics.includes(index)) {
  //     setSelectedTopics(selectedTopics.filter((i) => i !== index));
  //   } else {
  //     setSelectedTopics([...selectedTopics, index]);
  //   }
  // };

  // Handle select all topics
  // const toggleSelectAllTopics = () => {
  //   if (selectedTopics.length === coreTopics.length) {
  //     setSelectedTopics([]);
  //   } else {
  //     setSelectedTopics(coreTopics.map((_, index) => index));
  //   }
  // };

  return (
    <div className="w-[280px] flex-shrink-0 overflow-visible relative z-[100]">
      {/* Tutor Image */}
      <div className="flex justify-start mb-2">
        <img src="/Guy.svg" alt="Tutor" />
      </div>

      {/* Filters */}
      <div className="flex gap-2 w-64 flex-col">
        {/* Board */}
        <div className="relative">
          <p className="text-sm font-semibold text-gray-800 mb-1">
            {" "}
            Your Board
          </p>
          <div className="w-full flex items-center pb-2 border-b border-gray-300 text-sm font-medium">
            <span className="text-gray-700">{board}</span>
          </div>
        </div>

        {/* Class */}
        <div className="relative">
          <p className="text-sm font-semibold text-gray-800 mb-1">
            Class / Standard
          </p>
          <div className="w-full flex items-center pb-2 border-b border-gray-300 text-sm font-medium">
            <span className="text-gray-700">{className}</span>
          </div>
        </div>
        {/* Section */}
        {/* <div className="relative">
          <p className="text-sm font-semibold text-gray-800 mb-1">Section</p>
          <div className="w-full flex items-center pb-2 border-b border-gray-300 text-sm font-medium">
            <span className="text-gray-700">
              {sectionName?.length
                ? sectionName.map((s) => (typeof s === "string" ? s : s.section_name)).join(", ")
                : "N/A"}
            </span>
          </div>
        </div> */}
        {/* Subject */}
        <div className="relative" ref={subjectDropdownRef}>
          <p className="text-sm font-semibold text-gray-800 mb-1">Subject</p>
          <div className="w-full flex items-center pb-2 border-b border-gray-300 text-sm font-medium">
            <button
              type="button"
              onClick={() => setIsSubjectDropdownOpen(!isSubjectDropdownOpen)}
              className="w-full bg-transparent border-none text-gray-700 focus:outline-none cursor-pointer flex justify-between items-center text-left pl-0 pr-4"
            >
              <span className="truncate">{activeSubject || "Select a subject"}</span>
              <span className={`material-symbols-outlined text-gray-500 transition-transform duration-200 ${isSubjectDropdownOpen ? 'rotate-180' : ''}`}>expand_more</span>
            </button>
          </div>
          {isSubjectDropdownOpen && subjectDropdownRef.current && (
            <div
              className="fixed z-[9999] bg-white shadow-lg rounded-md overflow-y-auto border border-gray-100"
              style={{
                top:
                  subjectDropdownRef.current.getBoundingClientRect().bottom + 4,
                left:
                  subjectDropdownRef.current.getBoundingClientRect().left,
                width: subjectDropdownRef.current.offsetWidth,
                maxHeight: "250px",
              }}
            >              {subjects.length > 0 ? (
              subjects.map((subject) => (
                <div
                  key={subject}
                  onClick={() => {
                    setActiveSubject(subject);
                    setIsSubjectDropdownOpen(false);
                  }}
                  className="pl-3 pr-3 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                >
                  {subject}
                </div>
              ))
            ) : (
              <div className="px-4 py-2 text-sm text-gray-400 italic">
                No subjects available
              </div>
            )}
            </div>
          )}
        </div>

        {/* Difficulty */}
        {/* <div className="relative">
                    <p className="text-xs text-gray-500 mb-1">Difficulty Level</p>
                    <button
                        onClick={() => {
                            setOpenDifficulty(!openDifficulty);
                        }}
                        className="w-full flex justify-between items-center pb-2 border-b border-gray-300 text-sm font-medium"
                    >
                        <span>{difficulty}</span>
                        <ChevronDown size={16} />
                    </button>

                    {openDifficulty && (
                        <div className="absolute z-10 mt-2 w-full bg-white shadow-md rounded-md">
                            {["Easy", "Medium", "Difficult"].map((item) => (
                                <div
                                    key={item}
                                    onClick={() => {
                                        setDifficulty(item);
                                        setOpenDifficulty(false);
                                    }}
                                    className="px-4 py-2 text-sm cursor-pointer hover:bg-gray-100"
                                >
                                    {item}
                                </div>
                            ))}
                        </div>
                    )}
                </div> */}
      </div>

      {/* Chapters */}
      {/* <div className="mb-6 pt-2">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-semibold text-gray-800"> Chapters</h3>
          <button
            onClick={toggleSelectAllChapters}
            className={`flex items-center gap-1 text-xs px-2 py-1 rounded transition-colors ${
              selectedChapters.length === chapters.length && chapters.length > 0
                ? "bg-button-primary text-primary font-bold"
                : "text-gray-500 font-bold hover:bg-gray-100"
            }`}
          >
            <Check size={12} />{" "}
            {selectedChapters.length === chapters.length && chapters.length > 0
              ? "All Selected"
              : "Select All"}
          </button>
        </div>

        <div className="max-h-56 overflow-y-auto pr-2">
          <div className="flex flex-col gap-2">
            {chapters.map((chapter, index) => (
              <span
                key={index}
                onClick={() => toggleChapterSelection(index)}
                className={`w-fit text-xs px-4 py-2 rounded-full cursor-pointer transition-colors ${
                  selectedChapters.includes(index)
                    ? "bg-button-primary text-primary font-bold"
                    : "bg-primary text-white font-semibold hover:bg-secondary"
                }`}
              >
                {chapter.name}
              </span>
            ))}
          </div>
        </div>
      </div> */}

      {/* Core Topics */}
      {/* <div>
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-semibold text-gray-800">Core Topics</h3>
          <button
            onClick={toggleSelectAllTopics}
            className={`flex items-center gap-1 text-xs px-2 py-1 rounded transition-colors ${
              selectedTopics.length === coreTopics.length &&
              coreTopics.length > 0
                ? "bg-button-primary text-primary font-bold"
                : "text-gray-500 font-bold hover:bg-gray-100"
            }`}
          >
            <Check size={12} />{" "}
            {selectedTopics.length === coreTopics.length &&
            coreTopics.length > 0
              ? "All Selected"
              : "Select All"}
          </button>
        </div>

        <div className="max-h-56 overflow-y-auto pr-2">
          <div className="flex flex-col gap-2">
            {coreTopics.map((topic, index) => (
              <span
                key={index}
                onClick={() => toggleTopicSelection(index)}
                className={`w-fit text-xs px-4 py-2 rounded-full cursor-pointer transition-colors ${
                  selectedTopics.includes(index)
                    ? "bg-button-primary text-primary font-bold"
                    : "bg-primary text-white font-semibold hover:bg-secondary"
                }`}
              >
                {topic.name}
              </span>
            ))}
          </div>
        </div>
      </div> */}
    </div>
  );
};

export default MaterialsSidebar;
