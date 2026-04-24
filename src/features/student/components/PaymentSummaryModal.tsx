import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

// Types (matching Subscription.tsx)
interface Subject {
  subject_id: number;
  subject_name: string;
}

interface SubjectPrice {
  subject_id: number;
  price: number;
}

interface ApiFeature {
  feature_name: string;
  availability: string;
  feature_type: string;
}

interface ApiPlan {
  plan_id: number;
  plan_name: string;
  plan_tag: string;
  badge: string | null;
  billing_cycle: string;
  duration_days: number;
  payable_amount: number;
  subject_prices?: SubjectPrice[];
  features: ApiFeature[];
  plan_discount_percent: number;
  base_subject_total: number;
  monthly_divisor: number;
}
interface ProfileItem {
  selectedPlan?: ApiPlan | null;
  selectedSubjects: Subject[];
  seats: number;
  board_id: number | "";
  class_id: number | "";
}

interface PaymentSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  profiles: ProfileItem[]; // ✅ ONLY THIS

  uiTotalAmount: number;

  onProceedToPay: (
    subscriptionName: string,
    couponCode: string,
  ) => void;

  onApplyCoupon: (couponCode: string) => Promise<{
    success: boolean;
    data?: {
      db_discount: number;
      db_final: number;
      db_total: number;
    };
    message?: string;
  }>;

  isProcessing: boolean;
}

