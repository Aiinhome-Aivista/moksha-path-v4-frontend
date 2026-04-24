import React, { useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import Header from "./Header";
import Sidebar from "./Sidebar";
import { useAuth } from "../../app/providers/AuthProvider";
import { PageLoader } from "../common/Loader";
import { LoginModal } from "../../features/auth/modal/Login";
import { SignInModal } from "../../features/auth/modal/SignIn";
import { AcademicDetails } from "../../features/auth/modal/AcademicDetails";
import { SelectSubjectsModal } from "../../features/auth/modal/SelectSubjects";
import { SelectRoleModal } from "../../features/auth/modal/SelectRole";
import { ProfileSelectionModal } from "../../features/auth/modal/ProfileSelection";
import Footer from "./Footer";
import { useLocation } from "react-router-dom";
import GlobalSeo from "../common/GlobalSeo";

export const AppLayout: React.FC = () => {
  const { isLoading, isAuthenticated } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  // Any path starting with /blogs is considered public, as is the root path.
  const isPublicPage = location.pathname === "/" || location.pathname.startsWith("/blogs");

  // Show loading state while checking auth
  if (isLoading) {
    return <PageLoader text="Loading your workspace..." />;
  }

  if (!isAuthenticated && !isPublicPage) {
    return <Navigate to="/" replace />;
  }

  // Render a simpler layout for public pages (no sidebar, no main padding)
  if (isPublicPage && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-background-dark flex flex-col">
        <GlobalSeo />
        <Header isSidebarOpen={isSidebarOpen} />
        <main className="flex-1 overflow-x-hidden">
          <Outlet />
        </main>
        <Footer />

        {/* Modal Flow - All render on top of dashboard */}
        {/* Step 0: SignIn Modal (Existing User) */}
        <SignInModal />
        {/* Step 1: Login Modal (New User Setup) */}
        <LoginModal />
        {/* Step 2: Academic Details Modal */}
        <AcademicDetails />
        {/* Step 3: Select Subjects Modal */}
        <SelectSubjectsModal />
        <SelectRoleModal />
        <ProfileSelectionModal />
      </div>
    );
  }

  // Render the full app layout for authenticated pages
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-background-dark flex">
      <GlobalSeo />
      {/* Sidebar - Fixed Position */}
      <Sidebar
        isOpen={isSidebarOpen}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      {/* Main Content Wrapper - Fixed margin, Sidebar floats over when expanded */}
      <div
        className={`flex-1 flex flex-col min-h-screen ml-0 ${isAuthenticated ? "md:ml-[88px]" : ""} transition-all duration-300 ease-in-out min-w-0`}
      >
        {/* Header - Sticky at the top of the content area */}
        <Header isSidebarOpen={isSidebarOpen} />

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-6">
          <Outlet />
        </main>

        <Footer />

        {/* Modal Flow - All render on top of dashboard */}
        {/* Step 0: SignIn Modal (Existing User) */}
        <SignInModal />

        {/* Step 1: Login Modal (New User Setup) */}
        <LoginModal />

        {/* Step 2: Academic Details Modal */}
        <AcademicDetails />

        {/* Step 3: Select Subjects Modal */}
        <SelectSubjectsModal />

        <SelectRoleModal />
        <ProfileSelectionModal />
      </div>
    </div>
  );
};

export default AppLayout;