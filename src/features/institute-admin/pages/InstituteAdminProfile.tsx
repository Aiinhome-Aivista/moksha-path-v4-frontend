import React, { useState, useEffect, useRef } from "react";
import { useFormik } from "formik";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../../app/providers/AuthProvider";
// import { useModal } from '../../../features/auth/context/AuthContext';
import ApiServices from "../../../services/ApiServices";
import ManageFacultyModal from "../components/ManageFacultyModal";
import {
  Mail,
  Phone,
  Edit3,
  CheckCircle2,
  GraduationCap,
  Users,
  Lock,
  MapPin,
  PlusCircle,
  X,
  CreditCard,
  Receipt,
  ChevronLeft,
  ChevronRight,
  Download,
  FileSpreadsheet,
} from "lucide-react";
import { useModal } from "../../../features/auth/context/AuthContext";
import Subscription from "../../student/pages/Subscription";

const resolveRole = (roleName?: string) => {
  if (!roleName) return "student" as any;
  const normalized = roleName.toLowerCase();
  switch (normalized) {
    case "student":
    case "teacher":
    case "principal":
    case "admin":
    case "parent":
      return normalized as any;
    case "institute_admin":
    case "institute admin":
      return "institute-admin" as any;
    case "private_tutor":
    case "private tutor":
      return "private-tutor" as any;
    default:
      return "student" as any;
  }
};

const LoadingState: React.FC<{ text: string }> = ({ text }) => (
  <div className="py-12 flex flex-col items-center justify-center bg-white rounded-2xl border border-gray-100">
    <div className="w-8 h-8 border-2 border-gray-200 border-t-[#b0cb1f] rounded-full animate-spin mb-3" />
    <p className="text-xs text-gray-500 font-medium">{text}</p>
  </div>
);

const EmptyState: React.FC<{ icon: React.ReactNode; title: string; description: string }> = ({ icon, title, description }) => (
  <div className="py-12 flex flex-col items-center justify-center bg-white rounded-2xl border border-gray-100 text-center px-6">
    <div className="text-gray-200 mb-4">{icon}</div>
    <h3 className="text-sm font-bold text-gray-800 mb-1">{title}</h3>
    <p className="text-xs text-gray-400 max-w-[200px]">{description}</p>
  </div>
);

const Pagination: React.FC<{ currentPage: number; totalPages: number; onPageChange: (page: number) => void }> = ({ currentPage, totalPages, onPageChange }) => (
  <div className="flex items-center justify-center gap-2 p-4 bg-gray-50/50 border-t border-gray-100">
    <button
      onClick={() => onPageChange(currentPage - 1)}
      disabled={currentPage === 1}
      className="p-1.5 rounded-full hover:bg-white hover:shadow-sm disabled:opacity-30 transition-all"
    >
      <ChevronLeft size={16} />
    </button>
    <div className="text-xs font-bold text-gray-700">
      {currentPage} <span className="text-gray-400 font-medium">/ {totalPages}</span>
    </div>
    <button
      onClick={() => onPageChange(currentPage + 1)}
      disabled={currentPage === totalPages}
      className="p-1.5 rounded-full hover:bg-white hover:shadow-sm disabled:opacity-30 transition-all"
    >
      <ChevronRight size={16} />
    </button>
  </div>
);

