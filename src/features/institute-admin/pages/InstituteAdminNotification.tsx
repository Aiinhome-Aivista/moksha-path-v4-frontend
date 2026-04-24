import React, { useState, useEffect } from "react";
import ApiServices from "../../../services/ApiServices";
import { useNavigate } from "react-router-dom";

type InvitationStatus = "Pending" | "Accepted" | "Rejected";
type ProfileStatus = "Complete" | "Pending" | "Rejected";
type ActiveTab = "subscription" | "test" | "profile";

interface ReceivedInvitation {
  id: number;
  inviteToken: string;
  invitedBy: string; // or receiverName
  subscriptionName: string;
  planName: string;
  subjects: string[];
  invitedOn: string;
  expiresOn: string;
  status: InvitationStatus;
  type: "received" | "sent";
}

type TestStatus = "Pending" | "Completed";

interface TestNotification {
  assignment_id: number;
  set_name: string;
  subject_name: string;
  assigned_by_name: string;
  assigned_date: string;
  due_date: string;
  duration_minutes: number;
  total_marks: number;
  number_of_questions: number;
  marks_obtained: number;
  status: TestStatus;
}

const statusConfig: Record<
  InvitationStatus,
  { bg: string; text: string; dot: string; label: string }
> = {
  Pending: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    dot: "bg-amber-400",
    label: "Pending",
  },
  Accepted: {
    bg: "bg-green-50",
    text: "text-green-700",
    dot: "bg-green-500",
    label: "Accepted",
  },
  Rejected: {
    bg: "bg-red-50",
    text: "text-red-600",
    dot: "bg-red-500",
    label: "Rejected",
  },
};

const profileStatusConfig: Record<
  ProfileStatus,
  { bg: string; text: string; dot: string; label: string }
> = {
  Pending: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    dot: "bg-amber-400",
    label: "Pending",
  },
  Complete: {
    bg: "bg-green-50",
    text: "text-green-700",
    dot: "bg-green-500",
    label: "Complete",
  },
  Rejected: {
    bg: "bg-red-50",
    text: "text-red-600",
    dot: "bg-red-500",
    label: "Rejected",
  },
};

// left-border color map for cards
const statusBorder: Record<InvitationStatus, string> = {
  Pending: "border-l-amber-400",
  Accepted: "border-l-green-500",
  Rejected: "border-l-red-500",
};

const avatarGradients = [
  "from-violet-500 to-purple-600",
  "from-blue-500 to-cyan-500",
  "from-emerald-500 to-teal-500",
  "from-rose-500 to-pink-500",
  "from-orange-500 to-amber-500",
];

const FILTERS: { key: InvitationStatus | "All"; label: string }[] = [
  { key: "All", label: "All" },
  { key: "Pending", label: "Pending" },
  { key: "Accepted", label: "Accepted" },
  { key: "Rejected", label: "Rejected" },
];

// Normalize raw API item → ReceivedInvitation
function normalize(item: any, type: "received" | "sent"): ReceivedInvitation {
  return {
    id: item.invite_id,
    inviteToken: item.invite_token,
    invitedBy:
      type === "received"
        ? item.sender_name ?? "Unknown"
        : item.receiver_name ?? "Unknown",
    subscriptionName: item.subscription_name ?? item.plan_name ?? "—",
    planName: item.plan_name ?? "—",
    subjects: Array.isArray(item.subject_names) ? item.subject_names : [],
    invitedOn: item.sent_at ? item.sent_at.split(",")[0] : "—",
    expiresOn:
      item.subscriptionExpiryDate ??
      (item.expires_at ? item.expires_at.split(",")[0] : "—"),
    status: (item.status as InvitationStatus) || "Pending",
    type,
  };
}

