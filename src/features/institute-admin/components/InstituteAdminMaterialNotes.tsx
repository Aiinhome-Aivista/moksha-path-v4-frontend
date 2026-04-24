import React, { useState } from "react";
import {
  StickyNote,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Upload,
} from "lucide-react";

export interface NoteData {
  topic_id: number;
  topic_title: string;
  content: any; // Can be string, array, or object
}

interface NotesProps {
  notes?: NoteData[];
  isLoading?: boolean;
}

const ITEMS_PER_PAGE = 8;

// Recursively render note content in a readable format
const RenderNoteContent: React.FC<{ data: any; depth?: number }> = ({
  data,
  depth = 0,
}) => {
  if (typeof data === "string") {
    // Handle bold text indicated by ** markers
    const parts = data.split(/(\*\*[^*]+\*\*)/g);
    return (
      <p className="text-sm text-gray-700 leading-relaxed">
        {parts.map((part, i) => {
          if (part.startsWith("**") && part.endsWith("**")) {
            return <strong key={i}>{part.slice(2, -2)}</strong>;
          }
          return part;
        })}
      </p>
    );
  }

  if (Array.isArray(data)) {
    // Different list styles based on depth
    const getBulletStyle = (lvl: number) => {
      if (lvl === 0) return "list-disc"; // Main level: •
      if (lvl === 1) return "list-circle"; // Sub level: ◦
      return "list-square"; // Deep level: ▪
    };

    return (
      <ul
        className={`space-y-2 ${getBulletStyle(depth)} list-inside ${depth > 0 ? "ml-4" : ""}`}
      >
        {data.map((item, i) => (
          <li
            key={i}
            className={`text-gray-700 leading-relaxed ${
              depth === 0 ? "text-sm font-medium" : "text-sm"
            }`}
          >
            {typeof item === "string" ? (
              <>
                {item.split(/(\*\*[^*]+\*\*)/g).map((part, idx) => {
                  if (part.startsWith("**") && part.endsWith("**")) {
                    return <strong key={idx}>{part.slice(2, -2)}</strong>;
                  }
                  return part;
                })}
              </>
            ) : typeof item === "object" ? (
              <RenderNoteContent data={item} depth={depth + 1} />
            ) : (
              String(item)
            )}
          </li>
        ))}
      </ul>
    );
  }

  if (typeof data === "object" && data !== null) {
    return (
      <div className={`space-y-4 ${depth > 0 ? "ml-2" : ""}`}>
        {Object.entries(data).map(([key, value]) => {
          const label = key
            .replace(/_/g, " ")
            .replace(/\b\w/g, (c) => c.toUpperCase());

          // Skip class/title since we show those in the header
          if (key === "class" || key === "title") return null;

          const isMainSection = depth === 0;

          return (
            <div key={key} className={isMainSection ? "mb-4" : "mb-3"}>
              <h4
                className={`font-bold mb-2 tracking-widest ${
                  isMainSection
                    ? "text-xs text-gray-900 uppercase border-b-2 border-[#F27927] pb-2"
                    : "text-xs text-gray-800 uppercase"
                }`}
              >
                {label}
              </h4>
              <div
                className={
                  isMainSection ? "pl-0" : "pl-3 border-l-2 border-gray-300"
                }
              >
                <RenderNoteContent data={value} depth={depth + 1} />
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return <p className="text-sm text-gray-700">{String(data)}</p>;
};

const InstituteAdminMaterialNotes: React.FC<NotesProps> = ({ notes = [], isLoading = false }) => {
  const [expandedNotes, setExpandedNotes] = useState<Set<number>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [uploadedNotes, setUploadedNotes] = useState<NoteData[]>([]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const newNote: NoteData = {
        topic_id: Date.now(),
        topic_title: file.name,
        content: "File uploaded locally.",
      };
      setUploadedNotes((prev) => [...prev, newNote]);
    }
  };

  const toggleNote = (topicId: number) => {
    setExpandedNotes((prev) => {
      const next = new Set(prev);
      if (next.has(topicId)) next.delete(topicId);
      else next.add(topicId);
      return next;
    });
  };

  const allNotes = [...notes, ...uploadedNotes];

  // Pagination Logic
  const totalPages = Math.ceil(allNotes.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentNotes = allNotes.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      // Optionally scroll to top of notes list
      // window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-400">
        <Loader2 size={32} className="animate-spin mb-3" />
        <p className="text-sm font-medium">Loading notes...</p>
      </div>
    );
  }

  if (allNotes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-gray-400">
        <StickyNote size={40} className="mb-3 opacity-50" />
        <p className="text-sm font-medium">No notes available</p>
        <p className="text-xs mt-1">
          Select a chapter and topic from the sidebar to load notes
        </p>
        <div className="mt-6">
          <label className="flex items-center gap-2 cursor-pointer bg-primary text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-[#A3C627] transition-colors">
            <span>Upload PDF</span>
            <input
              type="file"
              className="hidden"
              accept="application/pdf"
              onChange={handleFileUpload}
            />
          </label>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <StickyNote size={20} className="text-[#F27927]" />
        <h2 className="text-lg font-semibold text-gray-800">Notes</h2>
        <span className="px-4 py-2 rounded-full text-xs  bg-[#464646] text-white font-bold hover:bg-[#555555]">
          {allNotes.length} notes
        </span>
        {/* Page indicator (optional, small top right) */}
        {totalPages > 1 && (
          <span className="text-xs text-gray-500 ">
            Page {currentPage} of {totalPages}
          </span>
        )}
        <label className="px-4 py-2 rounded-full text-xs  bg-[#A3C627] text-left text-primary font-bold ml-auto flex items-center gap-2 cursor-pointer transition-colors">
          <Upload size={14} />
          <span>Upload</span>
          <input
            type="file"
            className="hidden"
            accept="application/pdf"
            onChange={handleFileUpload}
          />
        </label>
      </div>

      <div className="space-y-4 min-h-[500px]">
        {" "}
        {/* Added min-height to reduce layout shift */}
        {currentNotes.map((note) => {
          const isExpanded = expandedNotes.has(note.topic_id);

          return (
            <div
              key={note.topic_id}
              className="bg-white rounded-lg border-l-4 border-l-[#F27927] border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Header - clickable */}
              <button
                onClick={() => toggleNote(note.topic_id)}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors text-left"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0">
                    <StickyNote size={20} className="text-[#F27927]" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-base text-gray-800">
                      {note.topic_title}
                    </h3>
                  </div>
                </div>
              </button>

              {/* Expandable content */}
              {isExpanded && (
                <div className="px-5 pb-5 border-t border-gray-200 bg-gray-50">
                  <div className="pt-4">
                    <RenderNoteContent data={note.content} />
                  </div>
                </div>
              )}
            </div>

            
          );
        })}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8 mb-4">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`p-2 rounded-lg border flex items-center justify-center transition-colors ${
              currentPage === 1
                ? "border-gray-100 text-gray-300 cursor-not-allowed"
                : "border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-[#F27927]"
            }`}
            title="Previous Page"
          >
            <ChevronLeft size={20} />
          </button>

          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              // Logic to show limited page numbers if many pages (e.g., 1, 2, ..., 10) can be added here
              // For now, showing all up to a reasonable amount, user likely won't have 100s of pages of notes per topic
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`w-8 h-8 rounded-lg text-sm font-medium flex items-center justify-center transition-all ${
                  currentPage === page
                    ? "bg-[#F27927] text-white shadow-md shadow-orange-100"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {page}
              </button>
            ))}
          </div>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`p-2 rounded-lg border flex items-center justify-center transition-colors ${
              currentPage === totalPages
                ? "border-gray-100 text-gray-300 cursor-not-allowed"
                : "border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-[#F27927]"
            }`}
            title="Next Page"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}
    </div>
  );
};

export default InstituteAdminMaterialNotes;