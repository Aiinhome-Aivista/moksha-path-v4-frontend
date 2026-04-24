import { useState, useEffect, useMemo, useCallback } from "react";
import { useLocation } from "react-router-dom";
import MaterialsSidebar from "../components/Materialsidebar";
import MaterialsHeader from "../components/MaterialHeader";
import ResourceMaterials from "../components/Videos";
import Notes from "../components/Notes";
import ApiServices from "../../../services/ApiServices";

const TeacherMaterials = () => {
  const location = useLocation();

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

  // 1. Sidebar Selections
  const [board, setBoard] = useState(locationState?.boardName || "");
  const [className, setClassName] = useState(locationState?.className || "");
  const [section, setSection] = useState(locationState?.sectionName || "");
  const [activeSubject, setActiveSubject] = useState(
    locationState?.selectedSubjectName || locationState?.subjects?.[0] || "",
  );

  // 2. Sidebar Options
  const [boardOptions, setBoardOptions] = useState<string[]>([]);
  const [classOptions, setClassOptions] = useState<string[]>([]);
  // const [sectionOptions, setSectionOptions] = useState<string[]>([]);
  const [subjectOptions, setSubjectOptions] = useState<string[]>([]);

  // 3. Status States
  const [isSidebarLoading, setIsSidebarLoading] = useState(false);
  const [isResourcesLoading, setIsResourcesLoading] = useState(false);
  const [isManualRefreshing, setIsManualRefreshing] = useState(false);
  
  // 4. Data States
  const [allMaterials, setAllMaterials] = useState<any[]>([]);
  const [availableFilters, setAvailableFilters] = useState<any>(null);
  const [activeResourceType, setActiveResourceType] = useState(
    locationState?.activeResourceType || "Videos",
  );

  const resourceTypes = ["Videos", "Notes"];

  // Sync resource type with URL
  useEffect(() => {
    if (location.pathname.includes("teacher-videos")) setActiveResourceType("Videos");
    else if (location.pathname.includes("teacher-notes")) setActiveResourceType("Notes");
  }, [location.pathname]);

  // --- STEP 1: Fetch Sidebar Data from Planner ---
  useEffect(() => {
    const fetchPlannerData = async () => {
      setIsSidebarLoading(true);
      try {
        const response = await ApiServices.getTeacherPlannerData();
        if (response.data.status === "success") {
          const pData = response.data.data;
          
          if (pData.board?.name) {
            setBoard(pData.board.name);
            setBoardOptions([pData.board.name]);
          }

          if (pData.dropdowns) {
            const classes = (pData.dropdowns.classes || []).map((c: any) => c.name);
            const subjects = (pData.dropdowns.subjects || []).map((s: any) => s.name);
            const sections = (pData.dropdowns.sections || []).map((s: any) => s.name);

            setClassOptions(classes);
            setSubjectOptions(subjects);
            // setSectionOptions(sections);

            // Default selections (if not already set)
            if (!className && classes.length > 0) setClassName(classes[0]);
            if (!activeSubject && subjects.length > 0) setActiveSubject(subjects[0]);
            if (!section && sections.length > 0) setSection(sections[0]);
          }
        }
      } catch (error) {}
      finally {
        setIsSidebarLoading(false);
      }
    };
    fetchPlannerData();
  }, []);

  // --- STEP 2: Fetch Materials (Initial and on Filter Change) ---
  const fetchMaterials = useCallback(async (isManual = false) => {
    if (isManual) setIsManualRefreshing(true);
    setIsResourcesLoading(true);

    try {
      const response = await ApiServices.getTeacherStudyMaterial();
      const result = response.data;
      if (result.status === "success") {
        setAllMaterials(result.data.data || []);
        setAvailableFilters(result.data.filters || null);
      }
    } catch (error) {}
    finally {
      setIsResourcesLoading(false);
      setIsManualRefreshing(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchMaterials();
  }, [fetchMaterials]);

  // Handle manual refresh
  const handleRefresh = useCallback(() => {
    fetchMaterials(true);
  }, [fetchMaterials]);


  // --- STEP 3: Client-side Filtering based on Sidebar ---
  const filteredMaterialItems = useMemo(() => {
    if (!availableFilters) return [];
    
    // Resolve selection names to IDs
    const selectedClassId = availableFilters.classes?.find((c: any) => c.name === className)?.id;
    const selectedSubjectId = availableFilters.subjects?.find((s: any) => s.name === activeSubject)?.id;
    const selectedSectionId = availableFilters.sections?.find((s: any) => 
        s.name === section || s.name === `Section ${section}` || (s.id.toString() === section)
    )?.id;

    let filtered = allMaterials;

    if (className) {
        if (selectedClassId) filtered = filtered.filter(m => m.class_id === selectedClassId);
        else filtered = [];
    }

    if (activeSubject && filtered.length > 0) {
        if (selectedSubjectId) filtered = filtered.filter(m => m.subject_id === selectedSubjectId);
        else filtered = []; 
    }

    if (section && filtered.length > 0) {
        if (selectedSectionId) filtered = filtered.filter(m => m.section_id === selectedSectionId);
    }

    return filtered;
  }, [allMaterials, availableFilters, className, activeSubject, section]);

  const dynamicYoutubeLinks = useMemo(() =>
    filteredMaterialItems
      .filter((m: any) => m.file_type === "link")
      .map((m: any) => ({
        title: m.title,
        url: m.resource,
        thumbnail: m.thumbnail,
      })),
    [filteredMaterialItems]
  );

  const dynamicStudyMaterials = useMemo(() =>
    filteredMaterialItems
      .filter((m: any) => m.file_type === "study_material" || m.file_type === "practice_material")
      .map((m: any) => ({
        ...m,
        file_url: m.resource
      })),
    [filteredMaterialItems]
  );

  return (
    <div className="h-full p-6">
      <div className="flex gap-6">
        <MaterialsSidebar
          board={board}
          className={className}
          boardOptions={boardOptions}
          classOptions={classOptions}
          setBoard={setBoard}
          setClassName={setClassName}
          setSubject={setActiveSubject}
          activeSubject={activeSubject}
          subjectOptions={subjectOptions}
          isLoading={isSidebarLoading} // Only shows during sidebar options fetch
        />

        <div className="flex-1">
          <MaterialsHeader
            subjects={subjectOptions}
            activeSubject={activeSubject}
            setActiveSubject={setActiveSubject}
            resourceTypes={resourceTypes}
            activeResourceType={activeResourceType}
            setActiveResourceType={setActiveResourceType}
            onRefresh={handleRefresh}
            isRefreshing={isManualRefreshing} // Separate state for refresh button
          />

          <div className="pr-6">
            {activeResourceType === "Videos" && (
              <ResourceMaterials
                youtubeLinks={dynamicYoutubeLinks}
                isLoading={isResourcesLoading} // Shows during initial materials fetch
              />
            )}
            {activeResourceType === "Notes" && (
              <Notes
                studyMaterials={dynamicStudyMaterials}
                isLoading={isResourcesLoading}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherMaterials;
