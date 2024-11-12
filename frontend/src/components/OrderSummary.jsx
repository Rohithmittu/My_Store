// import {
//   Elements,
//   PaymentElement,
//   useElements,
//   useStripe,
// } from "@stripe/react-stripe-js";
// import { motion } from "framer-motion";
// import { useCartStore } from "../stores/useCartStore";
// import { Link, useNavigate } from "react-router-dom"; // Added useNavigate
// import { useLocation } from "react-router-dom";
// import { MoveRight } from "lucide-react";
// import { loadStripe } from "@stripe/stripe-js";
// import axios from "../lib/axios";
// import { Navigate } from "react-router-dom";

// const stripePromise = loadStripe(
//   "pk_test_51NawlTSIuCkFjqUxwW0r7IWhQJSwgSQtHuDjGTdoVrU2VRbcsyucVGAE0MGS28U1H8M6aTyROcEFdhlqk2Vx2KeG00GcbhheqI"
// );

// const OrderSummarycheckout = () => {
//   const { total, subtotal, coupon, isCouponApplied, cart, shippingInfo } =
//     useCartStore();
//   const stripe = useStripe();
//   const elements = useElements();
//   const navigate = useNavigate(); // Initialize useNavigate
//   const savings = subtotal - total;
//   const formattedSubtotal = subtotal.toFixed(2);
//   const formattedTotal = total.toFixed(2);
//   const formattedSavings = savings.toFixed(2);

//   const handlePayment = async () => {
//     try {
//       // 1. Create the checkout session on the backend
//       const response = await axios.post("/payments/create-checkout-session", {
//         products: cart,
//         shippingInfo: shippingInfo,
//         couponCode: coupon ? coupon.code : null,
//       });

//       // console.log(response, "Response1");

//       const { clientSecret } = response.data;

//       // 2. Confirm payment using PaymentElement
//       const result = await stripe.confirmPayment({
//         elements,
//         confirmParams: {
//           return_url: "/purchase-success", // Replace with your success URL
//         },
//       });

//       if (result.error) {
//         // Show error message to user
//         console.error("Payment failed:", result.error.message);
//         alert("Payment failed. Please try again.");
//       } else {
//         if (result.paymentIntent.status === "succeeded") {
//           // Payment was successful
//           alert("Payment successful!");
//           navigate("/purchase-success");
//         }
//       }
//     } catch (error) {
//       console.error("Error creating checkout session:", error);
//       alert("An error occurred during the payment process. Please try again.");
//     }
//   };

//   return (
//     <motion.div
//       className="space-y-4 rounded-lg border border-gray-700 bg-gray-800 p-4 shadow-sm sm:p-6"
//       initial={{ opacity: 0, y: 20 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ duration: 0.5 }}
//     >
//       <p className="text-xl font-semibold text-violet-400">Order summary</p>

//       <div className="space-y-4">
//         <div className="space-y-2">
//           <dl className="flex items-center justify-between gap-4">
//             <dt className="text-base font-normal text-gray-300">
//               Original price
//             </dt>
//             <dd className="text-base font-medium text-white">
//               ₹{formattedSubtotal}
//             </dd>
//           </dl>

//           {savings > 0 && (
//             <dl className="flex items-center justify-between gap-4">
//               <dt className="text-base font-normal text-gray-300">Savings</dt>
//               <dd className="text-base font-medium text-violet-400">
//                 -₹{formattedSavings}
//               </dd>
//             </dl>
//           )}

