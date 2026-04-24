import React from "react";
import { Check } from "lucide-react";

interface Props {
    board: string;
    className: string;
    section?: string;

    boardOptions?: string[];
    classOptions?: string[];
    sectionOptions?: string[];

    setBoard?: (v: string) => void;
    setClassName?: (v: string) => void;
    setSection?: (v: string) => void;

    activeSubject: string;
    chapters: { name: string; topics?: { name: string; topic_id?: number }[] }[];
    coreTopics: { name: string; topic_id?: number }[];

    selectedChapters: number[];
    setSelectedChapters: (v: number[]) => void;
    selectedTopics: number[];
    setSelectedTopics: (v: number[]) => void;
}

const InstituteAdminMaterialSidebar: React.FC<Props> = ({
    board,
    className,
    section,
    boardOptions,
    classOptions,
    sectionOptions,
    setBoard,
    setClassName,
    setSection,
    activeSubject: _activeSubject, // currently unused but may be useful later
    chapters,
    coreTopics,
    selectedChapters,
    setSelectedChapters,
    selectedTopics,
    setSelectedTopics,
}) => {

    // Handle chapter selection toggle
    const toggleChapterSelection = (index: number) => {
        if (selectedChapters.includes(index)) {
            setSelectedChapters(selectedChapters.filter((i) => i !== index));
        } else {
            setSelectedChapters([...selectedChapters, index]);
        }
    };

    // Handle select all chapters
    const toggleSelectAllChapters = () => {
        if (selectedChapters.length === chapters.length) {
            setSelectedChapters([]);
        } else {
            setSelectedChapters(chapters.map((_, index) => index));
        }
    };

    // Handle topic selection toggle
    const toggleTopicSelection = (index: number) => {
        if (selectedTopics.includes(index)) {
            setSelectedTopics(selectedTopics.filter((i) => i !== index));
        } else {
            setSelectedTopics([...selectedTopics, index]);
        }
    };

    // Handle select all topics
    const toggleSelectAllTopics = () => {
        if (selectedTopics.length === coreTopics.length) {
            setSelectedTopics([]);
        } else {
            setSelectedTopics(coreTopics.map((_, index) => index));
        }
    };

    return (
        <div className="w-[280px] flex-shrink-0">
            {/* Tutor Image */}
            <div className="flex justify-start mb-2">
                <img src="/guy.svg" alt="Tutor" />
            </div>

            {/* Filters */}
            <div className="flex gap-2 w-64 flex-col">
                {/* Board */}
                <div className="relative">
                    <p className="text-sm font-semibold text-gray-800 mb-1"> Choose Your Board</p>
                    <div className="w-full flex items-center pb-2 border-b border-gray-300 text-sm font-medium">
                        {setBoard && boardOptions ? (
                            <select
                                value={board}
                                onChange={(e) => setBoard(e.target.value)}
                                className="text-sm bg-white"
                            >
                                {boardOptions.map((b) => (
                                    <option key={b} value={b}>
                                        {b}
                                    </option>
                                ))}
                            </select>
                        ) : (
                            <span className="text-gray-700">{board}</span>
                        )}
                    </div>
                </div>

                {/* Class */}
                <div className="relative">
                    <p className="text-sm font-semibold text-gray-800 mb-1">Choose Class / Standard</p>
                    <div className="w-full flex items-center pb-2 border-b border-gray-300 text-sm font-medium">
                        {setClassName && classOptions ? (
                            <select
                                value={className}
                                onChange={(e) => setClassName(e.target.value)}
                                className="text-sm bg-white"
                            >
                                {classOptions.map((c) => (
                                    <option key={c} value={c}>
                                        {c}
                                    </option>
                                ))}
                            </select>
                        ) : (
                            <span className="text-gray-700">{className}</span>
                        )}
                    </div>
                </div>

                {/* Section (optional) */}
                {setSection && sectionOptions && (
                    <div className="relative">
                        <p className="text-sm font-semibold text-gray-800 mb-1">Choose your Section</p>
                        <div className="w-full flex items-center pb-2 border-b border-gray-300 text-sm font-medium">
                            <select
                                value={section || ""}
                                onChange={(e) => setSection(e.target.value)}
                                className="text-sm bg-white"
                            >
                                <option value="">All</option>
                                {sectionOptions.map((s) => (
                                    <option key={s} value={s}>
                                        {s}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                )}

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
            <div className="mb-6 pt-2">
                <div className="flex justify-between items-center mb-3">
                    <h3 className="font-semibold text-gray-800"> Chapters</h3>
                    <button
                        onClick={toggleSelectAllChapters}
                        className={`flex items-center gap-1 text-xs px-2 py-1 rounded transition-colors ${
                            selectedChapters.length === chapters.length && chapters.length > 0
                                ? "bg-button-primary text-white"
                                : "text-gray-500 hover:bg-gray-100"
                        }`}
                    >
                        <Check size={12} /> {selectedChapters.length === chapters.length && chapters.length > 0 ? "All Selected" : "Select All"}
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
                                        ? "bg-button-primary text-white"
                                        : "bg-primary text-white hover:bg-secondary"
                                }`}
                            >
                                {chapter.name}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {/* Core Topics */}
            <div>
                <div className="flex justify-between items-center mb-3">
                    <h3 className="font-semibold text-gray-800">Core Topics</h3>
                    <button
                        onClick={toggleSelectAllTopics}
                        className={`flex items-center gap-1 text-xs px-2 py-1 rounded transition-colors ${
                            selectedTopics.length === coreTopics.length && coreTopics.length > 0
                                ? "bg-button-primary text-white"
                                : "text-gray-500 hover:bg-gray-100"
                        }`}
                    >
                        <Check size={12} /> {selectedTopics.length === coreTopics.length && coreTopics.length > 0 ? "All Selected" : "Select All"}
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
                                        ? "bg-button-primary text-white"
                                        : "bg-primary text-white hover:bg-secondary"
                                }`}
                            >
                                {topic.name}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InstituteAdminMaterialSidebar;
