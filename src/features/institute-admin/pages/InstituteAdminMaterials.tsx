import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import MaterialsSidebar from "../components/InstituteAdminMaterialSidebar";
import MaterialsHeader from "../components/InstituteAdminMaterialHeader";
import ResourceMaterials, {
  type YouTubeLink,
} from "../components/InstituteAdminMaterialVideos";
import Tests from "../components/InstituteAdminTestAssignPage";
import Notes, { type NoteData } from "../components/InstituteAdminMaterialNotes";
import ApiServices from "../../../services/ApiServices";
// import IconChat from "../../../assets/icon/chat2.svg";
import Chat from "../../auth/modal/chat";

interface ChapterItem {
  name: string;
  chapter_id?: number;
  topics?: TopicItem[];
}

interface TopicItem {
  name: string;
  topic_id?: number;
}

const InstituteAdminMaterials = () => {
  const location = useLocation();

  // Get data from location state (passed from LearningPlanner)
  const locationState = location.state as {
    boardName?: string;
    className?: string;
    sectionName?: string;
    subjects?: string[];
    subjectWisePlan?: any[];
    stats?: any;
    selectedChapterId?: number;
    activeResourceType?: string;
    selectedSubjectName?: string;
    selectedTopicIds?: number[];
  } | null;

  // initialize current selection states (will drive dropdowns)
  const [board, setBoard] = useState(locationState?.boardName || "");
  const [className, setClassName] = useState(locationState?.className || "");
  const [section, setSection] = useState(locationState?.sectionName || "");

  // option lists populated from API
  const [boardOptions, setBoardOptions] = useState<string[]>([]);
  const [classOptions, setClassOptions] = useState<string[]>([]);
  const [sectionOptions, setSectionOptions] = useState<string[]>([]);

  // raw hierarchy returned by API (boards -> classes -> sections -> subjects)
  const [academicHierarchy, setAcademicHierarchy] = useState<any[]>([]);


  // const [activeSubject, setActiveSubject] = useState(
  //     locationState?.subjects?.[0] || "Math",
  // );

  const [activeSubject, setActiveSubject] = useState(
    locationState?.selectedSubjectName || locationState?.subjects?.[0] || "",
  );
  const [activeResourceType, setActiveResourceType] = useState(
    locationState?.activeResourceType || "",
  );

  const [selectedChapters, setSelectedChapters] = useState<number[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<number[]>([]);
  const [chapters, setChapters] = useState<ChapterItem[]>([]);
  const [coreTopics, setCoreTopics] = useState<TopicItem[]>([]);
  const [apiSubjectWisePlan, setApiSubjectWisePlan] = useState<any[] | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  // ── Resource data from API ──
  const [youtubeLinks, setYoutubeLinks] = useState<YouTubeLink[]>([]);
  const [notesData, setNotesData] = useState<NoteData[]>([]);
  const [isResourcesLoading, setIsResourcesLoading] = useState(false);

  const resourceTypes = ["Videos", "Tests", "Notes"];

  const effectiveSubjectWisePlan = locationState?.subjectWisePlan || apiSubjectWisePlan || null;


  useEffect(() => {
    if (location.pathname.includes("institute-admin/videos")) {
      setActiveResourceType("Videos");
    } else if (location.pathname.includes("institute-admin/tests")) {
      setActiveResourceType("Tests");
    } else if (location.pathname.includes("institute-admin/notes")) {
      setActiveResourceType("Notes");
    }
  }, [location.pathname]);


  // whenever selected board or hierarchy changes, update class options
  useEffect(() => {
    if (!board) {
      setClassOptions([]);
      setClassName("");
      return;
    }
    const classes = academicHierarchy
      .filter((item: any) => item.board_name === board)
      .map((item: any) => item.class_name)
      .filter((v: any) => v);
    const uniqClasses = Array.from(new Set(classes));
    setClassOptions(uniqClasses);
    // if the currently selected class is not part of new options, or none selected, choose first
    if (!className || !uniqClasses.includes(className)) {
      setClassName(uniqClasses[0] || "");
    }
    // any time board changes, clear sections as well
    setSection("");
    setSectionOptions([]);
  }, [board, academicHierarchy]);

  // whenever selected class changes, update section options from hierarchy
  useEffect(() => {
    if (!board || !className) {
      setSectionOptions([]);
      setSection("");
      return;
    }
    const sections = academicHierarchy
      .filter(
        (item: any) =>
          item.board_name === board && item.class_name === className,
      )
      .flatMap((item: any) => {
        if (Array.isArray(item.sections)) {
          return item.sections.map((s: any) => s.section_name || s.section);
        }
        return [];
      });
    const uniqSections = Array.from(new Set(sections)).filter(Boolean) as string[];
    setSectionOptions(uniqSections);
    // if current section not valid, or none selected, pick first
    if (!section || !uniqSections.includes(section)) {
      setSection(uniqSections[0] || "");
    }
  }, [board, className, academicHierarchy]);

  // Derive subjects list: prefer explicit `subjects` from location, otherwise map from plan
  const subjects =
    locationState?.subjects ||
    (effectiveSubjectWisePlan && Array.isArray(effectiveSubjectWisePlan)
      ? effectiveSubjectWisePlan.map((p: any) => p.subject_name || p.subject)
      : [
        "Math",
        "Science",
        "History",
        "Civics",
        "Geography",
        "English Literature",
        "English Grammar",
        "Hindi Sahitya",
      ]);

  // When API plan loads and no activeSubject selected, pick first subject
  useEffect(() => {
    if (!activeSubject && Array.isArray(effectiveSubjectWisePlan) && effectiveSubjectWisePlan.length > 0) {
      const first = effectiveSubjectWisePlan[0].subject_name || effectiveSubjectWisePlan[0].subject;
      if (first) setActiveSubject(first);
    }
  }, [effectiveSubjectWisePlan, activeSubject]);

  useEffect(() => {
    const fetchHierarchy = async () => {
      try {
        const res = await ApiServices.getAcademicHierarchy();
        const result = res.data;
        if (result?.status === "success" && Array.isArray(result.data)) {
          // store raw hierarchy for board/class/section dropdowns
          setAcademicHierarchy(result.data);
          const boards = Array.from(
            new Set(result.data.map((item: any) => item.board_name)),
          ).filter(Boolean) as string[];
          setBoardOptions(boards);

          // also flatten subjects if plan wasn't already provided
          if (!locationState?.subjectWisePlan) {
            const flattenedSubjects = result.data.flatMap((item: any) =>
              Array.isArray(item.subjects) ? item.subjects : [],
            );
            setApiSubjectWisePlan(flattenedSubjects);
          }
        }
      } catch (err) {
        // console.error("Failed to fetch academic hierarchy:", err);
      }
    };

    // only bail out early for subject-wise plan; we still need hierarchy for dropdowns
    fetchHierarchy();
  }, [locationState?.subjectWisePlan]);

  // if options come in and no board is selected yet, choose the first
  useEffect(() => {
    if (!board && boardOptions.length > 0) {
      setBoard(boardOptions[0]);
    }
  }, [boardOptions, board]);

  // ── Update chapters and topics dynamically based on active subject ──
  // useEffect(() => {
  //   if (
  //     locationState?.subjectWisePlan &&
  //     Array.isArray(locationState.subjectWisePlan) &&
  //     activeSubject
  //   ) {
  //     const selectedSubjectPlan = locationState.subjectWisePlan.find(
  //       (plan: any) => plan.subject_name === activeSubject,
  //     );

  //     if (
  //       selectedSubjectPlan?.chapters &&
  //       Array.isArray(selectedSubjectPlan.chapters)
  //     ) {
  //       const transformedChapters: ChapterItem[] =
  //         selectedSubjectPlan.chapters.map((chapter: any) => ({
  //           name: chapter.chapter_name,
  //           chapter_id: chapter.chapter_id,
  //           topics:
  //             chapter.topics?.map((topic: any) => ({
  //               name: topic.topic_name,
  //               topic_id: topic.topic_id,
  //             })) || [],
  //         }));
  //       setChapters(transformedChapters);

  //       // Set initially selected chapter if passed from LearningPlanner
  //       if (locationState?.selectedChapterId) {
  //         const chapterIndex = transformedChapters.findIndex(
  //           (ch) => ch.chapter_id === locationState.selectedChapterId,
  //         );
  //         if (chapterIndex !== -1) {
  //           setSelectedChapters([chapterIndex]);
  //         }
  //       } else {
  //         setSelectedChapters([]);
  //       }

  //       // Extract all topics from all chapters
  //       const allTopics: TopicItem[] = selectedSubjectPlan.chapters.flatMap(
  //         (chapter: any) =>
  //           chapter.topics && Array.isArray(chapter.topics)
  //             ? chapter.topics.map((topic: any) => ({
  //                 name: topic.topic_name,
  //                 topic_id: topic.topic_id,
  //               }))
  //             : [],
  //       );
  //       setCoreTopics(allTopics);

  //       // Initialize all topics as selected by default
  //       // setSelectedTopics(allTopics.map((_, index) => index));

  //     } else {
  //       setChapters([]);
  //       setCoreTopics([]);
  //     }
  //   } else if (!locationState?.subjectWisePlan) {
  //     // Fallback to default chapters if no API data provided
  //     setChapters([
  //       { name: "Matter" },
  //       { name: "Physical Quantities & Measurement" },
  //       { name: "Physical Changes" },
  //       { name: "Least Count" },
  //       { name: "Errors" },
  //     ]);
  //     setCoreTopics([
  //       { name: "States" },
  //       { name: "Interconversion" },
  //       { name: "Physical Changes" },
  //       { name: "Least Count" },
  //       { name: "Errors" },
  //     ]);
  //   }
  // }, [activeSubject, locationState?.subjectWisePlan]);
  // when the active subject or plan changes, rebuild available chapters and reset selection
  useEffect(() => {
    if (
      !effectiveSubjectWisePlan ||
      !Array.isArray(effectiveSubjectWisePlan) ||
      !activeSubject
    ) {
      setChapters([]);
      setCoreTopics([]);
      setSelectedChapters([]);
      setSelectedTopics([]);
      return;
    }

    const selectedSubjectPlan = effectiveSubjectWisePlan.find(
      (plan: any) => plan.subject_name === activeSubject,
    );

    if (!selectedSubjectPlan?.chapters) {
      setChapters([]);
      setCoreTopics([]);
      setSelectedChapters([]);
      setSelectedTopics([]);
      return;
    }

    // transform and cache chapters for sidebar
    const transformedChapters: ChapterItem[] = selectedSubjectPlan.chapters.map(
      (chapter: any) => ({
        name: chapter.chapter_name,
        chapter_id: chapter.chapter_id,
        topics: chapter.topics || [],
      }),
    );
    setChapters(transformedChapters);

    // if we were given a chapter id from navigation state, initialize selection
    if (locationState?.selectedChapterId) {
      const idx = transformedChapters.findIndex(
        (ch) => ch.chapter_id === locationState.selectedChapterId,
      );
      if (idx !== -1) {
        setSelectedChapters([idx]);
      }
    } else {
      // otherwise start with no chapters selected – user will choose in sidebar
      setSelectedChapters([0]);
      // Also default select all topics for the first chapter on initial load
      const firstChapterTopics = transformedChapters[0]?.topics || [];
      setSelectedTopics(firstChapterTopics.map((_, i) => i));
    }
  }, [
    activeSubject,
    effectiveSubjectWisePlan,
    locationState?.selectedChapterId,
  ]);

  // Auto-select first chapter and its topics when switching resource tabs (Videos, Tests, Notes) if none are selected
  useEffect(() => {
    if (activeResourceType && chapters.length > 0 && selectedChapters.length === 0) {
      setSelectedChapters([0]);
      const firstChapterTopics = chapters[0]?.topics || [];
      setSelectedTopics(firstChapterTopics.map((_, i) => i));
    }
  }, [activeResourceType]);

  // whenever the chapter selection changes (or the chapter list itself), compute the core topic list
  useEffect(() => {
    if (selectedChapters.length === 0) {
      setCoreTopics([]);
      setSelectedTopics([]);
      return;
    }

    const topics: TopicItem[] = selectedChapters.flatMap((index) => {
      const ch = chapters[index];
      return (
        ch?.topics?.map((t: any) => ({
          name: t.topic_name || t.name,
          topic_id: t.topic_id,
        })) || []
      );
    });

    setCoreTopics(topics);

    // re-sync selectedTopics indices if they are out of range
    setSelectedTopics((prev) => prev.filter((i) => i < topics.length));
  }, [selectedChapters, chapters]);

  // if initial navigation state provided topic ids, map them to indices once topics list is available
  useEffect(() => {
    const selTopicIds = locationState?.selectedTopicIds || [];
    if (selTopicIds.length > 0 && coreTopics.length > 0) {
      const topicIndexes = coreTopics
        .map((topic, index) =>
          topic.topic_id !== undefined && selTopicIds.includes(topic.topic_id)
            ? index
            : -1,
        )
        .filter((index) => index !== -1);
      setSelectedTopics(topicIndexes);
    }
  }, [locationState?.selectedTopicIds, coreTopics]);
  // ── Fetch resources when chapter & topic are selected ──
  useEffect(() => {
    const fetchResources = async () => {
      // We need at least one selected chapter
      if (selectedChapters.length === 0) {
        // Clear resources when no chapters are selected
        setYoutubeLinks([]);
        setNotesData([]);
        return;
      }

      // Get all selected chapter IDs
      const selectedChapterIds = selectedChapters
        .map((index) => chapters[index]?.chapter_id)
        .filter((id) => id !== undefined) as number[];

      if (selectedChapterIds.length === 0) return;

      // Collect topic IDs: if specific topics are selected use those,
      // otherwise use all topics from selected chapters
      let topicIds: number[] = [];

      if (
        selectedTopics.length > 0 &&
        selectedTopics.length < coreTopics.length
      ) {
        // Specific core topics are selected (not all)
        topicIds = selectedTopics
          .map((topicIndex) => coreTopics[topicIndex]?.topic_id)
          .filter((id) => id !== undefined) as number[];
      } else {
        // Use all topics from selected chapters
        topicIds = selectedChapterIds.flatMap((chapterId) => {
          const chapter = chapters.find((ch) => ch.chapter_id === chapterId);
          return (
            chapter?.topics
              ?.filter((t) => t.topic_id !== undefined)
              .map((t) => t.topic_id as number) || []
          );
        });
      }

      if (topicIds.length === 0) return;

      // Build payload
      const stats = locationState?.stats;
      const selectedSubjectPlan = effectiveSubjectWisePlan?.find(
        (plan: any) => plan.subject_name === activeSubject,
      );

      const payload = {
        board_id: stats?.board_id,
        institute_id: stats?.institute_id,
        class_id: stats?.class_id,
        // section may be used by newer APIs (name, id or both)
        section: section || undefined,
        subject_id: selectedSubjectPlan?.subject_id,
        chapter_ids: selectedChapterIds,
        topic_ids: topicIds,
      };
      // console.log("RESOURCE PAYLOAD:", payload);

      setIsResourcesLoading(true);

      try {
        const response = await ApiServices.getChapterTopicResources(payload);
        const result = response.data;

        if (result.status === "success" && Array.isArray(result.data)) {
          // Flatten all youtube_links or videos from all topics
          const allLinks: YouTubeLink[] = result.data.flatMap(
            (item: any) => item.youtube_links || item.videos || [],
          );
          setYoutubeLinks(allLinks);

          // Parse notes for each topic
          const allNotes: NoteData[] = result.data
            .filter((item: any) => item.notes)
            .map((item: any) => {
              let parsedContent: any = item.notes;

              // If it's a string, try to parse it, otherwise keep as is
              if (typeof item.notes === "string") {
                try {
                  parsedContent = JSON.parse(item.notes);
                } catch {
                  parsedContent = item.notes;
                }
              }

              // Normalize content structure if it's an object with a 'content' field
              // but we want to be flexible as the API might return direct array or obj

              return {
                topic_id: item.topic_id,
                topic_title:
                  item.topic_title ||
                  (parsedContent &&
                    typeof parsedContent === "object" &&
                    !Array.isArray(parsedContent)
                    ? parsedContent.title || parsedContent.topic
                    : `Topic ${item.topic_id}`),
                content: parsedContent,
              };
            });
          setNotesData(allNotes);
        }
      } catch (error) {
        // console.error("Failed to fetch resources:", error);
        setYoutubeLinks([]);
        setNotesData([]);
      } finally {
        setIsResourcesLoading(false);
      }
    };

    fetchResources();
  }, [
    selectedChapters,
    selectedTopics,
    chapters,
    coreTopics,
    activeSubject,
    locationState?.stats,
    effectiveSubjectWisePlan,
  ]);

  // Get subject_id and chapter_ids for Tests component
  const getSubjectId = () => {
    if (!effectiveSubjectWisePlan || !activeSubject) return undefined;
    const selectedSubjectPlan = effectiveSubjectWisePlan.find(
      (plan: any) => plan.subject_name === activeSubject,
    );
    return selectedSubjectPlan?.subject_id;
  };

  const getSelectedChapterIds = () => {
    if (selectedChapters.length === 0) return null;
    const chapterIds = selectedChapters
      .map((index) => chapters[index]?.chapter_id)
      .filter((id) => id !== undefined) as number[];
    return chapterIds.length > 0 ? chapterIds : null;
  };

  const getSelectedChapterNames = () => {
    if (selectedChapters.length === 0) return [];
    return selectedChapters
      .map((index) => chapters[index]?.name)
      .filter((name) => name !== undefined) as string[];
  };

  const getClassId = () => {
    if (locationState?.stats?.class_id) return locationState.stats.class_id;
    const boardItem = academicHierarchy.find((item: any) => item.board_name === board && item.class_name === className);
    return boardItem?.class_id;
  };

  return (
    <div className="min-h-screen">
      <div className="flex gap-6">
        <MaterialsSidebar
          board={board}
          className={className}
          section={section}
          boardOptions={boardOptions}
          classOptions={classOptions}
          sectionOptions={sectionOptions}
          setBoard={setBoard}
          setClassName={setClassName}
          setSection={setSection}
          activeSubject={activeSubject}
          chapters={chapters}
          coreTopics={coreTopics}
          selectedChapters={selectedChapters}
          setSelectedChapters={setSelectedChapters}
          selectedTopics={selectedTopics}
          setSelectedTopics={setSelectedTopics}
        />

        <div className="flex-1">
          <MaterialsHeader
            subjects={subjects}
            activeSubject={activeSubject}
            setActiveSubject={setActiveSubject}
            resourceTypes={resourceTypes}
            activeResourceType={activeResourceType}
            setActiveResourceType={setActiveResourceType}
          />

          {activeResourceType === "Videos" && (
            <ResourceMaterials
              youtubeLinks={youtubeLinks}
              isLoading={isResourcesLoading}
            />
          )}
          {activeResourceType === "Tests" && (
            <Tests
              subjectId={getSubjectId()}
              subjectName={activeSubject}
              chapterIds={getSelectedChapterIds()}
              chapterNames={getSelectedChapterNames()}
              allChapters={chapters}
              allTopics={coreTopics}
              topicIds={selectedTopics
                .map((i) => coreTopics[i]?.topic_id)
                .filter((id): id is number => id !== undefined)}
              topicNames={selectedTopics
                .map((i) => coreTopics[i]?.name)
                .filter((name): name is string => name !== undefined)}
              classIds={getClassId() ? [getClassId()] : []}
              stats={locationState?.stats}
            />
          )}
          {activeResourceType === "Notes" && (
            <Notes notes={notesData} isLoading={isResourcesLoading} />
          )}
        </div>
      </div>
      {/* <div className="fixed right-[1%] top-[80%] -translate-y-1/2 z-[100]">
        <button
          onClick={() => setIsChatOpen(true)}
          aria-label="Open chat"
          className="p-0 bg-transparent border-0 cursor-pointer"
        >
          <img src={IconChat} alt="Chat" className="w-[95px]" />
        </button>
      </div> */}
      {isChatOpen && <Chat onClose={() => setIsChatOpen(false)} />}

    </div>
  );
};

export default InstituteAdminMaterials;
