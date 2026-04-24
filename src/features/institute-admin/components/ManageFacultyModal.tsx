import React, { useEffect, useState } from "react";
import ApiServices from "../../../services/ApiServices";

// ── Types matching real API responses ──────────────────────────────────────
interface AssignedTeacher {
  teacher_user_id: number;
  name: string;
  mobile: string;
  email: string;
  class_ids: number[];
  section_names: string[];
  assigned_on: string;
}

interface AvailableTeacher {
  teacher_user_id: number;
  name: string;
  mobile: string;
  email: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

type ModalTab = "assigned" | "available";

const avatarGradients = [
  "from-violet-500 to-purple-600",
  "from-blue-500 to-cyan-500",
  "from-emerald-500 to-teal-500",
  "from-rose-500 to-pink-500",
  "from-orange-500 to-amber-500",
];

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

// ── Main Component ─────────────────────────────────────────────────────────
const ManageFacultyModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<ModalTab>("assigned");

  // Assigned teachers state
  const [assignedTeachers, setAssignedTeachers] = useState<AssignedTeacher[]>([]);
  const [assignedLoading, setAssignedLoading] = useState(false);
  const [assignedError, setAssignedError] = useState("");
  const [assignedSearch, setAssignedSearch] = useState("");

  // Available teachers state
  const [availableTeachers, setAvailableTeachers] = useState<AvailableTeacher[]>([]);
  const [availableLoading, setAvailableLoading] = useState(false);
  const [availableError, setAvailableError] = useState("");
  const [availableSearch, setAvailableSearch] = useState("");

  // Per-teacher inline assign form (available tab)
  const [assigningTeacher, setAssigningTeacher] = useState<number | null>(null); // teacher_user_id being assigned
  const [assignStatus, setAssignStatus] = useState<Record<number, { type: "success" | "error"; text: string }>>({});
  const [assignLoading, setAssignLoading] = useState<number | null>(null);

  // Institute admin summary (class + subject dropdown data)
  const [summaryData, setSummaryData] = useState<any[]>([]);
  const [summaryLoading, setSummaryLoading] = useState(false);
  // Per-teacher dropdown selections
  const [selectedClassId, setSelectedClassId] = useState<Record<number, number>>({});
  const [selectedSubjectId, setSelectedSubjectId] = useState<Record<number, number>>({});

  // Per-teacher remove state (assigned tab)
  const [confirmRemove, setConfirmRemove] = useState<AssignedTeacher | null>(null);
  const [removingId, setRemovingId] = useState<number | null>(null);
  const [removeStatus, setRemoveStatus] = useState<Record<number, { type: "success" | "error"; text: string }>>({});

  // ── Fetchers ──
  const fetchAssigned = async () => {
    setAssignedLoading(true);
    setAssignedError("");
    try {
      const res = await ApiServices.getAssignedTeacherList();
      if (res.data?.status === "success") {
        setAssignedTeachers(res.data.data || []);
      } else {
        setAssignedError(res.data?.message || "Failed to load assigned teachers.");
      }
    } catch (err: any) {
      setAssignedError(err?.response?.data?.message || "Could not fetch assigned teachers.");
    } finally {
      setAssignedLoading(false);
    }
  };

