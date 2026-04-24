import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../app/providers/AuthProvider";
import {
  useModal,
  type PageAccessItem,
} from "../../features/auth/context/AuthContext";
import { LogoutConfirmationModal } from "../../features/auth/modal/LogoutConfirmationModal";
import {
  X,
  LogOut,
  Home,
  User,
  CreditCard,
  Wallet,
  Calendar,
  BookOpen,
  FileText,
  NotebookPen,
  Video,
  Edit,
  Award,
  Bell,
  Mail,
  ChevronRight,
  Menu,
  Group,
  type LucideIcon,
} from "lucide-react";
import ApiServices from "../../services/ApiServices";
import { useToast } from "../../app/providers/ToastProvider";
import { useNotification } from "../../app/providers/NotificationProvider";

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

// Map API icon strings (lowercase) to Lucide components
const IconMap: Record<string, LucideIcon> = {
  home: Home,
  discussion: Group,
  user: User,
  "credit-card": CreditCard,
  wallet: Wallet,
  calendar: Calendar,
  book: BookOpen,
  "file-text": FileText,
  "notebook-pen": NotebookPen,
  video: Video,
  edit: Edit,
  award: Award, 
  notification: Bell,
  invitation: Mail,
};

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar }) => {
  const { logout, isAuthenticated, user } = useAuth();
  const { menuItems, isMenuLoaded, fetchMenu, clearMenu } = useModal();
  const { count: notificationCount } = useNotification();
  const navigate = useNavigate();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const { showToast } = useToast();

  // --- API Profile State ---
  const [dynProfile, setDynProfile] = useState<any>(null);
  const [profileImage, setProfileImage] = useState<string>("");

  const staticMenuItems: PageAccessItem[] = [];

  const effectiveMenu =
    isAuthenticated && menuItems && menuItems.length > 0
      ? menuItems
      : staticMenuItems;

  // Fetch menu when user is authenticated
  useEffect(() => {
    if (isAuthenticated && !isMenuLoaded) {
      fetchMenu();
    }
  }, [isAuthenticated, isMenuLoaded, fetchMenu]);

  // Fetch profile data securely via API instead of localStorage
  useEffect(() => {
    if (isAuthenticated) {
      const fetchSidebarProfile = async () => {
        try {
          const [profileRes, imageRes] = await Promise.all([
            ApiServices.getProfileInfo(),
            ApiServices.getUserProfileImage(),
          ]);

          if (profileRes.data?.status === "success") {
            setDynProfile(profileRes.data.data);
          }
          if (imageRes.data?.status === "success") {
            const imgData = imageRes.data.data?.image || imageRes.data.data?.profile_image;
            if (imgData) {
              const profileImg = imgData.startsWith("data:")
                ? imgData
                : `data:image/jpeg;base64,${imgData}`;
              setProfileImage(profileImg);
            }
          }
        } catch (error) {
          // Fail silently and rely on useAuth user object if API fails
        }
      };

      fetchSidebarProfile();
    }
  }, [isAuthenticated]);

  // Safely determine the display name
  const displayUserName = user?.name || dynProfile?.full_name || dynProfile?.teacher_name || "User";

  // Helper to render icon
  const renderIcon = (iconName: string) => {
    const Icon = IconMap[iconName] || Home;
    return <Icon size={20} strokeWidth={1.5} />;
  };

  const handleLogout = () => {
    setIsLogoutModalOpen(true);
  };

  const confirmLogout = async () => {
    try {
      await ApiServices.signOut();
    } catch (error) {
      // Ignore API signout error and continue local cleanup
    } finally {
      clearMenu();
      localStorage.removeItem("auth_token");
      logout();
      showToast("Signed out successfully", "success");
      navigate("/");
      setIsLogoutModalOpen(false);
    }
  };

  return (
    <>
    {isAuthenticated && (
    <aside
      onMouseLeave={() => {
        if (isOpen) toggleSidebar();
      }}
      className={`
                fixed top-0 left-0 h-full z-[100]
                bg-white dark:bg-secondary-900
                shadow-xl transition-all duration-500 ease-in-out
                flex flex-col rounded-r-[30px] overflow-hidden
                ${isOpen ? "w-[360px]" : "w-0 md:w-[88px]"}
            `}
      style={{
        transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    >
      {/* Header Section */}
      <div
        className={`
                h-14 flex items-center transition-all duration-500 shrink-0
                ${isOpen ? "justify-start px-6 gap-4" : "justify-center"}
            `}
        style={{
          transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        {isOpen ? (
          <>
            <button
              onClick={toggleSidebar}
              className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-800 dark:text-gray-200 transition-colors shrink-0"
            >
              <X size={24} strokeWidth={2.5} />
            </button>
            <div className="flex items-center gap-2 font-bold text-lg min-w-0">
              <img src="/logogod.svg" alt="logo" className="w-10 h-10 shrink-0" />
              <div className="min-w-0">
                <h3 className="truncate">
                  Moksh<span className="text-xl text-[#E7842E]">Path</span>
                </h3>
                <p className="text-[10px] leading-none font-normal truncate">
                  Guided Path to True Learning
                </p>
              </div>
            </div>
          </>
        ) : (
          <button
            onClick={toggleSidebar}
            className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 transition-colors ${!isOpen ? "fixed left-4 top-4 z-[60] md:static" : ""}`}
          >
            <Menu size={24} />
          </button>
        )}
      </div>

      {/* ── PROFILE PICTURE & WELCOME SECTION ── */}
      <div className={`flex items-center transition-all duration-500 shrink-0 min-w-0 ${!isOpen ? "flex-col hidden md:flex py-2" : "flex-row gap-4 pt-4 pb-2 border-b border-gray-100 dark:border-gray-800 mx-3 px-3"}`}>
        <div className="relative shrink-0">
          {profileImage ? (
            <img 
              src={profileImage} 
              alt="Profile" 
              className={`rounded-full object-cover border-2 border-white shadow-md transition-all duration-500 ${isOpen ? "w-14 h-14" : "w-10 h-10"}`} 
            />
          ) : (
            <div className={`rounded-full border-2 border-white shadow-md bg-gradient-to-br from-[#E7842E] to-yellow-500 flex items-center justify-center text-white font-black transition-all duration-500 ${isOpen ? "w-14 h-14 text-2xl" : "w-10 h-10 text-lg"}`}>
              {displayUserName.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        
        {isOpen && (
          <div className="flex flex-col min-w-0 transition-opacity duration-500">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Welcome</span>
            <h4 className="text-lg font-bold text-gray-800 dark:text-gray-800 leading-tight truncate w-full">
              {displayUserName}
            </h4>
          </div>
        )}
      </div>

      {/* Navigation Menu */}
      <nav
        className={`flex-1 overflow-y-auto overflow-x-hidden px-3 pt-2 pb-4 custom-scrollbar ${!isOpen ? "hidden md:block" : ""}`}
      >
        <ul className="space-y-1">
          {effectiveMenu.map((item) => (
            <li key={item.page_id}>
              <NavLink
                to={item.route}
                draggable={false}
                onDragStart={(e) => e.preventDefault()}
                onClick={() => {
                  if (isOpen) toggleSidebar();
                }}
                className={({ isActive }) => `
                                    group flex items-center
                                    px-3 py-3 rounded-xl
                                    transition-all duration-300
                                    ${
                                      isActive
                                        ? "bg-orange-50 dark:bg-orange-900/10 text-orange-500"
                                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                                    }
                                    ${isOpen ? "justify-between" : "justify-center"}
                                `}
                style={{
                  transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
                }}
                title={!isOpen ? item.page_name : undefined}
              >
                <div className={`flex items-center min-w-0 ${isOpen ? "gap-3" : ""}`}>
                  <div className="relative shrink-0">
                    {renderIcon(item.icon)}
                    {item.icon === "notification" && notificationCount > 0 && (
                      <span className={`absolute -top-1.5 -right-1.5 flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-[10px] font-bold text-white border-2 border-white shadow-sm`}>
                        {notificationCount > 99 ? "99+" : notificationCount}
                      </span>
                    )}
                  </div>
                  {isOpen && (
                    <span
                      className="text-[15px] font-medium truncate transition-opacity duration-300"
                      style={{
                        transitionTimingFunction:
                          "cubic-bezier(0.4, 0, 0.2, 1)",
                      }}
                    >
                      {item.page_name}
                    </span>
                  )}
                </div>
                {isOpen && (
                  <ChevronRight
                    size={16}
                    className={`text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity duration-300 shrink-0`}
                    style={{
                      transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
                    }}
                  />
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer / Logout */}
      {isAuthenticated && (
        <div
          className={`p-4 dark:border-gray-800 transition-all duration-500 shrink-0 ${!isOpen ? "hidden md:block" : ""}`}
          style={{
            transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
          <button
            onClick={handleLogout}
            className={`
                        flex items-center text-gray-600 dark:text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-all duration-300
                        ${isOpen ? "w-full px-4 py-3 gap-3" : "justify-center p-3"}
                    `}
            style={{
              transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
            }}
            title={!isOpen ? "Sign Out" : undefined}
          >
            <LogOut size={20} strokeWidth={1.5} className="shrink-0" />
            {isOpen && (
              <div
                className="flex items-center gap-3 transition-opacity duration-300 w-full min-w-0"
                style={{
                  transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
                }}
              >
                <span className="text-[15px] font-medium truncate">Sign Out</span>
                <ChevronRight size={16} className="ml-auto text-gray-300 shrink-0" />
              </div>
            )}
          </button>
        </div>
      )}
      <LogoutConfirmationModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={confirmLogout}
      />
    </aside>
    )}
    </>
  );
};

export default Sidebar;