//           {coupon && isCouponApplied && (
//             <dl className="flex items-center justify-between gap-4">
//               <dt className="text-base font-normal text-gray-300">
//                 Coupon ({coupon.code})
//               </dt>
//               <dd className="text-base font-medium text-violet-400">
//                 -{coupon.discountPercentage}%
//               </dd>
//             </dl>
//           )}
//           <dl className="flex items-center justify-between gap-4 border-t border-gray-600 pt-2">
//             <dt className="text-base font-bold text-white">Total</dt>
//             <dd className="text-base font-bold text-violet-400">
//               ₹{formattedTotal}
//             </dd>
//           </dl>
//         </div>
//         <motion.button
//           className="flex w-full items-center justify-center rounded-lg bg-violet-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-violet-700 focus:outline-none focus:ring-4 focus:ring-violet-300"
//           whileHover={{ scale: 1.05 }}
//           whileTap={{ scale: 0.95 }}
//         >
//           <Link to="/shipping"> Proceed to Checkout</Link>
//         </motion.button>
//         <motion.button
//           className="flex w-full items-center justify-center rounded-lg bg-violet-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-violet-700 focus:outline-none focus:ring-4 focus:ring-violet-300"
//           whileHover={{ scale: 1.05 }}
//           whileTap={{ scale: 0.95 }}
//           onClick={handlePayment}
//         >
//           <PaymentElement />
//         </motion.button>

//         <div className="flex items-center justify-center gap-2">
//           <span className="text-sm font-normal text-gray-400">or</span>
//           <Link
//             to="/"
//             className="inline-flex items-center gap-2 text-sm font-medium text-violet-400 underline hover:text-violet-300 hover:no-underline"
//           >
//             Continue Shopping
//             <MoveRight size={16} />
//           </Link>
//         </div>
//       </div>
//     </motion.div>
//   );
// };
// // export default OrderSummary;

// const OrderSummary = () => {
//   const location = useLocation();
//   const searchParams = new URLSearchParams(location.search);
//   const clientSecret = searchParams.get("clientSecret");

//   console.log(clientSecret);

//   // Ensure clientSecret is valid before rendering Elements
//   if (!clientSecret) {
//     return <Navigate to="/shipping" />;
//   }

//   return (
//     <Elements options={{ clientSecret }} stripe={stripePromise}>
//       <OrderSummarycheckout />
//     </Elements>
//   );
// };

// export default OrderSummary;

import { motion } from "framer-motion";
import { useCartStore } from "../stores/useCartStore";
import { Link } from "react-router-dom";

const OrderSummary = () => {
  const { total, subtotal, coupon, isCouponApplied, cart, shippingInfo } =
    useCartStore();
  const savings = subtotal - total;
  const formattedSubtotal = subtotal.toFixed(2);
  const formattedTotal = total.toFixed(2);
  const formattedSavings = savings.toFixed(2);

  return (
    <motion.div
      className="space-y-4 rounded-lg border border-gray-700 bg-gray-800 p-4 shadow-sm sm:p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <p className="text-xl font-semibold text-violet-400">Order summary</p>

      <div className="space-y-4">
        {/* Order summary details */}
        <dl className="flex items-center justify-between gap-4">
          <dt className="text-base font-normal text-gray-300">
            Original price
          </dt>
          <dd className="text-base font-medium text-white">
            ₹{formattedSubtotal}
          </dd>
        </dl>

        {savings > 0 && (
          <dl className="flex items-center justify-between gap-4">
            <dt className="text-base font-normal text-gray-300">Savings</dt>
            <dd className="text-base font-medium text-violet-400">
              -₹{formattedSavings}
            </dd>
          </dl>
        )}

        {coupon && isCouponApplied && (
          <dl className="flex items-center justify-between gap-4">
            <dt className="text-base font-normal text-gray-300">
              Coupon ({coupon.code})
            </dt>
            <dd className="text-base font-medium text-violet-400">
              -{coupon.discountPercentage}%
            </dd>
          </dl>
        )}

        <dl className="flex items-center justify-between gap-4 border-t border-gray-600 pt-2">
          <dt className="text-base font-bold text-white">Total</dt>
          <dd className="text-base font-bold text-violet-400">
            ₹{formattedTotal}
          </dd>
        </dl>

        <motion.button
          className="flex w-full items-center justify-center rounded-lg bg-violet-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-violet-700 focus:outline-none focus:ring-4 focus:ring-violet-300"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Link to="/shipping">Proceed to shipping</Link>
        </motion.button>
        <motion.button
          className="flex w-full items-center justify-center rounded-lg bg-violet-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-violet-700 focus:outline-none focus:ring-4 focus:ring-violet-300"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Link to="/payment">Proceed to pay</Link>
        </motion.button>
      </div>
    </motion.div>
  );
};

export default OrderSummary;
