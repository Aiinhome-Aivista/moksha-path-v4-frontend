import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
// import IconChat from "../../../assets/icon/chat2.svg";
import ApiServices from "../../../services/ApiServices"; // Assuming ApiServices path
import { useToast } from "../../../app/providers/ToastProvider";
import { useModal } from "../../auth/context/AuthContext";

const PaymentGateway: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  const { fetchMenu } = useModal();
  const [isProcessing, setIsProcessing] = React.useState(false);
  // const [localUser, setLocalUser] = React.useState<any>({});

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  React.useEffect(() => {
    // const user = JSON.parse(localStorage.getItem("active_profile") || "{}");
    // setLocalUser(user);
  }, []);

  // Retrieve data passed from Subscription page
  const { paymentData, plan } = location.state || {};

  const handleCancel = () => {
    navigate("/subscription");
  };

  const handleNext = async () => {
    if (!paymentData) {
      showToast(
        "Missing payment data. Please try again from Subscription page.",
        "error",
      );
      return;
    }

    setIsProcessing(true);
    try {
      // console.log("Received paymentData:", paymentData);
      // Construct the final payload for complete_subscription
      // const finalPayload = {
      //   plan_id: paymentData.plan_id,
      //   board_id: paymentData.board_id,
      //   class_id: paymentData.class_id,
      //   academic_year: paymentData.academic_year,
      //   institute_id: paymentData.institute_id,
      //   subject_ids: paymentData.subject_ids,
      //   total_licenses: paymentData.total_licenses,
      //   licenses_used: paymentData.licenses_used,
      //   transaction_id: "TXN-RAZORPAY-" + Math.floor(Math.random() * 100000000),
      //   subscription_name: paymentData.subscription_name,
      //   ui_total_amount: paymentData.ui_total_amount,
      //   // section: paymentData.section || undefined,
      //   ...(paymentData.coupon_code && {
      //     coupon_code: paymentData.coupon_code,
      //   }),
      // };

      const finalPayload = {
        profiles: paymentData.profiles.map((p: any) => ({
          ...p,
          section_id: p.section_id || null, // ✅ ensure passing
        })),

        transaction_id: "TXN-RAZORPAY-" + Math.floor(Math.random() * 100000000),

        subscription_name: paymentData.subscription_name,

        db_total: Number(
          (
            paymentData.final_amount + (paymentData.discounted_amount || 0)
          ).toFixed(2),
        ),

        db_discount: Number((paymentData.discounted_amount || 0).toFixed(2)),

        db_final: Number(paymentData.final_amount.toFixed(2)),

        ui_total_amount: Number(paymentData.ui_total_amount.toFixed(2)), // ✅ ADD THIS

        payment_gateway: "RAZORPAY",

        currency: "INR",

        ...(paymentData.coupon_code && {
          coupon_code: paymentData.coupon_code,
        }),
      };

      // console.log("Completing subscription with payload:", finalPayload);

      const response = await ApiServices.completeSubscription(finalPayload);

      if (response.data?.status === "success") {
        localStorage.removeItem("selected_subjects_payload");
        // // Verify subscription_id is actually set in localStorage
        // const subscriptionId = response?.data?.data?.subscription_id;
        const subscriptionToken = response?.data?.data?.subscription_token;
        if (subscriptionToken) {
          localStorage.setItem("subscription_token", subscriptionToken);
        }

        if (response.data?.message === "Subscription already active") {
          showToast(response.data?.message, "error");
        } else {
          showToast(
            response.data?.message || "Subscription completed successfully!",
            "success",
          );
          // console.log("idd",subscriptionId)
          // if (subscriptionId) {
          //   const role = localUser?.role?.toLowerCase();

          //   if (role === "teacher") {
          //     navigate("/teacher/dashboard", { replace: true });
          //   } else if (role === "parent") {
          //     navigate("/parent/dashboard", { replace: true });
          //   } else {
          //     navigate("/dashboard", { replace: true });
          //   }
          // }
          const menuItems = await fetchMenu();
          const dashboardRoute = menuItems?.find(
            (item: any) => item.page_name?.toLowerCase().includes("dashboard")
          )?.route || "/dashboard";

          navigate(dashboardRoute, { replace: true });
        }
      } else {
        showToast(
          "Subscription failed: " + (response.data?.message || "Unknown error"),
          "error",
        );
      }
    } catch (error) {
      // console.error("Payment API error", error);
      showToast(
        "An error occurred while processing the subscription.",
        "error",
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
      {/* Success Message */}
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-300 leading-tight italic">
          Authentication, Payment
        </h1>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-300 leading-tight italic">
          Gateway & Payment
        </h1>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-300 leading-tight italic">
          successfull
        </h1>
        {plan && (
          <p className="mt-4 text-gray-500">
            Completing purchase for{" "}
            <span className="font-bold text-teal-600">{plan.plan_name}</span>
          </p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button
          onClick={handleCancel}
          disabled={isProcessing}
          className="px-8 py-2.5 rounded-full bg-primary text-white text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          onClick={handleNext}
          disabled={isProcessing}
          className="px-8 py-2.5 rounded-full bg-button-primary text-white text-sm font-medium transition-colors disabled:opacity-50"
        >
          {isProcessing ? "Processing..." : "Next"}
        </button>
      </div>

      {/* <div className="fixed right-[1%] top-[80%] -translate-y-1/2 z-[100]">
        <img src={IconChat} alt="Chat" className="w-[95px]" />
      </div> */}
    </div>
  );
};

export default PaymentGateway;
