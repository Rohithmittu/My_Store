import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useCartStore } from "../stores/useCartStore";
import axios from "../lib/axios"; // Your axios instance for API requests
import Confetti from "react-confetti";

const PurchaseSuccessPage = () => {
  const { clearCart, paymentIntentId } = useCartStore(); // Get paymentIntentId directly from the store
  const [orderDetails, setOrderDetails] = useState(null);
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const handlePaymentSuccess = async (paymentIntentId) => {
      try {
        await axios.post("/payments/checkout-success", {
          paymentIntentId,
        });
        clearCart();
      } catch (err) {
        console.error("Error during payment success:", err);
      } finally {
        setIsProcessing(false);
      }
    };

    if (paymentIntentId) {
      handlePaymentSuccess(paymentIntentId);
    } else {
      setIsProcessing(false);
      setError("No payment intent ID found.");
    }
  }, [clearCart]);

  if (isProcessing) {
    return (
      <div className="text-center text-white">Processing your order...</div>
    );
  }

  if (error) {
    return <div className="text-center text-red-500">Error: {error}</div>;
  }

  return (
    <div className="h-screen flex items-center justify-center px-4">
      <Confetti
        width={window.innerWidth}
        height={window.innerHeight}
        gravity={0.1}
        style={{ zIndex: 99 }}
        numberOfPieces={700}
        recycle={false}
      />
      <div className="max-w-md w-full bg-gray-800 rounded-lg shadow-xl overflow-hidden relative z-10">
        <div className="p-6 sm:p-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-center text-violet-400 mb-2">
            Purchase Successful!
          </h1>
          {orderDetails && (
            <div className="bg-gray-700 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Order number</span>
                <span className="text-sm font-semibold text-violet-400">
                  {orderDetails.orderNumber}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">
                  Estimated delivery
                </span>
                <span className="text-sm font-semibold text-violet-400">
                  {orderDetails.deliveryEstimate}
                </span>
              </div>
            </div>
          )}
          <Link
            to={"/"}
            className="w-full bg-gray-700 hover:bg-gray-600 text-violet-400 font-bold py-2 px-4 rounded-lg transition duration-300 flex items-center justify-center"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PurchaseSuccessPage;
