import React, { useState, useEffect } from "react";
import { Receipt, ChevronLeft, ChevronRight } from "lucide-react";
// @ts-ignore
import ApiServices from "../../../services/ApiServices";
import { useToast } from "../../../app/providers/ToastProvider";

interface TransactionItem {
    coupon_code: string;
    payment_gateway: string;
    payment_status: string;
    plan_name: string;
    subscription_id: string;
    subscription_name: string;
    total_amount: number;
    transaction_id: string;
}

const ITEMS_PER_PAGE = 5;

const TransactionHistory: React.FC = () => {
    const { showToast } = useToast();
    const [transactions, setTransactions] = useState<TransactionItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        fetchTransactions();
    }, []);

    const fetchTransactions = async () => {
        try {
            setIsLoading(true);
            const response = await ApiServices.getUserSubscriptions();
            if (response.data?.status === "success") {
                setTransactions(response.data.data?.data2 || []);
            } else {
                showToast(response.data?.message || "Failed to load transactions", "error");
            }
        } catch (error: any) {
            // console.error("Failed to fetch transactions:", error);
            showToast(
                error.response?.data?.message || "Failed to load transactions",
                "error"
            );
        } finally {
            setIsLoading(false);
        }
    };

    const totalPages = Math.ceil(transactions.length / ITEMS_PER_PAGE);
    const paginatedData = transactions.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
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
                        <Receipt size={20} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Transaction History</h1>
                        <p className="text-sm text-gray-500">View all your past payments and transactions</p>
                    </div>
                </div>
            </div>

            {/* Table */}
            {isLoading ? (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-9 h-9 border-[3px] border-gray-200 border-t-[#b0cb1f] rounded-full animate-spin" />
                        <p className="text-sm text-gray-500 font-medium">Loading transactions...</p>
                    </div>
                </div>
            ) : transactions.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 flex flex-col items-center justify-center text-center">
                    <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center mb-5">
                        <Receipt size={36} className="text-gray-300" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">No Transactions Found</h3>
                    <p className="text-sm text-gray-400 max-w-sm">
                        You don't have any past transactions.
                    </p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    {/* Desktop Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-gradient-to-r from-gray-50 to-gray-50/80 border-b border-gray-100">
                                    <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider w-12">Sl. No</th>
                                    <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Transaction ID</th>
                                    <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Subscription ID</th>
                                    <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Plan Name</th>
                                    <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Payment Gateway</th>
                                    <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Amount</th>
                                    <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Coupon Code</th>
                                    <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {paginatedData.map((txn, index) => (
                                    <tr
                                        key={txn.transaction_id || index}
                                        className="hover:bg-lime-50/40 transition-colors duration-200 group"
                                    >
                                        <td className="px-6 py-4">
                                            <span className="w-7 h-7 rounded-full bg-gray-100 group-hover:bg-[#b0cb1f]/20 flex items-center justify-center text-xs font-bold text-gray-600 transition-colors">
                                                {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium text-gray-700">
                                            {txn.transaction_id || "N/A"}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium text-gray-700">
                                            {txn.subscription_id || "N/A"}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#b0cb1f]/10 text-[#6b7a0e] text-xs font-semibold border border-[#b0cb1f]/20">
                                                <Receipt size={12} />
                                                {txn.plan_name}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {txn.payment_gateway || "N/A"}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-semibold text-gray-800">
                                            ₹ {txn.total_amount}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-md uppercase tracking-wide">
                                                {txn.coupon_code || "None"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide ${txn.payment_status?.toLowerCase() === 'success'
                                                ? 'bg-green-100 text-green-700 border border-green-200/50'
                                                : txn.payment_status?.toLowerCase() === 'pending'
                                                    ? 'bg-yellow-100 text-yellow-700 border border-yellow-200/50'
                                                    : 'bg-red-100 text-red-700 border border-red-200/50'
                                                }`}>
                                                {txn.payment_status || "Unknown"}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/50">
                            <span className="text-sm text-gray-500 font-medium">
                                Showing <span className="text-gray-900 font-semibold">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> to <span className="text-gray-900 font-semibold">{Math.min(currentPage * ITEMS_PER_PAGE, transactions.length)}</span> of <span className="text-gray-900 font-semibold">{transactions.length}</span> entries
                            </span>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => goToPage(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:bg-white hover:text-[#b0cb1f] hover:border-[#b0cb1f]/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                                >
                                    <ChevronLeft size={16} strokeWidth={2.5} />
                                </button>

                                <div className="flex items-center gap-1.5">
                                    {getPageNumbers().map((pageNum, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => typeof pageNum === 'number' ? goToPage(pageNum) : null}
                                            disabled={pageNum === "..."}
                                            className={`
                                                w-8 h-8 rounded-full text-sm font-semibold flex items-center justify-center transition-all shadow-sm
                                                ${pageNum === currentPage
                                                    ? 'bg-gradient-to-b from-[#c0dd21] to-[#a0b91c] text-white shadow-[#b0cb1f]/30 ring-2 ring-[#b0cb1f]/20 ring-offset-1'
                                                    : pageNum === "..."
                                                        ? 'bg-transparent text-gray-400 cursor-default shadow-none'
                                                        : 'bg-white text-gray-600 border border-gray-200 hover:border-[#b0cb1f]/30 hover:text-[#b0cb1f]'
                                                }
                                            `}
                                        >
                                            {pageNum}
                                        </button>
                                    ))}
                                </div>

                                <button
                                    onClick={() => goToPage(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:bg-white hover:text-[#b0cb1f] hover:border-[#b0cb1f]/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                                >
                                    <ChevronRight size={16} strokeWidth={2.5} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default TransactionHistory;
