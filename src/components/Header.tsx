// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { useModal } from "../../features/auth/context/AuthContext";
// import { useAuth } from "../../app/providers/AuthProvider";
// import { LogoutConfirmationModal } from "../../features/auth/modal/LogoutConfirmationModal";
// import ApiServices from "../../services/ApiServices";
// import { useToast } from "../../app/providers/ToastProvider";
// import { UserCircle } from "lucide-react";
// import { RoleSwitchModal } from "../../features/auth/modal/RoleSwitchModal";

// interface HeaderProps {
//   isSidebarOpen: boolean;
// }

// export const Header: React.FC<HeaderProps> = ({ isSidebarOpen }) => {
//   const { openSignIn, clearMenu } = useModal();
//   const { isAuthenticated, logout } = useAuth();
//   const navigate = useNavigate();
//   const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
//   const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
//   const { showToast } = useToast();

//   const handleLogout = () => {
//     setIsLogoutModalOpen(true);
//   };

//   // const confirmLogout = () => {
//   //     localStorage.removeItem("auth_token");
//   //     logout();
//   //     navigate("/");
//   //     setIsLogoutModalOpen(false);
//   // };

//   const confirmLogout = async () => {
//     try {
//       // Call backend signout API
//       await ApiServices.signOut();
//     } catch (error) {
//       console.error("Header signout API failed", error);
//       //  Still continue logout even if API fails
//     } finally {
//       clearMenu();
//       //  Clear frontend session
//       localStorage.removeItem("auth_token");
//       logout();
//       showToast("Signed out successfully", "success");
//       navigate("/");
//       setIsLogoutModalOpen(false);
//     }
//   };

//   return (
//     <>
//       <header className="sticky top-0 z-40 h-16 bg-white dark:bg-secondary-900 border-secondary-200 dark:border-secondary-700 shadow-sm">
//         <div className="h-full px-4 lg:px-6 flex items-center justify-between">
//           {/* Logo & App Name - Only show when sidebar is CLOSED (mini) */}
//           <div className="flex items-center gap-4">
//             {!isSidebarOpen && (
//               <div className="flex items-center animate-fade-in">
//                 <img src="/Logo.svg" alt="App Logo" className="h-25, w-25" />
//               </div>
//             )}
//           </div>
//           <div className="flex-1 flex justify-center">
// <div className="flex items-center absolute left-80 z-10 bg-yellow-400 rounded-b-full px-6  gap-6">
//               <button className="text-sm font-semibold text-black">
//                 Request a Demo
//               </button>
//               <button className="text-sm font-semibold text-black">FAQs</button>
//               <button className="text-sm font-semibold text-black">
//                 Help Center
//               </button>
//             </div>
//         <div className="flex items-center relative top-0 bg-[#E9E9E9] rounded-b-full  pt-5 pb-6 pl-72 pr-6 gap-6">
//               {/* Yellow Highlight Section */}

//               {/* Other Menu Items */}
//               <button className="text-sm font-semibold text-gray-700">
//                 About us
//               </button>
//               <button className="text-sm font-semibold text-gray-700">
//                 Vidya Kosh
//               </button>
//               <button className="text-sm font-semibold text-gray-700">
//                 Success Stories
//               </button>
//               <button className="text-sm font-semibold text-gray-700">
//                 Institutional Access
//               </button>
//               {/* <button
//                 onClick={openSignIn}
//                 className="px-5 py-2 rounded-full bg-primary text-white text-sm font-semibold hover:bg-lime-600 transition-colors shadow-md hover:shadow-lg"
//               >
//                 Sign In
//               </button> */}
//               <button
//                 onClick={isAuthenticated ? handleLogout : openSignIn}
//                 className={`text-sm font-semibold text-gray-700 hover:text-gray-900 ${isAuthenticated ? "bg-red-500 hover:bg-red-600 rounded-full px-4" : ""}`}
//               >
//                 {isAuthenticated ? "Sign Out" : "Sign In"}
//               </button>
//             </div>
//             <div className="flex items-center gap-4">
//               {isAuthenticated && (
//                 <button
//                   onClick={() => setIsRoleModalOpen(true)}
//                   className="p-2 rounded-full hover:bg-gray-100 transition"
//                   title="Switch Role"
//                 >
//                   <UserCircle size={28} className="text-gray-700" />
//                 </button>
//               )}
//             </div>
//           </div>
//         </div>
//       </header>

