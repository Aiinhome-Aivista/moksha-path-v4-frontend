import React, { useState, useEffect } from "react";
import ApiServices from "../../../services/ApiServices";
import { Loader2 } from "lucide-react";
import SearchableSelect from "../../../components/common/SearchableSelect";

interface Board {
    id: number;
    name: string;
}

interface School {
    id: number;
    name: string;
}

interface ClassItem {
    id: number;
    name: string;
}

interface AcademicYear {
    year: string;
}

interface Subject {
    subject_id: number;
    subject_name: string;
}

interface SubscriptionSetupModalProps {
    isOpen: boolean;
    initialData?: {
        board_id?: number | "";
        class_id?: number | "";
        institute_id?: number | "";
    };
    onConfirm: (data: {
        selectedBoard: number;
        selectedSchool: number | "";
        selectedClass: number;
        selectedYear: string;
        sheetCount: number;
        selectedSubjects: Subject[];
        availableSubjects: Subject[];
        boards: Board[];
        schools: School[];
        classes: ClassItem[];
        academicYears: AcademicYear[];
    }) => void;
}

const SubscriptionSetupModal: React.FC<SubscriptionSetupModalProps> = ({
    isOpen,
    initialData,
    onConfirm,
}) => {
    // Master data
    const [boards, setBoards] = useState<Board[]>([]);
    const [schools, setSchools] = useState<School[]>([]);
    const [classes, setClasses] = useState<ClassItem[]>([]);
    const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
    const [isMasterLoading, setIsMasterLoading] = useState(true);

    // Selections
    const [selectedBoard, setSelectedBoard] = useState<number | "">(initialData?.board_id || "");
    const [selectedSchool, setSelectedSchool] = useState<number | "">(initialData?.institute_id || "");
    const [selectedClass, setSelectedClass] = useState<number | "">(initialData?.class_id || "");
    const [selectedYear, setSelectedYear] = useState("");
    // Seats
    const localUser = JSON.parse(localStorage.getItem("user") || "{}");
    const isStudent = localUser.role === "student";
    const [sheetCount, setSheetCount] = useState(isStudent ? 1 : 1);
    const [availableSubjects, setAvailableSubjects] = useState<Subject[]>([]);
    const [selectedSubjects, setSelectedSubjects] = useState<Subject[]>([]);
    const [isSubjectsLoading, setIsSubjectsLoading] = useState(false);

    // Add school
    const [showAddSchoolInput, setShowAddSchoolInput] = useState(false);
    const [newSchoolName, setNewSchoolName] = useState("");
    const [isAddingSchool, setIsAddingSchool] = useState(false);

    // Fetch master data on mount
    useEffect(() => {
        const fetchMasterData = async () => {
            setIsMasterLoading(true);
            try {
                const response = await ApiServices.getAcademicMasterData();
                if (response.data?.status === "success") {
                    const data = response.data.data;
                    setBoards(data.boards || []);
                    setSchools(data.schools || []);
                    setClasses(data.classes || []);
                    setAcademicYears(data.academic_years || []);
                }
            } catch (error) {
                // console.error("Failed to load academic master data", error);
            } finally {
                setIsMasterLoading(false);
            }
        };

        if (isOpen) {
            fetchMasterData();
        }
    }, [isOpen]);

    // Fetch subjects when board+class+year selected
    useEffect(() => {
        if (!selectedBoard || !selectedClass || !selectedYear) {
            setAvailableSubjects([]);
            setSelectedSubjects([]);
            return;
        }

        const fetchSubjects = async () => {
            setIsSubjectsLoading(true);
            try {
                const payload = {
                    board_name: selectedBoard,
                    class_name: selectedClass,
                    institute_name: selectedSchool || null,
                    academic_year: selectedYear,
                };

                const response = await ApiServices.getSubjectsByBoards(payload);
                if (response.data?.status === "success") {
                    setAvailableSubjects(response.data.data.subjects || []);
                    setSelectedSubjects([]);
                }
            } catch (err) {
                // console.error("Failed to fetch subjects", err);
            } finally {
                setIsSubjectsLoading(false);
            }
        };

        fetchSubjects();
    }, [selectedBoard, selectedClass, selectedSchool, selectedYear]);

    const handleAddSchool = async () => {
        if (!newSchoolName.trim()) return;
        setIsAddingSchool(true);
        try {
            const res = await ApiServices.addInstitute({
                school_name: newSchoolName.trim(),
            });
            if (res.data?.status === "success") {
                const newSchool = res.data.data;
                setSchools((prev) => [...prev, newSchool]);
                setSelectedSchool(newSchool.id);
                setNewSchoolName("");
                setShowAddSchoolInput(false);
            }
        } catch (error) {
            // console.error("Failed to add school", error);
        } finally {
            setIsAddingSchool(false);
        }
    };

    const toggleSubject = (subject: Subject) => {
        setSelectedSubjects((prev) => {
            const exists = prev.some((s) => s.subject_id === subject.subject_id);
            if (exists) {
                return prev.filter((s) => s.subject_id !== subject.subject_id);
            }
            return [...prev, subject];
        });
    };

    const canProceed =
        selectedBoard &&
        selectedClass &&
        selectedYear &&
        selectedSubjects.length > 0;

    const handleConfirm = () => {
        if (!canProceed) return;
        onConfirm({
            selectedBoard: selectedBoard as number,
            selectedSchool,
            selectedClass: selectedClass as number,
            selectedYear,
            sheetCount,
            selectedSubjects,
            availableSubjects,
            boards,
            schools,
            classes,
            academicYears,
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/40 touch-none" />

            {/* Modal */}
            <div className="relative bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-4xl w-full min-h-0 sm:min-h-[32rem] max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col md:flex-row">

                {/* Left decorative panel */}
                <div className="hidden md:flex md:w-[38%] bg-[#f5f7fa] items-center justify-center p-6">
                    <div className="relative w-full max-w-sm text-center">
                        <img
                            src="/image84.svg"
                            alt="Academic Illustration"
                            className="w-full h-auto"
                        />
                    </div>
                </div>

                {/* Right form panel */}
                <div className="w-full md:w-[62%] p-5 sm:p-8 overflow-y-auto custom-scrollbar">
                    <h2 className="text-2xl sm:text-3xl font-bold text-primary mb-1 pr-8 sm:pr-0">
                        Set Up Your Subscription
                    </h2>
                    <p className="text-sm text-gray-500 mb-6">
                        Select your academic details to view plans
                    </p>

                    {isMasterLoading ? (
                        <div className="flex items-center justify-center py-16 gap-3">
                            <Loader2 className="w-6 h-6 animate-spin text-primary" />
                            <span className="text-sm text-gray-500">
                                Loading academic data...
                            </span>
                        </div>
                    ) : (
                        <div className="space-y-5">
                            {(() => {
                                return (
                                    <>
                                        {/* Board & School Row */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                            <div>
                                                <label className="block text-sm font-medium text-primary mb-2">
                                                    Choose Your Board <span className="text-red-500">*</span>
                                                </label>
                                                <SearchableSelect
                                                    value={selectedBoard}
                                                    onChange={(val) => {
                                                        if (val === "") {
                                                            setSelectedBoard("");
                                                            setSelectedSchool("");
                                                            setSelectedClass("");
                                                            setSelectedYear("");
                                                            setSelectedSubjects([]);
                                                            setAvailableSubjects([]);
                                                        } else {
                                                            setSelectedBoard(Number(val));
                                                        }
                                                    }}
                                                    options={boards.map((b) => ({ value: b.id, label: b.name }))}
                                                    placeholder="Select Board"
                                                    className="w-full py-2 border-b border-gray-300 text-primary bg-transparent focus:outline-none focus:border-gray-500 text-base"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-primary mb-2">
                                                    Choose Your School
                                                </label>
                                                <SearchableSelect
                                                    value={selectedSchool}
                                                    onChange={(val) => {
                                                        if (val === "ADD_NEW") {
                                                            setShowAddSchoolInput(true);
                                                            setSelectedSchool("");
                                                        } else if (val === "") {
                                                            setSelectedBoard("");
                                                            setSelectedSchool("");
                                                            setSelectedClass("");
                                                            setSelectedYear("");
                                                            setSelectedSubjects([]);
                                                            setAvailableSubjects([]);
                                                            setShowAddSchoolInput(false);
                                                        } else {
                                                            setSelectedSchool(Number(val));
                                                            setShowAddSchoolInput(false);
                                                        }
                                                    }}
                                                    options={[
                                                        ...schools.map((s) => ({ value: s.id, label: s.name })),
                                                        { value: "ADD_NEW", label: "➕ Add New School" }
                                                    ]}
                                                    placeholder="Select School"
                                                    className="w-full py-2 border-b border-gray-300 text-primary bg-transparent focus:outline-none focus:border-gray-500 text-base"
                                                />

                                                {showAddSchoolInput && (
                                                    <div className="mt-3 flex gap-2">
                                                        <input
                                                            value={newSchoolName}
                                                            onChange={(e) => setNewSchoolName(e.target.value)}
                                                            placeholder="Enter school name"
                                                            className="flex-1 py-2 border-b border-gray-300 text-primary placeholder-gray-400 focus:outline-none focus:border-gray-500 bg-transparent text-sm"
                                                        />
                                                        <button
                                                            onClick={handleAddSchool}
                                                            disabled={isAddingSchool}
                                                            className="px-4 py-1.5 rounded-full text-xs font-medium bg-primary text-white hover:opacity-90 transition-colors disabled:opacity-50"
                                                        >
                                                            {isAddingSchool ? "Adding..." : "Add"}
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Class & Year Row */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                            <div>
                                                <label className="block text-sm font-medium text-primary mb-2">
                                                    Class / Standard <span className="text-red-500">*</span>
                                                </label>
                                                <SearchableSelect
                                                    value={selectedClass}
                                                    onChange={(val) => {
                                                        if (val === "") {
                                                            setSelectedBoard("");
                                                            setSelectedSchool("");
                                                            setSelectedClass("");
                                                            setSelectedYear("");
                                                            setSelectedSubjects([]);
                                                            setAvailableSubjects([]);
                                                        } else {
                                                            setSelectedClass(Number(val));
                                                        }
                                                    }}
                                                    options={classes.map((c) => ({ value: c.id, label: c.name }))}
                                                    placeholder="Select Class"
                                                    className="w-full py-2 border-b border-gray-300 text-primary bg-transparent focus:outline-none focus:border-gray-500 text-base"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-primary mb-2">
                                                    Academic Year <span className="text-red-500">*</span>
                                                </label>
                                                <select
                                                    value={selectedYear}
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        if (val === "") {
                                                            setSelectedBoard("");
                                                            setSelectedSchool("");
                                                            setSelectedClass("");
                                                            setSelectedYear("");
                                                            setSelectedSubjects([]);
                                                            setAvailableSubjects([]);
                                                        } else {
                                                            setSelectedYear(val);
                                                        }
                                                    }}
                                                    className="w-full py-2 border-b border-gray-300 text-primary bg-transparent focus:outline-none focus:border-gray-500 text-base"
                                                >
                                                    <option value="">Select Year</option>
                                                    {academicYears.map((y) => (
                                                        <option key={y.year} value={y.year}>
                                                            {y.year}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>


                                    </>
                                );
                            })()}
                            {/* Seats Row */}
                            <div className="flex flex-col gap-1">
                                <label className="text-[10px] tracking-widest text-gray-400 font-semibold px-1">
                                    Seats
                                </label>
                                <div className={`inline-flex items-center rounded-xl border px-1 py-1 gap-1 ${isStudent ? 'bg-gray-100 border-gray-200' : 'bg-[#464646] border-[#464646]'}`}>
                                    <button
                                        onClick={() => !isStudent && setSheetCount((prev) => (prev > 1 ? prev - 1 : 1))}
                                        disabled={isStudent}
                                        className={`w-7 h-7 rounded-lg flex items-center justify-center text-base font-bold transition-colors ${isStudent ? 'text-gray-400 cursor-not-allowed' : 'text-white hover:bg-white/10'}`}
                                    >
                                        −
                                    </button>
                                    <input
                                        type="number"
                                        disabled={isStudent}
                                        className={`font-semibold text-xs bg-transparent w-8 text-center outline-none border-none appearance-none [&::-webkit-inner-spin-button]:appearance-none ${isStudent ? 'text-gray-500' : 'text-white'}`}
                                        value={sheetCount === 0 ? "" : sheetCount}
                                        onChange={(e) => {
                                            if (isStudent) return;
                                            const val = e.target.value;
                                            if (val === "") { setSheetCount(0); }
                                            else { const parsed = parseInt(val); if (!isNaN(parsed)) setSheetCount(parsed); }
                                        }}
                                        onBlur={() => { if (sheetCount < 1) setSheetCount(1); }}
                                    />
                                    <button
                                        onClick={() => !isStudent && setSheetCount((prev) => prev + 1)}
                                        disabled={isStudent}
                                        className={`w-7 h-7 rounded-lg flex items-center justify-center text-base font-bold transition-colors ${isStudent ? 'text-gray-400 cursor-not-allowed' : 'text-white hover:bg-white/10'}`}
                                    >
                                        +
                                    </button>
                                </div>
                                {isStudent && (
                                    <p className="text-xs text-gray-400 mt-1">Students can only purchase 1 seat.</p>
                                )}
                            </div>

                            {/* Subjects Section */}
                            {(selectedBoard && selectedClass && selectedYear) && (
                                <div>
                                    <label className="block text-sm font-medium text-primary mb-2">
                                        Select Subjects <span className="text-red-500">*</span>
                                    </label>

                                    {isSubjectsLoading ? (
                                        <div className="flex items-center gap-2 py-6 justify-center">
                                            <Loader2 className="w-5 h-5 animate-spin text-primary" />
                                            <span className="text-sm text-gray-400">
                                                Loading subjects...
                                            </span>
                                        </div>
                                    ) : availableSubjects.length === 0 ? (
                                        <p className="text-sm text-gray-400 text-center py-4">
                                            No subjects found for this selection
                                        </p>
                                    ) : (
                                        <div className="flex flex-wrap gap-2">
                                            {availableSubjects.map((subject) => {
                                                const isSelected = selectedSubjects.some(
                                                    (s) => s.subject_id === subject.subject_id
                                                );
                                                return (
                                                    <button
                                                        key={subject.subject_id}
                                                        onClick={() => toggleSubject(subject)}
                                                        className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 border ${isSelected
                                                            ? "bg-button-primary text-primary border-button-primary shadow-sm scale-105"
                                                            : "bg-transparent text-primary border-gray-300 hover:border-button-primary hover:bg-button-primary/10"
                                                            }`}
                                                    >
                                                        {subject.subject_name}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Footer Actions */}
                            <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2 w-full">
                                <button
                                    onClick={handleConfirm}
                                    disabled={!canProceed}
                                    className={`px-8 py-2.5 rounded-full text-sm font-medium transition-colors disabled:cursor-not-allowed ${canProceed
                                        ? "bg-button-primary text-primary hover:opacity-90"
                                        : "bg-primary text-white opacity-50"
                                        }`}
                                >
                                    View Plans →
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SubscriptionSetupModal;