const SubscriptionTab: React.FC<{ className?: string }> = ({ className }) => {
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        setIsLoading(true);
        const response = await ApiServices.getUserSubscriptions();
        if (response.data?.status === "success") {
          setSubscriptions(response.data.data?.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch subscriptions", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSubscriptions();
  }, []);

  const totalPages = Math.ceil(subscriptions.length / ITEMS_PER_PAGE);
  const paginatedData = subscriptions.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  if (isLoading) return <LoadingState text="Loading subscriptions..." />;
  if (subscriptions.length === 0) return <EmptyState icon={<CreditCard size={36} />} title="No Subscriptions Found" description="You don't have any active subscriptions yet." />;

  return (
    <div className={`bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden ${className || ""}`}>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Sl. No</th>
              <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Plan</th>
              <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Board</th>
              <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Class</th>
              <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Subjects</th>
              <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Year</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {paginatedData.map((sub, index) => (
              <tr key={sub.subscription_id} className="hover:bg-lime-50/20 transition-colors">
                <td className="px-6 py-4 text-xs font-medium text-gray-500">{(currentPage - 1) * ITEMS_PER_PAGE + index + 1}</td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#b0cb1f]/10 text-[#6b7a0e] text-[11px] font-bold">
                    <CreditCard size={10} />
                    {sub.plan_name}
                  </span>
                </td>
                <td className="px-6 py-4 text-xs text-gray-700">{sub.board_name}</td>
                <td className="px-6 py-4 text-xs text-gray-700">{sub.class_name}</td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {sub.subjects?.map((s: any) => (
                      <span key={s.subject_id} className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-semibold border border-indigo-100">
                        {s.subject_name}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4 text-xs text-gray-600">{sub.year}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
};

const TransactionTab: React.FC<{ className?: string }> = ({ className }) => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setIsLoading(true);
        const response = await ApiServices.getUserSubscriptions();
        if (response.data?.status === "success") {
          setTransactions(response.data.data?.data2 || []);
        }
      } catch (error) {
        console.error("Failed to fetch transactions", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTransactions();
  }, []);

  const totalPages = Math.ceil(transactions.length / ITEMS_PER_PAGE);
  const paginatedData = transactions.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  if (isLoading) return <LoadingState text="Loading transactions..." />;
  if (transactions.length === 0) return <EmptyState icon={<Receipt size={36} />} title="No Transactions Found" description="You don't have any past transactions." />;

  return (
    <div className={`bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden ${className || ""}`}>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Sl. No</th>
              <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Transaction ID</th>
              <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Plan Name</th>
              <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {paginatedData.map((txn, index) => (
              <tr key={txn.transaction_id || index} className="hover:bg-lime-50/20 transition-colors">
                <td className="px-6 py-4 text-xs font-medium text-gray-500">{(currentPage - 1) * ITEMS_PER_PAGE + index + 1}</td>
                <td className="px-6 py-4 text-xs font-bold text-gray-700">{txn.transaction_id || "N/A"}</td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#b0cb1f]/10 text-[#6b7a0e] text-[11px] font-bold">
                    <Receipt size={10} />
                    {txn.plan_name}
                  </span>
                </td>
                <td className="px-6 py-4 text-xs font-black text-gray-900">₹ {txn.total_amount}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${txn.payment_status?.toLowerCase() === 'success'
                    ? 'bg-green-100 text-green-700'
                    : txn.payment_status?.toLowerCase() === 'pending'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-red-100 text-red-700'
                    }`}>
                    {txn.payment_status || "Unknown"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
};

const BulkUploadTab: React.FC<{ className?: string }> = ({ className }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const uploadInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setUploadMessage(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      setIsUploading(true);
      setUploadMessage(null);
      const response = await ApiServices.bulkUploadUsers(selectedFile);

      if (response.data?.status === "success") {
        setIsSuccess(true);
        setUploadMessage("Users uploaded successfully!");
        setSelectedFile(null);
        if (uploadInputRef.current) uploadInputRef.current.value = "";
      } else {
        setIsSuccess(false);
        setUploadMessage(response.data?.message || "Failed to upload users.");
      }
    } catch (error: any) {
      setIsSuccess(false);
      setUploadMessage(
        error.response?.data?.message || "An error occurred during upload."
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownloadTemplate = () => {
    const headers = [
      "full_name",
      "email",
      "phone",
      "username",
      "role_id",
      "institute_id",
      "subscription_id",
      "board_id",
      "academic_year",
      "class_id",
      "section_ids",
      "subject_ids"
    ];

    const rows = [
      [
        "Milon Mondal",
        "milon123@gmail.com",
        "9000000000",
        "milonmondal",
        "3",
        "1",
        "20262027_CBSE_09_INS_1_202603270724527",
        "1",
        "2026-2027",
        "9",
        "1,3",
        "1,2"
      ]
    ];

    const csvContent = [
      headers.join(","),
      ...rows.map(e => e.map(item => `"${item}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "bulk_upload_users_template.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={`bg-white rounded-2xl border border-gray-100 shadow-sm p-8 ${className || ""}`}>
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Download Section */}
        <div className="space-y-6 text-center border-r border-gray-50 pr-0 md:pr-12">
          <div className="w-16 h-16 bg-lime-50 rounded-2xl flex items-center justify-center mx-auto border border-lime-100">
            <FileSpreadsheet className="text-[#b0cb1f]" size={32} />
          </div>

          <div>
            <h3 className="text-xl font-black text-primary mb-2">1. Download Template</h3>
            <p className="text-sm text-gray-500 font-medium h-12">
              Download our standardized CSV template to prepare your student and faculty data.
            </p>
          </div>

          <button
            onClick={handleDownloadTemplate}
            className="w-full flex items-center justify-center gap-2 py-4 bg-gray-50 hover:bg-gray-100 text-primary font-black rounded-2xl border border-gray-200 transition-all group"
          >
            <Download size={18} className="group-hover:translate-y-0.5 transition-transform" />
            Download CSV Template
          </button>

          <div className="pt-4 grid grid-cols-2 gap-3">
            <div className="p-3 bg-gray-50/50 rounded-xl border border-gray-100 text-left">
              <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Total Columns</p>
              <p className="text-sm font-black text-primary">12 Headers</p>
            </div>
            <div className="p-3 bg-gray-50/50 rounded-xl border border-gray-100 text-left">
              <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Format</p>
              <p className="text-sm font-black text-primary">CSV (UTF-8)</p>
            </div>
          </div>
        </div>

        {/* Upload Section */}
        <div className="space-y-6 text-center">
          <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto border border-indigo-100">
            <PlusCircle className="text-indigo-500" size={32} />
          </div>

          <div>
            <h3 className="text-xl font-black text-primary mb-2">2. Upload & Process</h3>
            <p className="text-sm text-gray-500 font-medium h-12">
              Select your completed CSV file and upload it to bulk create users.
            </p>
          </div>

          <div className="space-y-4">
            <input
              type="file"
              ref={uploadInputRef}
              onChange={handleFileChange}
              accept=".csv"
              className="hidden"
            />

            <div
              onClick={() => uploadInputRef.current?.click()}
              className={`cursor-pointer w-full py-4 border-2 border-dashed rounded-2xl transition-all ${selectedFile
                  ? "border-[#b0cb1f] bg-lime-50/30"
                  : "border-gray-200 hover:border-gray-300 bg-gray-50"
                }`}
            >
              {selectedFile ? (
                <div className="flex flex-col items-center gap-1">
                  <p className="text-xs font-bold text-[#6b7a0e] truncate max-w-[200px]">
                    {selectedFile.name}
                  </p>
                  <p className="text-[10px] text-gray-400">
                    {(selectedFile.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              ) : (
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Select CSV File
                </p>
              )}
            </div>

            <button
              onClick={handleUpload}
              disabled={!selectedFile || isUploading}
              className={`w-full flex items-center justify-center gap-2 py-4 font-black rounded-2xl shadow-lg transition-all ${!selectedFile || isUploading
                  ? "bg-gray-100 text-gray-400 shadow-none"
                  : "bg-[#b0cb1f] text-white shadow-[#b0cb1f]/20 hover:bg-[#a0ba1c]"
                }`}
            >
              {isUploading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <PlusCircle size={18} />
                  Upload and Process
                </>
              )}
            </button>
          </div>

          {uploadMessage && (
            <div className={`p-3 rounded-xl text-xs font-bold animate-in fade-in slide-in-from-top-2 ${isSuccess ? "bg-green-50 text-green-600 border border-green-100" : "bg-red-50 text-red-600 border border-red-100"
              }`}>
              {uploadMessage}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface Course {
  name: string;
  grade: string;
  progress: number;
}

interface ProfileFormValues {
  address: string;
  academic: string;
  board: string;
  school: string;
  dateOfBirth: string;
  grade: string;
  section: string;
  enrollmentDate: string;
  courses: Course[];
}

const InstituteAdminProfile: React.FC = () => {
  const { user, roleConfig, login } = useAuth();
  const { openSelectRole } = useModal();
  const [isEditingBasic, setIsEditingBasic] = useState(false);
  const [profileImage, setProfileImage] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isFacultyModalOpen, setIsFacultyModalOpen] = useState(false);

  // Tab State
  const location = useLocation();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<"faculty" | "subscriptions" | "transactions" | "bulk_upload">(() => {
    const hash = location.hash.replace("#", "");
    if (["faculty", "subscriptions", "transactions", "bulk_upload"].includes(hash)) {
      return hash as "faculty" | "subscriptions" | "transactions" | "bulk_upload";
    }
    return "faculty";
  });

  // Profile Switcher State
  const [profiles, setProfiles] = useState<any[]>([]);
  const [isFetchingProfiles, setIsFetchingProfiles] = useState(false);
  const [switchingProfileId, setSwitchingProfileId] = useState<string | null>(null);

  // faculty inline tabs
  const [facultyTab, setFacultyTab] = useState<"assigned" | "available">("assigned");
  const [assignedTeachers, setAssignedTeachers] = useState<any[]>([]);
  const [availableTeachers, setAvailableTeachers] = useState<any[]>([]);
  const [facultyLoading, setFacultyLoading] = useState(false);

  //for academic info
  const [academicInfo, setAcademicInfo] = useState<any>(null);

  //for basic info
  const [profileInfo, setProfileInfo] = useState<any>(null);

  // ── Fetch all linked profiles for switcher ──
  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        setIsFetchingProfiles(true);
        const res = await ApiServices.getUsersByTokenContact();
        if (res.data?.status === "success") {
          setProfiles(res.data.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch profiles", error);
      } finally {
        setIsFetchingProfiles(false);
      }
    };
    fetchProfiles();
  }, []);

  const handleProfileSwitch = async (profile: any) => {
    const profileIdStr = profile.sub || String(profile.user_id) || profile.profile_id;
    if (profileIdStr === String(user?.id)) return;

    try {
      setSwitchingProfileId(profileIdStr);
      const payload = {
        user_id: profileIdStr,
        subscription_id: profile.subscription_id || null,
      };

      const res = await ApiServices.selectProfileV4(payload);
      if (res.data?.status === "success") {
        const data = res.data.data;

        if (data?.auth_token) localStorage.setItem("auth_token", data.auth_token);
        if (data?.refresh_token) localStorage.setItem("refresh_token", data.refresh_token);
        if (data?.subscription_token) localStorage.setItem("subscription_token", data.subscription_token);

        const activeRole = resolveRole(
          profile.role_name || profile.roles?.[0]?.role_name || "student"
        );

        login({
          id: profileIdStr,
          name: profile.name || profile.username,
          email: profile.email || "",
          role: activeRole,
        });

        localStorage.setItem("active_profile", JSON.stringify(profile));

        let profileRoute = "/profile";
        if (activeRole.toLowerCase().includes("institute")) {
          profileRoute = "/institute-admin/profile";
        } else if (activeRole.toLowerCase().includes("tutor")) {
          profileRoute = "/private-tutor/profile";
        }

        navigate(profileRoute);
        window.location.reload();
      }
    } catch (error) {
      console.error("Profile switch failed", error);
    } finally {
      setSwitchingProfileId(null);
    }
  };

  // ── Fetch faculty lists ─────────────────────────────────────
  useEffect(() => {
    const fetchFaculty = async () => {
      try {
        setFacultyLoading(true);
        const [assignedRes, availableRes] = await Promise.all([
          ApiServices.getAssignedTeacherList(),
          ApiServices.getAvailableTeachers(),
        ]);
        if (assignedRes.data?.status === "success") setAssignedTeachers(assignedRes.data.data || []);
        if (availableRes.data?.status === "success") setAvailableTeachers(availableRes.data.data || []);
      } catch {
        // silently fail
      } finally {
        setFacultyLoading(false);
      }
    };
    fetchFaculty();
  }, [isFacultyModalOpen]); // refresh when modal closes

  // ── Profile image ──────────────────────────
  useEffect(() => {
    const fetchProfileImage = async () => {
      try {
        const response = await ApiServices.getUserProfileImage();
        if (response.data?.status === "success" && response.data?.data?.image) {
          setProfileImage(response.data.data.image);
        }
      } catch {
        // silently fail
      }
    };
    fetchProfileImage();
  }, []);


  useEffect(() => {
    const fetchAcademicInfo = async () => {
      try {
        const res = await ApiServices.getUserAcademicInfo();

        if (res.data?.status === "success") {
          setAcademicInfo(res.data.data);
        }
      } catch (error) {
        console.error("Academic info fetch failed");
      }
    };

    fetchAcademicInfo();
  }, []);

  useEffect(() => {
    const fetchProfileInfo = async () => {
      try {
        const res = await ApiServices.getProfileInfo();

        if (res.data?.status === "success") {
          const data = res.data.data;

          setProfileInfo(data);

          // Fill form values
          formik.setValues({
            ...formik.values,
            address: data.address || "",
            dateOfBirth: data.dob || "",
          });
        }
      } catch (error) {
        console.error("Profile fetch failed");
      }
    };

    fetchProfileInfo();
  }, []);



  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setProfileImage(URL.createObjectURL(file));
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", file);
      await ApiServices.uploadProfilePicture(formData);
    } catch {
      // silently fail
    } finally {
      setUploading(false);
    }
  };

  // ── View Profiles ──────────────────────────
  // const handleViewProfiles = async () => {
  //     try {
  //         setIsLoadingProfiles(true);
  //         const response = await ApiServices.getUsersByTokenContact();
  //         if (response.data?.status === 'success') {
  //             setProfilesList(response.data.data);
  //             openProfileSelection();
  //         }
  //     } catch {
  //         // silently fail
  //     } finally {
  //         setIsLoadingProfiles(false);
  //     }
  // };



  // ── Formik ─────────────────────────────────
  const initialValues: ProfileFormValues = {
    address: "",
    academic: "",
    board: "",
    school: "",
    dateOfBirth: "",
    grade: "",
    section: "",
    enrollmentDate: "",
    courses: [],
  };

  const formik = useFormik<ProfileFormValues>({
    initialValues,
    onSubmit: async (values) => {
      try {
        setIsSaving(true);

        const payload = {
          dob: values.dateOfBirth ? values.dateOfBirth : null,
          address: values.address,
        };

        const response = await ApiServices.updateUserProfile(payload);

        if (response.data?.status === "success") {
          setIsEditingBasic(false);
        }

      } catch (error) {
        console.error("Profile update failed", error);
      } finally {
        setIsSaving(false);
      }
    },
  });

  const handleSave = () => formik.submitForm();

  const handleCancel = (section: "basic" | "guardian") => {
    formik.resetForm();
    if (section === 'basic') setIsEditingBasic(false);
    // if (section === 'guardian') setIsEditingGuardian(false);
  };

  const EditButtons = ({
    isEditing,
    onEdit,
    onCancel,
    onSave,
    isSaving
  }: {
    isEditing: boolean;
    onEdit: () => void;
    onCancel: () => void;
    onSave: () => void;
    isSaving?: boolean;
  }) => (
    <div className="flex gap-1.5">
      {isEditing ? (
        <>
          <button
            type="button"
            onClick={onCancel}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-semibold transition-all"
          >
            <X size={11} />
            Cancel
          </button>
          <button
            type="button"
            disabled={isSaving}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-semibold transition-all bg-[#b0cb1f] text-white hover:bg-[#a0ba1c] disabled:opacity-60"
            onClick={onSave}
          >
            {isSaving ? (
              <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <CheckCircle2 size={11} />
            )}
            Save
          </button>
        </>
      ) : (
        <button
          type="button"
          onClick={onEdit}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-semibold transition-all bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200"
        >
          <Edit3 size={11} />
          Edit
        </button>
      )}
    </div>
  );
  return (
    <form onSubmit={formik.handleSubmit} className="space-y-4">
      {/* ── Profile Switcher (Manage Profile) ── */}
      {(profiles.length > 0 || isFetchingProfiles) && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-primary">Manage Profiles</h3>
            <div className="px-2 py-0.5 rounded-full bg-lime-50 text-[#6b7a0e] text-[9px] font-bold border border-lime-100 uppercase">
              {profiles.length} Accounts Found
            </div>
          </div>
          <div className="flex flex-wrap items-start gap-x-8 gap-y-6 overflow-y-auto max-h-[130px] custom-scrollbar p-2">
            {profiles.map((p) => {
              const profileId = p.sub || String(p.user_id) || p.profile_id;
              const isActive = String(user?.id) === String(profileId);
              const isSwitching = switchingProfileId === String(profileId);

              return (
                <div
                  key={profileId}
                  className="flex flex-col items-center gap-2 group cursor-pointer shrink-0 transition-transform active:scale-95"
                  onClick={() => handleProfileSwitch(p)}
                >
                  <div className={`relative w-14 h-14 rounded-full flex items-center justify-center text-lg font-black transition-all border-4 ${isActive
                      ? "bg-gradient-to-tr from-[#b0cb1f] to-lime-400 text-white border-lime-100 shadow-lg shadow-lime-200"
                      : "bg-gray-50 text-gray-400 border-white hover:border-gray-100 hover:bg-gray-100"
                    }`}>
                    {p.name?.charAt(0).toUpperCase() || "U"}

                    {isActive && (
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                        <CheckCircle2 size={10} className="text-white" />
                      </div>
                    )}
                    {isSwitching && (
                      <div className="absolute inset-0 rounded-full bg-white/60 flex items-center justify-center">
                        <div className="w-5 h-5 border-2 border-[#b0cb1f] border-t-transparent rounded-full animate-spin" />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-center">
                    <p className={`text-[10px] font-bold truncate max-w-[70px] ${isActive ? "text-[#6b7a0e]" : "text-gray-500 group-hover:text-gray-700"}`}>
                      {p.name}
                    </p>
                    <p className="text-[8px] text-gray-400 font-medium uppercase tracking-tighter">
                      {p.role_name || "Institute Admin"}
                    </p>
                  </div>
                </div>
              );
            })}

            {/* Add Profile Item */}
            {(user?.role === "parent" || JSON.parse(localStorage.getItem("active_profile") || "{}")?.role_id === 2) && (
              <div
                className="flex flex-col items-center gap-2 group cursor-pointer shrink-0 transition-transform active:scale-95"
                onClick={() => openSelectRole()}
              >
                <div className="relative w-14 h-14 rounded-full flex items-center justify-center text-lg font-light text-gray-400 border-2 border-dashed border-gray-200 hover:border-gray-300 hover:bg-gray-50 bg-gray-50/50 transition-all">
                  <PlusCircle size={24} strokeWidth={1} />
                </div>
                <div className="flex flex-col items-center">
                  <p className="text-[10px] font-bold text-gray-400 group-hover:text-gray-500">
                    Add New
                  </p>
                  <p className="text-[8px] text-gray-300 font-medium uppercase tracking-tighter">
                    Profile
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Profile Hero Card ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Banner */}
        <div className="h-24 bg-gradient-to-r from-[#b0cb1f] to-lime-400 relative flex items-center px-6 gap-6">
          {/* Decorative circles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-4 -right-4 w-32 h-32 rounded-full bg-white/10" />
            <div className="absolute -bottom-8 right-24 w-24 h-24 rounded-full bg-white/10" />
          </div>
          <div
            className="relative group shrink-0 cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="w-16 h-16 rounded-full overflow-hidden shadow-xl select-none">
              {profileImage ? (
                <img
                  src={profileImage}
                  alt="Profile"
                  className="w-full h-full object-cover"
                  onError={() => setProfileImage("")}
                />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center text-2xl font-black text-white"
                  style={{ background: "rgba(255,255,255,0.25)" }}
                >
                  {user?.name?.charAt(0)?.toUpperCase()}
                </div>
              )}
            </div>
            <button
              type="button"
              disabled={uploading}
              className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white flex items-center justify-center shadow-lg border border-gray-100 group-hover:scale-110 transition-transform"
              title="Change profile picture"
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
            >
              {uploading ? (
                <div className="w-3 h-3 border-2 border-gray-300 border-t-[#b0cb1f] rounded-full animate-spin" />
              ) : (
                <span
                  style={{ fontVariationSettings: "'wght' 600, 'opsz' 20" }}
                  className="material-symbols-outlined text-gray-600 text-[14px]"
                >
                  photo_camera
                </span>
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              aria-label="Upload profile picture"
              disabled={uploading}
            />
          </div>
          <div className="relative flex-1 min-w-0">
            <h1 className="text-xl font-black text-primary leading-tight truncate">
              {user?.name}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-primary font-bold opacity-80 uppercase tracking-widest">
                {roleConfig?.label}
              </span>
              <span className="w-1 h-1 rounded-full bg-primary/30" />
              <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-white/40 text-primary border border-white/20 uppercase tracking-wider">
                Active
              </span>
            </div>
          </div>

          {/* ── Action buttons in header ── */}
          <div className="relative flex gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setIsFacultyModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white shadow-sm hover:shadow-md text-primary text-xs font-black transition-all border border-white/50"
            >
              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>manage_accounts</span>
              Manage Faculty
            </button>
          </div>
        </div>

        <SectionCard
          icon={<GraduationCap size={16} className="text-primary" />}
          title="Basic Information"
          action={
            <EditButtons
              isEditing={isEditingBasic}
              onEdit={() => setIsEditingBasic(true)}
              onCancel={() => handleCancel('basic')}
              onSave={handleSave}
              isSaving={isSaving}
            />
          }
        >
          <div className="px-6 py-5">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6">
              <FormField
                label="Board"
                name="board"
                value={academicInfo?.board_name || ""}
                onChange={formik.handleChange}
                isEditing={false}
              />
              <FormField
                label="School"
                name="school"
                value={academicInfo?.institute_name || ""}
                onChange={formik.handleChange}
                isEditing={false}
              />
              <FormField
                label="Academic Year"
                name="academic"
                value={academicInfo?.academic_year || ""}
                onChange={formik.handleChange}
                isEditing={false}
              />
              <FormField
                label="Enrollment"
                name="enrollmentDate"
                value={academicInfo?.enrollment_date || ""}
                onChange={formik.handleChange}
                isEditing={false}
              />
              <ReadOnlyField
                label="Email Address"
                value={profileInfo?.email || ""}
                icon={<Mail size={12} className="text-primary" />}
              />
              <ReadOnlyField
                label="Mobile Number"
                value={profileInfo?.mobile || ""}
                icon={<Phone size={12} className="text-primary" />}
              />
            </div>
            <div className="mt-6">
              <FormField
                label="Address"
                name="address"
                value={formik.values.address}
                onChange={formik.handleChange}
                isEditing={isEditingBasic}
                icon={<MapPin size={12} className="text-primary" />}
              />
            </div>
          </div>
        </SectionCard>
      </div>

      {/* ── Tabs & Content Combined Section ── */}
      <div className="-space-y-[1px]">
        {/* ── Tabs Navigation ── */}
        <div className="flex items-center p-1.5 bg-white rounded-t-2xl border border-gray-100 shadow-sm overflow-x-auto no-scrollbar gap-1 relative z-10">
          {[
            { id: "faculty", label: "Faculty Information", icon: <Users size={14} /> },
            { id: "subscriptions", label: "My Subscriptions", icon: <CreditCard size={14} /> },
            { id: "transactions", label: "Transaction History", icon: <Receipt size={14} /> },
            { id: "bulk_upload", label: "Batch Subscriptions", icon: <FileSpreadsheet size={14} /> },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black transition-all whitespace-nowrap ${activeTab === tab.id
                  ? "bg-[#b0cb1f] text-white shadow-md shadow-[#b0cb1f]/20"
                  : "text-gray-500 hover:bg-gray-50"
                }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Tab Content Container ── */}
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          {activeTab === "faculty" && (
            <SectionCard
              className="rounded-t-none border-t-0"
              icon={<Users size={16} className="text-primary" />}
              title="Faculty Information"
            >
              <div className="p-6">
                {/* Faculty Tabs */}
                <div className="flex gap-1 bg-gray-50 p-1 rounded-xl mb-6">
                  {(["assigned", "available"] as const).map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setFacultyTab(tab)}
                      className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all duration-200 capitalize ${facultyTab === tab
                          ? "bg-button-primary text-white shadow-sm border border-gray-100"
                          : "text-gray-500 hover:text-gray-700"
                        }`}
                    >
                      {tab === "assigned" ? `Assigned Faculty (${assignedTeachers.length})` : `Available Teachers (${availableTeachers.length})`}
                    </button>
                  ))}
                </div>

                {facultyLoading ? (
                  <div className="flex items-center justify-center py-12 text-gray-400 gap-2">
                    <div className="w-6 h-6 border-2 border-gray-200 border-t-[#b0cb1f] rounded-full animate-spin" />
                    <span className="text-xs font-medium">Loading…</span>
                  </div>
                ) : facultyTab === "assigned" ? (
                  assignedTeachers.length === 0 ? (
                    <EmptyState icon={<Users size={48} className="opacity-10" />} title="No Assigned Faculty" description="You haven't assigned any teachers yet." />
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                      {assignedTeachers.map((t: any) => (
                        <div key={t.teacher_user_id} className="flex items-center gap-4 bg-gray-50/50 rounded-2xl p-4 border border-gray-100 group hover:bg-white hover:border-[#b0cb1f]/20 transition-all">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#b0cb1f] to-lime-500 flex items-center justify-center text-white font-black text-lg flex-shrink-0 shadow-sm">
                            {(t.name || "T").charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-gray-800 truncate">{t.name}</p>
                            <p className="text-xs text-gray-400 truncate">{t.email}</p>
                          </div>
                          <div className="text-right flex flex-col items-end gap-1.5">
                            <p className="text-[10px] font-bold text-gray-400">{t.mobile}</p>
                            {t.section_names?.length > 0 && (
                              <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-[#b0cb1f]/10 text-[#6b7a0e] uppercase tracking-tighter">
                                {t.section_names.join(", ")}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                ) : (
                  availableTeachers.length === 0 ? (
                    <EmptyState icon={<Users size={48} className="opacity-10" />} title="No Available Teachers" description="All teachers are already assigned." />
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                      {availableTeachers.map((t: any) => (
                        <div key={t.teacher_user_id} className="flex items-center gap-4 bg-gray-50/50 rounded-2xl p-4 border border-gray-100 group hover:bg-white hover:border-gray-200 transition-all">
                          <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 font-black text-lg flex-shrink-0">
                            {(t.name || "T").charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-gray-800 truncate">{t.name}</p>
                            <p className="text-xs text-gray-400 truncate">{t.email}</p>
                          </div>
                          <p className="text-[10px] font-bold text-gray-400">{t.mobile}</p>
                        </div>
                      ))}
                    </div>
                  )
                )}
              </div>
            </SectionCard>
          )}

          {activeTab === "subscriptions" &&
            (
              <>
                <SubscriptionTab className="rounded-t-none border-t-0" />
                {/* ── Subscription Purchase Flow (Bottom) ── */}
                <div className="mt-8 pt-8 border-t border-gray-100 shadow-sm bg-white rounded-2xl">
                  <h2 className="text-xl font-black text-primary mb-6 px-4">Add New Subscription</h2>
                  <Subscription />
                </div>
              </>
            )}
          {activeTab === "transactions" && <TransactionTab className="rounded-t-none border-t-0" />}
          {activeTab === "bulk_upload" && <BulkUploadTab className="rounded-t-none border-t-0" />}
        </div>
      </div>

      {/* Manage Faculty Modal */}
      <ManageFacultyModal
        isOpen={isFacultyModalOpen}
        onClose={() => setIsFacultyModalOpen(false)}
      />
    </form>
  );
};

const SectionCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}> = ({ icon, title, action, children, className }) => (
  <div className={`bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden ${className || ""}`}>
    <div className="flex items-center justify-between gap-2 px-5 py-3 border-b border-gray-100">
      <div className="flex items-center gap-2">
        {icon}
        <h3 className="text-sm font-bold text-primary">{title}</h3>
      </div>
      {action && <div>{action}</div>}
    </div>
    {children}
  </div>
);

const FormField: React.FC<{
  label: string;
  name: string;
  value: string;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  isEditing?: boolean;
  highlight?: boolean;
  icon?: React.ReactNode;
}> = ({ label, name, value, onChange, isEditing, highlight, icon }) => (
  <div>
    <label className="text-[10px] font-bold text-primary uppercase tracking-wider block mb-1">
      {label}
    </label>
    {isEditing ? (
      <input
        name={name}
        value={value}
        onChange={onChange}
        className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-gray-200 bg-gray-50 focus:outline-none focus:border-[#b0cb1f] focus:ring-2 focus:ring-[#b0cb1f]/20 text-gray-900 transition-all"
      />
    ) : (
      <div className="flex items-center gap-1">
        {icon && <span className="shrink-0">{icon}</span>}
        <p
          className={`text-xs font-medium text-primary ${highlight ? "text-base font-bold text-[#6b7a0e]" : ""}`}
        >
          {value || <span className="text-gray-300 italic">—</span>}
        </p>
      </div>
    )}
  </div>
);

const ReadOnlyField: React.FC<{
  label: string;
  value: string;
  icon?: React.ReactNode;
}> = ({ label, value, icon }) => (
  <div>
    <label className="text-[10px] font-bold text-primary uppercase tracking-wider mb-1 flex items-center gap-1">
      {label}
      <Lock size={8} className="text-gray-300" />
    </label>
    <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gray-50 border border-gray-100">
      {icon && <span className="shrink-0">{icon}</span>}
      <p className="text-xs font-medium text-primary truncate">{value}</p>
    </div>
  </div>
);

export default InstituteAdminProfile;