const PaymentSummaryModal: React.FC<PaymentSummaryModalProps> = ({
  isOpen,
  onClose,
  profiles,
  uiTotalAmount,
  onProceedToPay,
  onApplyCoupon,
  isProcessing,
}) => {
  const [subscriptionName, setSubscriptionName] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [originalAmount, setOriginalAmount] = useState(0);
  const [currentDisplayAmount, setCurrentDisplayAmount] = useState(0);
  const [couponError, setCouponError] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen && profiles?.length) {
      setSubscriptionName("");
      setCouponCode("");
      setCouponApplied(false);
      setCouponError("");
      setOriginalAmount(uiTotalAmount);
      setCurrentDisplayAmount(uiTotalAmount); // Initialize display amount
      setDiscountAmount(0);
    }
  }, [isOpen, profiles, uiTotalAmount]);

  // Prevent background scroll (Bulletproof Mobile Fix)
  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY;
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";
      document.body.style.overflow = "hidden";
    } else {
      const scrollY = document.body.style.top;
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      document.body.style.overflow = "";
      window.scrollTo(0, parseInt(scrollY || "0", 10) * -1);
    }
    return () => {
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // const getDurationLabel = (plan: ApiPlan) => {
  //   const months = Math.round(plan.duration_days / 30);
  //   switch (plan.billing_cycle) {
  //     case "trial":
  //       return `${plan.duration_days / 7} Week`;
  //     case "quarterly":
  //     case "half_yearly":
  //       return `${months} Months`;
  //     case "yearly":
  //       return "Yearly";
  //     default:
  //       return `${plan.duration_days} Days`;
  //   }
  // };

  const handleApplyCoupon = async () => {
    if (couponCode.trim()) {
      setIsApplyingCoupon(true);
      setCouponError("");
      try {
        const result = await onApplyCoupon(couponCode);
        if (result.success && result.data) {
          setOriginalAmount(result.data.db_total);
          setCurrentDisplayAmount(result.data.db_final);
          setDiscountAmount(result.data.db_discount);
          setCouponApplied(true);
          setCouponError("");
        } else {
          // Show the actual error message from backend
          setCouponError(result.message || "Coupon code is invalid or expired");
          setCouponApplied(false);
        }
      } finally {
        setIsApplyingCoupon(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 overscroll-contain">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity touch-none"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-lg bg-white rounded-2xl sm:rounded-3xl shadow-2xl transform transition-all flex flex-col max-h-[95vh] sm:max-h-[90vh] overflow-hidden border border-gray-100 animate-[fadeIn_0.2s_ease-out]">
        {/* Header */}
        <div className="relative p-4 sm:px-6 sm:pt-6 sm:pb-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                Payment Summary
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                Review your subscription details
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Body — Scrollable */}
        <div className="p-4 sm:px-6 sm:py-5 overflow-y-auto space-y-5">
          {/* ── Subscription Summary ── */}
          <div className="space-y-3">
            <h3 className="text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wide">
              Subscription Summary
            </h3>

            {profiles.map((profile, index) => {
              const plan = profile.selectedPlan;
              if (!plan) return null;

              const subjectNames = profile.selectedSubjects
                .map((s) => s.subject_name)
                .join(", ");

              return (
                <div
                  key={index}
                  className="border border-gray-200 rounded-xl overflow-hidden"
                >
                  {/* Header */}
                  <div
                    className="flex justify-between items-center px-4 py-3 bg-[#F7FAE9] cursor-pointer"
                    onClick={() =>
                      setExpandedIndex(expandedIndex === index ? null : index)
                    }
                  >
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">
                        Plan #{index + 1} - {plan.plan_name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {profile.selectedSubjects.length} subjects • {profile.seats} seats
                      </p>
                    </div>

                    <span
                      className={`material-symbols-outlined text-gray-600 transition-transform duration-200 ${expandedIndex === index ? "rotate-180" : "rotate-0"
                        }`}
                    >
                      expand_more
                    </span>
                  </div>

                  {/* Content */}
                  {expandedIndex === index && (
                    <div className="p-4 text-sm space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Subjects</span>
                        <span className="text-gray-800 text-right">
                          {subjectNames}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-gray-500">Seats</span>
                        <span className="text-gray-800">{profile.seats}</span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-gray-500">Amount</span>
                        <span className="text-gray-800 font-semibold">
                          ₹ {(
                            (plan.subject_prices || [])
                              .filter(sp =>
                                profile.selectedSubjects.some(s => s.subject_id === sp.subject_id)
                              )
                              .reduce((sum, sp) => sum + (sp.price || 0), 0) *
                            profile.seats *
                            (1 - (plan.plan_discount_percent || 0) / 100)
                          ).toFixed(2)}
                        </span>
                      </div>

                      {plan.plan_discount_percent > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Discount</span>
                          <span className="text-green-600">
                            {plan.plan_discount_percent}% off
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* ── TOTAL SUMMARY ── */}
          <div className="bg-[#F7FAE9] rounded-2xl p-4 space-y-3">
            <h3 className="text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wide">
              Payment Details
            </h3>

            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Total Amount</span>
              <span className="text-gray-800 font-medium">
                ₹ {originalAmount.toFixed(2)}
              </span>
            </div>

            {couponApplied && discountAmount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Discount</span>
                <span className="text-green-600 font-medium">
                  − ₹ {discountAmount.toFixed(2)}
                </span>
              </div>
            )}

            <div className="border-t pt-2 flex justify-between text-base font-bold">
              <span className="text-gray-800">Final Amount</span>
              <span className="text-[#5C5082]">
                ₹ {currentDisplayAmount.toFixed(2)}
              </span>
            </div>
          </div>

          {/* ── Coupon Code ── */}
          {uiTotalAmount > 0 && (
            <div className="space-y-2 sm:space-y-3">
              <h3 className="text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Coupon Code
              </h3>

              <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => {
                    setCouponCode(e.target.value.toUpperCase());
                    setCouponApplied(false);
                    setCouponError("");
                  }}
                  placeholder="Enter coupon code"
                  className={`flex-1 px-4 py-3 sm:py-2.5 border rounded-xl text-base sm:text-sm focus:outline-none focus:ring-2 transition-all ${couponError
                    ? "border-red-300 focus:ring-red-500/50 focus:border-red-500"
                    : "border-gray-200 focus:ring-[#b0cb1f]/50 focus:border-[#b0cb1f]"
                    }`}
                />
                <button
                  onClick={handleApplyCoupon}
                  disabled={!couponCode.trim() || couponApplied || isApplyingCoupon}
                  className={`w-full sm:w-auto px-5 py-3 sm:py-2.5 rounded-xl text-base sm:text-sm font-semibold transition-all ${couponApplied
                    ? "bg-green-100 text-green-700 cursor-default"
                    : couponCode.trim()
                      ? "bg-[#b0cb1f] text-gray-800 hover:bg-[#c5de3a] hover:scale-[1.02]"
                      : "bg-gray-100 text-gray-400 cursor-not-allowed"
                    }`}
                >
                  {isApplyingCoupon ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                      Applying...
                    </span>
                  ) : couponApplied ? (
                    "Applied ✓"
                  ) : (
                    "Apply"
                  )}
                </button>
              </div>
              {couponError && (
                <p className="text-xs sm:text-sm text-red-600 font-medium mt-1.5 sm:mt-2">
                  {couponError}
                </p>
              )}
            </div>
          )}

          {/* ── Subscription Name ── */}
          <div>
            <h3 className="text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">
              Subscription Name
            </h3>
            <input
              type="text"
              value={subscriptionName}
              onChange={(e) => setSubscriptionName(e.target.value)}
              placeholder="Enter subscription name"
              className="w-full px-4 py-3 sm:py-2.5 border border-gray-200 rounded-xl text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#b0cb1f]/50 focus:border-[#b0cb1f] transition-all"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:px-6 sm:py-4 border-t border-gray-100 shrink-0 flex flex-col-reverse sm:flex-row gap-3">
          <button
            onClick={onClose}
            className="w-full sm:flex-1 px-4 py-3 sm:py-2.5 rounded-xl border border-gray-200 text-gray-700 text-base sm:text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() =>
              onProceedToPay(subscriptionName, couponCode)
            }
            disabled={isProcessing || !subscriptionName.trim()}
            className={`w-full sm:flex-1 px-4 py-3 sm:py-2.5 rounded-xl text-base sm:text-sm font-medium transition-all hover:scale-[1.02] ${isProcessing || !subscriptionName.trim()
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-button-primary text-white shadow-lg shadow-[#b0cb1f]/20 hover:bg-[#c5de3a]"
              }`}
          >
            {isProcessing ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Processing...
              </span>
            ) : (
              "Proceed to Pay"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentSummaryModal;