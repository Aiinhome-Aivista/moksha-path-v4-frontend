import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import {
  FilePlus2,
  FileText,
  Search,
  Edit,
  Trash2,
  Loader2,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import ApiServices from "../../../../services/ApiServices";
import { useToast } from "../../../../app/providers/ToastProvider";

// ==========================================
// GLOBAL SEARCH FUNCTION
// This searches EVERY key in your API data automatically
// ==========================================
const searchAnyKey = (dataArray: any[], searchQuery: string) => {
  if (!searchQuery) return dataArray;

  const query = searchQuery.toLowerCase().trim();

  return dataArray.filter((item) => {
    // Object.values(item) gets all the data inside the object, regardless of the key names
    return Object.values(item).some((value) => {
      if (value === null || value === undefined) return false;
      // Convert everything to a string and check if it matches the search query
      return String(value).toLowerCase().includes(query);
    });
  });
};
// ==========================================

// ==========================================
// GLOBAL DATE FORMATTER (DD/MM/YYYY)
// ==========================================
const formatDate = (dateString: string | undefined | null): string => {
  if (!dateString) return "N/A";
  try {
    const date = new Date(dateString);
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return "Invalid Date";
    }
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Month is 0-indexed
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  } catch (error) {
    return "Invalid Date";
  }
};
// ==========================================

