// import React, { useState } from "react";
// import { useNavigate, useLocation, Navigate } from "react-router-dom";
// import { useCartStore } from "../stores/useCartStore";
// import axios from "../lib/axios";
// import toast from "react-hot-toast"; // if you want toast notifications

// const PaymentPageForm = () => {
//   const { coupon, cart, shippingInfo } = useCartStore();
//   const navigate = useNavigate();
//   const [isProcessing, setIsProcessing] = useState(false);

//   const submitHandler = async (e) => {
//     e.preventDefault();

//     console.log("Shipping Info: frontend", shippingInfo);
//     console.log("Shipping Info: frontend", cart);
//     console.log("Shipping Info: frontend", coupon);

//     setIsProcessing(true);

//     try {
//       // 1. Create the checkout session on the backend
//       const response = await axios.post("/payments/create-checkout-session", {
//         products: cart,
//         shippingInfo: shippingInfo,
//         couponCode: coupon ? coupon.code : null,
//       });

//       console.log(response, "Response1");

//       // 2. Redirect to the Stripe Checkout page
//       const { url } = response.data;

//       if (url) {
//         window.location.href = url; // Redirect to the Stripe checkout page
//       } else {
//         toast.error("Failed to initiate payment session.");
//       }
//     } catch (error) {
//       console.error("Error creating checkout session:", error);
//       toast.error(
//         "An error occurred during the payment process. Please try again."
//       );
//     } finally {
//       setIsProcessing(false);
//     }
//   };

//   return (
//     <div className="space-y-4 rounded-lg border border-gray-700 bg-gray-800 p-4 shadow-sm sm:p-6">
//       <h2 className="text-xl font-semibold text-violet-400">Payment</h2>
//       <form onSubmit={submitHandler}>
//         {/* Removed PaymentElement as it is no longer needed */}
//         <button
//           type="submit"
//           disabled={isProcessing}
//           className="w-full py-2 mt-4 font-semibold text-white bg-violet-600 rounded-lg hover:bg-violet-700 focus:outline-none focus:ring-4 focus:ring-violet-400"
//         >
//           {isProcessing ? "Processing..." : "Proceed to Payment"}
//         </button>
//       </form>
//     </div>
//   );
// };

// const PaymentPage = () => {
//   const { cart, shippingInfo } = useCartStore();

//   // Ensure cart and shippingInfo are available before showing the payment form
//   if (!cart.length || !shippingInfo) {
//     return <Navigate to="/shipping" />;
//   }

//   return (
//     <div className="flex justify-center items-center min-h-screen bg-gray-900 text-white">
//       <PaymentPageForm />
//     </div>
//   );
// };

// export default PaymentPage;

import React, { useState, useEffect } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useCartStore } from "../stores/useCartStore";
import axios from "../lib/axios";
import toast from "react-hot-toast";

const stripePromise = loadStripe(
  "pk_test_51NawlTSIuCkFjqUxwW0r7IWhQJSwgSQtHuDjGTdoVrU2VRbcsyucVGAE0MGS28U1H8M6aTyROcEFdhlqk2Vx2KeG00GcbhheqI"
);

const PaymentPageForm = ({ clientSecret }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();
  const { setPaymentIntentId } = useCartStore();
  const submitHandler = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setIsProcessing(true);

    try {
      const result = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/purchase-success`,
        },
        redirect: "if_required",
      });

      if (result.error) {
        console.error("Payment failed:", result.error.message);
        toast.error("Payment failed. Please try again.");
      } else if (
        result.paymentIntent &&
        result.paymentIntent.status === "succeeded"
      ) {
        toast.success("Payment successful!");

        const paymentIntentId = result.paymentIntent.id;
        setPaymentIntentId(paymentIntentId);
        navigate("/purchase-success");

        // Instead of navigate("/payment-success"), let Stripe handle the redirect with the payment_intent data.
      }
    } catch (error) {
      console.error("Error processing payment:", error);
      toast.error("An error occurred during payment processing.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form
      onSubmit={submitHandler}
      className="space-y-4 rounded-lg border border-gray-700 bg-gray-800 p-4 shadow-sm sm:p-6"
    >
      <PaymentElement />
      <button
        type="submit"
        disabled={isProcessing}
        className="w-full py-2 mt-4 font-semibold text-white bg-violet-600 rounded-lg hover:bg-violet-700 focus:outline-none focus:ring-4 focus:ring-violet-400"
      >
        {isProcessing ? "Processing..." : "Pay"}
      </button>
    </form>
  );
};

const PaymentPage = () => {
  const { coupon, cart, shippingInfo } = useCartStore();
  const [clientSecret, setClientSecret] = useState(null);

  useEffect(() => {
    const createPaymentIntent = async () => {
      try {
        const response = await axios.post("/payments/create-checkout-session", {
          products: cart,
          shippingInfo,
          couponCode: coupon ? coupon.code : null,
        });
        setClientSecret(response.data.clientSecret);
      } catch (error) {
        console.error("Error creating payment intent:", error);
        toast.error("An error occurred while initializing payment.");
      }
    };

    if (cart.length && shippingInfo) {
      createPaymentIntent();
    }
  }, [cart, shippingInfo, coupon]);

  if (!cart.length || !shippingInfo) {
    return <Navigate to="/shipping" />;
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-900 text-white">
      {clientSecret ? (
        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <PaymentPageForm clientSecret={clientSecret} />
        </Elements>
      ) : (
        <p>Loading payment details...</p>
      )}
    </div>
  );
};

export default PaymentPage;