//       <LogoutConfirmationModal
//         isOpen={isLogoutModalOpen}
//         onClose={() => setIsLogoutModalOpen(false)}
//         onConfirm={confirmLogout}
//       />

//       <RoleSwitchModal
//         isOpen={isRoleModalOpen}
//         onClose={() => setIsRoleModalOpen(false)}
//       />
//     </>
//   );


// export default Header;

import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useModal } from "../../features/auth/context/AuthContext";
import { useAuth } from "../../app/providers/AuthProvider";
import { LogoutConfirmationModal } from "../../features/auth/modal/LogoutConfirmationModal";
import ApiServices from "../../services/ApiServices";
import { useToast } from "../../app/providers/ToastProvider";
import { UserCircle, Menu, X } from "lucide-react";
import { ProfileDropdown } from "../../features/auth/modal/ProfileDropdown";

interface HeaderProps {
  isSidebarOpen: boolean;
}

export const Header: React.FC<HeaderProps> = ({ }) => {
  const { openSignIn, clearMenu } = useModal();
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const { showToast } = useToast();

  // const handleLogout = () => {
  //   setIsLogoutModalOpen(true);
  // };

  const confirmLogout = async () => {
    try {
      await ApiServices.signOut();
    } catch (error) {
      // console.error("Header signout API failed", error);
    } finally {
      clearMenu();
      localStorage.removeItem("auth_token");
      logout();
      showToast("Signed out successfully", "success");
      navigate("/");
      setIsLogoutModalOpen(false);
    }
  };

  const handleLogoClick = () => {
    if (isAuthenticated) {
      const role = user?.role?.toLowerCase();
      if (role === "teacher") {
        navigate("/teacher/dashboard");
      } else if (role === "parent") {
        navigate("/parent/dashboard");
      } else {
        // Default for student and other roles
        navigate("/dashboard");
      }
    } else {
      navigate("/");
    }
  };

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <>
      <header className="sticky top-0 z-40 h-14 bg-gray-100 dark:bg-secondary-900 border-secondary-200 dark:border-secondary-700 shadow-sm">
        <div className="h-full px-4 xl:px-6 flex items-center justify-between">
          <div className="flex items-center gap-4 pl-10 xl:pl-0 transition-all duration-300">
            {/* <button onClick={handleLogoClick} className="flex items-center animate-fade-in cursor-pointer">
              <img src="/Logo.svg" alt="App Logo" className="h-[90%] w-[80%]" />
            </button> */}
            <div className="flex items-center gap-2 font-bold text-lg cursor-pointer" onClick={handleLogoClick}>
              <img src="/logogod.svg" alt="logo" className="w-10 h-10" />
              <div>
                <h3>
                  Moksh<span className="text-xl text-[#E7842E]">Path</span>
                </h3>
                <p className="text-xs leading-none font-normal">
                  Guided Path to True Learning
                </p>
              </div>
            </div>
          </div>
          {/* Middle Menu Section - HIDDEN ON MOBILE */}
          <div className="hidden xl:flex flex-1 justify-center relative h-full">
            <div className="flex items-center absolute left-1/2 -translate-x-[140%] z-10 bg-yellow-500 rounded-b-full pl-10 pr-12 gap-3">
              <button className="text-sm font-semibold text-black hover:opacity-80 transition-opacity">
                Request a Demo
              </button>
              <button className="text-sm font-semibold text-black hover:opacity-80 transition-opacity">FAQs</button>
              <button className="text-sm font-semibold text-black hover:opacity-80 transition-opacity">
                Help Center
              </button>
            </div>
             <div
              className={`flex items-center relative top-0 bg-[#E9E9E9] rounded-b-full ${
                isAuthenticated ? "w-[55rem] pl-64" : "w-[59rem] pl-72"
              } pt-5 pb-4 pr-6 gap-4 lg:gap-6`}

              
            >
              <button disabled className="text-sm font-semibold text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed">
                About us
              </button>
              <button disabled className="text-sm font-semibold text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed">
                Vidya Kosh
              </button>
              <button disabled className="text-sm font-semibold text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed">
                Success Stories
              </button>
              <button disabled className="text-sm font-semibold text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed">
                Institutional Access
              </button>
              <button
                onClick={() => navigate("/blogs")}
                className="text-sm font-semibold text-gray-700 hover:text-gray-900 transition-colors"
              >
                Blogs
              </button>
              {!isAuthenticated && !location.pathname.startsWith('/admin') && (
                <button
                  onClick={openSignIn}
                  className="text-sm font-semibold text-gray-700 hover:text-gray-900 transition-colors"
                >
                  Sign In
                </button>
              )}
            </div>

            {isAuthenticated && user?.role !== 'admin' && (
              <div className="relative flex items-center justify-center left-6">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsProfileDropdownOpen(!isProfileDropdownOpen);
                  }}
                  className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                  title="Profile Menu"
                >
                  <UserCircle size={28} className="text-gray-700" />
                </button>

                <ProfileDropdown
                  isOpen={isProfileDropdownOpen}
                  onClose={() => setIsProfileDropdownOpen(false)}
                />
              </div>
            )}
          </div>

          {/* Right Section: Auth & Profile */}
          <div className="flex items-center gap-2 xl:gap-3">
            {isAuthenticated && user?.role !== 'admin' && (
              <div className="relative flex items-center justify-center xl:hidden 2xl:-left-28">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsProfileDropdownOpen(!isProfileDropdownOpen);
                  }}
                  className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                  title="Profile Menu"
                >
                  <UserCircle size={28} className="text-gray-700" />
                </button>

                <ProfileDropdown
                  isOpen={isProfileDropdownOpen}
                  onClose={() => setIsProfileDropdownOpen(false)}
                />
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="xl:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-200 transition-colors"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="xl:hidden absolute top-full left-0 w-full bg-white dark:bg-secondary-800 shadow-xl z-30 animate-in slide-in-from-top-2 duration-200">
            <div className="p-4 space-y-4">
              {/* Top yellow bar links */}
              <div className="grid grid-cols-1 gap-3 pb-4 border-b border-gray-200 dark:border-secondary-700">
                <button className="text-sm md:text-left font-semibold text-gray-700 dark:text-gray-400 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-secondary-700">
                  Request a Demo
                </button>
                <button className="text-sm md:text-left font-semibold text-gray-700 dark:text-gray-400 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-secondary-700">FAQs</button>
                <button className="text-sm md:text-left font-semibold text-gray-700 dark:text-gray-400 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-secondary-700">
                  Help Center
                </button>
              </div>
              {/* Main nav links */}
              <nav className="flex flex-col space-y-2">
                <button disabled className="text-sm font-semibold text-gray-500 text-left p-2 rounded-lg">
                  About us
                </button>
                <button disabled className="text-sm font-semibold text-gray-500 text-left p-2 rounded-lg">
                  Vidya Kosh
                </button>
                <button disabled className="text-sm font-semibold text-gray-500 text-left p-2 rounded-lg">
                  Success Stories
                </button>
                <button disabled className="text-sm font-semibold text-gray-500 text-left p-2 rounded-lg">
                  Institutional Access
                </button>
                <button
                  onClick={() => navigate("/blogs")}
                  className="text-sm font-semibold text-gray-700 text-left p-2 rounded-lg"
                >
                  Blogs
                </button>
              </nav>
              {!isAuthenticated && !location.pathname.startsWith('/admin') && (
                <div className="pt-4 border-t border-gray-200 dark:border-secondary-700">
                  <button
                    onClick={openSignIn}
                    className="w-full text-sm font-semibold text-gray-700 hover:text-gray-900 px-3 py-2.5 rounded-lg border border-gray-300 bg-gray-50"
                  >
                    Sign In
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      <LogoutConfirmationModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={confirmLogout}
      />
    </>
  );
};

export default Header;