import React, { useState, useEffect } from 'react';
import { LayoutDashboard, FileText, Activity, Layers, Loader2 } from 'lucide-react';
import ApiServices from '../../../services/ApiServices';

export const AdminDashboard: React.FC = () => {
    const [adminName, setAdminName] = useState('Admin');
    const [stats, setStats] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

const formatDate = (dateString: string | undefined | null): string => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    // Check if date is valid
    if (isNaN(date.getTime())) {
        return 'Invalid Date';
    }
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  } catch (error) {
    return 'Invalid Date';
  }
};


    const fetchDashboardData = async () => {
        setIsLoading(true);
        try {
            const response = await ApiServices.getBlogAdminDashboard();
            console.log("Dashboard Raw Response:", response);

            const respData = response.data;

            // Case 1: Wrapped response { code: 200, data: { ... }, status: "success" }
            if (respData && (respData.code === 200 || respData.status === 'success') && respData.data) {
                console.log("Setting stats from wrapped data:", respData.data);
                setStats(respData.data);
            }
            // Case 2: Direct response { total_categories: 2, ... }
            else if (respData && respData.total_categories !== undefined) {
                console.log("Setting stats from direct data:", respData);
                setStats(respData);
            }
            else {
                console.warn("Unknown response format:", respData);
            }
        } catch (error) {
            console.error("Failed to fetch dashboard data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        // Get Admin Name
        try {
            const storedUser = localStorage.getItem("admin_user");
            if (storedUser) {
                const userObj = JSON.parse(storedUser);
                if (userObj?.full_name) {
                    setAdminName(userObj.full_name);
                }
            }
        } catch (error) {
            console.error("Failed to parse admin session", error);
        }

        fetchDashboardData();
    }, []);

    const dashboardStats = [
        {
            label: 'Total Categories',
            value: stats?.total_categories !== undefined ? stats.total_categories : '0',
            icon: <Layers size={24} />,
            color: 'bg-blue-500'
        },
        {
            label: 'Total Blogs',
            value: stats?.total_blogs !== undefined ? stats.total_blogs : '0',
            icon: <FileText size={24} />,
            color: 'bg-[#b0cb1f]'
        },
        {
            label: 'SEO Pages',
            value: stats?.total_seo_pages !== undefined ? stats.total_seo_pages : '0',
            icon: <Activity size={24} />,
            color: 'bg-orange-500'
        },
        {
            label: 'Active Content',
            value: stats?.total_blogs !== undefined ? stats.total_blogs : '0',
            icon: <LayoutDashboard size={24} />,
            color: 'bg-green-500'
        },
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-primary dark:text-white">
                        Admin Dashboard
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Welcome back, <span className="font-bold text-primary dark:text-white">{adminName}</span>.
                    </p>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {isLoading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="bg-white dark:bg-secondary-800 rounded-2xl p-6 shadow-sm border border-secondary-200 dark:border-secondary-700 animate-pulse flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-gray-200 dark:bg-secondary-700 shrink-0" />
                            <div className="space-y-2 flex-grow">
                                <div className="h-3 bg-gray-200 dark:bg-secondary-700 rounded w-1/2" />
                                <div className="h-6 bg-gray-200 dark:bg-secondary-700 rounded w-3/4" />
                            </div>
                        </div>
                    ))
                ) : (
                    dashboardStats.map((stat, index) => (
                        <div key={index} className="bg-white dark:bg-secondary-800 rounded-2xl p-6 shadow-sm border border-secondary-200 dark:border-secondary-700 flex items-center gap-4 hover:shadow-md transition-shadow">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white ${stat.color} shrink-0 shadow-md`}>
                                {stat.icon}
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1">
                                    {stat.label}
                                </p>
                                <h3 className="text-2xl font-black text-primary dark:text-white leading-none">
                                    {stat.value}
                                </h3>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div className="bg-white dark:bg-secondary-800 rounded-2xl p-6 shadow-sm border border-secondary-200 dark:border-secondary-700">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-primary dark:text-white flex items-center gap-2">
                        <FileText className="text-[#b0cb1f]" size={20} />
                        Recent Blog Posts
                    </h2>
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center p-12">
                        <Loader2 className="animate-spin text-[#b0cb1f]" size={40} />
                    </div>
                ) : stats?.recent_blogs && stats.recent_blogs.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-[#b0cb1f] text-gray-900 font-semibold border-b border-gray-200 dark:border-secondary-700">
                                <tr>
                                    <th className="px-6 py-4">Title</th>
                                    <th className="px-6 py-4 text-center">Category</th>
                                    <th className="px-6 py-4 text-center">Date Created</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-secondary-700">
                                {stats.recent_blogs.map((blog: any, index: number) => (
                                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-secondary-700/50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-primary dark:text-white">{blog.blog_title || blog.title}</td>
                                        <td className="px-6 py-4 text-center text-secondary-500 dark:text-secondary-400">{blog.category_name}</td>
                                        <td className="px-6 py-4 text-center text-secondary-500 dark:text-secondary-400">
                                            {formatDate(blog.created_at)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="p-12 text-center text-secondary-500 flex flex-col items-center">
                        <FileText size={48} className="mb-4 text-gray-300 dark:text-secondary-600" />
                        <p className="font-medium">No recent blogs found.</p>
                        <p className="text-sm">When you publish new blogs, they will appear here.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
