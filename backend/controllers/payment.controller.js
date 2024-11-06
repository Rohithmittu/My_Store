import Coupon from "../models/coupon.model.js";
import { stripe } from "../lib/stripe.js";
import Order from "../models/order.model.js";
import User from "../models/user.model.js";

async function createStripeCoupon(discountPercentage) {
  const coupon = await stripe.coupons.create({
    percent_off: discountPercentage,
    duration: "once",
  });

  return coupon.id;
}

async function createNewCoupon(userId) {
  const newCoupon = new Coupon({
    code: "GIFT" + Math.floor().toString(36).substring(2, 8).toUpperCase(),
    discountPercentage: 10,
    expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    userId: userId,
  });

  await newCoupon.save();
}

export const createCheckoutSession = async (req, res) => {
  try {
    const { products, couponCode } = req.body;

    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ error: "Invalid or empty products array" });
    }

    let totalAmount = 0; // Initialize totalAmount as a number

    // products.forEach((product) => {
    //   const amount = Math.round(product.price * 100); // Convert price to paise
    //   totalAmount += amount * product.quantity; // Accumulate the total amount
    // });

    let coupon = null;

    if (couponCode) {
      coupon = await Coupon.findOne({
        code: couponCode,
        userId: req.user._id,
        isActive: true,
      });

      if (coupon) {
        totalAmount -= Math.round(
          (totalAmount * coupon.discountPercentage) / 100
        );
      }
    }

    const lineItems = products.map((product) => {
      const amount = Math.round(product.price * 100); // because stripe accept in lowest form of currency so inr lowest is paise
      totalAmount += amount * product.quantity;
      return {
        price_data: {
          currency: "inr",
          product_data: {
            name: product.name,
            images: [product.image],
          },
          unit_amount: amount,
        },
        quantity: product.quantity || 1,
      };
    });

    // console.log(lineItems);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${process.env.CLIENT_URL}/purchase-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/purchase-cancel`,
      discounts: coupon
        ? [
            {
              coupon: await createStripeCoupon(coupon.discountPercentage),
            },
          ]
        : [],
      metadata: {
        userId: req.user._id.toString(),
        couponCode: couponCode || "",
        products: JSON.stringify(
          products.map((p) => ({
            id: p._id,
            quantity: p.quantity,
            price: p.price,
          }))
        ),
      },
    });

    // const session = await stripe.paymentIntents.create({
    //   amount: totalAmount,
    //   currency: "inr",
    //   description: "MERN-Ecommerce",
    //   shipping: {
    //     name: req.user.name,
    //     address: {
    //       line1: "510 Townsend St",
    //       postal_code: "504323",
    //       city: "Hyderabad",
    //       state: "Telangana",
    //       country: "India",
    //     },
    //   },
    // });

    // console.log(session);
    // id: session.client_secret,

    if (totalAmount >= 20000) {
      await createNewCoupon(req.user._id);
    }

    res.status(200).json({
      id: session.id,
      totalAmount: totalAmount / 100,
    });
  } catch (error) {
    console.log("error in proccesing  checkouts:", error);
    res.status(500).json({
      message: "error Proceesing  checkout",
      error: error.message,
    });
  }
};

// export const createPaymentIntent = async (req, res) => {
//   try {
//     const { products, couponCode } = req.body;

//     if (!Array.isArray(products) || products.length === 0) {
//       return res.status(400).json({ error: "Invalid or empty products array" });
//     }

//     // Calculate total amount
//     let totalAmount = products.reduce((sum, product) => {
//       return sum + Math.round(product.price * 100) * product.quantity;
//     }, 0);

//     // Apply coupon if valid
//     let coupon = null;
//     if (couponCode) {
//       coupon = await Coupon.findOne({
//         code: couponCode,
//         userId: req.user._id,
//         isActive: true,
//       });

//       if (coupon) {
//         const discountAmount = Math.round(
//           (totalAmount * coupon.discountPercentage) / 100
//         );
//         totalAmount -= discountAmount;
//       }
//     }

