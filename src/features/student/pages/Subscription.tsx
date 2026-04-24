import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
// import IconChat from "../../../assets/icon/chat2.svg";
// @ts-ignore
import ApiServices from "../../../services/ApiServices";
import { useToast } from "../../../app/providers/ToastProvider";
// import { useModal } from "../../auth/context/AuthContext";
import PaymentSummaryModal from "../components/PaymentSummaryModal";
import SubscriptionSetupModal from "../components/SubscriptionSetupModal";
import { defaultPlans } from "./defaultPlans";
import SearchableSelect from "../../../components/common/SearchableSelect";

// Types
interface Subject {
  subject_id: number;
  subject_name: string;
}

interface ApiFeature {
  feature_name: string;
  availability: string;
  feature_type: string;
}
interface SubjectPrice {
  subject_id: number;
  price: number;
}
interface ApiPlan {
  plan_id: number;
  plan_name: string;
  plan_tag: string;
  badge: string | null;
  billing_cycle: string;
  duration_days: number;
  payable_amount: number;
  subject_prices?: SubjectPrice[];
  features: ApiFeature[];
  plan_discount_percent: number;
  base_subject_total: number;
  monthly_divisor: number;
}

interface TransformedFeature {
  name: string;
  plans: Record<number, string>;
}

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

interface Section {
  id: number;
  name: string;
}

interface AcademicYear {
  year: string;
}

interface DependencyMapItem {
  academic_year: string;
  board_id: number;
  class_id: number;
  school_id: number;
  section_id?: number;
}

