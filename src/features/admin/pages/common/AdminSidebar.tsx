import React from "react";
import { NavLink } from "react-router-dom";
import {
    X,
    LogOut,
    Menu,
    LayoutDashboard,
    FileText,
    Search,
    ChevronRight,
    BookOpen
} from "lucide-react";
import ConfirmModal from "@/components/common/ConfirmModal";

interface AdminSidebarProps {
    isOpen: boolean;
    toggleSidebar: () => void;
}

const getIconForPage = (pageName: string) => {
    const name = pageName.toLowerCase();
    if (name.includes('dashboard')) return <LayoutDashboard size={20} strokeWidth={1.5} />;
    if (name.includes('blog')) return <BookOpen size={20} strokeWidth={1.5} />;
    if (name.includes('category') || name.includes('categories')) return <FileText size={20} strokeWidth={1.5} />;
    if (name.includes('seo')) return <Search size={20} strokeWidth={1.5} />;
    return <FileText size={20} strokeWidth={1.5} />;
};

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ isOpen, toggleSidebar }) => {
    const [menuItems, setMenuItems] = React.useState<any[]>([]);
    const [showLogoutModal, setShowLogoutModal] = React.useState(false);

    React.useEffect(() => {
        const storedUser = localStorage.getItem("admin_user");
        if (storedUser) {
            try {
                const userObj = JSON.parse(storedUser);
                if (userObj?.menus && userObj.menus.length > 0) {
                    const mappedMenus = userObj.menus.map((item: any) => ({
                        page_id: item.page_id,
                        page_name: item.page_name,
                        route: `/admin${item.page_route}`
                    }));
                    setMenuItems(mappedMenus);
                } else {
                    // Fallback for Blog Admin
                    setMenuItems([
                        {
                            page_id: 'dashboard',
                            page_name: 'Dashboard',
                            route: '/admin/dashboard'
                        },
                        {
                            page_id: 'categories',
                            page_name: 'Categories',
                            route: '/admin/manage-categories'
                        },
                        {
                            page_id: 'blogs',
                            page_name: 'Blogs',
                            route: '/admin/manage-blog'
                        },
                        {
                            page_id: 'seo',
                            page_name: 'SEO Config',
                            route: '/admin/manage-seo'
                        }
                    ]);
                }
            } catch (error) {
                console.error("Failed to parse menus", error);
            }
        }
    }, []);

    const handleLogoutClick = () => {
        setShowLogoutModal(true);
    };

    const confirmLogout = () => {
        // Clear all session/auth tokens related to admin manually
        localStorage.removeItem("admin_user");
        // Force redirect to login which clears state completely
        window.location.href = "/";
    };

    return (
        <aside
            className={`
                fixed top-0 left-0 h-full z-[100]
                bg-white dark:bg-secondary-900
                shadow-xl transition-all duration-500 ease-in-out
                flex flex-col rounded-r-[30px]
                ${isOpen ? "w-64" : "w-0 md:w-[88px]"}
            `}
            style={{
                transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
            }}
        >
            {/* Header Section */}
            <div
                className={`
                    h-14 flex items-center transition-all duration-500
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
                            className="btn btn-ghost p-1  hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                            <X size={24} strokeWidth={2.5} />
                        </button>
                        <div className="flex items-center gap-3">
                            <img src="/assets/logogod.svg" alt="App Logo" className="h-25 w-[80%]" />
                        </div>
                    </>
                ) : (
                    <button
                        onClick={toggleSidebar}
                        className={`btn btn-ghost p-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${!isOpen ? "fixed left-4 top-4 z-[60] md:static" : ""}`}
                    >
                        <Menu size={24} />
                    </button>
                )}
            </div>

            {/* Navigation Menu */}
            <nav
                className={`flex-1 overflow-y-auto overflow-x-hidden px-3 py-4 custom-scrollbar ${!isOpen ? "hidden md:block" : ""}`}
            >
                <div className={`text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 px-3 ${!isOpen && "text-center opacity-0 hidden"}`}>
                    Core Modules
                </div>
                <ul className="space-y-1 list-none m-0 p-0">
                    {menuItems.map((item) => (
                        <li key={item.page_id} className="m-0 p-0">
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
                                    ${isActive
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
                                <div className={`flex items-center ${isOpen ? "gap-3" : ""}`}>
                                    <span className="flex-shrink-0 flex items-center justify-center w-6 h-6">
                                        {getIconForPage(item.page_name)}
                                    </span>
                                    {isOpen && (
                                        <span
                                            className="text-[15px] font-medium whitespace-nowrap transition-opacity duration-300"
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
                                        className={`text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
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
            <div
                className={`p-4 dark:border-gray-800 transition-all duration-500 ${!isOpen ? "hidden md:block" : ""}`}
                style={{
                    transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
                }}
            >
                <button
                    onClick={handleLogoutClick}
                    className={`btn btn-ghost    ${isOpen ? "w-full px-4 py-3 gap-3" : "justify-center p-3"}
                    `}
                    style={{
                        transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
                    }}
                    title={!isOpen ? "Sign Out" : undefined}
                >
                    <LogOut size={20} strokeWidth={1.5} />
                    {isOpen && (
                        <div
                            className="flex items-center gap-3 transition-opacity duration-300"
                            style={{
                                transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
                            }}
                        >
                            <span className="text-[15px] font-medium">Safe Logout</span>
                        </div>
                    )}
                </button>
            </div>

            {/* Logout Confirmation Modal using the separated file and home page theme */}
            <ConfirmModal 
                isOpen={showLogoutModal}
                title="Ready to leave?"
                message="Are you sure you want to log out of your admin session? You will need to sign in again to access the dashboard."
                confirmText="Logout"
                cancelText="Cancel"
                onConfirm={confirmLogout}
                onCancel={() => setShowLogoutModal(false)}
            />
        </aside>
    );
};

export default AdminSidebar;