//     // Create PaymentIntent
//     const paymentIntent = await stripe.paymentIntents.create({
//       amount: totalAmount,
//       currency: "inr",
//       metadata: {
//         userId: req.user._id.toString(),
//         products: JSON.stringify(
//           products.map((p) => ({
//             id: p.id,
//             quantity: p.quantity,
//             price: p.price,
//           }))
//         ),
//         couponCode: couponCode || "",
//       },
//       automatic_payment_methods: {
//         enabled: true,
//       },
//       shipping: {
//         name: req.user.name,
//         address: {
//           line1: "510 Townsend St",
//           postal_code: "504323",
//           city: "Hyderabad",
//           state: "Telangana",
//           country: "India",
//         },
//       },
//     });

//     // Create new coupon if total amount is >= 20000
//     if (totalAmount >= 2000000) {
//       // 20000 * 100 (for paise)
//       await createNewCoupon(req.user._id);
//     }

//     // Send client secret to frontend
//     res.status(200).json({
//       clientSecret: paymentIntent.client_secret,
//       totalAmount: totalAmount / 100, // Convert back to rupees for display
//     });
//   } catch (error) {
//     console.log("Error in processing payment intent:", error);
//     res.status(500).json({
//       message: "Error processing payment",
//       error: error.message,
//     });
//   }
// };

// // Handle successful payment
// export const handlePaymentSuccess = async (req, res) => {
//   try {
//     const { paymentIntentId } = req.body;

//     // Retrieve the payment intent
//     const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

//     if (paymentIntent.status === "succeeded") {
//       // Get metadata from payment intent
//       const {
//         userId,
//         products: productsJson,
//         couponCode,
//       } = paymentIntent.metadata;
//       const products = JSON.parse(productsJson);

//       // Deactivate used coupon
//       if (couponCode) {
//         await Coupon.findOneAndUpdate(
//           {
//             code: couponCode,
//             userId: userId,
//           },
//           {
//             isActive: false,
//           }
//         );
//       }

//       // Create new order
//       const newOrder = new Order({
//         user: userId,
//         products: products.map((product) => ({
//           product: product.id,
//           quantity: product.quantity,
//           price: product.price,
//         })),
//         totalAmount: paymentIntent.amount / 100,
//         paymentIntentId: paymentIntentId,
//       });

//       await newOrder.save();

//       res.status(200).json({
//         success: true,
//         message:
//           "Payment successful, order created, and coupon deactivated if used.",
//         orderId: newOrder._id,
//       });
//     } else {
//       res.status(400).json({
//         success: false,
//         message: "Payment not successful",
//       });
//     }
//   } catch (error) {
//     console.log("Error in processing successful payment:", error);
//     res.status(500).json({
//       message: "Error processing successful payment",
//       error: error.message,
//     });
//   }
// };

export const checkoutSuccess = async (req, res) => {
  try {
    const { sessionId } = req.body;
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === "paid") {
      if (session.metadata.couponCode) {
        await Coupon.findOneAndUpdate(
          {
            code: session.metadata.couponCode,
            userId: session.metadata.userId,
          },
          {
            isActive: false,
          }
        );
      }

      const products = JSON.parse(session.metadata.products);
      const newOrder = new Order({
        user: session.metadata.userId,
        products: products.map((product) => ({
          product: product.id,
          quantity: product.quantity,
          price: product.price,
        })),

        totalAmount: session.amount_total / 100,
        StripeSessionId: sessionId,
      });

      await newOrder.save();
      res.status(200).json({
        success: true,
        message:
          "payment succesfull, order created, and couppon deactivated if used.",
        orderId: newOrder._id,
      });
    }
  } catch (error) {
    console.log("error in proccesing succesful checkouts:", error);
    res.status(500).json({
      message: "error Proceesing succesfull checkout",
      error: error.message,
    });
  }
};
