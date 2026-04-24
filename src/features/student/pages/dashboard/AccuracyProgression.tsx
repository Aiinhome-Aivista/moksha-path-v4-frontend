interface ChapterData {
  accuracy: number;
  chapter_id: number;
  chapter_name?: string;
  label: string;
}

interface AccuracyProgressionProps {
  chapters: ChapterData[];
}

export const AccuracyProgression = ({ chapters }: AccuracyProgressionProps) => {
  return (
    <div className="px-4">
     <h2 className="font-semibold text-3xl text-primary">
        Accuracy by Difficulty Mock Progression
      </h2>
      <p className="font-medium text-base mb-5 text-primary">
        Highest level you answer correctly: 50% of the time
      </p>
      {chapters.map((chapter, i) => {
        // Extract level from label like "Handles L4"
        const levelMatch = chapter.label.match(/L(\d+)/);
        const level = levelMatch ? parseInt(levelMatch[1]) : 1;

        return (
          <div key={i} className="mb-6">
            {/* Title */}
            <div className="flex justify-between text-sm mb-1">
              <span className="text-xl font-semibold">{chapter.chapter_name || "Chapter"}</span>
              <span
                className={`text-xs text-end font-semibold ${level === 2
                    ? "text-gray-500"
                    : level === 3
                      ? "text-orange-500"
                      : level === 4
                        ? "text-green-500"
                        : "text-red-500"
                  }`}
              >
                {chapter.label}
              </span>
            </div>

            {/* Multi-level bars */}
            <div className="flex gap-2">
              {[1, 2, 3, 4].map((lvl) => {
                return (
                  <div
                    key={lvl}
                    className={`h-3 flex-1 rounded-full ${lvl < level
                        ? "bg-green-600"
                        : lvl === level
                          ? "bg-yellow-500"
                          : "bg-gray-300"
                      }`}
                  />
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};