interface AcademicProfile {
  id: string;
  board_id: number | "";
  school_id: number | "";
  class_id: number | "";
  section_id: number | "";
  academic_year: string;
  selectedSubjects: Subject[];
  availableSubjects: Subject[];
  isSubjectsLoading: boolean;
  isExpanded: boolean;
  seats: number;
  selectedPlan?: ApiPlan | null;
}
const createEmptyProfile = (): AcademicProfile => ({
  id: crypto.randomUUID(),
  board_id: "",
  school_id: "",
  class_id: "",
  section_id: "",
  academic_year: "",
  selectedSubjects: [],
  availableSubjects: [],
  isSubjectsLoading: false,
  isExpanded: true,
  seats: 1,
});
const Subscription: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  const [profiles, setProfiles] = useState<AcademicProfile[]>([
    createEmptyProfile(),
  ]);

  const [plans, setPlans] = useState<ApiPlan[]>(defaultPlans);
  const [transformedFeatures, setTransformedFeatures] = useState<
    TransformedFeature[]
  >([]);
  const [hoveredPlanId, setHoveredPlanId] = useState<number | null>(null);

  const [isValidating, setIsValidating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  // const [sheetCount, setSheetCount] = useState<number>(1);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  // const [currentTotalAmount, setCurrentTotalAmount] = useState(0);
  const [discountedAmount, setDiscountedAmount] = useState(0);
  const [showSetupModal, setShowSetupModal] = useState(false);
  // const [profileImage, setProfileImage] = useState<string>("");

  const [boards, setBoards] = useState<Board[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [dependencyMap, setDependencyMap] = useState<DependencyMapItem[]>([]);
  const [activeProfileIndex, setActiveProfileIndex] = useState(0);
  const [isPlansLoading, setIsPlansLoading] = useState(false);
  const [sections, setSections] = useState<Section[]>([]);

  const [showAddSchoolInput, setShowAddSchoolInput] = useState<{
    index: number;
    show: boolean;
  }>({ index: -1, show: false });
  const [newSchoolName, setNewSchoolName] = useState("");
  const [isAddingSchool, setIsAddingSchool] = useState(false);

  const [localUser, setLocalUser] = useState<any>({});

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("active_profile") || "{}");
    setLocalUser(user);
  }, [location.pathname]);
  // const [plansExpanded, setPlansExpanded] = useState(true);
  // const togglePlansAccordion = () => {
  //   setPlansExpanded((prev) => !prev);
  // };

  useEffect(() => {
    const preselected = location.state?.preselectedAcademicDetails;

    const activeProfile = JSON.parse(
      localStorage.getItem("active_profile") || "null"
    );

    if (preselected) {
      setProfiles([
        {
          id: "primary",
          board_id: preselected.board_id || "",
          class_id: preselected.class_id || "",
          school_id: preselected.institute_id || "",
          section_id: preselected.section_id || "",
          academic_year: preselected.academic_year || "",
          selectedSubjects: [],
          availableSubjects: [],
          isSubjectsLoading: false,
          isExpanded: true,
          seats: 1,
          selectedPlan: null,
        },
      ]);
      return;
    }

    if (localUser.role_name === "student" && activeProfile) {
      setProfiles([
        {
          id: "primary",
          board_id: activeProfile.board_id || "",
          class_id: activeProfile.class_id || "",
          school_id: activeProfile.institute_id || "",
          section_id: activeProfile.section_id || "",
          academic_year: "",
          selectedSubjects: [],
          availableSubjects: [],
          isSubjectsLoading: false,
          isExpanded: true,
          seats: 1,
          selectedPlan: null,
        },
      ]);
    }
  }, [location.state, localUser.role_name]);

  useEffect(() => {
    if (!boards.length || !schools.length || !classes.length) return;

    setProfiles((prev) =>
      prev.map((profile) => ({
        ...profile,
        board_id: boards.some((b) => String(b.id) === String(profile.board_id))
          ? profile.board_id
          : profile.board_id,
        school_id: schools.some((s) => String(s.id) === String(profile.school_id))
          ? profile.school_id
          : profile.school_id,
        class_id: classes.some((c) => String(c.id) === String(profile.class_id))
          ? profile.class_id
          : profile.class_id,
        academic_year: academicYears.some(
          (y) => String(y.year) === String(profile.academic_year)
        )
          ? profile.academic_year
          : profile.academic_year,
      }))
    );
  }, [boards, schools, classes, academicYears]);

  React.useEffect(() => {
    // fetchProfileImage();
    fetchAcademicMasterData();
    transformData(defaultPlans);
  }, []);

  const fetchAcademicMasterData = async () => {
    try {
      const response = await ApiServices.getAcademicMasterData();
      if (response.data?.status === "success") {
        const data = response.data.data;
        setBoards(data.boards || []);
        setSchools(data.schools || []);
        setClasses(data.classes || []);
        setSections(data.sections || []);
        const rawYears = data.academic_years || [];
        const formattedYears = rawYears.map((y: any) =>
          typeof y === "string" ? { year: y } : y,
        );
        setAcademicYears(formattedYears);
        setDependencyMap(data.dependency_map || []);
      }
    } catch (error) {
    } finally {
      setIsPageLoading(false);
    }
  };

  const addProfile = () => {
    const baseProfile = profiles[activeProfileIndex] || createEmptyProfile();

    const newProfile: AcademicProfile = {
      ...createEmptyProfile(),
      board_id: baseProfile.board_id,
      school_id: baseProfile.school_id,
      class_id: "",
      academic_year: "",
      selectedSubjects: [],
      availableSubjects: [],
      selectedPlan: null,
      seats: localUser.role_name === "student" ? 1 : 1,
    };

    setProfiles((prev) => [
      ...prev.map((p) => ({ ...p, isExpanded: false })),
      newProfile,
    ]);

    setActiveProfileIndex(profiles.length);
    setPlans(defaultPlans);
    transformData(defaultPlans);
  };

  const toggleProfile = (profileId: string) => {
    setProfiles((prev) =>
      prev.map((p, i) => {
        if (p.id === profileId) {
          const newExpanded = !p.isExpanded;
          if (newExpanded) {
            setActiveProfileIndex(i);
          }
          return { ...p, isExpanded: newExpanded };
        }
        return p;
      }),
    );
  };

  const removeProfile = (profileId: string) => {
    if (profiles.length <= 1) return;

    setProfiles((prev) => {
      const updated = prev.filter((p) => p.id !== profileId);
      if (activeProfileIndex >= updated.length) {
        setActiveProfileIndex(updated.length - 1);
      }
      return updated;
    });
  };

  const updateProfile = (index: number, updates: Partial<AcademicProfile>) => {
    setProfiles((prev) =>
      prev.map((p, i) => {
        if (i !== index) return p;
        const updatedProfile = { ...p, ...updates };
        if (localUser.role_name === "student") {
          updatedProfile.seats = 1;
        }
        return updatedProfile;
      }),
    );
  };

  const handleAddSchool = async (profileIndex: number) => {
    if (!newSchoolName.trim()) return;
    setIsAddingSchool(true);
    const res = await ApiServices.addInstitute({
      school_name: newSchoolName.trim(),
    });

    if (res.data?.status === "success") {
      const newSchool = res.data.data;
      setSchools((prev) => [...prev, newSchool]);
      updateProfile(profileIndex, { school_id: newSchool.id });
      setNewSchoolName("");
      setShowAddSchoolInput({ index: -1, show: false });
      showToast("School added successfully", "success");
    }
    setIsAddingSchool(false);
  };

  // const fetchProfileImage = async () => {
  //   try {
  //     const response = await ApiServices.getUserProfileImage();
  //     if (response.data?.status === "success" && response.data?.data?.image) {
  //       setProfileImage(response.data.data.image);
  //     }
  //   } catch (error) { }
  // };

  React.useEffect(() => {
    profiles.forEach((profile, index) => {
      if (profile.board_id && profile.class_id && profile.academic_year) {
        fetchAvailableSubjects(index);
      }
    });
  }, [
    profiles.map((p) => p.board_id).join(","),
    profiles.map((p) => p.class_id).join(","),
    profiles.map((p) => p.school_id).join(","),
    profiles.map((p) => p.academic_year).join(","),
  ]);

  const allSelectedSubjects = React.useMemo(() => {
    return profiles.flatMap((p) => p.selectedSubjects);
  }, [profiles]);
  const totalSeats = React.useMemo(() => {
    return profiles.reduce((sum, p) => sum + (p.seats || 0), 0);
  }, [profiles]);
  
  const activeProfile = profiles[activeProfileIndex] || profiles[0] || null;
  const subjectIds = activeProfile
    ? activeProfile.selectedSubjects.map((s) => s.subject_id).join(",")
    : "";
  const isPlanSelectable =
    activeProfile && activeProfile.selectedSubjects.length > 0;
  const selectedPlan = React.useMemo(
    () => activeProfile?.selectedPlan || null,
    [activeProfile],
  );

  useEffect(() => {
    if (!activeProfile) return;

    if (activeProfile.selectedSubjects.length === 0) {
      setPlans(defaultPlans);
      transformData(defaultPlans);
      updateProfile(activeProfileIndex, {
        selectedPlan: null,
      });
      return;
    }
    fetchSubscriptionPlans();
  }, [
    activeProfile?.board_id,
    activeProfile?.class_id,
    activeProfile?.academic_year,
    activeProfile?.selectedSubjects.length,
  ]);

  useEffect(() => {
    if (subjectIds.length === 0) {
      updateProfile(activeProfileIndex, {
        selectedPlan: null,
      });
    }
  }, [subjectIds]);

  const fetchSubscriptionPlans = async () => {
    if (!activeProfile) return;
    setIsPlansLoading(true);

    try {
      const payload = {
        board_id: activeProfile.board_id,
        class_id: activeProfile.class_id,
        academic_year: activeProfile.academic_year,
        subject_ids: activeProfile.selectedSubjects.map((s) => s.subject_id),
      };

      const response = await ApiServices.getSubscriptionPlans(payload);

      if (response.data?.status === "success") {
        const fetchedPlans: ApiPlan[] = response.data.data;
        setPlans(fetchedPlans);
        transformData(fetchedPlans);
      }
    } catch (err) {
    } finally {
      setIsPlansLoading(false);
    }
  };

  const transformData = (fetchedPlans: ApiPlan[]) => {
    const allFeatureNames = Array.from(
      new Set(
        fetchedPlans.flatMap((p) => p.features.map((f) => f.feature_name)),
      ),
    );

    const transformed = allFeatureNames.map((featureName) => {
      const plansMap: Record<number, string> = {};
      fetchedPlans.forEach((plan) => {
        const feature = plan.features.find(
          (f) => f.feature_name === featureName,
        );
        if (!feature) {
          plansMap[plan.plan_id] = "false";
          return;
        }
        const { feature_type, availability } = feature;
        if (feature_type === "BOOLEAN") {
          plansMap[plan.plan_id] =
            availability === "AVAILABLE" ? "true" : "false";
          return;
        }
        if (availability === "NONE" || availability === "NOT_AVAILABLE") {
          plansMap[plan.plan_id] = "false";
          return;
        }
        if (feature_type === "CONTENT_LEVEL") {
          if (
            feature.feature_name === "Knowledge Hub (Videos & Notes)" &&
            availability === "VIDEOS"
          ) {
            plansMap[plan.plan_id] = "true";
          } else if (availability === "VIDEOS") {
            plansMap[plan.plan_id] = "Videos";
          } else if (availability === "VIDEOS_AND_NOTES") {
            plansMap[plan.plan_id] = "Videos & Notes";
          } else if (availability === "FULL_VIEW") {
            plansMap[plan.plan_id] = "true";
          }
          return;
        }
        if (feature_type === "USAGE_LIMIT") {
          if (feature.feature_name === "Assessments") {
            if (availability === "VIDEOS_AND_NOTES") {
              plansMap[plan.plan_id] = "Videos + Notes";
            } else if (
              availability === "NONE" ||
              availability === "NOT_AVAILABLE"
            ) {
              plansMap[plan.plan_id] = "false";
            } else {
              plansMap[plan.plan_id] =
                availability === "UNLIMITED" ? "Unlimited" : "Limited";
            }
            return;
          }
          plansMap[plan.plan_id] =
            availability === "UNLIMITED" ? "Unlimited" : "Limited";
          return;
        }
        if (feature_type === "ACCESS_LEVEL") {
          if (availability === "BASIC") {
            plansMap[plan.plan_id] = "Basic";
          } else if (availability === "FULL_VIEW") {
            plansMap[plan.plan_id] = "Full View";
          } else if (availability === "AVAILABLE") {
            plansMap[plan.plan_id] = "true";
          }
          return;
        }
        plansMap[plan.plan_id] = "false";
      });
      return { name: featureName, plans: plansMap };
    });
    setTransformedFeatures(transformed);
  };

  const fetchAvailableSubjects = async (profileIndex: number) => {
    const profile = profiles[profileIndex];
    if (!profile.board_id || !profile.class_id || !profile.academic_year)
      return;
    setProfiles((prev) =>
      prev.map((p, i) =>
        i === profileIndex ? { ...p, isSubjectsLoading: true } : p,
      ),
    );
    try {
      const payload = {
        board_name: profile.board_id,
        class_name: profile.class_id,
        institute_name: profile.school_id || null,
        academic_year: profile.academic_year,
      };
      const response = await ApiServices.getSubjectsByBoards(payload);
      if (response.data?.status === "success") {
        const newSubjects = response.data.data.subjects || [];
        setProfiles((prev) =>
          prev.map((p, i) => {
            if (i === profileIndex) {
              return {
                ...p,
                availableSubjects: newSubjects,
                selectedSubjects: p.selectedSubjects.filter((s) =>
                  newSubjects.some(
                    (ns: Subject) => ns.subject_id === s.subject_id,
                  ),
                ),
                isSubjectsLoading: false,
              };
            }
            return p;
          }),
        );
      }
    } catch (err) {
      setProfiles((prev) =>
        prev.map((p, i) =>
          i === profileIndex ? { ...p, isSubjectsLoading: false } : p,
        ),
      );
    }
  };

  const handleOpenPaymentModal = async () => {
    if (!selectedPlan) {
      showToast("Please select a plan first.", "warning");
      return;
    }
    setIsValidating(true);
    try {
      const validatePayload = {
        profiles: buildProfilesPayload(),
        ui_total_amount: Number(uiTotalAmount.toFixed(2)),
        total_licences: totalSeats,
      };
      const response = await ApiServices.validatePlanAmount(validatePayload);
      if (response.data?.status === "success") {
        // setCurrentTotalAmount(uiTotalAmount);
        setShowPaymentModal(true);
      } else {
        showToast(response.data?.message || "Plan validation failed", "error");
      }
    } catch (error) {
      showToast("Validation failed. Please try again.", "error");
    } finally {
      setIsValidating(false);
    }
  };

  const handlePayNow = async (subscriptionName: string, couponCode: string) => {
    if (!selectedPlan) return;
    try {
      const paymentData = {
        profiles: buildProfilesPayload(),
        ui_total_amount: Number(uiTotalAmount.toFixed(2)),
        discounted_amount: Number(discountedAmount.toFixed(2)),
        final_amount: Number((uiTotalAmount - discountedAmount).toFixed(2)),
        total_licenses: totalSeats,
        subscription_name: subscriptionName,
        coupon_code: couponCode || undefined,
        currency: "INR",
      };
      setShowPaymentModal(false);
      navigate("/payment", {
        state: { paymentData: paymentData, plan: selectedPlan },
      });
    } catch (error) {
      showToast("Failed to navigate to payment.", "error");
    }
  };

  const handleApplyCoupon = async (couponCode: string) => {
    if (!couponCode.trim()) {
      showToast("Please enter a coupon code.", "warning");
      return { success: false, message: "" };
    }
    try {
      const payload = {
        profiles: buildProfilesPayload(),
        ui_total_amount: Number(uiTotalAmount.toFixed(2)),
        total_licences: totalSeats,
        coupon_code: couponCode,
      };
      const response = await ApiServices.validatePlanAmount(payload);
      if (response.data?.status === "success") {
        const data = response.data?.data;
        setDiscountedAmount(Number((data?.db_discount || 0).toFixed(2)));
        // setCurrentTotalAmount(Number((data?.db_final || 0).toFixed(2)));
        showToast("Coupon applied successfully!", "success");

        return {
          success: true,
          data: {
            db_discount: data?.db_discount || 0,
            db_final: data?.db_final || 0,
            db_total: data?.db_total || 0,
          },
        };
      } else {
        const errorMessage = response.data?.message || "Invalid coupon code";
        showToast(errorMessage, "error");
        return { success: false, message: errorMessage };
      }
    } catch (error) {
      showToast("Failed to apply coupon.", "error");
      return { success: false, message: "Failed to apply coupon" };
    }
  };

  const uiTotalAmount = React.useMemo(() => {
    return profiles.reduce((total, profile) => {
      if (profile.selectedSubjects.length === 0) return total;
      const plan = profile.selectedPlan || selectedPlan;
      if (!plan) return total;

      const selectedSubjectIds = profile.selectedSubjects.map(s => s.subject_id);
      const subjectTotal =
        plan.subject_prices
          ?.filter(sp => selectedSubjectIds.includes(sp.subject_id))
          .reduce((sum, sp) => sum + (sp.price || 0), 0) || 0;
      const discountPercent = plan.plan_discount_percent || 0;
      const afterDiscount = subjectTotal - (subjectTotal * discountPercent) / 100;

      return total + afterDiscount * profile.seats;
    }, 0);
  }, [profiles, selectedPlan]);

  const buildProfilesPayload = () => {
    return profiles.map((p) => {
      const plan = p.selectedPlan || selectedPlan;
      const selectedSubjectIds = p.selectedSubjects.map(s => s.subject_id);
      const subjectTotal =
        plan?.subject_prices
          ?.filter(sp => selectedSubjectIds.includes(sp.subject_id))
          .reduce((sum, sp) => sum + (sp.price || 0), 0) || 0;
      const discountPercent = plan?.plan_discount_percent || 0;
      const afterDiscount = subjectTotal - (subjectTotal * discountPercent) / 100;
      const profileAmount = afterDiscount * (p.seats || 1);

      return {
        plan_id: plan?.plan_id,
        board_id: p.board_id,
        class_id: p.class_id,
        academic_year: p.academic_year,
        institute_id: p.school_id || null,
        section_id: p.section_id || null,
        subject_ids: p.selectedSubjects.map((s) => s.subject_id),
        total_licenses: p.seats,
        licenses_used: localUser.role_name === "student" ? 1 : 0,
        profile_amount: Number(profileAmount.toFixed(2)),
      };
    });
  };

  const handleSave = async () => {
    if (!selectedPlan) return;
    setIsSaving(true);
    try {
      const payload = {
        profiles: buildProfilesPayload().map((p) => ({
          plan_id: p.plan_id,
          board_id: p.board_id,
          class_id: p.class_id,
          academic_year: p.academic_year,
          institute_id: p.institute_id,
          subject_ids: p.subject_ids,
          total_licenses: p.total_licenses,
          licenses_used: p.licenses_used,
        })),
        subscription_name: `Plan_${selectedPlan?.plan_id}_${new Date()
          .toLocaleString("en-IN", { month: "long", year: "numeric" })
          .replace(" ", "")}`,
        total_amount: Number(uiTotalAmount.toFixed(2)),
        ui_total_amount: Number(uiTotalAmount.toFixed(2)),
        total_licenses: totalSeats,
      };
      const response = await ApiServices.saveSubscriptionDraft(payload);
      if (response.data?.status === "success") {
        showToast("Draft saved successfully", "success");
      } else {
        showToast(response.data?.message || "Failed to save draft", "error");
      }
    } catch (error) {
      showToast("Something went wrong.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveSubject = (profileIndex: number, subjectId: number) => {
    setProfiles((prev) =>
      prev.map((p, i) => {
        if (i === profileIndex) {
          const updated = p.selectedSubjects.filter(
            (s) => s.subject_id !== subjectId,
          );
          return { ...p, selectedSubjects: updated };
        }
        return p;
      }),
    );
  };

  const handleAddSubject = (profileIndex: number, subject: Subject) => {
    setProfiles((prev) =>
      prev.map((p, i) => {
        if (i === profileIndex) {
          if (
            !p.selectedSubjects.some((s) => s.subject_id === subject.subject_id)
          ) {
            const updated = [...p.selectedSubjects, subject];
            return { ...p, selectedSubjects: updated };
          }
        }
        return p;
      }),
    );
  };

  const renderCell = (value?: string, textColor: string = "text-gray-500") => {
    if (!value) {
      return (
        <div className="w-5 h-5 rounded-full bg-[#C3CFD1] flex items-center justify-center mx-auto">
          <span className="material-symbols-outlined text-[#DE4B3B]">
            close
          </span>
        </div>
      );
    }
    if (value === "true") {
      return (
        <div className="w-5 h-5 rounded-full bg-[#333C5B] flex items-center justify-center mx-auto">
          <span className="material-symbols-outlined text-[#B0CB1F]">
            check
          </span>
        </div>
      );
    }
    if (value === "false") {
      return (
        <div className="w-5 h-5 rounded-full bg-[#C3CFD1] flex items-center justify-center mx-auto">
          <span className="material-symbols-outlined text-[#DE4B3B]">
            close
          </span>
        </div>
      );
    }
    return (
      <span className={`${textColor} font-medium text-sm capitalize`}>
        {String(value).toLowerCase().replace(/_/g, " ")}
      </span>
    );
  };

  const getDurationLabel = (plan: ApiPlan) => {
    const months = Math.round(plan.duration_days / 30);
    switch (plan.billing_cycle) {
      case "trial":
        return `${plan.duration_days / 7} Week`;
      case "quarterly":
      case "half_yearly":
        return `${months} mth`;
      case "yearly":
        return "Yrly";
      default:
        return "";
    }
  };

  const calculatePlanDisplayPrice = (plan: ApiPlan, licenses: number) => {
    const subjectTotal =
      plan.subject_prices?.reduce((sum, sp) => sum + (sp.price || 0), 0) || 0;
    const discountPercent = plan.plan_discount_percent || 0;
    const afterDiscount = subjectTotal - (subjectTotal * discountPercent) / 100;
    return afterDiscount * licenses;
  };

  const handleSetupConfirm = (data: any) => {
    updateProfile(0, {
      board_id: data.selectedBoard,
      school_id: data.selectedSchool,
      class_id: data.selectedClass,
      academic_year: data.selectedYear,
      availableSubjects: data.availableSubjects,
      selectedSubjects: data.selectedSubjects,
    });
    // setSheetCount(data.sheetCount);
    setShowSetupModal(false);
  };

  return (
    <div className="min-h-screen relative px-2 sm:px-4">
      {/* Setup Modal */}
      <SubscriptionSetupModal
        isOpen={showSetupModal}
        initialData={location.state?.preselectedAcademicDetails}
        onConfirm={handleSetupConfirm}
      />

      {isPageLoading && !showSetupModal && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-xl">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-gray-200 border-t-[#BADA55] rounded-full animate-spin"></div>
            <span className="text-sm text-gray-500 font-medium">
              Loading subscription...
            </span>
          </div>
        </div>
      )}

      {/* ─── TOP HEADER ─────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-col sm:items-start sm:justify-between gap-5 mb-6">
        <div className="flex items-center justify-between w-full">
          {localUser.role_name !== "student" && (
            <button
              onClick={addProfile}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#BADA55] text-white rounded-xl text-sm font-bold shadow-sm shadow-[#BADA55]/40 hover:bg-lime-500 transition-all active:scale-95"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              Add More Plans
            </button>
          )}
        </div>

        <div className="flex flex-col gap-4 w-full flex-1 relative">
          {" "}
          {profiles.map((p, profileIndex) => {
            const validDependencies = dependencyMap.filter((dep) => {
              if (p.board_id && dep.board_id !== Number(p.board_id))
                return false;
              if (p.school_id && dep.school_id !== Number(p.school_id))
                return false;
              if (p.class_id && dep.class_id !== Number(p.class_id))
                return false;
              if (p.academic_year && dep.academic_year !== p.academic_year)
                return false;
              return true;
            });

            const useFilter =
              p.board_id !== "" ||
              p.school_id !== "" ||
              p.class_id !== "" ||
              p.academic_year !== "";

            const validBoards = useFilter
              ? Array.from(new Set(validDependencies.map((d) => d.board_id)))
              : boards.map((b) => b.id);
            const validSchools = useFilter
              ? Array.from(new Set(validDependencies.map((d) => d.school_id)))
              : schools.map((s) => s.id);
            const validClasses = useFilter
              ? Array.from(new Set(validDependencies.map((d) => d.class_id)))
              : classes.map((c) => c.id);
            const validSections = useFilter
              ? Array.from(new Set(validDependencies.map((d) => d.section_id)))
              : sections.map((s) => s.id);
            const validYears = useFilter
              ? Array.from(
                new Set(validDependencies.map((d) => d.academic_year)),
              )
              : academicYears.map((y) => y.year);

            const filteredBoards = useFilter
              ? boards.filter((b) => validBoards.includes(b.id))
              : boards;
            const filteredSchools = useFilter
              ? schools.filter((s) => validSchools.includes(s.id))
              : schools;
            const filteredClasses = useFilter
              ? classes.filter((c) => validClasses.includes(c.id))
              : classes;
            const filteredSections = useFilter
              ? sections.filter((s) => validSections.includes(s.id))
              : sections;
            const filteredYears = useFilter
              ? academicYears.filter((y) => validYears.includes(y.year))
              : academicYears;

            const boardLabel = boards.find((b) => b.id === p.board_id)?.name;
            const classLabel = classes.find((c) => c.id === p.class_id)?.name;
            const schoolLabel = schools.find((s) => s.id === p.school_id)?.name;

            return (
              <div
                key={p.id}
                className={`flex flex-col rounded-xl border border-white/60 shadow-sm ${p.isExpanded ? "overflow-visible" : "overflow-hidden"}`}
              >
                {/* Header Section */}
                <div
                  className={`flex items-center justify-between px-4 py-2 cursor-pointer transition-colors duration-200 ${p.isExpanded ? "bg-white/20" : "hover:bg-white/30"
                    }`}
                  onClick={() => toggleProfile(p.id)}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="material-symbols-outlined text-gray-400 text-[20px] transition-transform duration-200"
                      style={{
                        transform: p.isExpanded ? "rotate(90deg)" : "rotate(0)",
                      }}
                    >
                      chevron_right
                    </span>
                    <span className="text-sm font-bold text-primary uppercase tracking-widest">
                      Plan #{profileIndex + 1}
                    </span>
                    {!p.isExpanded && useFilter && (
                      <div className="flex items-center gap-2 overflow-hidden max-w-[550px]">
                        <span className="text-gray-300">|</span>
                        <span className="text-[11px] text-teal-600 font-semibold truncate max-w-[470px]">
                          {[
                            boardLabel,
                            schoolLabel,
                            classLabel ? `Class ${classLabel}` : null,
                            p.academic_year,
                            `Seats ${p.seats}`,
                          ]
                            .filter(Boolean)
                            .join(" • ")}
                        </span>
                        {p.selectedSubjects.length > 0 && (
                          <div className="flex items-center gap-2 overflow-hidden shrink-0">
                            <span className="text-gray-300">|</span>
                            <div className="flex items-center gap-1.5 overflow-hidden">
                              <span className="text-[11px] text-[#6a8412] font-bold truncate max-w-[120px]">
                                {" "}
                                {p.selectedSubjects
                                  .slice(0, 2)
                                  .map((s) => s.subject_name)
                                  .join(", ")}
                              </span>
                              {p.selectedSubjects.length > 2 && (
                                <span
                                  className="text-[10px] bg-[#BADA55]/20 text-[#6a8412] px-1.5 py-0.5 rounded flex-shrink-0 font-black cursor-help hover:bg-[#BADA55] hover:text-white transition-all duration-200"
                                  title={p.selectedSubjects
                                    .map((s) => s.subject_name)
                                    .join(", ")}
                                >
                                  +{p.selectedSubjects.length - 2} more
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div
                    className="flex items-center gap-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {profiles.length > 1 && (
                      <button
                        onClick={() => removeProfile(p.id)}
                        className="text-red-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50/50 transition-colors"
                        title="Remove Profile"
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          delete
                        </span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Content Section (Collapsible) */}
                <div
                  className={`transition-all duration-300 ease-in-out ${p.isExpanded
                    ? "max-h-[75vh] opacity-100 py-3 overflow-y-auto"
                    : "max-h-0 opacity-0 py-0 overflow-hidden"
                    }`}
                >
                  <div className="px-4 flex flex-col gap-3">
                    <div className="grid grid-cols-7 gap-3 w-full">
                      {/* Board */}
                      <div className="flex flex-col gap-1">
                        <label className="text-sm tracking-widest text-primary font-bold px-1 uppercase">
                          Board
                        </label>
                        <div className="relative w-full">
                          <SearchableSelect
                            value={p.board_id ? String(p.board_id) : ""}
                            onChange={(val) => {
                              updateProfile(profileIndex, {
                                board_id: val ? Number(val) : "",
                                school_id: "",
                                class_id: "",
                                section_id: "",
                                academic_year: "",
                                selectedSubjects: [],
                                availableSubjects: [],
                                selectedPlan: null,
                              });
                            }}
                            options={filteredBoards.map((b) => ({
                              value: String(b.id),
                              label: b.name,
                            }))}
                            placeholder="Board"
                            className="w-full bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-700 font-medium shadow-sm hover:border-[#BADA55]"
                          />
                        </div>
                      </div>

                      {/* School */}
                      <div className="flex flex-col gap-1">
                        <label className="text-sm tracking-widest text-primary font-bold px-1 uppercase">
                          School
                        </label>
                        <div className="relative w-full">
                          <SearchableSelect
                            value={p.school_id}
                            onChange={(val) => {
                              if (val === "ADD_NEW") {
                                setShowAddSchoolInput({
                                  index: profileIndex,
                                  show: true,
                                });
                                updateProfile(profileIndex, { school_id: "" });
                              } else {
                                updateProfile(profileIndex, {
                                  school_id: val === "" ? "" : Number(val),
                                  section_id: "",
                                });
                                setShowAddSchoolInput({
                                  index: -1,
                                  show: false,
                                });
                              }
                            }}
                            options={filteredSchools.map((s) => ({
                              value: s.id,
                              label: s.name,
                            }))}
                            placeholder="School"
                            className="w-full bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-700 font-medium shadow-sm hover:border-[#BADA55] focus:outline-none transition-all"
                            dropdownClassName="min-w-[180px]"
                          />
                        </div>
                        {showAddSchoolInput.index === profileIndex &&
                          showAddSchoolInput.show && (
                            <div className="flex gap-1.5 mt-1 w-[200px] absolute top-full left-0 z-50">
                              <input
                                value={newSchoolName}
                                onChange={(e) =>
                                  setNewSchoolName(e.target.value)
                                }
                                placeholder="School name"
                                className="flex-1 px-2.5 py-1.5 border border-white bg-white/90 backdrop-blur shadow-lg rounded-xl text-xs focus:outline-none"
                              />
                              <button
                                onClick={() => handleAddSchool(profileIndex)}
                                disabled={isAddingSchool}
                                className="px-2.5 py-1.5 bg-[#464646] text-white rounded-xl text-xs font-medium hover:bg-[#333] transition-colors whitespace-nowrap"
                              >
                                {isAddingSchool ? "…" : "Add"}
                              </button>
                            </div>
                          )}
                      </div>

                      {/* Class */}
                      <div className="flex flex-col gap-1">
                        <label className="text-sm tracking-widest text-primary font-bold px-1 uppercase">
                          Class
                        </label>
                        <div className="relative w-full">
                          <SearchableSelect
                            value={p.class_id}
                            onChange={(val) => {
                              updateProfile(profileIndex, {
                                class_id: val === "" ? "" : Number(val),
                                section_id: "",
                              });
                            }}
                            options={filteredClasses.map((c) => ({
                              value: c.id,
                              label: c.name,
                            }))}
                            placeholder="Class"
                            className="w-full bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-700 font-medium shadow-sm hover:border-[#BADA55] focus:outline-none transition-all"
                            dropdownClassName="min-w-[140px]"
                          />
                        </div>
                      </div>

                      {/* Section */}
                      <div className="flex flex-col gap-1">
                        <label className="text-sm tracking-widest text-primary font-bold px-1 uppercase">
                          Section
                        </label>
                        <div className="relative w-full">
                          <SearchableSelect
                            value={p.section_id}
                            onChange={(val) => {
                              updateProfile(profileIndex, {
                                section_id: val === "" ? "" : Number(val),
                              });
                            }}
                            options={filteredSections.map((s) => ({
                              value: s.id,
                              label: s.name,
                            }))}
                            placeholder="Section"
                            className="w-full bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs"
                            dropdownClassName="min-w-[120px]"
                          />
                        </div>
                      </div>

                      {/* Academic Year */}
                      <div className="flex flex-col gap-1">
                        <label className="text-sm tracking-widest text-primary font-bold px-1 uppercase">
                          Year
                        </label>
                        <div className="relative w-full">
                          <SearchableSelect
                            value={p.academic_year}
                            onChange={(val) => {
                              updateProfile(profileIndex, {
                                academic_year: String(val),
                              });
                            }}
                            options={filteredYears.map((y) => ({
                              value: y.year,
                              label: y.year,
                            }))}
                            placeholder="Year"
                            className="w-full bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-700 font-medium shadow-sm hover:border-[#BADA55] focus:outline-none transition-all"
                            dropdownClassName="min-w-[110px]"
                          />
                        </div>
                      </div>

                      {/* Clear for this profile */}
                      <div className="flex items-end">
                        {useFilter && (
                          <button
                            onClick={() =>
                              updateProfile(profileIndex, {
                                board_id: "",
                                school_id: "",
                                class_id: "",
                                section_id: "",
                                academic_year: "",
                                selectedSubjects: [],
                                availableSubjects: [],
                                selectedPlan: null,
                              })
                            }
                            className="w-full h-[32px] px-3 py-1.5 bg-gray-100/50 text-gray-500 border border-gray-200 rounded-lg text-[10px] font-bold hover:bg-gray-100 transition-colors uppercase tracking-wider"
                          >
                            Clear
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Subject Selection for this profile */}
                    {(p.availableSubjects.length > 0 ||
                      p.isSubjectsLoading) && (
                        <div className="mt-1 border-t border-white/40 pt-2">
                          <p className="text-sm uppercase tracking-widest text-primary font-bold px-1 mb-2">
                            Select Subjects
                          </p>
                          {p.isSubjectsLoading ? (
                            <div className="flex items-center gap-2 px-1">
                              <div className="w-3 h-3 border-2 border-gray-200 border-t-[#BADA55] rounded-full animate-spin"></div>
                              <span className="text-[10px] text-gray-400">
                                Loading...
                              </span>
                            </div>
                          ) : (
                            <div className="mt-3 w-full md:w-[85%]">
                              <div className="flex flex-wrap gap-1.5">
                                {p.availableSubjects.map((subject) => {
                                  const isSelected = p.selectedSubjects.some(
                                    (s) => s.subject_id === subject.subject_id,
                                  );
                                  return (
                                    <button
                                      key={subject.subject_id}
                                      onClick={() => {
                                        isSelected
                                          ? handleRemoveSubject(
                                            profileIndex,
                                            subject.subject_id,
                                          )
                                          : handleAddSubject(profileIndex, subject);
                                      }}
                                      className={`relative px-3 py-1 rounded-full text-sm font-bold transition-all duration-200 border
                                    ${isSelected
                                          ? "bg-[#b0cb1f] text-gray-800 border-[#9ab515]"
                                          : "bg-white text-gray-500 border-gray-200 hover:border-[#b0cb1f] hover:text-gray-800"
                                        }`}
                                    >
                                      {subject.subject_name}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    {/* ─── PRICING GRID ───────────────────────────────────────── */}
                    <div className="relative mt-6 sm:mt-10 min-h-[300px] w-full">
                      {" "}
                      {isPlansLoading && (
                        <div className="absolute inset-0 z-0 flex items-center justify-center bg-white/60 backdrop-blur-sm rounded-xl">
                          <div className="flex flex-col items-center gap-3">
                            <div className="w-8 h-8 border-4 border-gray-200 border-t-[#BADA55] rounded-full animate-spin"></div>
                            <span className="text-sm text-gray-500 font-medium">
                              Loading plans...
                            </span>
                          </div>
                        </div>
                      )}
                      {plans.length === 0 ? (
                        <div className="text-center py-16 sm:py-20" />
                      ) : (
                        <>
                          {/* ── DESKTOP TABLE (md+) ── */}
                          <div className="hidden md:block">
                            <div
                              className="grid w-full gap-x-2 lg:gap-x-4"
                              style={{
                                gridTemplateColumns: `1.4fr repeat(${plans.length}, 1fr)`,
                                gridTemplateRows: `auto repeat(${transformedFeatures.length}, auto) auto`,
                              }}
                            >
                              {/* Background column highlights */}
                              {plans.map((plan, index) => (
                                <div
                                  key={`bg-${plan.plan_id}`}
                                  className={`mx-2 lg:mx-3 transition-all duration-300 overflow-hidden ${selectedPlan?.plan_id === plan.plan_id
                                    ? "bg-white shadow-[0_0_20px_rgba(186,218,85,0.4)] border-2 border-[#BADA55]/40"
                                    : hoveredPlanId === plan.plan_id
                                      ? "bg-white/80 shadow-md border border-gray-100"
                                      : "bg-[#F7FAE9]/60 border border-transparent"
                                    }`}
                                  style={{
                                    gridColumn: index + 2,
                                    gridRow: "1 / -1",
                                    borderRadius: "24px",
                                    zIndex: 1,
                                  }}
                                />
                              ))}

                              {/* Click overlay */}
                              {plans.map((plan, index) => (
                                <div
                                  key={`click-${plan.plan_id}`}
                                  onMouseEnter={() =>
                                    setHoveredPlanId(plan.plan_id)
                                  }
                                  onMouseLeave={() => setHoveredPlanId(null)}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    if (isPlanSelectable) {
                                      updateProfile(activeProfileIndex, {
                                        selectedPlan:
                                          selectedPlan?.plan_id === plan.plan_id
                                            ? null
                                            : plan,
                                      });
                                    } else {
                                      showToast(
                                        "Please select a subject to view pricing and enable selection.",
                                        "warning",
                                      );
                                    }
                                  }}
                                  className={
                                    isPlanSelectable
                                      ? "cursor-pointer outline-none"
                                      : "cursor-not-allowed opacity-50 outline-none"
                                  }
                                  style={{
                                    gridColumn: index + 2,
                                    gridRow: "1 / -1",
                                    zIndex: 20,
                                  }}
                                ></div>
                              ))}

                              {/* Header label */}
                              <div
                                className="p-4 pt-6 pl-4 lg:pl-6 relative"
                                style={{ gridColumn: 1, gridRow: 1 }}
                              >
                                <h2 className="text-lg lg:text-xl font-black text-gray-800 uppercase tracking-tight">
                                  Choose a Plan
                                </h2>
                                <p className="text-teal-600 text-[10px] font-bold uppercase tracking-widest mt-1">
                                  Select Your Goal
                                </p>
                              </div>
                              <div
                                className="border-b-2 border-gray-100 w-full h-px z-10 pointer-events-none"
                                style={{
                                  gridColumn: "1 / -1",
                                  gridRow: 1,
                                  alignSelf: "end",
                                }}
                              />

                              {/* Plan header cells */}
                              {plans.map((plan, index) => (
                                <div
                                  key={plan.plan_id}
                                  onMouseEnter={() =>
                                    setHoveredPlanId(plan.plan_id)
                                  }
                                  onMouseLeave={() => setHoveredPlanId(null)}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    if (isPlanSelectable) {
                                      updateProfile(activeProfileIndex, {
                                        selectedPlan:
                                          selectedPlan?.plan_id === plan.plan_id
                                            ? null
                                            : plan,
                                      });
                                    } else {
                                      showToast(
                                        "Please select at least one subject to enable plan selection.",
                                        "warning",
                                      );
                                    }
                                  }}
                                  className={`mx-1.5 lg:mx-3 text-center z-10 pb-4 pt-8 lg:pt-10 px-2 transition-all rounded-t-[24px] duration-200 outline-none ${activeProfile?.selectedSubjects?.length
                                    ? "cursor-pointer"
                                    : "cursor-not-allowed"
                                    } ${selectedPlan?.plan_id === plan.plan_id
                                      ? "bg-[#BADA55]/10"
                                      : activeProfile?.selectedSubjects?.length
                                        ? "hover:bg-gray-50"
                                        : ""
                                    }`}
                                  style={{ gridColumn: index + 2, gridRow: 1 }}
                                >
                                  <p className="text-black text-xs lg:text-sm font-black uppercase tracking-tighter leading-none mb-3">
                                    {plan.plan_name.replace(" Plan", "")} <br />{" "}
                                    PLAN
                                  </p>
                                  <div className="flex flex-col justify-center items-center gap-1">
                                    <div className="text-center">
                                      {plan.plan_tag && (
                                        <p className="text-base lg:text-lg font-black text-[#5C5082] leading-tight">
                                          {plan.plan_tag.split(" ")[0]}
                                        </p>
                                      )}
                                      {plan.plan_tag &&
                                        plan.plan_tag.split(" ").length > 1 && (
                                          <p className="text-[#5C5082] font-bold text-[9px] lg:text-[10px] uppercase tracking-wider">
                                            {plan.plan_tag
                                              .split(" ")
                                              .slice(1)
                                              .join(" ")}
                                          </p>
                                        )}
                                    </div>
                                    <div className="text-center">
                                      {plan.billing_cycle === "trial" ? (
                                        <>
                                          <p className="text-teal-500 text-[10px] lg:text-xs font-semibold">
                                            ₹ 0 / {getDurationLabel(plan)}
                                          </p>
                                          <div className="text-gray-400 text-[10px] lg:text-xs">
                                            (NA)
                                          </div>
                                        </>
                                      ) : (
                                        <>
                                          <p className="text-teal-500 text-[10px] lg:text-xs font-semibold">
                                            ₹{" "}
                                            {calculatePlanDisplayPrice(
                                              plan,
                                              activeProfile?.seats || 1,
                                            ).toFixed(2)}{" "}
                                            / {getDurationLabel(plan)}
                                          </p>
                                          <div className="text-gray-400 text-[10px] lg:text-xs">
                                            {(
                                              calculatePlanDisplayPrice(
                                                plan,
                                                totalSeats,
                                              ) / (plan.monthly_divisor || 1)
                                            ).toFixed(2)}{" "}
                                            / month
                                            {plan.plan_discount_percent > 0 && (
                                              <span className="ml-1">
                                                (Less{" "}
                                                {plan.plan_discount_percent}%)
                                              </span>
                                            )}
                                            {plan.badge && (
                                              <span className="ml-1">
                                                ({plan.badge})
                                              </span>
                                            )}
                                          </div>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}

                              {/* Feature rows */}
                              {transformedFeatures.map((feature, index) => {
                                const row = index + 2;
                                return (
                                  <React.Fragment key={feature.name}>
                                    <div
                                      className="border-b border-gray-200 w-full h-px z-20 pointer-events-none"
                                      style={{
                                        gridColumn: "1 / -1",
                                        gridRow: row,
                                        alignSelf: "end",
                                      }}
                                    />
                                    <div
                                      className="px-3 lg:px-5 py-2 lg:py-3 text-gray-700 font-bold text-xs lg:text-sm flex items-center z-10 pointer-events-none"
                                      style={{ gridColumn: 1, gridRow: row }}
                                    >
                                      {feature.name}
                                    </div>
                                    {plans.map((plan, planIndex) => (
                                      <div
                                        key={`${feature.name}-${plan.plan_id}`}
                                        className="px-2 lg:px-4 py-2 lg:py-3 flex items-center justify-center z-10"
                                        style={{
                                          gridColumn: planIndex + 2,
                                          gridRow: row,
                                        }}
                                      >
                                        {renderCell(
                                          feature.plans[plan.plan_id],
                                          plan.billing_cycle === "yearly"
                                            ? "text-teal-500 font-semibold"
                                            : undefined,
                                        )}
                                      </div>
                                    ))}
                                  </React.Fragment>
                                );
                              })}

                              {/* Bottom spacer */}
                              <div
                                className="h-4 z-[-1]"
                                style={{
                                  gridColumn: "1 / -1",
                                  gridRow: transformedFeatures.length + 2,
                                }}
                              />
                            </div>
                          </div>

                          {/* ── MOBILE CARDS (< md) ── */}
                          <div className="block md:hidden">
                            <div className="mb-4 px-1">
                              <h2 className="text-lg font-bold text-gray-800">
                                Choose a Plan
                              </h2>
                              <p className="text-teal-600 text-sm">
                                that fits Your Learning Goals
                              </p>
                            </div>
                            <div className="flex flex-col gap-6 pb-3">
                              {plans.map((plan) => (
                                <div
                                  key={plan.plan_id}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    if (isPlanSelectable) {
                                      updateProfile(activeProfileIndex, {
                                        selectedPlan:
                                          selectedPlan?.plan_id === plan.plan_id
                                            ? null
                                            : plan,
                                      });
                                    } else {
                                      showToast(
                                        "Please select at least one subject to enable plan selection.",
                                        "warning",
                                      );
                                    }
                                  }}
                                  className={`w-full text-left rounded-3xl border-2 transition-all duration-200 overflow-hidden outline-none ${activeProfile?.selectedSubjects?.length
                                    ? "cursor-pointer"
                                    : "cursor-not-allowed opacity-90"
                                    } ${selectedPlan?.plan_id === plan.plan_id
                                      ? "border-[#b0cb1f] bg-lime-50"
                                      : "border-gray-100 bg-[#F7FAE9]"
                                    }`}
                                >
                                  {/* Card header */}
                                  <div
                                    className={`px-5 pt-5 pb-4 ${selectedPlan?.plan_id === plan.plan_id ? "bg-lime-100" : "bg-[#eef5c8]/60"}`}
                                  >
                                    <p className="text-gray-500 text-xs font-semibold uppercase tracking-widest mb-1">
                                      {plan.plan_name.replace(" Plan", "")} PLAN
                                    </p>
                                    <div className="flex items-end justify-between gap-2">
                                      <div>
                                        {plan.plan_tag && (
                                          <p className="text-2xl font-bold text-[#5C5082] leading-tight">
                                            {plan.plan_tag.split(" ")[0]}
                                          </p>
                                        )}
                                        {plan.plan_tag &&
                                          plan.plan_tag.split(" ").length >
                                          1 && (
                                            <p className="text-[#5C5082] font-bold text-xs uppercase tracking-wider">
                                              {plan.plan_tag
                                                .split(" ")
                                                .slice(1)
                                                .join(" ")}
                                            </p>
                                          )}
                                      </div>
                                      <div className="text-right">
                                        {plan.billing_cycle === "trial" ? (
                                          <p className="text-teal-500 text-sm font-bold">
                                            FREE
                                          </p>
                                        ) : (
                                          <>
                                            <p className="text-teal-500 text-sm font-bold">
                                              ₹
                                              {calculatePlanDisplayPrice(
                                                plan,
                                                activeProfile?.seats || 1,
                                              ).toFixed(0)}
                                              <span className="text-xs font-normal ml-1">
                                                / {getDurationLabel(plan)}
                                              </span>
                                            </p>
                                            <p className="text-gray-400 text-xs">
                                              ₹
                                              {(
                                                calculatePlanDisplayPrice(
                                                  plan,
                                                  totalSeats,
                                                ) / (plan.monthly_divisor || 1)
                                              ).toFixed(0)}
                                              /mo
                                              {plan.plan_discount_percent >
                                                0 && (
                                                  <span className="ml-1 text-[#b0cb1f] font-semibold">
                                                    {plan.plan_discount_percent}%
                                                    off
                                                  </span>
                                                )}
                                            </p>
                                          </>
                                        )}
                                      </div>
                                    </div>
                                    {selectedPlan?.plan_id === plan.plan_id && (
                                      <div className="mt-2 inline-flex items-center gap-1 bg-[#464646] text-white text-[10px] font-semibold px-2.5 py-1 rounded-full">
                                        <span>✓</span> Selected
                                      </div>
                                    )}
                                  </div>

                                  {/* Feature list */}
                                  <div className="px-5 py-3 divide-y divide-gray-100">
                                    {transformedFeatures.map((feature) => {
                                      const val = feature.plans[plan.plan_id];
                                      return (
                                        <div
                                          key={feature.name}
                                          className="flex items-center justify-between py-2 gap-2"
                                        >
                                          <span className="text-gray-600 font-bold text-[11px] flex-1 leading-tight lowercase">
                                            {feature.name}
                                          </span>
                                          <span className="shrink-0">
                                            {val === "true" ? (
                                              <span className="w-5 h-5 rounded-full bg-[#333C5B] flex items-center justify-center">
                                                <span className="material-symbols-outlined text-[#B0CB1F] text-xs">
                                                  check
                                                </span>
                                              </span>
                                            ) : val === "false" || !val ? (
                                              <span className="w-5 h-5 rounded-full bg-[#C3CFD1] flex items-center justify-center">
                                                <span className="material-symbols-outlined text-[#DE4B3B] text-xs">
                                                  close
                                                </span>
                                              </span>
                                            ) : (
                                              <span className="text-teal-600 text-[11px] font-semibold capitalize">
                                                {String(val)
                                                  .toLowerCase()
                                                  .replace(/_/g, " ")}
                                              </span>
                                            )}
                                          </span>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

        </div>
      </div>

      {/* ─── ACTION BUTTONS ─────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-center gap-3 mt-8 px-4 sm:px-0">
        <button
          onClick={handleSave}
          disabled={isSaving || !activeProfile}
          className={`w-full sm:w-auto px-8 py-2.5 rounded-full font-medium transition-colors text-sm ${allSelectedSubjects.length === 0
            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
            : "bg-primary text-white hover:bg-gray-800"
            }`}
        >
          {isSaving ? "Saving..." : "Save"}
        </button>
        <button
          onClick={handleOpenPaymentModal}
          disabled={isValidating || !activeProfile}
          className={`w-full sm:w-auto px-8 py-2.5 rounded-full font-medium transition-colors text-sm ${allSelectedSubjects.length === 0
            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
            : selectedPlan
              ? "bg-button-primary text-white hover:bg-[#d4e66e]"
              : "bg-primary text-white hover:bg-gray-400"
            }`}
        >
          {isValidating ? "Processing..." : "Pay Now"}
        </button>
      </div>

      {/* Payment Summary Modal */}
      {showPaymentModal && selectedPlan && (
        <PaymentSummaryModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          uiTotalAmount={uiTotalAmount}
          onProceedToPay={handlePayNow}
          onApplyCoupon={handleApplyCoupon}
          isProcessing={isValidating}
          profiles={profiles}
        />
      )}

      {/* Chat Bot Icon */}
      {/* <div className="fixed bottom-6 right-6 z-[100]">
        <img src={IconChat} alt="Chat" className="w-[95px]" />
      </div> */}
    </div>
  );
};

export default Subscription;