export const ManageBlog: React.FC = () => {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [isTableLoading, setIsTableLoading] = useState(true); // For initial page load
  const [isRefreshing, setIsRefreshing] = useState(false); // For the refresh button only
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [blogToDelete, setBlogToDelete] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { showToast } = useToast();
  const POSTS_PER_PAGE = 5;

  // Function 1: Initial Load
  const loadInitialData = async () => {
    setIsTableLoading(true);
    try {
      const response = await ApiServices.getBlogsList();
      if (response.data.code === 200 || response.data.status === "success") {
        setBlogs(response.data.data || []);
      }
    } catch (error) {
      console.error("Error loading blogs:", error);
      showToast("Failed to load blogs", "error");
    } finally {
      setIsTableLoading(false);
    }
  };

  // Function 2: Manual Refresh (Different Logic Path)
  const handleManualRefresh = async () => {
    if (isTableLoading || isRefreshing) return; // Block if already busy
    setIsRefreshing(true);
    try {
      const response = await ApiServices.getBlogsList();
      if (response.data.code === 200 || response.data.status === "success") {
        setBlogs(response.data.data || []);
        // showToast("Blogs refreshed", "success");
      } else {
        showToast("Failed to refresh blogs", "error");
      }
    } catch (error) {
      console.error("Error refreshing blogs:", error);
      showToast("Failed to refresh blogs", "error");
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  // Reset to page 1 when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // 👇 Apply the global search function here 👇
  const filteredBlogs = searchAnyKey(blogs, searchQuery);

  // Pagination Logic
  const totalPosts = filteredBlogs.length;
  const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE);
  const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
  const currentBlogs = filteredBlogs.slice(
    startIndex,
    startIndex + POSTS_PER_PAGE,
  );

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleDeleteClick = (id: number) => {
    setBlogToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!blogToDelete) return;

    setIsDeleting(true);
    try {
      const response = await ApiServices.deleteBlog({ id: blogToDelete });
      if (response.data.code === 200 || response.data.status === "success") {
        showToast(
          response.data.message || "Blog deleted successfully",
          "success",
        );
        setShowDeleteModal(false);
        setBlogToDelete(null);
        loadInitialData(); // Refetch data after delete
      } else {
        showToast(response.data.message || "Failed to delete blog", "error");
      }
    } catch (error) {
      console.error("Error deleting blog:", error);
      showToast("Something went wrong while deleting", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 w-full px-4">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary dark:text-white flex items-center gap-3">
            <FileText className="text-[#b0cb1f]" />
            Manage Blogs
          </h1>
          <p className="text-secondary-500 dark:text-secondary-400 mt-1">
            View, edit, or delete existing blog posts.
          </p>
        </div>
        <NavLink
          to="/admin/add-blog"
          className="flex items-center gap-2 bg-[#b0cb1f] hover:bg-[#c5de3a] text-gray-900 px-5 py-2.5 rounded-xl font-semibold transition-colors shadow-md"
        >
          <FilePlus2 size={18} />
          Create New Blog
        </NavLink>
      </div>

      {/* Table Card Container */}
      <div className="w-full bg-white dark:bg-secondary-800">
        {/* Search & Refresh Bar */}
        <div className="p-4 border-b border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-800/50 flex items-center justify-between gap-4">
          <div className="relative max-w-md flex items-center w-full">
            <Search className="absolute left-3 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search anything..."
              className="pl-10 pr-4 py-2 border border-gray-200 dark:border-secondary-600 rounded-md w-full text-primary dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#b0cb1f]/50 transition-shadow text-black dark:text-white disabled:opacity-70 disabled:cursor-not-allowed"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              disabled={isTableLoading || isRefreshing}
            />
          </div>
          <button
            onClick={handleManualRefresh}
            disabled={isTableLoading || isRefreshing}
            className="p-2 rounded-full hover:bg-secondary-100 dark:hover:bg-secondary-700 text-secondary-500 dark:text-secondary-400 transition-colors disabled:opacity-50 disabled:cursor-wait"
            title="Refresh"
          >
            {isRefreshing ? (
              <div className="w-5 h-5 border-2 border-gray-300 dark:border-secondary-600 border-t-[#b0cb1f] rounded-full animate-spin" />
            ) : (
              <RefreshCw size={18} />
            )}
          </button>
        </div>

        {/* Table Layout */}
        <div className="w-full">
          <table className="w-full text-sm text-left table-fixed">
            {/* GREEN Table Header */}
            <thead className="bg-[#b0cb1f] text-gray-900 font-semibold border-b border-gray-200 dark:border-secondary-700">
              <tr className="divide-x divide-gray-900/20">
                <th className="px-6 py-4 text-center">Sl. No.</th>
                <th className="px-6 py-4 text-center">Title</th>
                <th className="px-6 py-4 text-center">Content Preview</th>
                <th className="px-6 py-4 text-center">Category</th>
                <th className="px-6 py-4 text-center">Author</th>
                <th className="px-6 py-4 text-center">Featured Image</th>
                <th className="px-6 py-4 text-center">Created Date</th>
                <th className="px-6 py-4 text-center">Action</th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-gray-100 dark:divide-secondary-700">
              {isTableLoading ? (
                // Initial Page Load Loader
                <tr>
                  <td colSpan={7} className="p-20 text-center min-h-[300px]">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="w-10 h-10 border-4 border-secondary-200 dark:border-secondary-700 border-t-[#b0cb1f] rounded-full animate-spin" />
                      <p className="text-secondary-500 dark:text-secondary-400 text-sm font-medium">
                        Loading initial data...
                      </p>
                    </div>
                  </td>
                </tr>
              ) : isRefreshing ? (
                // Manual Refresh Table Loader
                <tr>
                  <td
                    colSpan={7}
                    className="p-20 text-center bg-gray-50/50 dark:bg-secondary-800/20 min-h-[300px]"
                  >
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="w-8 h-8 border-4 border-secondary-200 dark:border-secondary-700 border-t-[#b0cb1f] rounded-full animate-spin" />
                      <p className="text-secondary-500 dark:text-secondary-400 font-medium">
                        Refreshing table data...
                      </p>
                    </div>
                  </td>
                </tr>
              ) : currentBlogs.length > 0 ? (
                // Actual Data Rows
                currentBlogs.map((blog, index) => (
                  <tr
                    key={blog.id}
                    className="divide-x divide-gray-100 dark:divide-secondary-700 hover:bg-gray-50 dark:hover:bg-secondary-700/50 transition-colors"
                  >
                    <td className="px-6 py-4 text-center text-primary dark:text-gray-300">
                      {startIndex + index + 1}
                    </td>
                    <td
                      className="px-6 py-4 text-center font-medium text-primary dark:text-gray-200 max-w-xs truncate cursor-pointer"
                      title={blog.blog_title || blog.title}
                    >
                      {blog.blog_title || blog.title}
                    </td>
                    <td
                      className="px-6 py-4 text-center text-primary dark:text-gray-400 text-sm max-w-xs truncate cursor-pointer"
                      title={
                        blog.blog_content?.replace(/<[^>]*>?/gm, "") ||
                        blog.excerpt ||
                        "No content"
                      }
                    >
                      {blog.blog_content
                        ?.replace(/<[^>]*>?/gm, "")
                        .substring(0, 100) ||
                        blog.excerpt ||
                        "No content"}
                    </td>
                    <td className="px-6 py-4 text-center text-primary dark:text-gray-300">
                      {blog.category_name || blog.category}
                    </td>
                    <td className="px-6 py-4 text-center text-primary dark:text-gray-300">
                      {blog.blog_author}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center">
                        {blog.image ? (
                          <img
                            src={blog.image}
                            alt="feature"
                            className="w-12 h-12 object-cover rounded shadow-sm border border-gray-200"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gray-100 border border-gray-200 rounded flex flex-col items-center justify-center text-[10px] text-gray-400 leading-tight">
                            <span>No</span>
                            <span>Image</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center text-primary dark:text-gray-300">
                      {formatDate(blog.created_at || blog.publishDate)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center space-x-4">
                        <NavLink
                          to={`/admin/add-blog?edit=${blog.id}`}
                          className="text-amber-500 hover:text-amber-600 transition-colors"
                          title="Edit"
                        >
                          <Edit size={18} />
                        </NavLink>
                        <button
                          onClick={() => handleDeleteClick(blog.id)}
                          className="text-red-500 hover:text-red-600 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                // No Data Found
                <tr key="no-data">
                  <td colSpan={7}>
                    <div className="p-12 text-center text-secondary-500 dark:text-secondary-400 flex flex-col items-center justify-center min-h-[300px]">
                      <FileText
                        size={48}
                        className="text-gray-300 dark:text-secondary-600 mb-4"
                      />
                      <p className="font-semibold text-lg text-gray-600 dark:text-secondary-300">
                        No blogs found
                      </p>
                      <p className="text-sm text-gray-400 mt-1">
                        Get started by creating your first blog post.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {!isTableLoading && !isRefreshing && totalPages > 1 && (
          <div className="p-4 border-t border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 flex justify-between items-center">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Showing {startIndex + 1} to{" "}
              {Math.min(startIndex + POSTS_PER_PAGE, totalPosts)} of{" "}
              {totalPosts} blogs
            </span>
            <div className="flex space-x-1">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-1.5 text-sm border border-gray-200 dark:border-secondary-600 rounded bg-white dark:bg-secondary-900 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-secondary-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Prev
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => goToPage(page)}
                    className={`px-4 py-1.5 text-sm rounded font-medium shadow-sm ${
                      currentPage === page
                        ? "bg-[#b0cb1f] text-gray-900"
                        : "bg-white dark:bg-secondary-900 border border-gray-200 dark:border-secondary-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-secondary-700"
                    }`}
                  >
                    {page}
                  </button>
                ),
              )}
              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-1.5 text-sm border border-gray-200 dark:border-secondary-600 rounded bg-white dark:bg-secondary-900 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-secondary-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modern Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
            onClick={() => !isDeleting && setShowDeleteModal(false)}
          />

          <div className="relative bg-white dark:bg-secondary-900 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-secondary-100 dark:border-secondary-800">
            <div className="p-8 text-center">
              <div className="w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertTriangle size={40} className="text-red-500" />
              </div>

              <h3 className="text-2xl font-bold text-secondary-900 dark:text-white mb-3">
                Delete Blog?
              </h3>
              <p className="text-secondary-500 dark:text-secondary-400 mb-8 leading-relaxed">
                Are you sure you want to remove this blog post? This action is
                permanent and cannot be undone.
              </p>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  disabled={isDeleting}
                  className="px-6 py-3.5 rounded-2xl font-bold text-secondary-600 dark:text-secondary-400 hover:bg-secondary-100 dark:hover:bg-secondary-800 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={isDeleting}
                  className="px-6 py-3.5 rounded-2xl font-bold bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/30 transition-all active:scale-95 flex items-center justify-center gap-2 group disabled:opacity-70"
                >
                  {isDeleting ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    <>
                      <Trash2 size={18} className="group-hover:shake" />
                      Delete Now
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="h-1.5 w-full bg-red-500" />
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageBlog;