  const fetchAvailable = async () => {
    setAvailableLoading(true);
    setAvailableError("");
    try {
      const res = await ApiServices.getAvailableTeachers();
      if (res.data?.status === "success") {
        setAvailableTeachers(res.data.data || []);
      } else {
        setAvailableError(res.data?.message || "Failed to load available teachers.");
      }
    } catch (err: any) {
      setAvailableError(err?.response?.data?.message || "Could not fetch available teachers.");
    } finally {
      setAvailableLoading(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    if (activeTab === "assigned") fetchAssigned();
    if (activeTab === "available") fetchAvailable();
  }, [isOpen, activeTab]);

  // Fetch summary once when modal opens
  useEffect(() => {
    if (!isOpen || summaryData.length > 0) return;
    const fetchSummary = async () => {
      setSummaryLoading(true);
      try {
        const res = await ApiServices.getInstituteAdminSummary();
        if (res.data?.status === "success") {
          setSummaryData(res.data.data || []);
        }
      } catch (err) {
        console.error("Failed to fetch admin summary", err);
      } finally {
        setSummaryLoading(false);
      }
    };
    fetchSummary();
  }, [isOpen]);

  // ── Handlers ──
  const handleAssign = async (teacher: AvailableTeacher) => {
    const classId = selectedClassId[teacher.teacher_user_id];
    const subjectId = selectedSubjectId[teacher.teacher_user_id];

    if (!classId) {
      setAssignStatus((prev) => ({
        ...prev,
        [teacher.teacher_user_id]: { type: "error", text: "Please select a class." },
      }));
      return;
    }

    setAssignLoading(teacher.teacher_user_id);
    setAssignStatus((prev) => { const n = { ...prev }; delete n[teacher.teacher_user_id]; return n; });

    try {
      const res = await ApiServices.assignTeacher({
        teacher_user_id: teacher.teacher_user_id,
        class_ids: [classId],
        subject_ids: subjectId ? [subjectId] : [],
      });
      if (res.data?.status === "success") {
        setAssignStatus((prev) => ({
          ...prev,
          [teacher.teacher_user_id]: { type: "success", text: res.data?.message || "Assigned successfully!" },
        }));
        setSelectedClassId((prev) => { const n = { ...prev }; delete n[teacher.teacher_user_id]; return n; });
        setSelectedSubjectId((prev) => { const n = { ...prev }; delete n[teacher.teacher_user_id]; return n; });
        setAssigningTeacher(null);
        // Refresh both lists
        fetchAssigned();
        fetchAvailable();
      } else {
        setAssignStatus((prev) => ({
          ...prev,
          [teacher.teacher_user_id]: { type: "error", text: res.data?.message || "Failed to assign." },
        }));
      }
    } catch (err: any) {
      setAssignStatus((prev) => ({
        ...prev,
        [teacher.teacher_user_id]: { type: "error", text: err?.response?.data?.message || "Something went wrong." },
      }));
    } finally {
      setAssignLoading(null);
    }
  };

  const handleRemove = async (teacher: AssignedTeacher) => {
    setRemovingId(teacher.teacher_user_id);
    setRemoveStatus((prev) => { const n = { ...prev }; delete n[teacher.teacher_user_id]; return n; });
    try {
      const res = await ApiServices.removeTeacher({ teacher_user_id: teacher.teacher_user_id });
      if (res.data?.status === "success") {
        setAssignedTeachers((prev) => prev.filter((t) => t.teacher_user_id !== teacher.teacher_user_id));
        setRemoveStatus((prev) => ({
          ...prev,
          [teacher.teacher_user_id]: { type: "success", text: res.data?.message || "Removed successfully." },
        }));
        // Refresh available list too
        if (activeTab === "available") fetchAvailable();
      } else {
        setRemoveStatus((prev) => ({
          ...prev,
          [teacher.teacher_user_id]: { type: "error", text: res.data?.message || "Failed to remove." },
        }));
      }
    } catch (err: any) {
      setRemoveStatus((prev) => ({
        ...prev,
        [teacher.teacher_user_id]: { type: "error", text: err?.response?.data?.message || "Something went wrong." },
      }));
    } finally {
      setRemovingId(null);
      setConfirmRemove(null);
    }
  };

  // ── Filtered lists ──
  const filteredAssigned = assignedTeachers.filter((t) => {
    const q = assignedSearch.toLowerCase();
    return t.name?.toLowerCase().includes(q) || t.mobile?.includes(q) || String(t.email).includes(q);
  });

  const filteredAvailable = availableTeachers.filter((t) => {
    const q = availableSearch.toLowerCase();
    return t.name?.toLowerCase().includes(q) || t.mobile?.includes(q) || String(t.email).includes(q);
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[82vh] flex flex-col overflow-hidden">

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#b0cb1f]/15 flex items-center justify-center">
              <span
                className="material-symbols-outlined text-[#7a9000]"
                style={{ fontVariationSettings: "'FILL' 1, 'wght' 500" }}
              >
                manage_accounts
              </span>
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-gray-800">Manage Faculty</h2>
              <p className="text-xs text-gray-400">Assign or remove teachers from your institute</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* ── Tabs ── */}
        <div className="flex gap-1 bg-gray-50 mx-6 mt-5 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab("assigned")}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-1.5 ${activeTab === "assigned" ? "bg-button-primary text-gray-800 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
          >
            <span
              className="material-symbols-outlined text-base"
              style={{ fontVariationSettings: activeTab === "assigned" ? "'FILL' 1" : "'FILL' 0" }}
            >
              group
            </span>
            Assigned Faculty
            {assignedTeachers.length > 0 && (
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#b0cb1f] text-gray-800 text-[10px] font-bold">
                {assignedTeachers.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("available")}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-1.5 ${activeTab === "available" ? "bg-button-primary text-gray-800 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
          >
            <span
              className="material-symbols-outlined text-base"
              style={{ fontVariationSettings: activeTab === "available" ? "'FILL' 1" : "'FILL' 0" }}
            >
              person_add
            </span>
            Available Teachers
            {availableTeachers.length > 0 && (
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold">
                {availableTeachers.length}
              </span>
            )}
          </button>
        </div>

        {/* ── Tab Content ── */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">

          {activeTab === "assigned" && (
            <>
              {/* Search */}
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl">search</span>
                <input
                  type="text"
                  placeholder="Search by name, mobile and email"
                  value={assignedSearch}
                  onChange={(e) => setAssignedSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#b0cb1f] transition"
                />
              </div>

              {/* Loading */}
              {assignedLoading ? (
                <div className="flex items-center justify-center py-16 gap-2 text-gray-400">
                  <span className="material-symbols-outlined animate-spin text-3xl" style={{ fontVariationSettings: "'wght' 300" }}>
                    progress_activity
                  </span>
                  <span className="text-sm">Loading assigned faculty…</span>
                </div>
              ) : assignedError ? (
                <div className="flex flex-col items-center justify-center py-16 gap-2 text-red-400">
                  <span className="material-symbols-outlined text-3xl">error</span>
                  <p className="text-sm font-semibold">{assignedError}</p>
                  <button onClick={fetchAssigned} className="text-xs text-gray-500 underline">Retry</button>
                </div>
              ) : filteredAssigned.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-2 text-gray-400">
                  <span className="material-symbols-outlined text-5xl text-gray-200" style={{ fontVariationSettings: "'wght' 200" }}>
                    group_off
                  </span>
                  <p className="text-sm font-semibold text-gray-500">
                    {assignedSearch ? "No teachers match your search." : "No teachers assigned yet."}
                  </p>
                  {!assignedSearch && (
                    <button
                      onClick={() => setActiveTab("available")}
                      className="text-xs font-bold text-[#7a9000] hover:underline mt-1"
                    >
                      + Assign from Available Teachers
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredAssigned.map((teacher, idx) => {
                    const grad = avatarGradients[idx % avatarGradients.length];
                    const isRemoving = removingId === teacher.teacher_user_id;
                    const msg = removeStatus[teacher.teacher_user_id];
                    return (
                      <div
                        key={teacher.teacher_user_id}
                        className="bg-gray-50/70 rounded-2xl p-4 hover:bg-gray-100/60 transition-colors border border-gray-100"
                      >
                        <div className="flex items-center gap-3">
                          {/* Avatar */}
                          <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${grad} flex items-center justify-center text-white font-bold text-lg flex-shrink-0`}>
                            {(teacher.name || "T").charAt(0).toUpperCase()}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="text-sm font-bold text-gray-800 truncate">{teacher.name}</p>
                              {/* <span className="text-[10px] font-mono bg-gray-200 text-gray-500 rounded-lg px-2 py-0.5">
                                ID: {teacher.teacher_user_id}
                              </span> */}
                            </div>
                            <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                              <span className="material-symbols-outlined text-[11px]">email</span>
                              {teacher.email}
                            </p>
                            <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                              <span className="material-symbols-outlined text-[11px]">phone</span>
                              {teacher.mobile}
                            </p>
                          </div>

                          {/* Remove button */}
                          <button
                            disabled={isRemoving}
                            onClick={() => setConfirmRemove(teacher)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-red-200 text-red-500 text-xs font-semibold hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                          >
                            {isRemoving ? (
                              <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
                            ) : (
                              <span className="material-symbols-outlined text-sm">person_remove</span>
                            )}
                            Remove
                          </button>
                        </div>

                        {/* Meta chips row */}
                        <div className="mt-3 flex flex-wrap gap-2">
                          {/* Classes */}
                          {teacher.class_ids.length > 0 && (
                            <div className="flex items-center gap-1.5 bg-blue-50 rounded-lg px-3 py-1.5">
                              <span className="material-symbols-outlined text-blue-500 text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                                class
                              </span>
                              <span className="text-xs font-semibold text-blue-700">
                                Classes: {teacher.class_ids.join(", ")}
                              </span>
                            </div>
                          )}

                          {/* Sections */}
                          {teacher.section_names.length > 0 && (
                            <div className="flex items-center gap-1.5 bg-purple-50 rounded-lg px-3 py-1.5">
                              <span className="material-symbols-outlined text-purple-500 text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                                view_list
                              </span>
                              <span className="text-xs font-semibold text-purple-700">
                                Sections: {teacher.section_names.join(", ")}
                              </span>
                            </div>
                          )}
                          <div className="flex items-center gap-1.5 bg-gray-100 rounded-lg px-3 py-1.5 ml-auto">
                            <span className="material-symbols-outlined text-gray-400 text-sm">schedule</span>
                            <span className="text-xs text-gray-500">
                              Assigned: {formatDate(teacher.assigned_on)}
                            </span>
                          </div>
                        </div>
                        {msg && (
                          <p className={`text-[11px] font-semibold mt-2 ${msg.type === "success" ? "text-green-600" : "text-red-500"}`}>
                            {msg.text}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
          {activeTab === "available" && (
            <>
              {/* Search */}
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl">search</span>
                <input
                  type="text"
                  placeholder="Search by name, mobile and email"
                  value={availableSearch}
                  onChange={(e) => setAvailableSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#b0cb1f] transition"
                />
              </div>

              {/* Loading */}
              {availableLoading ? (
                <div className="flex items-center justify-center py-16 gap-2 text-gray-400">
                  <span className="material-symbols-outlined animate-spin text-3xl" style={{ fontVariationSettings: "'wght' 300" }}>
                    progress_activity
                  </span>
                  <span className="text-sm">Loading available teachers…</span>
                </div>
              ) : availableError ? (
                <div className="flex flex-col items-center justify-center py-16 gap-2 text-red-400">
                  <span className="material-symbols-outlined text-3xl">error</span>
                  <p className="text-sm font-semibold">{availableError}</p>
                  <button onClick={fetchAvailable} className="text-xs text-gray-500 underline">Retry</button>
                </div>
              ) : filteredAvailable.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-2 text-gray-400">
                  <span className="material-symbols-outlined text-5xl text-gray-200" style={{ fontVariationSettings: "'wght' 200" }}>
                    person_search
                  </span>
                  <p className="text-sm font-semibold text-gray-500">
                    {availableSearch ? "No teachers match your search." : "No available teachers found."}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredAvailable.map((teacher, idx) => {
                    const grad = avatarGradients[idx % avatarGradients.length];
                    const isExpanded = assigningTeacher === teacher.teacher_user_id;
                    const isLoading = assignLoading === teacher.teacher_user_id;
                    const status = assignStatus[teacher.teacher_user_id];

                    return (
                      <div
                        key={teacher.teacher_user_id}
                        className={`rounded-2xl border transition-all duration-200 overflow-hidden ${isExpanded ? "border-[#b0cb1f] bg-[#b0cb1f]/5" : "border-gray-100 bg-gray-50/70"}`}
                      >
                        {/* Teacher Row */}
                        <div className="flex items-center gap-3 p-4">
                          {/* Avatar */}
                          <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${grad} flex items-center justify-center text-white font-bold text-lg flex-shrink-0`}>
                            {(teacher.name || "T").charAt(0).toUpperCase()}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="text-sm font-bold text-gray-800 truncate">{teacher.name}</p>

                            </div>
                            <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                              <span className="material-symbols-outlined text-[11px]">email</span>
                              {teacher.email}
                            </p>
                            <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                              <span className="material-symbols-outlined text-[11px]">phone</span>
                              {teacher.mobile}
                            </p>
                            {/* Status feedback */}
                            {status && (
                              <p className={`text-[11px] font-semibold mt-1 ${status.type === "success" ? "text-green-600" : "text-red-500"}`}>
                                {status.text}
                              </p>
                            )}
                          </div>

                          {/* Assign toggle button */}
                          <button
                            onClick={() => {
                              setAssigningTeacher(isExpanded ? null : teacher.teacher_user_id);
                              setAssignStatus((p) => { const n = { ...p }; delete n[teacher.teacher_user_id]; return n; });
                            }}
                            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex-shrink-0 ${isExpanded
                              ? "bg-gray-200 text-gray-600 hover:bg-gray-300"
                              : "bg-[#b0cb1f] text-gray-800 hover:bg-lime-400 shadow-sm"
                            }`}
                          >
                            <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                              {isExpanded ? "close" : "person_add"}
                            </span>
                            {isExpanded ? "Cancel" : "Assign"}
                          </button>
                        </div>

                        {/* Inline Assign Form (expanded) */}
                        {isExpanded && (
                          <div className="px-4 pb-4 space-y-3 border-t border-[#b0cb1f]/30 pt-3">
                            <p className="text-xs text-gray-500">
                              Select details to assign{" "}
                              <span className="font-semibold text-gray-700">{teacher.name.trim()}</span>:
                            </p>

                            {summaryLoading ? (
                              <div className="py-3 flex justify-center text-gray-400">
                                <span className="material-symbols-outlined animate-spin text-xl">progress_activity</span>
                              </div>
                            ) : (
                            <>
                            {/* Row: Class + Section + Subject */}
                            <div className="flex gap-2">
                              {/* Class Dropdown */}
                              <div className="relative flex-1">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-base pointer-events-none">class</span>
                                <select
                                  value={selectedClassId[teacher.teacher_user_id] || ""}
                                  onChange={(e) => {
                                    setSelectedClassId((prev) => ({ ...prev, [teacher.teacher_user_id]: parseInt(e.target.value) }));
                                    setSelectedSubjectId((prev) => { const n = { ...prev }; delete n[teacher.teacher_user_id]; return n; });
                                  }}
                                  className="w-full pl-9 pr-8 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#b0cb1f] transition appearance-none text-gray-600"
                                >
                                  <option value="">Select Class</option>
                                  {/* Dedupe classes by target_class_id */}
                                  {Array.from(new Map(summaryData.map((r: any) => [r.target_class_id, r])).values()).map((r: any) => (
                                    <option key={r.target_class_id} value={r.target_class_id}>{r.class_name}</option>
                                  ))}
                                </select>
                              </div>

                              {/* Section Dropdown (static — no sections in API) */}
                              <div className="relative flex-1">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-base pointer-events-none">view_list</span>
                                <select className="w-full pl-9 pr-8 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#b0cb1f] transition appearance-none text-gray-600">
                                  <option value="">Select Section</option>
                                </select>
                              </div>

                              {/* Subject Dropdown — filtered by selected class */}
                              <div className="relative flex-1">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-base pointer-events-none">subject</span>
                                <select
                                  value={selectedSubjectId[teacher.teacher_user_id] || ""}
                                  onChange={(e) => setSelectedSubjectId((prev) => ({ ...prev, [teacher.teacher_user_id]: parseInt(e.target.value) }))}
                                  className="w-full pl-9 pr-8 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#b0cb1f] transition appearance-none text-gray-600"
                                  disabled={!selectedClassId[teacher.teacher_user_id]}
                                >
                                  <option value="">Select Subject</option>
                                  {summaryData
                                    .filter((r: any) => r.target_class_id === selectedClassId[teacher.teacher_user_id])
                                    .map((r: any) => (
                                      <option key={r.subject_id} value={r.subject_id}>{r.subject_name}</option>
                                    ))}
                                </select>
                              </div>
                            </div>
                            </>
                            )}

                            {/* Assign Button */}
                            <button
                              disabled={isLoading}
                              onClick={() => handleAssign(teacher)}
                              className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 bg-[#b0cb1f] hover:bg-lime-400 text-gray-800 text-sm font-bold rounded-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                              {isLoading ? (
                                <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
                              ) : (
                                <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                              )}
                              Assign Teacher
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
          <p className="text-xs text-gray-400">
            {activeTab === "assigned"
              ? `${assignedTeachers.length} teacher${assignedTeachers.length !== 1 ? "s" : ""} assigned`
              : `${availableTeachers.length} teacher${availableTeachers.length !== 1 ? "s" : ""} available`}
          </p>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>

      {/* ── Confirm Remove Dialog ── */}
      {confirmRemove && (
        <div className="fixed inset-0 z-[210] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div className="relative bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full text-center space-y-4">
            <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto">
              <span
                className="material-symbols-outlined text-red-500 text-3xl"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                person_remove
              </span>
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-gray-800">Remove Teacher?</h3>
              <p className="text-sm text-gray-500 mt-1 leading-relaxed">
                Are you sure you want to remove{" "}
                <strong className="text-gray-700">{confirmRemove.name}</strong> from the institute? Their slot will be freed.
              </p>
              {/* Classes they're in */}
              {/* {confirmRemove.class_ids.length > 0 && (
                <p className="text-xs text-amber-600 mt-2 bg-amber-50 rounded-lg px-3 py-2">
                  Currently assigned to class IDs: <strong>{confirmRemove.class_ids.join(", ")}</strong>
                </p>
              )} */}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmRemove(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => handleRemove(confirmRemove)}
                disabled={removingId === confirmRemove.teacher_user_id}
                className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-bold text-sm hover:bg-red-600 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {removingId === confirmRemove.teacher_user_id ? (
                  <span className="material-symbols-outlined animate-spin text-base">progress_activity</span>
                ) : null}
                Yes, Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageFacultyModal;
