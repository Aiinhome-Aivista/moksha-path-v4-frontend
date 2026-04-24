import React, { useState, useRef, useEffect } from "react";
import { Loader2 } from "lucide-react";

interface Props {
    board: string;
    className: string;

    boardOptions: string[];
    classOptions: string[];
    subjectOptions: string[];

    setBoard?: (v: string) => void;
    setClassName?: (v: string) => void;
    setSubject?: (v: string) => void;

    activeSubject: string;
    isLoading?: boolean;
}

const MaterialsSidebar: React.FC<Props> = ({
    board,
    className,
    boardOptions,
    classOptions,
    activeSubject: subject,
    subjectOptions,
    setBoard,
    setClassName,
    setSubject,
    isLoading,
}) => {

    // 🔥 dropdown states
    const [isBoardOpen, setIsBoardOpen] = useState(false);
    const [isClassOpen, setIsClassOpen] = useState(false);
    const [isSubjectOpen, setIsSubjectOpen] = useState(false);

    // 🔥 refs
    const boardRef = useRef<HTMLDivElement>(null);
    const classRef = useRef<HTMLDivElement>(null);
    const subjectRef = useRef<HTMLDivElement>(null);

    // 🔥 close on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (!boardRef.current?.contains(e.target as Node)) setIsBoardOpen(false);
            if (!classRef.current?.contains(e.target as Node)) setIsClassOpen(false);
            if (!subjectRef.current?.contains(e.target as Node)) setIsSubjectOpen(false);
        };

        const handleScroll = () => {
            setIsBoardOpen(false);
            setIsClassOpen(false);
            setIsSubjectOpen(false);
        };

        document.addEventListener("mousedown", handleClickOutside);
        window.addEventListener("scroll", handleScroll);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);

    return (
        <div className="w-[280px] flex-shrink-0">
            {/* Tutor Image */}
            <div className="flex justify-start mb-2">
                <img src="/Guy.svg" alt="Tutor" />
            </div>

            {/* Filters */}
            <div className="flex gap-3 w-64 flex-col">

                {/* ================= BOARD ================= */}
                <div className="relative" ref={boardRef}>
                    <p className="text-sm font-semibold text-gray-800 mb-1">
                        Choose Your Board
                    </p>

                    <div className="w-full flex items-center pb-2 border-b border-gray-300 text-sm font-medium">
                        {setBoard && boardOptions ? (
                            <button
                                type="button"
                                onClick={() => setIsBoardOpen(!isBoardOpen)}
                                className="w-full flex justify-between items-center text-left pl-0 pr-3 text-gray-700"
                            >
                                <span>{board || "Select Board"}</span>
                                <span
                                    className={`material-symbols-outlined transition-transform ${isBoardOpen ? "rotate-180" : ""
                                        }`}
                                >
                                    expand_more
                                </span>
                            </button>
                        ) : (
                            <span className="text-gray-700">{board}</span>
                        )}
                    </div>

                    {isBoardOpen && boardRef.current && (
                        <div
                            className="fixed z-[9999] bg-white shadow-lg rounded-md border max-h-[250px] overflow-y-auto"
                            style={{
                                top: boardRef.current.getBoundingClientRect().bottom + 4,
                                left: boardRef.current.getBoundingClientRect().left,
                                width: boardRef.current.offsetWidth,
                            }}
                        >
                            {boardOptions.length > 0 ? (
                                boardOptions.map((b) => (
                                    <div
                                        key={b}
                                        onClick={() => {
                                            setBoard?.(b);
                                            setIsBoardOpen(false);
                                        }}
                                        className="px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer"
                                    >
                                        {b}
                                    </div>
                                ))
                            ) : (
                                <div className="px-3 py-2 text-gray-400 text-sm italic">
                                    No boards available
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* ================= CLASS ================= */}
                <div className="relative" ref={classRef}>
                    <p className="text-sm font-semibold text-gray-800 mb-1">
                        Choose Class / Standard
                    </p>

                    <div className="w-full flex items-center pb-2 border-b border-gray-300 text-sm font-medium">
                        {setClassName && classOptions ? (
                            <button
                                type="button"
                                onClick={() => setIsClassOpen(!isClassOpen)}
                                className="w-full flex justify-between items-center text-left pl-0 pr-3 text-gray-700"
                            >
                                <span>{className || "Select Class"}</span>
                                <span
                                    className={`material-symbols-outlined transition-transform ${isClassOpen ? "rotate-180" : ""
                                        }`}
                                >
                                    expand_more
                                </span>
                            </button>
                        ) : (
                            <span className="text-gray-700">{className}</span>
                        )}
                    </div>

                    {isClassOpen && classRef.current && (
                        <div
                            className="fixed z-[9999] bg-white shadow-lg rounded-md border max-h-[250px] overflow-y-auto"
                            style={{
                                top: classRef.current.getBoundingClientRect().bottom + 4,
                                left: classRef.current.getBoundingClientRect().left,
                                width: classRef.current.offsetWidth,
                            }}
                        >
                            {classOptions.length > 0 ? (
                                classOptions.map((c) => (
                                    <div
                                        key={c}
                                        onClick={() => {
                                            setClassName?.(c);
                                            setIsClassOpen(false);
                                        }}
                                        className="px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer"
                                    >
                                        {c}
                                    </div>
                                ))
                            ) : (
                                <div className="px-3 py-2 text-gray-400 text-sm italic">
                                    No classes available
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* ================= SUBJECT ================= */}
                <div className="relative" ref={subjectRef}>
                    {isLoading && (
                        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60">
                            <Loader2 size={24} className="animate-spin text-primary" />
                        </div>
                    )}

                    <p className="text-sm font-semibold text-gray-800 mb-1">
                        Choose Subject
                    </p>

                    <div className="w-full flex items-center pb-2 border-b border-gray-300 text-sm font-medium">
                        {setSubject && subjectOptions ? (
                            <button
                                type="button"
                                onClick={() => setIsSubjectOpen(!isSubjectOpen)}
                                className="w-full flex justify-between items-center text-left pl-0 pr-3 text-gray-700"
                            >
                                <span>{subject || "Select Subject"}</span>
                                <span
                                    className={`material-symbols-outlined transition-transform ${isSubjectOpen ? "rotate-180" : ""
                                        }`}
                                >
                                    expand_more
                                </span>
                            </button>
                        ) : (
                            <span className="text-gray-700">{subject}</span>
                        )}
                    </div>

                    {isSubjectOpen && subjectRef.current && (
                        <div
                            className="fixed z-[9999] bg-white shadow-lg rounded-md border max-h-[250px] overflow-y-auto"
                            style={{
                                top: subjectRef.current.getBoundingClientRect().bottom + 4,
                                left: subjectRef.current.getBoundingClientRect().left,
                                width: subjectRef.current.offsetWidth,
                            }}
                        >
                            {subjectOptions.length > 0 ? (
                                subjectOptions.map((s) => (
                                    <div
                                        key={s}
                                        onClick={() => {
                                            setSubject?.(s);
                                            setIsSubjectOpen(false);
                                        }}
                                        className="px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer"
                                    >
                                        {s}
                                    </div>
                                ))
                            ) : (
                                <div className="px-3 py-2 text-gray-400 text-sm italic">
                                    No subjects available
                                </div>
                            )}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default MaterialsSidebar;