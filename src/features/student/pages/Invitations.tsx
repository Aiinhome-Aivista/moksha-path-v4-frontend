import React, { useEffect, useRef, useState } from "react";
import ApiServices from "../../../services/ApiServices";

// ── Types ─────────────────────────────────────────────────────────────────────

interface AssignedUser {
  id: number;
  user: string;
  subscriptionId: string;
  subscriptionName: string;
  invitedOn: string;
  status: "Accepted" | "Pending" | "Rejected";
  requestAcceptedOn: string;
  subscriptionExpiryDate?: string;
  email?: string;
  phone?: string;
  username?: string;
}

interface Subscription {
  id: string;
  name: string;
  totalSeats: number;
  usedSeats: number;
}

interface UserListItem {
  id: number | null;
  username: string;
  fullName: string;
  email: string;
  mobile: string;
}

interface InstituteHierarchy {
  board_id: number;
  board_name: string;
  class_id: number;
  class_name: string;
  institute_id: number;
  institute_name: string;
  section_id: number;
  section_name: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const statusStyle: Record<string, { bg: string; text: string; dot: string }> = {
  Accepted: { bg: "bg-green-50", text: "text-green-700", dot: "bg-green-500" },
  Pending: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-400" },
  Rejected: { bg: "bg-red-50", text: "text-red-600", dot: "bg-red-500" },
};

// left-border color for each status (for card accent)
const statusBorder: Record<string, string> = {
  Accepted: "border-l-green-500",
  Pending: "border-l-amber-400",
  Rejected: "border-l-red-500",
};

const avatarGradients = [
  "from-violet-500 to-purple-600",
  "from-blue-500 to-cyan-500",
  "from-emerald-500 to-teal-500",
  "from-rose-500 to-pink-500",
  "from-orange-500 to-amber-500",
];

// ── Component ─────────────────────────────────────────────────────────────────

const Invitations: React.FC = () => {
  // ── dashboard data ─────────────────────────────────────────────────────
  const [assignedUsers, setAssignedUsers] = useState<AssignedUser[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ── filter ─────────────────────────────────────────────────────────────
  const [filterSubId, setFilterSubId] = useState("");
  const [userStatusTab, setUserStatusTab] = useState<
    "All" | "Pending" | "Complete" | "Expired"
  >("All");
  const [userSearch, setUserSearch] = useState("");

  // ── modal ──────────────────────────────────────────────────────────────
  const [showModal, setShowModal] = useState(false);

  // full username list (loaded once when modal opens)
  const [allUsers, setAllUsers] = useState<UserListItem[]>([]);
  const [usernamesLoading, setUsernamesLoading] = useState(false);

  // username search state
  const [usernameInput, setUsernameInput] = useState("");
  // const [filteredNames, setFilteredNames] = useState<UserListItem[]>([]);
  const [, setFilteredNames] = useState<UserListItem[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<UserListItem[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // (subscription is taken from page-level filterSubId)

  // submit
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");
  const [sendSuccess, setSendSuccess] = useState("");
  // delete
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deleteError, setDeleteError] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const USER_PAGE_SIZE = 6;
  const [userPage, setUserPage] = useState(1);
  const [expandedId, setExpandedId] = useState<number | null>(null);


  //for filters and dropdown
  const [classSearch, setClassSearch] = useState("");
  const [showClassDropdown, setShowClassDropdown] = useState(false);
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [instituteData, setInstituteData] = useState<InstituteHierarchy[]>([]);
  const [classOptions, setClassOptions] = useState<string[]>([]);
  const [, setSectionOptions] = useState<string[]>([]);

  const USER_DROPDOWN_LIMIT = 10;
  const [dropdownPage, setDropdownPage] = useState(1);
  const [dropdownTotalPages, setDropdownTotalPages] = useState(1);
  const [instituteName, setInstituteName] = useState("");

  // ── fetch dashboard data ───────────────────────────────────────────────
  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await ApiServices.getSubscriptionList();
      if (res.data?.status === "success" && res.data?.data) {
        // setAssignedUsers(res.data.data.assignedUsers ?? []);
        // setSubscriptions(res.data.data.subscriptions ?? []);
        const subs = res.data.data.subscriptions ?? [];
        const users = res.data.data.assignedUsers ?? [];

        setAssignedUsers(users);
        setSubscriptions(subs);

        //  Determine default subscription selection.
        //  Prefer active_profile if present, otherwise try sensible fallbacks
        const activeProfile = JSON.parse(
          localStorage.getItem("active_profile") || "null",
        );

        let defaultSubId: string | null = null;

        if (activeProfile?.subscription_name) {
          const match = subs.find(
            (s: Subscription) => s.name === activeProfile.subscription_name,
          );
          if (match) defaultSubId = match.id;
        }

        // Fallback: if we have assigned users, prefer their subscription id
        if (!defaultSubId && users && users.length > 0) {
          const userSubId = users[0].subscriptionId;
          const match = subs.find((s: Subscription) => s.id === userSubId);
          if (match) defaultSubId = match.id;
        }

        // Fallback: if only one subscription exists, select it
        if (!defaultSubId && subs.length === 1) {
          defaultSubId = subs[0].id;
        }

        if (defaultSubId) setFilterSubId(defaultSubId);
      } else {
        setError(res.data?.message || "Failed to fetch data.");
      }
    } catch (err: any) {
      setError(
        err?.response?.data?.message || "Could not load invitation data.",
      );
    } finally {
      setLoading(false);
    }
  };


  const fetchInstituteHierarchy = async () => {
    try {
      const res = await ApiServices.getInstituteList();

      if (res.data?.status === "success") {
        const data: InstituteHierarchy[] = res.data.data;

        setInstituteData(data);

        const classes = [...new Set(data.map((d) => d.class_name))];
        setClassOptions(classes);

        const sections = [...new Set(data.map((d) => d.section_name))];
        setSectionOptions(sections);

        if (data.length > 0) {
          setInstituteName(data[0].institute_name);
        }
      }
    } catch (err) {
      console.error("Failed to load institute hierarchy");
    }
  };


  const getSelectedClassIds = () => {
    if (selectedClasses.length === 0) return [];

    return instituteData
      .filter((c) => selectedClasses.includes(c.class_name))
      .map((c) => c.class_id);
  };

  const fetchDropdownUsers = async (page = 1, searchValue = "") => {
    try {
      setUsernamesLoading(true);

      const payload = {
        page: page,
        limit: USER_DROPDOWN_LIMIT,
        search: searchValue,
        class_ids: getSelectedClassIds(),
      };

      const res = await ApiServices.allUserByPagination(payload);

      if (res.data?.status === "success") {
        const users = res.data.data.users || [];
        const pagination = res.data.data.pagination;

        const normalized = users.map((u: any) => ({
          id: u.user_id,
          username: u.username,
          fullName: u.full_name,
          email: u.email,
          mobile: u.mobile,
        }));

        setAllUsers(normalized);
        setDropdownPage(pagination.current_page);
        setDropdownTotalPages(pagination.total_pages);
      }
    } catch (err) {
      console.error("Dropdown users API failed");
    } finally {
      setUsernamesLoading(false);
    }
  };

  // ── seat stats ─────────────────────────────────────────────────────────
  const selectedSub = filterSubId
    ? (subscriptions.find((s) => s.id === filterSubId) ?? null)
    : null;
  const totalSeats = selectedSub
    ? selectedSub.totalSeats
    : subscriptions.reduce((sum, s) => sum + s.totalSeats, 0);
  const usedSeats = selectedSub
    ? selectedSub.usedSeats
    : subscriptions.reduce((sum, s) => sum + (s.usedSeats || 0), 0);
  const availableSeats = totalSeats - usedSeats;
  const usedPct = totalSeats > 0 ? (usedSeats / totalSeats) * 100 : 0;

  // ── filtered table ─────────────────────────────────────────────────────
  const filteredUsers = filterSubId
    ? assignedUsers.filter((u) => u.subscriptionId === filterSubId)
    : assignedUsers;

  const isExpired = (u: AssignedUser) => {
    if (
      !u.subscriptionExpiryDate ||
      u.subscriptionExpiryDate === "—" ||
      u.subscriptionExpiryDate === ""
    )
      return false;
    return new Date(u.subscriptionExpiryDate) < new Date();
  };

  const tabFiltered = filteredUsers.filter((u) => {
    if (userStatusTab === "Pending" && u.status !== "Pending") return false;
    if (
      userStatusTab === "Expired" &&
      !(u.status === "Accepted" && isExpired(u))
    )
      return false;
    if (
      userStatusTab === "Complete" &&
      !(u.status === "Accepted" && !isExpired(u))
    )
      return false;
    if (userSearch.trim()) {
      const q = userSearch.trim().toLowerCase();
      return (
        u.user.toLowerCase().includes(q) ||
        u.subscriptionName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const tabCounts = {
    All: filteredUsers.length,
    Pending: filteredUsers.filter((u) => u.status === "Pending").length,
    Complete: filteredUsers.filter(
      (u) => u.status === "Accepted" && !isExpired(u),
    ).length,
    Expired: filteredUsers.filter(
      (u) => u.status === "Accepted" && isExpired(u),
    ).length,
  };

  // ── pagination ─────────────────────────────────────────────────────────

  const userTotalPages = Math.max(
    1,
    Math.ceil(tabFiltered.length / USER_PAGE_SIZE),
  );
  const paginated = tabFiltered.slice(
    (userPage - 1) * USER_PAGE_SIZE,
    userPage * USER_PAGE_SIZE,
  );

  // reset page when filters change
  useEffect(() => {
    setUserPage(1);
  }, [userStatusTab, userSearch, filterSubId]);

  // ── close dropdown on outside click ───────────────────────────────────
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── lock body scroll when any modal is open ────────────────────────
  useEffect(() => {
    if (showModal || showDeleteConfirm) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [showModal, showDeleteConfirm]);

  const classDropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        classDropdownRef.current &&
        !classDropdownRef.current.contains(event.target as Node)
      ) {
        setShowClassDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // ── open modal: fetch username list once ───────────────────────────────
  const openModal = async () => {
    resetModal();
    setShowModal(true);
    fetchInstituteHierarchy();
    fetchDropdownUsers(1);
    if (allUsers.length === 0) {
      setUsernamesLoading(true);
      try {
        const res = await ApiServices.getUsernameList();
        if (res.data?.status === "success" && Array.isArray(res.data?.data)) {
          const normalized = res.data.data.map((item: any) => {
            if (typeof item === "string") {
              return {
                id: null as number | null,
                username: item,
                fullName: item,
                email: "",
                mobile: "",
              };
            }
            const userId = item.id ?? item.user_id ?? item.userId ?? null;
            const uname = item.username ?? item.name ?? item.user_name ?? "";
            const fullName = item.full_name ?? item.fullName ?? uname;
            const email = item.email ?? "";
            const mobile = item.mobile ?? item.phone ?? "";
            return {
              id: userId as number | null,
              username: uname as string,
              fullName: fullName as string,
              email: email as string,
              mobile: mobile as string,
            };
          });
          setAllUsers(normalized);
        }
      } catch {
        /* silent */
      } finally {
        setUsernamesLoading(false);
      }
    }
  };

  // ── username search: client-side filter ────────────────────────────────

  const handleUsernameChange = (val: string) => {
    setUsernameInput(val);

    if (val.trim().length === 0) {
      setShowDropdown(false);
      return;
    }

    setShowDropdown(true);   // ⭐ ADD THIS
    fetchDropdownUsers(1, val);
  };

  useEffect(() => {
    if (showModal) {
      fetchDropdownUsers(1, usernameInput);
    }
  }, [selectedClasses]);

  const handleDropdownPageChange = (page: number) => {
    fetchDropdownUsers(page, usernameInput);
  };

  // ── select a username from dropdown ────────────────────────────────────
  const handleSelectUsername = (user: UserListItem) => {
    if (!selectedUsers.some((u) => u.id === user.id)) {
      setSelectedUsers((prev) => [...prev, user]);
    }
    setUsernameInput("");
    setShowDropdown(false);
    setFilteredNames([]);
  };

  const handleRemoveUser = (userId: number | null) => {
    setSelectedUsers((prev) => prev.filter((u) => u.id !== userId));
  };

  // ── send invite ────────────────────────────────────────────────────────
  const handleSendInvite = async () => {
    if (selectedUsers.length === 0 || !filterSubId) return;
    setSending(true);
    setSendError("");
    setSendSuccess("");

    let successCount = 0;
    let failCount = 0;

    try {
      // Send invites sequentially or in parallel
      for (const user of selectedUsers) {
        try {
          const res = await ApiServices.sendSubscriptionInvite({
            subscription_code: filterSubId,
            target_user_id: user.id,
          });
          if (res.data?.status === "success") {
            successCount++;
          } else {
            failCount++;
          }
        } catch (err: any) {
          failCount++;
          const message =
            err?.response?.data?.message || "Failed to send invitation.";

          setSendError(message);
        }
      }

      if (successCount > 0) {
        setSendSuccess(`Successfully sent ${successCount} invite(s).`);
        resetModal();
        await fetchDashboard();
        setTimeout(() => {
          setShowModal(false);
          setSendSuccess("");
        }, 1200);
      } else if (failCount > 0) {
        // setSendError(`Failed to send ${failCount} invite(s).`);
      }
    } catch (err: any) {
      setSendError(err?.response?.data?.message || "Something went wrong.");
    } finally {
      setSending(false);
    }
  };

  const resetModal = () => {
    setUsernameInput("");
    setSelectedUsers([]);
    setFilteredNames([]);
    setShowDropdown(false);

    setSendError("");
    setSendSuccess("");
  };

  const canSubmit = selectedUsers.length > 0 && !!filterSubId && !sending;

  // ── handle delete confirm ──────────────────────────────────────────────────
  const handleConfirmDelete = async () => {
    if (!deletingId) return;
    setDeleteLoading(true);
    setDeleteError("");
    try {
      const res = await ApiServices.undoInvite({ invite_id: deletingId });
      if (res.data?.status === "success") {
        await fetchDashboard();
        setShowDeleteConfirm(false);
        setDeletingId(null);
      } else {
        setDeleteError(res.data?.message || "Failed to remove user.");
      }
    } catch (err: any) {
      setDeleteError(err?.response?.data?.message || "Something went wrong.");
    } finally {
      setDeleteLoading(false);
    }
  };

  // const classDisplay =
  //   selectedClasses.length > 2
  //     ? `${selectedClasses.slice(0, 2).join(", ")}...`
  //     : selectedClasses.join(", ");

  return (
    <div className="min-h-screen p-6 space-y-6">
      {/* ── Page Header ── */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Subscription Invitation
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Invite users and manage your subscription seats
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Subscription filter */}
          <div className="relative">
            <select
              value={filterSubId}
              onChange={(e) => setFilterSubId(e.target.value)}
              className="appearance-none bg-white border border-gray-200 rounded-xl pl-4 pr-9 py-2.5 text-sm text-gray-600 font-medium focus:outline-none focus:ring-2 focus:ring-[#BADA55]/60 shadow-sm"
            >
              <option value="">All Subscriptions</option>
              {subscriptions.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            <span
              className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              style={{ fontSize: "18px", fontVariationSettings: "'wght' 400" }}
            >
              expand_more
            </span>
          </div>

          {/* Refresh */}
          <button
            onClick={fetchDashboard}
            disabled={loading}
            className="flex items-center gap-1.5 px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 font-medium bg-white shadow-sm hover:bg-gray-50 transition-all disabled:opacity-50"
          >
            <span
              className={`material-symbols-outlined text-lg ${loading ? "animate-spin" : ""}`}
              style={{ fontVariationSettings: "'wght' 400, 'opsz' 20" }}
            >
              refresh
            </span>
          </button>

          {/* Add User */}
          <button
            onClick={openModal}
            disabled={availableSeats === 0 || !filterSubId}
            title={
              !filterSubId ? "Select a subscription plan first" : undefined
            }
            className="flex items-center gap-2 px-6 py-2.5 bg-[#BADA55] hover:bg-lime-400 text-gray-800 text-sm font-bold rounded-full shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <span
              className="material-symbols-outlined text-lg"
              style={{ fontVariationSettings: "'wght' 600, 'opsz' 20" }}
            >
              person_add
            </span>
            Add User
          </button>
        </div>
      </div>

      {/* ── Seat Stats Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#FFED00]/40 flex items-center justify-center flex-shrink-0">
            <span
              className="material-symbols-outlined text-gray-700 text-2xl"
              style={{ fontVariationSettings: "'wght' 500, 'FILL' 1" }}
            >
              groups
            </span>
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium">Total Seats</p>
            <p className="text-3xl font-bold text-gray-800">{totalSeats}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0">
            <span
              className="material-symbols-outlined text-green-500 text-2xl"
              style={{ fontVariationSettings: "'wght' 500, 'FILL' 1" }}
            >
              event_seat
            </span>
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium">Available Seats</p>
            <p className="text-3xl font-bold text-green-600">
              {availableSeats}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p className="text-xs text-gray-400 font-medium mb-3">Seats Used</p>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#BADA55] to-lime-400 rounded-full transition-all duration-500"
                style={{ width: `${usedPct}%` }}
              />
            </div>
            <span className="text-sm font-bold text-gray-700 whitespace-nowrap">
              {usedSeats} / {totalSeats}
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            {availableSeats} seat{availableSeats !== 1 ? "s" : ""} remaining
          </p>
        </div>
      </div>

      {/* ── Assigned Users Table ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/60">
          {/* Title + Search + Tabs on same row */}
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2 flex-shrink-0">
              <span
                className="material-symbols-outlined text-gray-400 text-lg"
                style={{ fontVariationSettings: "'wght' 400, 'FILL' 1" }}
              >
                manage_accounts
              </span>
              <h2 className="text-sm font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                Already Assigned Users
              </h2>
            </div>

            {/* Search bar */}
            <div className="relative flex-1 max-w-[380px]">
              <span
                className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none"
                style={{
                  fontSize: "16px",
                  fontVariationSettings: "'wght' 400",
                }}
              >
                search
              </span>
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Search user or plan…"
                className="w-full bg-white border border-gray-200 rounded-xl pl-9 pr-4 py-2 text-xs text-gray-700 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#BADA55]/50 focus:border-[#BADA55] transition-all shadow-sm"
              />
              {userSearch && (
                <button
                  onClick={() => setUserSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors"
                >
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: "14px" }}
                  >
                    close
                  </span>
                </button>
              )}
            </div>

            {/* Status tabs — right side */}
            <div className="flex gap-1 bg-white border border-gray-100 p-1 rounded-xl shadow-sm">
              {(["All", "Pending", "Complete", "Expired"] as const).map(
                (tab) => {
                  const icons: Record<string, string> = {
                    All: "group",
                    Pending: "hourglass_empty",
                    Complete: "check_circle",
                    Expired: "schedule",
                  };
                  const activeColors: Record<string, string> = {
                    All: "bg-gray-800 text-white",
                    Pending: "bg-amber-400 text-white",
                    Complete: "bg-[#BADA55] text-gray-800",
                    Expired: "bg-red-100 text-red-600",
                  };
                  const isActive = userStatusTab === tab;
                  return (
                    <button
                      key={tab}
                      onClick={() => setUserStatusTab(tab)}
                      className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${isActive
                        ? activeColors[tab] + " shadow-sm"
                        : "text-gray-400 hover:text-gray-700 hover:bg-gray-50"
                        }`}
                    >
                      <span
                        className="material-symbols-outlined"
                        style={{
                          fontSize: "14px",
                          fontVariationSettings: isActive
                            ? "'FILL' 1, 'wght' 500"
                            : "'FILL' 0, 'wght' 400",
                        }}
                      >
                        {icons[tab]}
                      </span>
                      {tab}
                      <span
                        className={`inline-flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-bold ${isActive
                          ? "bg-white/30 text-inherit"
                          : "bg-gray-100 text-gray-400"
                          }`}
                      >
                        {tabCounts[tab]}
                      </span>
                    </button>
                  );
                },
              )}
            </div>
          </div>
        </div>

        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-400">
            <span className="material-symbols-outlined text-4xl text-gray-300 animate-spin">
              progress_activity
            </span>
            <p className="text-sm font-medium">Loading…</p>
          </div>
        )}

        {!loading && error && (
          <div className="flex flex-col items-center justify-center py-16 gap-2 text-red-400">
            <span
              className="material-symbols-outlined text-4xl text-red-200"
              style={{ fontVariationSettings: "'wght' 200, 'opsz' 48" }}
            >
              error
            </span>
            <p className="text-sm font-semibold">{error}</p>
            <button
              onClick={fetchDashboard}
              className="text-xs text-[#BADA55] font-bold underline mt-1"
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && tabFiltered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 gap-2 text-gray-400">
            <span
              className="material-symbols-outlined text-5xl text-gray-200"
              style={{ fontVariationSettings: "'wght' 200, 'opsz' 48" }}
            >
              group_off
            </span>
            <p className="text-sm font-semibold">No users found</p>
            <p className="text-xs text-gray-400">
              Try a different tab or click "+ Add User" to invite someone
            </p>
          </div>
        )}

        {!loading && !error && tabFiltered.length > 0 && (
          <div className="px-5 py-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {paginated.map((u, idx) => {
                const st = statusStyle[u.status] ?? statusStyle["Pending"];
                const grad = avatarGradients[idx % avatarGradients.length];
                const isExpanded = expandedId === u.id;
                const borderColor = statusBorder[u.status];
                return (
                  <div
                    key={u.id}
                    className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all duration-1000 ${borderColor
                      ? `border-l-4 ${borderColor} border-t-gray-100 ${isExpanded ? "h-full" : "h-20"} border-r-gray-100 border-b-gray-100 hover:shadow-md`
                      : "border-gray-100 hover:border-gray-200 hover:shadow-sm"
                      }`}
                  >
                    <div
                      className="flex items-center gap-4 p-4 cursor-pointer"
                      onClick={() => setExpandedId(isExpanded ? null : u.id)}
                    >
                      <div
                        className={`flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br ${grad} flex items-center justify-center text-white text-lg font-bold shadow-sm`}
                      >
                        {u.user ? u.user.charAt(0).toUpperCase() : "U"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-0.5">
                          <span className="text-sm font-bold text-gray-800 truncate">
                            {u.user}
                          </span>
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full ${st.bg} ${st.text}`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${st.dot}`}
                            />
                            {u.status}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 truncate">
                          @{u.username ?? "—"} • {u.email ?? "—"}
                        </p>
                      </div>
                      <span
                        className={`material-symbols-outlined text-gray-300 text-xl transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}
                        style={{ fontVariationSettings: "'wght' 300" }}
                      >
                        expand_more
                      </span>
                    </div>
                    {isExpanded && (
                      <div className="border-t border-gray-100 transition-transform duration-300 px-4 pb-5 pt-4 space-y-4">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                          <div className="bg-gray-50 rounded-xl p-3">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">
                              Plan
                            </p>
                            <p className="text-xs font-semibold text-gray-700">
                              {u.subscriptionName}
                            </p>
                          </div>
                          <div className="bg-gray-50 rounded-xl p-3">
                            <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">
                              Invited On
                            </p>
                            <p className="text-xs font-semibold text-gray-700">
                              {u.invitedOn}
                            </p>
                          </div>
                          <div className="bg-gray-50 rounded-xl p-3">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">
                              Accepted
                            </p>
                            <p className="text-xs font-semibold text-gray-700">
                              {u.requestAcceptedOn || "—"}
                            </p>
                          </div>
                          <div className="bg-gray-50 rounded-xl p-3">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">
                              Expires
                            </p>
                            <p className="text-xs font-semibold text-amber-600">
                              {u.subscriptionExpiryDate || "—"}
                            </p>
                          </div>
                        </div>

                        {u.phone && (
                          <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-2">
                              Phone
                            </p>
                            <p className="text-xs font-semibold text-gray-700">
                              {u.phone}
                            </p>
                          </div>
                        )}

                        <div className="flex items-center gap-2">
                          {u.status === "Pending" && (
                            <button
                              onClick={() => {
                                setDeletingId(u.id);
                                setShowDeleteConfirm(true);
                                setDeleteError("");
                              }}
                              className="flex-1 text-xs px-3 py-1 rounded-lg border border-gray-200 text-red-600 hover:bg-red-50"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* ── Pagination bar ── */}
            {userTotalPages > 1 && (
              <div className="flex items-center justify-between gap-4 border-t border-gray-100 px-5 py-3 mt-6">
                <p className="text-xs text-gray-400 font-medium whitespace-nowrap">
                  {(userPage - 1) * USER_PAGE_SIZE + 1}–
                  {Math.min(userPage * USER_PAGE_SIZE, tabFiltered.length)}
                  <span className="text-gray-300"> / </span>
                  {tabFiltered.length}
                </p>

                <div className="flex items-center gap-1">
                  {Array.from({ length: userTotalPages }, (_, i) => i + 1).map(
                    (pg) => (
                      <button
                        key={pg}
                        onClick={() => setUserPage(pg)}
                        className={`w-7 h-7 rounded-lg text-xs font-bold transition-all duration-150 ${pg === userPage ? "bg-[#BADA55] text-gray-800 shadow-sm" : "text-gray-400 hover:bg-gray-100"}`}
                      >
                        {pg}
                      </button>
                    ),
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setUserPage((p) => Math.max(1, p - 1))}
                    disabled={userPage === 1}
                    className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: "16px" }}
                    >
                      chevron_left
                    </span>
                  </button>
                  <button
                    onClick={() =>
                      setUserPage((p) => Math.min(userTotalPages, p + 1))
                    }
                    disabled={userPage === userTotalPages}
                    className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: "16px" }}
                    >
                      chevron_right
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Add User Modal ── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg">
            {/* Header */}
            <div className="bg-gradient-to-r from-gray-800 to-gray-700 px-6 py-5 flex items-center justify-between rounded-t-3xl">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#BADA55]/20 flex items-center justify-center">
                  <span
                    className="material-symbols-outlined text-[#BADA55] text-xl"
                    style={{ fontVariationSettings: "'wght' 500, 'FILL' 1" }}
                  >
                    person_add
                  </span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Invite a User
                  </h3>
                  <p className="text-xs text-gray-400">
                    {subscriptions.find((s) => s.id === filterSubId)?.name ??
                      ""}
                    {" · "}
                    {availableSeats} seat{availableSeats !== 1 ? "s" : ""}{" "}
                    available
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors"
              >
                <span
                  className="material-symbols-outlined text-gray-400 text-lg"
                  style={{ fontVariationSettings: "'wght' 400" }}
                >
                  close
                </span>
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4 min-h-[320px]">
              {sendSuccess && (
                <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-sm font-medium rounded-xl px-4 py-3">
                  <span
                    className="material-symbols-outlined text-green-500 text-lg"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    check_circle
                  </span>
                  {sendSuccess}
                </div>
              )}
              {sendError && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-sm font-medium rounded-xl px-4 py-3">
                  <span
                    className="material-symbols-outlined text-red-500 text-lg"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    error
                  </span>
                  {sendError}
                </div>
              )}

              {/* ── Filters Row ── */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                {/* Institution Filter */}
                <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm font-medium text-gray-600 max-w-[220px]">
                  <input
                    type="checkbox"
                    checked={true}
                    disabled
                    className="w-4 h-4 accent-[#BADA55]"
                  />

                  <span
                    className="truncate cursor-pointer"
                    title={instituteName}
                  >
                    {instituteName || "Loading institute..."}
                  </span>
                </div>


                {/* Class Dropdown */}
                <div className="relative" ref={classDropdownRef}>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">
                      school
                    </span>
                    {/* 
                    <input
                      type="text"
                      value={classSearch}
                      title={selectedClasses.join(", ")}
                      onChange={(e) => setClassSearch(e.target.value)}
                      // onClick={() => setShowClassDropdown((prev) => !prev)}
                      onFocus={() => setShowClassDropdown(true)}
                      placeholder="Class"
                      className="w-full border border-gray-200 rounded-xl pl-10 pr-9 py-2.5 text-sm text-gray-700 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#BADA55]/60 focus:border-[#BADA55] shadow-sm"
                    /> */}
                    <input
                      type="text"
                      value={
                        classSearch ||
                        (selectedClasses.length > 2
                          ? `${selectedClasses.slice(0, 2).join(", ")}...`
                          : selectedClasses.join(", "))
                      }
                      title={selectedClasses.join(", ")}
                      onChange={(e) => {
                        setClassSearch(e.target.value);
                        setShowClassDropdown(true);
                      }}
                      onFocus={() => setShowClassDropdown(true)}
                      placeholder="Class"
                      className="w-full cursor-pointer border border-gray-200 rounded-xl pl-10 pr-9 py-2.5 text-sm text-gray-700 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#BADA55]/60 focus:border-[#BADA55] shadow-sm"
                    />

                    <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-lg">
                      expand_more
                    </span>
                  </div>

                  {showClassDropdown && (
                    <div
                      onMouseDown={(e) => e.stopPropagation()}
                      className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-44 overflow-y-auto"
                    >
                      {classOptions
                        .filter((c) =>
                          c.toLowerCase().includes(classSearch.toLowerCase())
                        )
                        .map((c) => (
                          <label
                            key={c}
                            className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-[#BADA55]/10"
                          >
                            <input
                              type="checkbox"
                              checked={selectedClasses.includes(c)}
                              onChange={() => {
                                setSelectedClasses((prev) =>
                                  prev.includes(c)
                                    ? prev.filter((x) => x !== c)
                                    : [...prev, c]
                                );

                                setClassSearch("");
                              }}
                              className="accent-[#BADA55]"
                            />
                            {c}
                          </label>
                        ))}
                    </div>
                  )}
                </div>


                {/* Section Dropdown */}
                {/* <div className="relative">
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">
                      view_list
                    </span>

                    <input
                      type="text"
                      value={sectionSearch}
                      onChange={(e) => setSectionSearch(e.target.value)}
                      onFocus={() => setShowSectionDropdown(true)}
                      placeholder="Section"
                      className="w-full border border-gray-200 rounded-xl pl-10 pr-9 py-2.5 text-sm text-gray-700 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#BADA55]/60 focus:border-[#BADA55] shadow-sm"
                    />

                    <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-lg">
                      expand_more
                    </span>
                  </div>

                  {showSectionDropdown && (
                    <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-44 overflow-y-auto">
                      {sectionOptions
                        .filter((s) =>
                          s.toLowerCase().includes(sectionSearch.toLowerCase())
                        )
                        .map((s) => (
                          <label
                            key={s}
                            className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-[#BADA55]/10"
                          >
                            <input
                              type="checkbox"
                              checked={selectedSections.includes(s)}
                              onChange={() => {
                                setSelectedSections((prev) =>
                                  prev.includes(s)
                                    ? prev.filter((x) => x !== s)
                                    : [...prev, s]
                                );
                              }}
                              className="accent-[#BADA55]"
                            />
                            {s}
                          </label>
                        ))}
                    </div>
                  )}
                </div> */}

              </div>

              {/* ── Username searchable field ── */}
              <div className="relative" ref={dropdownRef}>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">
                  User Name
                </label>

                <div className="relative">
                  <span
                    className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg pointer-events-none"
                    style={{ fontVariationSettings: "'wght' 400" }}
                  >
                    search
                  </span>
                  <input
                    type="text"
                    value={usernameInput}
                    onChange={(e) => handleUsernameChange(e.target.value)}
                    onFocus={() => {
                      if (allUsers.length > 0) setShowDropdown(true);
                    }}
                    placeholder={
                      usernamesLoading
                        ? "Loading users…"
                        : "Search username, full name, email or mobile…"
                    }
                    // disabled={usernamesLoading}
                    className="w-full border border-gray-200 rounded-xl pl-10 pr-10 py-3 text-sm text-gray-700 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#BADA55]/60 focus:border-[#BADA55] transition-all disabled:bg-gray-50 disabled:cursor-wait"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2">
                    {usernamesLoading && (
                      <span
                        className="material-symbols-outlined text-gray-300 text-lg animate-spin"
                        style={{ fontVariationSettings: "'wght' 400" }}
                      >
                        progress_activity
                      </span>
                    )}
                  </span>
                </div>

                {showDropdown && allUsers.length > 0 && (
                  <div
                    className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg"
                    onWheel={(e) => e.stopPropagation()}
                  >

                    {/* Users List */}
                    <div className="max-h-52 overflow-y-auto">
                      {allUsers.map((user) => (
                        <button
                          key={user.id ?? user.username}
                          type="button"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            handleSelectUsername(user);
                          }}
                          className="w-full flex items-center gap-2.5 px-4 py-2.5 text-left hover:bg-[#BADA55]/10 transition-colors first:rounded-t-xl"
                        >
                          <span
                            className="material-symbols-outlined text-gray-400 text-base"
                            style={{ fontVariationSettings: "'wght' 400, 'FILL' 1" }}
                          >
                            person
                          </span>

                          <span className="flex-1 min-w-0">
                            <span className="block text-sm font-medium text-gray-800 truncate">
                              {user.fullName}
                            </span>

                            <span className="block text-xs text-gray-500 truncate">
                              @{user.username}
                            </span>

                            {(user.email || user.mobile) && (
                              <span className="block text-[11px] text-gray-400 truncate mt-0.5">
                                {[user.email, user.mobile].filter(Boolean).join(" • ")}
                              </span>
                            )}
                          </span>
                        </button>
                      ))}
                    </div>

                    {/* Pagination */}
                    {dropdownTotalPages > 1 && (
                      <div className="flex justify-center gap-1 border-t p-2">
                        {Array.from({ length: dropdownTotalPages }, (_, i) => i + 1).map((pg) => (
                          <button
                            key={pg}
                            onClick={() => handleDropdownPageChange(pg)}
                            className={`px-2 py-1 text-xs rounded ${dropdownPage === pg
                              ? "bg-[#BADA55] text-gray-800"
                              : "bg-gray-100"
                              }`}
                          >
                            {pg}
                          </button>
                        ))}
                      </div>
                    )}

                  </div>
                )}

                {/* Selected / not-selected hint */}
                {selectedUsers.length === 0 && usernameInput.trim() ? (
                  <p className="mt-1.5 text-xs text-amber-500 font-medium flex items-center gap-1">
                    <span
                      className="material-symbols-outlined text-sm"
                      style={{ fontVariationSettings: "'wght' 400" }}
                    >
                      info
                    </span>
                    Pick a user from the suggestions above
                  </p>
                ) : null}
              </div>

              {/* ── Selected Users List ── */}
              {selectedUsers.length > 0 && (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">
                    Selected Users ({selectedUsers.length})
                  </p>
                  {selectedUsers.map((u) => (
                    <div
                      key={u.id}
                      className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-xl p-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shadow-sm flex-shrink-0">
                          {u.fullName
                            ? u.fullName.charAt(0).toUpperCase()
                            : "U"}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-gray-800 truncate">
                            {u.fullName}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            @{u.username}
                          </p>
                          {(u.email || u.mobile) && (
                            <p className="text-[11px] text-gray-400 truncate mt-0.5">
                              {[u.email, u.mobile].filter(Boolean).join(" • ")}
                            </p>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveUser(u.id)}
                        className="text-gray-400 hover:text-red-500 p-1"
                      >
                        <span className="material-symbols-outlined text-xl">
                          close
                        </span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex gap-3 px-6 pb-6">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-3 border border-gray-200 text-gray-600 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSendInvite}
                disabled={!canSubmit}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#BADA55] hover:bg-lime-400 text-gray-800 text-sm font-bold rounded-xl shadow-sm transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed disabled:translate-y-0"
              >
                {sending && (
                  <span
                    className="material-symbols-outlined text-lg animate-spin"
                    style={{ fontVariationSettings: "'wght' 400" }}
                  >
                    progress_activity
                  </span>
                )}
                {sending ? "Sending…" : "Send Invitation"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Modal ── */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-800">Remove User</h3>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-600">
                Are you sure you want to remove this user from the subscription?
                This action cannot be undone.
              </p>
              {deleteError && (
                <div className="text-sm text-red-600">{deleteError}</div>
              )}
            </div>
            <div className="flex gap-3 px-6 pb-6">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeletingId(null);
                }}
                className="flex-1 px-4 py-3 border border-gray-200 text-gray-600 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={deleteLoading}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-xl shadow-sm transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {deleteLoading ? "Removing…" : "Remove User"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Invitations;
