import React, { useState, useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import Header from "./Header";
import Footer from "./Footer";
import { PageLoader } from "../common/Loader";
import GlobalSeo from "../common/GlobalSeo";

export const AdminLayout: React.FC = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const checkAuth = () => {
            try {
                const storedUser = localStorage.getItem("admin_user");
                if (storedUser) {
                    const userObj = JSON.parse(storedUser);
                    // Check according to the new API response structure from AdminLogin
                    if (userObj?.role_name === 'admin') {
                        setIsAdmin(true);
                    }
                }
            } catch (error) {
                console.error("Failed to parse user session", error);
            }
            setIsLoading(false);
        };
        
        checkAuth();
    }, []);

    // Show loading state while checking auth
    if (isLoading) {
        return <PageLoader text="Loading Admin Workspace..." />;
    }

    // Role-check for admin isolated session
    if (!isAdmin) {
        return <Navigate to="/admin/login" replace />;
    }

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-background-dark flex">
            <GlobalSeo />
            {/* Admin Specific Sidebar */}
            <AdminSidebar
                isOpen={isSidebarOpen}
                toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
            />

            {/* Main Content Wrapper */}
            <div
                className={`flex-1 flex flex-col min-h-screen ml-0 md:ml-[88px] transition-all duration-300 ease-in-out min-w-0`}
            >
                {/* Header (Reused, but can be customized later if needed) */}
                <Header isSidebarOpen={isSidebarOpen} />

                {/* Content Area */}
                <main className="flex-1 overflow-y-auto overflow-x-hidden p-6">
                    <Outlet />
                </main>

                <Footer />
            </div>
        </div>
    );
};

export default AdminLayout;
