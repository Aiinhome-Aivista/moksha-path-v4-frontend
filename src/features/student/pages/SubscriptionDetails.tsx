import React, { useState, useEffect } from "react";
import { CreditCard, ChevronLeft, ChevronRight } from "lucide-react";
// @ts-ignore
import ApiServices from "../../../services/ApiServices";
import { useToast } from "../../../app/providers/ToastProvider";

interface Subject {
  subject_id: number;
  subject_name: string;
}

interface SubscriptionItem {
  subscription_id: number;
  subscription_name: string;
  plan_id: number;
  board_id: number;
  board_name: string;
  class_id: number;
  class_name: string;
  institute_id: number;
  institute_name: string;
  year: string;
  subjects: Subject[];
  plan_name: string;
}

const ITEMS_PER_PAGE = 5;

const SubscriptionDetails: React.FC = () => {
  const { showToast } = useToast();
  const [subscriptions, setSubscriptions] = useState<SubscriptionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      setIsLoading(true);
      const response = await ApiServices.getUserSubscriptions();
      if (response.data?.status === "success") {
        setSubscriptions(response.data.data?.data || []);
      } else {
        showToast(
          response.data?.message || "Failed to load subscriptions",
          "error",
        );
      }
    } catch (error: any) {
      // console.error("Failed to fetch subscriptions:", error);
      showToast(
        error.response?.data?.message || "Failed to load subscriptions",
        "error",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const totalPages = Math.ceil(subscriptions.length / ITEMS_PER_PAGE);
  const paginatedData = subscriptions.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Generate page numbers with ellipsis
  const getPageNumbers = (): (number | string)[] => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages: (number | string)[] = [1];
    if (currentPage > 3) pages.push("...");
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (currentPage < totalPages - 2) pages.push("...");
    pages.push(totalPages);
    return pages;
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#b0cb1f] to-lime-400 flex items-center justify-center shadow-md shadow-lime-200/50">
            <CreditCard size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              My Subscription Details
            </h1>
            <p className="text-sm text-gray-500">
              View all your active subscriptions
            </p>
          </div>
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-9 h-9 border-[3px] border-gray-200 border-t-[#b0cb1f] rounded-full animate-spin" />
            <p className="text-sm text-gray-500 font-medium">
              Loading subscriptions...
            </p>
          </div>
        </div>
      ) : subscriptions.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center mb-5">
            <CreditCard size={36} className="text-gray-300" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            No Subscriptions Found
          </h3>
          <p className="text-sm text-gray-400 max-w-sm">
            You don't have any active subscriptions yet. Subscribe to a plan to
            get started.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gradient-to-r from-gray-50 to-gray-50/80 border-b border-gray-100">
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider w-12">
                    Sl. No
                  </th>
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                    Plan
                  </th>
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                    Board
                  </th>
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                    Class
                  </th>
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                    Institute
                  </th>
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                    Subjects
                  </th>
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                    Academic Year
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {paginatedData.map((sub, index) => (
                  <tr
                    key={sub.subscription_id}
                    className="hover:bg-lime-50/40 transition-colors duration-200 group"
                  >
                    <td className="px-6 py-4">
                      <span className="w-7 h-7 rounded-full bg-gray-100 group-hover:bg-[#b0cb1f]/20 flex items-center justify-center text-xs font-bold text-gray-600 transition-colors">
                        {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#b0cb1f]/10 text-[#6b7a0e] text-xs font-semibold border border-[#b0cb1f]/20">
                        <CreditCard size={12} />
                        {sub.plan_name}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 font-medium">
                      {sub.board_name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 font-medium">
                      {sub.class_name}
                    </td>
                    <td
                      className="px-6 py-4 text-sm text-gray-600 max-w-[200px] truncate"
                      title={sub.institute_name}
                    >
                      {sub.institute_name || "—"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1.5 max-w-[280px]">
                        {sub.subjects.map((s) => (
                          <span
                            key={s.subject_id}
                            className="px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-600 text-[11px] font-semibold border border-indigo-100 whitespace-nowrap"
                          >
                            {s.subject_name}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600 font-medium">
                        {sub.year}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden divide-y divide-gray-50">
            {paginatedData.map((sub, index) => (
              <div
                key={sub.subscription_id}
                className="p-4 hover:bg-lime-50/40 transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#b0cb1f]/10 text-[#6b7a0e] text-xs font-semibold border border-[#b0cb1f]/20">
                    <CreditCard size={12} />
                    {sub.subscription_name}
                  </span>
                  <span className="text-xs font-medium text-gray-400">
                    #{(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm">
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase font-semibold">
                      Board
                    </p>
                    <p className="text-gray-700 font-medium">
                      {sub.board_name}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase font-semibold">
                      Class
                    </p>
                    <p className="text-gray-700 font-medium">
                      {sub.class_name}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-[10px] text-gray-400 uppercase font-semibold">
                      Institute
                    </p>
                    <p className="text-gray-600">{sub.institute_name || "—"}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-[10px] text-gray-400 uppercase font-semibold mb-1">
                      Subjects
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {sub.subjects.map((s) => (
                        <span
                          key={s.subject_id}
                          className="px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-600 text-[11px] font-semibold border border-indigo-100"
                        >
                          {s.subject_name}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase font-semibold">
                      Academic Year
                    </p>
                    <p className="text-gray-600 font-medium">{sub.year}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Rounded Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-1.5 px-6 py-5 border-t border-gray-100 bg-gray-50/50">
              {/* Previous */}
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 ${
                  currentPage === 1
                    ? "bg-gray-100 text-gray-300 cursor-not-allowed"
                    : "bg-white text-gray-600 border border-gray-200 hover:bg-[#b0cb1f] hover:text-white hover:border-[#b0cb1f] shadow-sm"
                }`}
              >
                <ChevronLeft size={16} />
              </button>

              {/* Page Numbers */}
              {getPageNumbers().map((page, i) =>
                typeof page === "string" ? (
                  <span
                    key={`ellipsis-${i}`}
                    className="w-9 h-9 flex items-center justify-center text-sm text-gray-400"
                  >
                    …
                  </span>
                ) : (
                  <button
                    key={page}
                    onClick={() => goToPage(page)}
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-200 ${
                      currentPage === page
                        ? "bg-[#b0cb1f] text-white shadow-md shadow-[#b0cb1f]/30"
                        : "bg-white text-gray-600 border border-gray-200 hover:bg-lime-50 hover:border-[#b0cb1f] shadow-sm"
                    }`}
                  >
                    {page}
                  </button>
                ),
              )}

              {/* Next */}
              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 ${
                  currentPage === totalPages
                    ? "bg-gray-100 text-gray-300 cursor-not-allowed"
                    : "bg-white text-gray-600 border border-gray-200 hover:bg-[#b0cb1f] hover:text-white hover:border-[#b0cb1f] shadow-sm"
                }`}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}

          {/* Summary footer */}
          <div className="px-6 py-3 bg-gray-50/80 border-t border-gray-100 flex items-center justify-between">
            <p className="text-xs text-gray-500">
              Showing{" "}
              <span className="font-semibold text-gray-700">
                {(currentPage - 1) * ITEMS_PER_PAGE + 1}
              </span>
              –
              <span className="font-semibold text-gray-700">
                {Math.min(currentPage * ITEMS_PER_PAGE, subscriptions.length)}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-gray-700">
                {subscriptions.length}
              </span>{" "}
              subscriptions
            </p>
            <p className="text-xs text-gray-400">
              Page {currentPage} of {totalPages}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionDetails;
