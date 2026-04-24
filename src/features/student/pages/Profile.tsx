import React, { useState, useEffect, useRef } from "react";
import { useFormik } from "formik";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../../app/providers/AuthProvider";
import { useModal } from "../../../features/auth/context/AuthContext";
import ApiServices from "../../../services/ApiServices";
import Subscription from "./Subscription";
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
} from "lucide-react";

interface Course {
  name: string;
  grade: string;
  progress: number;
}

interface ProfileFormValues {
  // Contact (email & phone always read-only)
  address: string;
  // Academic
  academic: string;
  board: string;
  school: string;
  dateOfBirth: string;
  grade: string;
  section: string;
  enrollmentDate: string;
  // Guardian
  guardianName: string;
  guardianRelation: string;
  guardianEmail: string;
  guardianPhone: string;
  // Lists
  courses: Course[];
}

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

const formatDateForTable = (dateString: string | null | undefined) => {
  if (!dateString) return 'N/A';
  try {
    return new Date(dateString).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch (e) {
    return 'Invalid Date';
  }
};


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
              <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Subscription Name</th>
              <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Plan</th>
              <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Board</th>
              <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Class</th>
              <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Subjects</th>
              <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Year</th>
              <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Validity</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {paginatedData.map((sub, index) => (
              <tr key={sub.subscription_id} className="hover:bg-lime-50/20 transition-colors">
                <td className="px-6 py-4 text-xs font-medium text-gray-500">{(currentPage - 1) * ITEMS_PER_PAGE + index + 1}</td>
                <td className="px-6 py-4 text-xs font-bold text-gray-800">{sub.subscription_name || 'N/A'}</td>
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
                <td className="px-6 py-4 text-xs text-gray-600 font-medium">
                  {formatDateForTable(sub.plan_valid_from)} - {formatDateForTable(sub.plan_valid_to)}
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

const AddProfileModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  targetRole: "parent" | "student";
}> = ({ isOpen, onClose, targetRole }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  if (!isOpen) return null;

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    try {
      setIsSearching(true);
      setError("");
      setSearchResults([]);
      const response = await ApiServices.searchUserForMapping(searchQuery);
      if (response.data?.status === "success") {
        setSearchResults(response.data.data || []);
        if (response.data.data?.length === 0) {
          setError("No users found matching your search.");
        }
      } else {
        setError(response.data?.message || "Search failed");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Search failed");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) {
      setError("Please select a user to map.");
      return;
    }

    try {
      setIsLoading(true);
      setError("");

      const payload: any = {};
      if (targetRole === "parent") {
        payload.parent_user_id = selectedUser.user_id;
      } else {
        payload.student_user_id = selectedUser.user_id;
      }

      const response = await ApiServices.addParentStudentMapping(payload);
      if (response.data?.status === "success") {
        setSuccess("Mapping request sent successfully!");
        setTimeout(() => {
          onClose();
          window.location.reload();
        }, 1500);
      } else {
        setError(response.data?.message || "Failed to add mapping");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 animate-in fade-in zoom-in duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-primary hover:text-gray-600 transition-colors"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-bold text-gray-900 mb-1">
          Add {targetRole === "parent" ? "Parent" : "Child"}
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          Find and link your {targetRole === "parent" ? "guardian" : "child"} by searching their name, email, or phone.
        </p>

        <div className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="text-[10px] font-bold text-primary uppercase tracking-wider block mb-1">
                Search User
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Name, Email or Phone..."
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 bg-gray-50 focus:outline-none focus:border-[#b0cb1f] focus:ring-2 focus:ring-[#b0cb1f]/20 transition-all"
              />
            </div>
            <button
              type="button"
              onClick={handleSearch}
              disabled={isSearching}
              className="mt-5 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5"
            >
              {isSearching ? <div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" /> : "Search"}
            </button>
          </div>

          {searchResults.length > 0 && (
            <div className="max-h-48 overflow-y-auto border border-gray-100 rounded-lg divide-y divide-gray-50">
              {searchResults
                .filter((user) => {
                  const query = searchQuery.toLowerCase().trim();
                  return (
                    user.full_name?.toLowerCase().includes(query) ||
                    user.email?.toLowerCase().includes(query) ||
                    user.phone?.includes(query)
                  );
                })
                .map((user) => (
                  <div
                    key={user.user_id}
                    onClick={() => setSelectedUser(user)}
                    className={`p-3 cursor-pointer transition-colors hover:bg-lime-50/50 ${selectedUser?.user_id === user.user_id ? "bg-lime-50 border-l-4 border-l-[#b0cb1f]" : ""}`}
                  >
                    <p className="text-sm font-bold text-gray-900">{user.full_name}</p>
                    <div className="flex items-center gap-3 mt-0.5">
                      <p className="text-[11px] text-gray-500">{user.email}</p>
                      <p className="text-[11px] text-gray-500">•</p>
                      <p className="text-[11px] text-gray-500">{user.phone}</p>
                      <span className="ml-auto px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-[9px] font-bold uppercase">{user.role_type}</span>
                    </div>
                  </div>
                ))}
            </div>
          )}

          {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
          {success && <p className="text-xs text-green-600 font-bold flex items-center gap-1"><CheckCircle2 size={12} /> {success}</p>}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading || !selectedUser}
              className="flex-1 px-4 py-2 text-sm font-semibold text-white bg-[#b0cb1f] hover:bg-[#a0ba1c] rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <PlusCircle size={14} />
                  Add Profile
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────
const StudentProfile: React.FC = () => {
  const { user, roleConfig, login } = useAuth();
  const { openSelectRole } = useModal();
  const [isEditingBasic, setIsEditingBasic] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [profileImage, setProfileImage] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);

  const location = useLocation();
  const navigate = useNavigate();

  const [activeTabState, setActiveTabState] = useState<"basic" | "subscriptions" | "transactions">(() => {
    const hash = location.hash.replace("#", "");
    if (["basic", "subscriptions", "transactions"].includes(hash)) {
      return hash as "basic" | "subscriptions" | "transactions";
    }
    return "basic";
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Profile Switcher State
  const [profiles, setProfiles] = useState<any[]>([]); // This will be populated
  const [isFetchingProfiles, setIsFetchingProfiles] = useState(true); // Start as true to show loading
  const [switchingProfileId, setSwitchingProfileId] = useState<string | null>(null);

  //for academic info
  const [academicInfo, setAcademicInfo] = useState<any>(null);

  //for basic info
  const [profileInfo, setProfileInfo] = useState<any>(null);

  // for active connections (Guardian/Student)
  const [activeConnections, setActiveConnections] = useState<any[]>([]);
  const [, setLoadingConnections] = useState(true);

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

        // The backend might return new tokens on switch
        if (data?.auth_token) {
          localStorage.setItem("auth_token", data.auth_token);
        }
        if (data?.refresh_token) {
          localStorage.setItem("refresh_token", data.refresh_token);
        }
        if (data?.subscription_token) {
          localStorage.setItem("subscription_token", data.subscription_token);
        }

        const activeRole = resolveRole(
          profile.role_name || profile.roles?.[0]?.role_name || "student"
        );

        // Update User Object in Auth State & LocalStorage
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setProfileImage(URL.createObjectURL(file));
    try {
      const formData = new FormData();
      formData.append("file", file);
      await ApiServices.uploadProfilePicture(formData);
    } catch {
      // silently fail
    } finally {
    }
  };

  // ── Role-based Action Button ────────────────
  const getProfileBtnProps = () => {
    const role = user?.role;
    if (role === "student")
      return { label: "Add Parent", show: true, targetRole: "parent" as const };
    if (role === "parent")
      return { label: "Add Child", show: true, targetRole: "student" as const };
    return { label: "", show: false, targetRole: null };
  };

  const profileBtn = getProfileBtnProps();

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
    guardianName: "",
    guardianRelation: "",
    guardianEmail: "",
    guardianPhone: "",
    courses: [],
  };

  // const formik = useFormik<ProfileFormValues>({
  //   initialValues,
  //   onSubmit: async () => {
  //     // values
  //     try {
  //       setIsSaving(true);
  //       // API payload — ready to send
  //       // const payload = {
  //       //     address: values.address,
  //       //     academic: values.academic,
  //       //     board: values.board,
  //       //     dateOfBirth: values.dateOfBirth,
  //       //     grade: values.grade,
  //       //     section: values.section,
  //       //     enrollmentDate: values.enrollmentDate,
  //       //     guardianName: values.guardianName,
  //       //     guardianRelation: values.guardianRelation,
  //       //     guardianEmail: values.guardianEmail,
  //       //     guardianPhone: values.guardianPhone,
  //       //     courses: values.courses,
  //       // };
  //       // TODO: await ApiServices.updateStudentProfile(payload);
  //       // console.log('[Profile] API Payload ready:', payload);
  //       setIsEditingBasic(false);
  //       setIsEditingGuardian(false);
  //     } catch {
  //       // silently fail
  //     } finally {
  //       setIsSaving(false);
  //     }
  //   },
  // });

  // ── Helpers ────────────────────────────────

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

  // Separate effect to update formik once profileInfo is loaded
  useEffect(() => {
    if (profileInfo) {
      formik.setValues(prev => ({
        ...prev,
        address: profileInfo.address || "",
        dateOfBirth: profileInfo.dob || "",
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileInfo]);


  const handleSave = () => formik.submitForm();

  const isTeacher = user?.role === "teacher";
  const isParent = user?.role === "parent";

  const secondSectionConfig = {
    title: isParent ? "Child Info" : "Guardian Info",
    labels: {
      name: isParent ? "Child Name" : "Name",
      email: isParent ? "Child Email" : "Email",
      phone: isParent ? "Child Phone" : "Phone",
    },
  };

  const handleCancel = (section: "basic" | "guardian") => {
    formik.resetForm();
    if (section === 'basic') setIsEditingBasic(false);
    // if (section === 'guardian') setIsEditingGuardian(false);
  };
  
  const setActiveTab = (tabId: "basic" | "subscriptions" | "transactions") => {
    setActiveTabState(tabId);
    navigate(`#${tabId}`, { replace: true }); // Use replace to avoid cluttering history
  };

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        await Promise.all([
          // Fetch Profile Image
          (async () => {
            try {
              const response = await ApiServices.getUserProfileImage();
              if (response.data?.status === "success" && response.data?.data?.image) {
                setProfileImage(response.data.data.image);
              }
            } catch { /* silent */ }
          })(),
          // Fetch Academic Info
          (async () => {
            try {
              const res = await ApiServices.getUserAcademicInfo();
              if (res.data?.status === "success") {
                setAcademicInfo(res.data.data);
              }
            } catch { /* silent */ }
          })(),
          // Fetch Profile Info
          (async () => {
            try {
              const res = await ApiServices.getProfileInfo();
              if (res.data?.status === "success") {
                setProfileInfo(res.data.data);
              }
            } catch { /* silent */ }
          })(),
          // Fetch Connections
          (async () => {
            try {
              const res = await ApiServices.getActiveUserConnections();
              if (res.data?.status === "success") {
                setActiveConnections(res.data.data || []);
              }
            } catch { /* silent */ }
          })(),
          // Fetch Linked Profiles
          (async () => {
            try {
              const res = await ApiServices.getUsersByTokenContact();
              if (res.data?.status === "success") {
                setProfiles(res.data.data || []);
              }
            } catch { /* silent */ }
          })(),
        ]);
      } catch (error) {
        console.error("An error occurred while fetching profile data.", error);
      } finally {
        setIsPageLoading(false);
        setIsFetchingProfiles(false);
        setLoadingConnections(false);
      }
    };

    fetchAllData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isPageLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-[#b0cb1f] rounded-full animate-spin" />
          <p className="text-sm font-medium text-gray-500">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={formik.handleSubmit} className="space-y-4">
      {/* ── Profile Switcher (Manage Profile) ── */}
      {/* This section should always be present, showing loading, content, or empty state */}
      {/* Removed the conditional rendering of the outer div to ensure it's always there */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-primary">Manage Profiles</h3>
            {isFetchingProfiles ? (
              <div className="w-20 h-4 bg-gray-100 rounded-full animate-pulse" /> // Placeholder for count
            ) : (
              <div className="px-2 py-0.5 rounded-full bg-lime-50 text-[#6b7a0e] text-[9px] font-bold border border-lime-100 uppercase">
                {profiles.length} Accounts Found
              </div>
            )}
          </div>

          {isFetchingProfiles ? (
            <div className="flex flex-col items-center justify-center py-6">
              <div className="w-8 h-8 border-2 border-gray-200 border-t-[#b0cb1f] rounded-full animate-spin" />
              <p className="text-xs text-gray-500 font-medium mt-3">Loading profiles...</p>
            </div>
          ) : profiles.length > 0 ? (
            // Render profiles if not fetching and profiles exist
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
                  <div className={`relative w-14 h-14 rounded-full flex items-center justify-center text-lg font-black transition-all border-4 ${
                    isActive 
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
                      {p.role_name || "Student"}
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
          ) : (
            // Empty state if no profiles after loading
            <div className="flex flex-col items-center justify-center py-6 text-center text-gray-400">
              <Users size={36} className="mb-2" />
              <p className="text-sm font-medium">No linked profiles found.</p>
              <p className="text-xs">Click "Add New" to link a profile.</p>
            </div>
          )}
        </div>
      {/* ── Profile Hero Card (Banner only) ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-[#b0cb1f] to-lime-400 relative flex items-center px-6 gap-6">
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
              className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white flex items-center justify-center shadow-lg border border-gray-100 group-hover:scale-110 transition-transform"
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
            >
              <span className="material-symbols-outlined text-gray-600 text-[14px]">photo_camera</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
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

          <div className="relative flex gap-2 shrink-0">
            {profileBtn.show && (
              <button
                type="button"
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white shadow-sm hover:shadow-md text-primary text-xs font-black transition-all border border-white/50"
              >
                <PlusCircle size={14} />
                {profileBtn.label}
              </button>
            )}
          </div>
        </div>
     

      {/* ── Academic Information (Always Visible) ── */}
      <SectionCard
        icon={<GraduationCap size={16} className="text-primary" />}
        title="Academic Information"
      >
        <div className="px-6 py-5">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6">
            <FormField label="Board" name="board" value={academicInfo?.board_name || ""} onChange={formik.handleChange} isEditing={false} />
            <FormField label="School" name="school" value={academicInfo?.institute_name || ""} onChange={formik.handleChange} isEditing={false} />
            <FormField label="Class" name="grade" value={academicInfo?.class_name || ""} onChange={formik.handleChange} isEditing={false} />
            <FormField label="Section" name="section" value={academicInfo?.section_name || ""} onChange={formik.handleChange} isEditing={false} />
            <FormField label="Academic Year" name="academic" value={academicInfo?.academic_year || ""} onChange={formik.handleChange} isEditing={false} />
            <FormField label="Enrollment" name="enrollmentDate" value={academicInfo?.enrollment_date || ""} onChange={formik.handleChange} isEditing={false} />
          </div>
        </div>
      </SectionCard>
 </div>
      {/* ── Tabs & Content Combined Section ── */}
      <div className="-space-y-[1px]">
        {/* ── Tabs Navigation ── */}
        <div className="flex items-center p-1.5 bg-white rounded-t-2xl border border-gray-100 shadow-sm overflow-x-auto no-scrollbar gap-1 relative z-10">
          {[
            { id: "basic", label: "Basic Info", icon: <Edit3 size={14} />, show: true },
            { id: "subscriptions", label: "My Subscriptions", icon: <CreditCard size={14} />, show: true },
            { id: "transactions", label: "Transaction History", icon: <Receipt size={14} />, show: true },
          ].filter(tab => tab.show).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black transition-all whitespace-nowrap ${
                activeTabState === tab.id
                  ? "bg-button-primary text-white shadow-sm border border-gray-100"
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
          {activeTabState === "basic" && (
            <SectionCard
              className="rounded-t-none border-t-0"
              icon={<Mail size={16} className="text-primary" />}
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
            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5 ">
                {user?.role === "student" && (
                  <FormField label="Date of Birth" name="dateOfBirth" value={formik.values.dateOfBirth} onChange={formik.handleChange} isEditing={isEditingBasic} />
                )}
                <ReadOnlyField label="Email Address" value={profileInfo?.email || ""} icon={<Mail size={12} className="text-primary" />} />
                <ReadOnlyField label="Mobile Number" value={profileInfo?.mobile || ""} icon={<Phone size={12} className="text-primary" />} />
                <FormField label="Address" name="address" value={formik.values.address} onChange={formik.handleChange} isEditing={isEditingBasic} icon={<MapPin size={12} className="text-primary" />} />
              </div>

              {!isTeacher && activeConnections.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <h4 className="text-xs font-bold text-primary uppercase tracking-wider mb-4">{secondSectionConfig.title}</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
                    <ReadOnlyField label={secondSectionConfig.labels.name} value={activeConnections[0].name || "N/A"} icon={<Users size={12} className="text-primary" />} />
                    <ReadOnlyField label={secondSectionConfig.labels.email} value={activeConnections[0].email || "N/A"} icon={<Mail size={12} className="text-primary" />} />
                    <ReadOnlyField label={secondSectionConfig.labels.phone} value={activeConnections[0].phone || "N/A"} icon={<Phone size={12} className="text-primary" />} />
                    {!isParent && (
                      <ReadOnlyField label="Relation" value={activeConnections[0].role || "N/A"} icon={<Users size={12} className="text-primary" />} />
                    )}
                  </div>
                </div>
              )}
            </div>
          </SectionCard>
        )}

        {activeTabState === "subscriptions" && (
          <>
            <SubscriptionTab className="rounded-t-none border-t-0" />
            {/* ── Subscription Purchase Flow (Bottom) ── */}
            <div className="mt-8 pt-8 border-t border-gray-100 shadow-sm bg-white rounded-2xl">
              <h2 className="text-xl font-black text-primary mb-6 px-4">Add New Subscription</h2>
              <Subscription />
            </div>
          </>
        )}
        {activeTabState === "transactions" && <TransactionTab className="rounded-t-none border-t-0" />}
        </div>
      </div>

      {profileBtn.targetRole && (
        <AddProfileModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          targetRole={profileBtn.targetRole as "parent" | "student"}
        />
      )}

    </form>
  );
};

export default StudentProfile;