const InstituteAdminNotification: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>("subscription");
  const [invitations, setInvitations] = useState<ReceivedInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeFilter, setActiveFilter] = useState<InvitationStatus | "All">(
    "All",
  );
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [actioningState, setActioningState] = useState<{
    id: number;
    action: "accept" | "reject";
  } | null>(null);
  const [actionError, setActionError] = useState<Record<number, string>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 9;

  const [tests, setTests] = useState<TestNotification[]>([]);
  const [testLoading, setTestLoading] = useState(false);
  const [testError, setTestError] = useState("");
  const [profileFilter, setProfileFilter] = useState<ProfileStatus | "All">(
    "All",
  );
  // const [profileLoading, setProfileLoading] = useState(false);
  // const [profileError, setProfileError] = useState("");
  const [profileExpandedId, setProfileExpandedId] = useState<number | null>(
    null,
  );

  //profile notification
  const [profileRequests, setProfileRequests] = useState<any[]>([]);
  const [profileSummary, setProfileSummary] = useState<any>({
    all: 0,
    complete: 0,
    rejected: 0,
    pending: 0
  });
  const [isUpdatingProfileRequest, setIsUpdatingProfileRequest] = useState<string | null>(null);


  const navigate = useNavigate();
  // ── fetch on mount ─────────────────────────────────────────────────────
  useEffect(() => {
    fetchInvites();
  }, []);

  const fetchInvites = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await ApiServices.getInviteHistory();
      if (res.data?.status === "success" && res.data?.data) {
        const received = (res.data.data.received_invites || []).map((i: any) =>
          normalize(i, "received"),
        );
        const sent = (res.data.data.sent_invites || []).map((i: any) =>
          normalize(i, "sent"),
        );
        // Merge and sort by ID (Assuming higher ID is newer)
        const combined = [...received, ...sent].sort((a, b) => b.id - a.id);
        setInvitations(combined);
      } else {
        setError(res.data?.message || "Failed to load invitations.");
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || "Could not load invitations.");
    } finally {
      setLoading(false);
    }
  };

  // // ── accept / decline ───────────────────────────────────────────────────
  // const respondInvite = async (
  //   inv: ReceivedInvitation,
  //   action: "accept" | "reject",
  // ) => {
  //   setActioningId(inv.id);
  //   setActionError((prev) => ({ ...prev, [inv.id]: "" }));
  //   try {
  //     const res = await ApiServices.respondToInvite(inv.inviteToken, action);
  //     if (res.data?.status === "success") {
  //       setInvitations((prev) =>
  //         prev.map((i) =>
  //           i.id === inv.id
  //             ? { ...i, status: action === "accept" ? "Accepted" : "Rejected" }
  //             : i,
  //         ),
  //       );
  //       setExpandedId(null);
  //     } else {
  //       setActionError((prev) => ({
  //         ...prev,
  //         [inv.id]: res.data?.message || "Action failed.",
  //       }));
  //     }
  //   } catch (err: any) {
  //     setActionError((prev) => ({
  //       ...prev,
  //       [inv.id]: err?.response?.data?.message || "Something went wrong.",
  //     }));
  //   } finally {
  //     setActioningId(null);
  //   }
  // };
  // ── accept / decline ───────────────────────────────────────────────────
  const respondInvite = async (
    inv: ReceivedInvitation,
    action: "accept" | "reject",
  ) => {
    setActioningState({ id: inv.id, action });
    setActionError((prev) => ({ ...prev, [inv.id]: "" }));
    try {
      const res = await ApiServices.respondToInvite(inv.inviteToken, action);

      if (res.data?.status === "success") {
        setInvitations((prev) =>
          prev.map((i) =>
            i.id === inv.id
              ? { ...i, status: action === "accept" ? "Accepted" : "Rejected" }
              : i,
          ),
        );
        setExpandedId(null);

        // ===================================================================
        // NEW LOGIC: Auto-fetch new token if they ACCEPTED the invite
        // ===================================================================
        if (action === "accept") {
          try {
            // 1. Fetch their profiles (the DB just created/updated one for them!)
            const profilesRes = await ApiServices.getUserProfiles();

            if (profilesRes.data?.status === "success") {
              const allProfiles = profilesRes.data.data;

              // 2. Find the profile that matches the invite they just accepted
              // (Or fallback to the first available profile if names mismatch)
              const newlyActivatedProfile =
                allProfiles.find(
                  (p: any) => p.subscription_name === inv.subscriptionName,
                ) || allProfiles[0];

              // if (newlyActivatedProfile) {
              //   // 3. Call the Switch Profile API to get a FRESH token
              //   const switchRes = await ApiServices.switchUserProfile({
              //     profile_id: newlyActivatedProfile.profile_id
              //   });

              //   if (switchRes.data?.status === "success") {
              //     // 4. Save the new token and profile
              //     const newToken = switchRes.data.data.auth_token;
              //     if (newToken) {
              //       localStorage.setItem("auth_token", newToken);
              //     }
              //     const newSubscription_token = switchRes.data.data.subscription_token;
              //     if (newSubscription_token) {
              //       localStorage.setItem("subscription_token", newSubscription_token);
              //     }

              //     const newActiveProfile = switchRes.data.data.active_profile;
              //     if (newActiveProfile) {
              //       localStorage.setItem("active_profile", JSON.stringify(newActiveProfile));
              //     }

              //     // 5. Hard Redirect to Dashboard so the whole app reloads with the new token
              //     // window.location.href = "/dashboard";
              //     return; // Stop execution here so it doesn't clear the loading state prematurely
              //   }
              // }
              if (newlyActivatedProfile) {
                const switchRes = await ApiServices.switchUserProfile({
                  profile_id: newlyActivatedProfile.profile_id,
                });

                if (switchRes.data?.status === "success") {
                  const { subscription_token, active_profile } =
                    switchRes.data.data;

                  // if (auth_token) {
                  //   localStorage.setItem("auth_token", auth_token);
                  // }

                  if (subscription_token) {
                    localStorage.setItem(
                      "subscription_token",
                      subscription_token,
                    );
                  }

                  if (active_profile) {
                    localStorage.setItem(
                      "active_profile",
                      JSON.stringify(active_profile),
                    );
                  }

                  return;
                }
              }
            }
          } catch (switchError) {
            // console.error("Failed to auto-switch profile after accepting invite", switchError);
          }
        }
        // ===================================================================
      } else {
        setActionError((prev) => ({
          ...prev,
          [inv.id]: res.data?.message || "Action failed.",
        }));
      }
    } catch (err: any) {
      setActionError((prev) => ({
        ...prev,
        [inv.id]: err?.response?.data?.message || "Something went wrong.",
      }));
    } finally {
      setActioningState(null);
    }
  };

  // ── derived ────────────────────────────────────────────────────────────
  const filtered =
    activeFilter === "All"
      ? invitations
      : invitations.filter((inv) => inv.status === activeFilter);

  const pendingCount = invitations.filter((i) => i.status === "Pending").length;

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const handleFilterChange = (key: InvitationStatus | "All") => {
    setActiveFilter(key);
    setCurrentPage(1);
  };

  const userProfile = JSON.parse(localStorage.getItem("active_profile") || "{}");
  const roleName = userProfile?.role_name?.toLowerCase() || "";
  const isStudentOrParent = roleName === "student" || roleName === "parent";

  const tabs: { key: ActiveTab; label: string; icon: string }[] = [
    { key: "subscription", label: "Subscription", icon: "subscriptions" },
    { key: "test", label: "Test", icon: "quiz" },
  ];

  if (isStudentOrParent) {
    tabs.push({ key: "profile", label: "Profile", icon: "person" });
  }

  const fetchTestNotifications = async () => {
    setTestLoading(true);
    setTestError("");

    try {
      const res = await ApiServices.getTeacherStudentTestNotification();

      if (res.data?.status === "success") {
        setTests(res.data.data || []);
      } else {
        setTestError(res.data?.message || "Failed to load test notifications");
      }
    } catch (err: any) {
      setTestError(
        err?.response?.data?.message || "Unable to fetch test notifications",
      );
    } finally {
      setTestLoading(false);
    }
  };

  const fetchProfileRequests = async () => {
    // setProfileLoading(true);
    // setProfileError("");

    try {
      const res = await ApiServices.getPendingMappingRequests();

      if (res.data?.status === "success") {
        setProfileRequests(res.data.data?.users_list || []);
        if (res.data.data?.summary) {
          setProfileSummary(res.data.data.summary);
        }
      } else {
        // setProfileError(res.data?.message || "Failed to load requests");
      }
    } catch (err: any) {
      // setProfileError(
      //   err?.response?.data?.message || "Unable to fetch requests"
      // );
    } finally {
      // setProfileLoading(false);
    }
  };

  const manageProfileRequest = async (linkId: number, reqStatus: string) => {
    try {
      setIsUpdatingProfileRequest(`${linkId}-${reqStatus}`);
      const res = await ApiServices.manageParentStudentMapping({
        link_id: linkId,
        action: reqStatus,
      });

      if (res.data?.status === "success") {
        fetchProfileRequests();
      } else {
        // console.error("Failed to update profile request status");
      }
    } catch (error) {
      // console.error("Error updating profile request status", error);
    } finally {
      setIsUpdatingProfileRequest(null);
    }
  };


  useEffect(() => {
    if (activeTab === "test") {
      fetchTestNotifications();
    }

    if (activeTab === "profile") {
      fetchProfileRequests();
    }
  }, [activeTab]);
  return (
    <div className="min-h-screen p-4 space-y-6">
      <div>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-gray-800">Notifications</h1>
            {pendingCount > 0 && (
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-400 text-white text-xs font-bold shadow-sm">
                {pendingCount}
              </span>
            )}
          </div>

          {/* ── Tabs inline with heading ── */}
          <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
            {tabs.map(({ key, label, icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${activeTab === key
                  ? "bg-white text-gray-800 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
                  }`}
              >
                <span
                  className="material-symbols-outlined"
                  style={{
                    fontSize: "16px",
                    fontVariationSettings:
                      activeTab === key
                        ? "'FILL' 1, 'wght' 500"
                        : "'FILL' 0, 'wght' 400",
                  }}
                >
                  {icon}
                </span>
                {label}
              </button>
            ))}
          </div>
        </div>
        <p className="text-sm text-gray-400 mt-1">
          Stay updated with your latest activity
        </p>
      </div>

      {/* ── Tab Content ── */}
      {activeTab === "subscription" ? (
        <div className="space-y-4">
          {/* ── Filter Chips ── */}
          <div className="flex flex-wrap gap-2">
            {FILTERS.map(({ key, label }) => {
              const count =
                key === "All"
                  ? invitations.length
                  : invitations.filter((i) => i.status === key).length;
              return (
                <button
                  key={key}
                  onClick={() => handleFilterChange(key)}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 flex items-center gap-1.5 ${activeFilter === key
                    ? "bg-gray-800 text-white border-gray-800 shadow-sm"
                    : "bg-white text-gray-500 border-gray-200 hover:border-gray-400 hover:text-gray-700"
                    }`}
                >
                  {label}
                  <span
                    className={`inline-flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-bold ${activeFilter === key
                      ? "bg-white/20 text-white"
                      : "bg-gray-100 text-gray-400"
                      }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* ── Loading / Error / Empty / Cards ── */}
          {loading ? (
            <div className="flex items-center justify-center py-24 gap-3 text-gray-400">
              <span
                className="material-symbols-outlined text-3xl animate-spin"
                style={{ fontVariationSettings: "'wght' 300" }}
              >
                progress_activity
              </span>
              <span className="text-sm">Loading invitations…</span>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-24 gap-2 text-red-400">
              <span
                className="material-symbols-outlined text-4xl"
                style={{ fontVariationSettings: "'wght' 200, 'FILL' 0" }}
              >
                error
              </span>
              <p className="text-sm font-semibold">{error}</p>
              <button
                onClick={fetchInvites}
                className="mt-2 text-xs text-gray-500 underline hover:text-gray-700"
              >
                Try again
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 gap-2 text-gray-400">
                  <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-2">
                    <span
                      className="material-symbols-outlined text-4xl text-gray-300"
                      style={{ fontVariationSettings: "'wght' 200, 'opsz' 48" }}
                    >
                      mail_off
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-gray-500">
                    No invitations here
                  </p>
                  <p className="text-xs">No invitations match this filter.</p>
                </div>
              ) : (
                paginated.map((inv, idx) => {
                  const cfg = statusConfig[inv.status];
                  const grad = avatarGradients[idx % avatarGradients.length];
                  const isExpanded = expandedId === inv.id;
                  const isPending = inv.status === "Pending";
                  const isActioning = actioningState?.id === inv.id;
                  const isAccepting =
                    isActioning && actioningState?.action === "accept";
                  const isRejecting =
                    isActioning && actioningState?.action === "reject";
                  const thisActionError = actionError[inv.id] ?? "";
                  const borderColor = statusBorder[inv.status];

                  return (
                    <div
                      key={`${inv.id}-${inv.type}`}
                      className={`bg-white rounded-2xl border shadow-sm transition-all duration-300 overflow-hidden ${borderColor
                        ? `border-l-4 ${borderColor} border-t-gray-100 border-r-gray-100 border-b-gray-100 hover:shadow-md`
                        : "border-gray-100 hover:border-gray-200 hover:shadow-sm"
                        }`}
                    >
                      {/* ── Card Header ── */}
                      <div
                        className="flex items-center gap-4 p-5 cursor-pointer"
                        onClick={() =>
                          setExpandedId(isExpanded ? null : inv.id)
                        }
                      >
                        {/* Avatar */}
                        <div
                          className={`flex-shrink-0 w-12 h-12 rounded-2xl bg-gradient-to-br ${grad} flex items-center justify-center text-white text-lg font-bold shadow-sm`}
                        >
                          {inv.invitedBy.charAt(0).toUpperCase()}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-0.5">
                            <span className="text-sm font-bold text-gray-800">
                              {inv.invitedBy}
                            </span>
                            {/* Status badge */}
                            <span
                              className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full ${cfg.bg} ${cfg.text}`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`}
                              />
                              {cfg.label}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 truncate">
                            {inv.type === "received"
                              ? "Invited you to "
                              : "You invited to "}
                            <span className="font-semibold text-gray-700">
                              {inv.subscriptionName}
                            </span>
                          </p>
                          <div className="flex items-center gap-1 mt-1">
                            <span
                              className="material-symbols-outlined text-gray-300"
                              style={{ fontSize: "12px" }}
                            >
                              schedule
                            </span>
                            <span className="text-[11px] text-gray-400">
                              {inv.invitedOn}
                            </span>
                          </div>
                        </div>

                        {/* Expand chevron */}
                        <span
                          className={`material-symbols-outlined text-gray-300 text-xl transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}
                          style={{ fontVariationSettings: "'wght' 300" }}
                        >
                          expand_more
                        </span>
                      </div>

                      {/* ── Expanded Details ── */}
                      {isExpanded && (
                        <div className="border-t border-gray-100 px-4 pb-5 pt-4 space-y-4">
                          {/* Detail grid */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <div className="bg-gray-50 rounded-xl p-3">
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">
                                Plan
                              </p>
                              <p className="text-xs font-semibold text-gray-700">
                                {inv.planName}
                              </p>
                            </div>
                            <div className="bg-gray-50 rounded-xl p-3">
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">
                                Subscription
                              </p>
                              <p className="text-xs font-semibold text-gray-700">
                                {inv.subscriptionName}
                              </p>
                            </div>
                            <div className="bg-gray-50 rounded-xl p-3">
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">
                                Invited On
                              </p>
                              <p className="text-xs font-semibold text-gray-700">
                                {inv.invitedOn}
                              </p>
                            </div>
                            <div className="bg-gray-50 rounded-xl p-3">
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">
                                Expires On
                              </p>
                              <p className="text-xs font-semibold text-amber-600">
                                {inv.expiresOn}
                              </p>
                            </div>
                          </div>

                          {/* Subjects */}
                          {inv.subjects.length > 0 && (
                            <div>
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-2">
                                Subjects Included
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {inv.subjects.map((subj) => (
                                  <span
                                    key={subj}
                                    className="inline-flex items-center gap-1.5 text-xs font-semibold bg-[#BADA55]/20 text-gray-700 px-3 py-1 rounded-full"
                                  >
                                    <span
                                      className="material-symbols-outlined text-[#7B9D24]"
                                      style={{
                                        fontSize: "13px",
                                        fontVariationSettings:
                                          "'wght' 500, 'FILL' 1",
                                      }}
                                    >
                                      menu_book
                                    </span>
                                    {subj}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Action error */}
                          {thisActionError && (
                            <p className="text-xs text-red-500 font-medium flex items-center gap-1">
                              <span className="material-symbols-outlined text-sm">
                                error
                              </span>
                              {thisActionError}
                            </p>
                          )}

                          {/* Action buttons — only if Pending and Received */}
                          {isPending && inv.type === "received" && (
                            <div className="flex gap-3 pt-1">
                              <button
                                disabled={isActioning}
                                onClick={() => respondInvite(inv, "reject")}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border border-red-200 text-red-500 text-sm font-semibold rounded-xl hover:bg-red-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {isRejecting ? (
                                  <span
                                    className="material-symbols-outlined text-base animate-spin"
                                    style={{
                                      fontVariationSettings: "'wght' 400",
                                    }}
                                  >
                                    progress_activity
                                  </span>
                                ) : (
                                  <span
                                    className="material-symbols-outlined text-base"
                                    style={{
                                      fontVariationSettings: "'wght' 400",
                                    }}
                                  >
                                    close
                                  </span>
                                )}
                                Decline
                              </button>
                              <button
                                disabled={isActioning}
                                onClick={() => respondInvite(inv, "accept")}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#BADA55] hover:bg-lime-400 text-gray-800 text-sm font-bold rounded-xl shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {isAccepting ? (
                                  <span
                                    className="material-symbols-outlined text-base animate-spin"
                                    style={{
                                      fontVariationSettings: "'wght' 400",
                                    }}
                                  >
                                    progress_activity
                                  </span>
                                ) : (
                                  <span
                                    className="material-symbols-outlined text-base"
                                    style={{
                                      fontVariationSettings:
                                        "'wght' 600, 'FILL' 1",
                                    }}
                                  >
                                    check_circle
                                  </span>
                                )}
                                Accept
                              </button>
                            </div>
                          )}

                          {/* Status message */}
                          {(inv.status !== "Pending" || inv.type === "sent") && (
                            <div
                              className={`flex items-center gap-2 text-xs font-semibold ${cfg.text} ${cfg.bg} px-4 py-2.5 rounded-xl`}
                            >
                              <span
                                className="material-symbols-outlined text-base"
                                style={{
                                  fontVariationSettings: "'wght' 500, 'FILL' 1",
                                }}
                              >
                                {inv.status === "Accepted"
                                  ? "check_circle"
                                  : inv.status === "Pending"
                                    ? "schedule"
                                    : "cancel"}
                              </span>
                              {inv.type === "received" ? (
                                <>
                                  You have{" "}
                                  {inv.status === "Accepted"
                                    ? "accepted"
                                    : inv.status === "Rejected"
                                      ? "declined"
                                      : ""}{" "}
                                  this invitation.
                                </>
                              ) : (
                                <>
                                  This invitation is{" "}
                                  {inv.status === "Accepted"
                                    ? "accepted"
                                    : inv.status === "Rejected"
                                      ? "declined"
                                      : "pending response"}.
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* ── Pagination ── */}
          {!loading && !error && filtered.length > PAGE_SIZE && (
            <div className="flex items-center justify-between px-1 pt-3 mt-1 border-t border-gray-100">
              {/* Left — count */}
              <p className="text-xs text-gray-400">
                <span className="font-semibold text-gray-600">
                  {(currentPage - 1) * PAGE_SIZE + 1}–
                  {Math.min(currentPage * PAGE_SIZE, filtered.length)}
                </span>{" "}
                / {filtered.length}
              </p>

              {/* Center — page numbers */}
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all duration-200 ${page === currentPage
                        ? "bg-[#BADA55] text-gray-800 shadow"
                        : "text-gray-400 hover:text-gray-700 hover:bg-gray-100"
                        }`}
                    >
                      {page}
                    </button>
                  ),
                )}
              </div>

              {/* Right — arrows */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-50 hover:text-gray-700 hover:border-gray-300 transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <span
                    className="material-symbols-outlined"
                    style={{
                      fontSize: "16px",
                      fontVariationSettings: "'wght' 400",
                    }}
                  >
                    chevron_left
                  </span>
                </button>
                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-50 hover:text-gray-700 hover:border-gray-300 transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <span
                    className="material-symbols-outlined"
                    style={{
                      fontSize: "16px",
                      fontVariationSettings: "'wght' 400",
                    }}
                  >
                    chevron_right
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      ) : activeTab === "test" ? (
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-800">
              Test Notifications
            </h2>
            <span className="text-xs font-semibold text-gray-400">
              {tests.length} Tests
            </span>
          </div>

          {/* Empty State */}
          {testLoading ? (
            <div className="flex items-center justify-center py-24 gap-2 text-gray-400">
              <span className="material-symbols-outlined animate-spin">
                progress_activity
              </span>
              <span className="text-sm">Loading tests…</span>
            </div>
          ) : testError ? (
            <div className="text-center py-24 text-red-500 text-sm font-semibold">
              {testError}
            </div>
          ) : tests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-2 text-gray-400">
              <span className="material-symbols-outlined text-5xl">quiz</span>
              <p className="text-sm font-semibold">No tests assigned</p>
              <p className="text-xs">
                You don’t have any test notifications yet.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {tests.map((test) => {
                const isPending = test.status === "Pending";

                return (
                  <div
                    key={test.assignment_id}
                    className={`rounded-2xl border shadow-sm p-5 space-y-3 transition-all duration-300 hover:shadow-md ${isPending
                      ? "border-l-4 border-l-amber-400 bg-white"
                      : "border-l-4 border-l-green-500 bg-white"
                      }`}
                  >
                    {/* Top */}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-bold text-gray-800 line-clamp-2">
                          {test.set_name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {test.subject_name} • {test.assigned_by_name}
                        </p>
                      </div>

                      {/* Status */}
                      <span
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${isPending
                          ? "bg-amber-50 text-amber-700"
                          : "bg-green-50 text-green-700"
                          }`}
                      >
                        {test.status}
                      </span>
                    </div>

                    {/* Meta */}
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="bg-gray-50 rounded-xl p-2">
                        <p className="text-gray-400 font-semibold uppercase text-[10px]">
                          Due Date
                        </p>
                        <p className="text-gray-700 font-semibold">
                          {test.due_date}
                        </p>
                      </div>

                      <div className="bg-gray-50 rounded-xl p-2">
                        <p className="text-gray-400 font-semibold uppercase text-[10px]">
                          Duration
                        </p>
                        <p className="text-gray-700 font-semibold">
                          {test.duration_minutes} mins
                        </p>
                      </div>

                      <div className="bg-gray-50 rounded-xl p-2">
                        <p className="text-gray-400 font-semibold uppercase text-[10px]">
                          Questions
                        </p>
                        <p className="text-gray-700 font-semibold">
                          {test.number_of_questions}
                        </p>
                      </div>

                      <div className="bg-gray-50 rounded-xl p-2">
                        <p className="text-gray-400 font-semibold uppercase text-[10px]">
                          Marks
                        </p>
                        <p className="text-gray-700 font-semibold">
                          {test.marks_obtained}/{test.total_marks}
                        </p>
                      </div>
                    </div>

                    {/* Action */}
                    {isPending ? (
                      <button
                        onClick={() => {
                          navigate("/tests", {
                            state: {
                              assignmentId: test.assignment_id,
                              selectedSubjectName: test.subject_name,
                            },
                          });
                        }}
                        className="w-full mt-2 px-4 py-2 bg-[#BADA55] hover:bg-lime-400 text-gray-800 text-sm font-bold rounded-xl transition-all"
                      >
                        Start Test
                      </button>
                    ) : (
                      <div className="flex items-center justify-center gap-1 text-xs font-semibold bg-green-50 text-green-700 px-3 py-2 rounded-xl">
                        <span className="material-symbols-outlined text-sm">
                          check_circle
                        </span>
                        Test Completed
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* ── Profile Tab (Hardcoded) ── */
        <div className="space-y-4">
          {/* Inner Tabs / Filters */}
          <div className="flex flex-wrap gap-2">
            {[
              { label: "All", key: "All" as const, countKey: "all" },
              { label: "Complete", key: "Complete" as const, countKey: "complete" },
              { label: "Pending", key: "Pending" as const, countKey: "pending" },
              { label: "Rejected", key: "Rejected" as const, countKey: "rejected" },
            ].map((f) => {
              const count = profileSummary?.[f.countKey] || 0;
              return (
                <button
                  key={f.key}
                  onClick={() => {
                    setProfileFilter(f.key);
                    setProfileExpandedId(null);
                  }}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 flex items-center gap-1.5 ${profileFilter === f.key
                    ? "bg-gray-800 text-white border-gray-800 shadow-sm"
                    : "bg-white text-gray-500 border-gray-200 hover:border-gray-400 hover:text-gray-700"
                    }`}
                >
                  {f.label}
                  <span
                    className={`inline-flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-bold ${profileFilter === f.key
                      ? "bg-white/20 text-white"
                      : "bg-gray-100 text-gray-400"
                      }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/*Profile Invitation Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
            {profileRequests
              .filter((p) => profileFilter === "All" || p.status_label === profileFilter || (profileFilter === "Complete" && p.status_label === "Accepted") || (profileFilter === "Pending" && p.status_label === "Pending") || (profileFilter === "Rejected" && p.status_label === "Rejected"))
              .map((p) => {
                const isExpanded = profileExpandedId === p.link_id;

                // mapped backwards compatibility
                const mappedStatus = p.status_label === "Accepted" ? "Complete" : p.status_label === "Rejected" ? "Rejected" : p.status_label;

                return (
                  <div
                    key={p.link_id}
                    className="bg-white rounded-2xl border border-l-4 border-l-gray-100 border-t-gray-100 border-r-gray-100 border-b-gray-100 shadow-sm transition-all duration-300 overflow-hidden hover:shadow-md"
                    style={{
                      borderLeftColor:
                        mappedStatus === "Complete"
                          ? "#22C55E"
                          : mappedStatus === "Pending"
                            ? "#FBBF24"
                            : "#EF4444",
                    }}
                  >
                    <div
                      className="flex items-center gap-4 p-5 cursor-pointer"
                      onClick={() =>
                        setProfileExpandedId(isExpanded ? null : p.link_id)
                      }
                    >
                      {/* Avatar */}
                      <div
                        className={`flex-shrink-0 w-12 h-12 rounded-2xl bg-gradient-to-br ${avatarGradients[p.link_id % avatarGradients.length] || avatarGradients[0]} flex items-center justify-center text-white text-lg font-bold shadow-sm`}
                      >
                        {(p.full_name || p.username || "U").charAt(0).toUpperCase()}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-0.5">
                          <span className="text-sm font-bold text-gray-800">
                            {p.full_name || p.username}
                          </span>
                          {/* Status badge */}
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full ${profileStatusConfig[mappedStatus as ProfileStatus]?.bg || "bg-gray-50"} ${profileStatusConfig[mappedStatus as ProfileStatus]?.text || "text-gray-500"}`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${profileStatusConfig[mappedStatus as ProfileStatus]?.dot || "bg-gray-300"}`}
                            />
                            {profileStatusConfig[mappedStatus as ProfileStatus]?.label || mappedStatus}
                          </span>
                        </div>
                        {/* <p className="text-xs text-gray-500 truncate">
                          Invited you to{" "}
                          <span className="font-semibold text-gray-700">
                           {p.role}
                          </span>
                        </p> */}
                        <p className="text-xs text-gray-500 truncate">
                          {p.request_type?.toLowerCase() === "received"
                            ? "Sent you a mapping request"
                            : "You sent a mapping request"}
                        </p>
                        {p.request_date || p.connected_on ? (
                          <div className="flex items-center gap-1 mt-1">
                            <span
                              className="material-symbols-outlined text-gray-300"
                              style={{ fontSize: "12px" }}
                            >
                              schedule
                            </span>
                            <span className="text-[11px] text-gray-400">
                              {new Date(p.request_date || p.connected_on).toLocaleDateString()}
                            </span>
                          </div>
                        ) : null}
                      </div>

                      {/* Expand chevron */}
                      <span
                        className={`material-symbols-outlined text-gray-300 text-xl transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}
                        style={{ fontVariationSettings: "'wght' 300" }}
                      >
                        expand_more
                      </span>
                    </div>

                    {/* Expandable Content */}
                    {isExpanded && (
                      <div className="border-t border-gray-100 px-4 pb-5 pt-4 space-y-4">
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                          {/* Role */}
                          <div className="bg-gray-50 rounded-xl p-3">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">
                              Username
                            </p>
                            <p className="text-xs font-semibold text-gray-700">
                              {p.username || "—"}
                            </p>
                          </div>

                          {/* Email */}
                          <div className="bg-gray-50 rounded-xl p-3 overflow-hidden">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">
                              Email
                            </p>
                            <p className="text-xs font-semibold text-gray-700 break-all truncate" title={p.email || ""}>
                              {p.email || "—"}
                            </p>
                          </div>

                          {/* Phone */}
                          <div className="bg-gray-50 rounded-xl p-3">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">
                              Phone
                            </p>
                            <p className="text-xs font-semibold text-gray-700">
                              {p.mobile || p.phone || "—"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 mt-4">
                          <span
                            className={`material-symbols-outlined text-base ${mappedStatus === "Complete"
                              ? "text-green-500"
                              : mappedStatus === "Pending"
                                ? "text-amber-500"
                                : "text-red-500"
                              }`}
                            style={{
                              fontVariationSettings: "'wght' 500, 'FILL' 1",
                            }}
                          >
                            {mappedStatus === "Complete"
                              ? "check_circle"
                              : mappedStatus === "Pending"
                                ? "schedule"
                                : "cancel"}
                          </span>
                          <span
                            className={`text-sm font-semibold ${mappedStatus === "Complete"
                              ? "text-green-600"
                              : mappedStatus === "Pending"
                                ? "text-amber-600"
                                : "text-red-600"
                              }`}
                          >
                            {mappedStatus === "Complete"
                              ? "You have accepted this invitation."
                              : mappedStatus === "Pending"
                                ? p.request_type?.toLowerCase() === "received"
                                  ? "This invitation is pending your response."
                                  : "Waiting for the recipient to respond."
                                : "This invitation has been rejected."}
                          </span>
                        </div>
                        {mappedStatus === "Pending" && p.request_type?.toLowerCase() === "received" && (
                          <div className="flex gap-3 pt-2">
                            <button
                              onClick={() => manageProfileRequest(p.link_id, "DELETE")}
                              disabled={isUpdatingProfileRequest !== null}
                              className="flex-1 px-4 py-2 border border-red-200 text-red-500 rounded-xl text-sm font-semibold hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                              {isUpdatingProfileRequest === `${p.link_id}-DELETE` ? (
                                <span className="material-symbols-outlined text-base animate-spin" style={{ fontVariationSettings: "'wght' 400" }}>
                                  progress_activity
                                </span>
                              ) : "Reject"}
                            </button>

                            <button
                              onClick={() => manageProfileRequest(p.link_id, "ACCEPT")}
                              disabled={isUpdatingProfileRequest !== null}
                              className="flex-1 px-4 py-2 bg-[#BADA55] text-gray-800 rounded-xl text-sm font-bold hover:bg-lime-400 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                              {isUpdatingProfileRequest === `${p.link_id}-ACCEPT` ? (
                                <span className="material-symbols-outlined text-base animate-spin" style={{ fontVariationSettings: "'wght' 400" }}>
                                  progress_activity
                                </span>
                              ) : "Accept"}
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </div>

      )}
    </div>
  );
};

export default InstituteAdminNotification;