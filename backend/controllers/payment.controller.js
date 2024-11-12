import Coupon from "../models/coupon.model.js";
import Order from "../models/order.model.js";
import { stripe } from "../lib/stripe.js";

// Controller to create Payment Intent
export const createCheckoutSession = async (req, res) => {
  try {
    const { products, shippingInfo, couponCode } = req.body;

    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ error: "Invalid or empty products array" });
    }
    if (!shippingInfo) {
      return res.status(400).json({ message: "Please send shipping info" });
    }

    let totalAmount = 0;

    // Calculate total amount in cents
    products.forEach((product) => {
      const amount = Math.round(product.price * 100);
      totalAmount += amount * product.quantity;
    });

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
      } else {
        return res
          .status(400)
          .json({ error: "Invalid or expired coupon code" });
      }
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalAmount,
      currency: "inr",
      payment_method_types: ["card"],
      description: "My-Store Order",
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
        shippingInfo: JSON.stringify(shippingInfo),
      },
      shipping: {
        name: req.user.name,
        address: {
          line1: shippingInfo.address,
          postal_code: shippingInfo.pinCode.toString(),
          city: shippingInfo.city,
          state: shippingInfo.state,
          country: shippingInfo.country,
        },
      },
    });

    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      totalAmount: totalAmount / 100,
    });
  } catch (error) {
    console.error("Error processing checkout:", error);
    res
      .status(500)
      .json({ message: "Error processing checkout", error: error.message });
  }
};

// Controller to handle successful payment
export const checkoutSuccess = async (req, res) => {
  try {
    const { paymentIntentId } = req.body;

    if (!paymentIntentId) {
      return res.status(400).json({ message: "Missing paymentIntentId" });
    }

    // Check if order already exists
    const existingOrder = await Order.findOne({
      stripePaymentIntentId: paymentIntentId,
    });
    if (existingOrder) {
      console.log("Order already exists:", existingOrder._id);
      return res.status(200).json({
        success: true,
        message: "Order already exists for this payment intent",
        orderId: existingOrder._id,
      });
    }

    // Retrieve payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === "succeeded") {
      const { metadata } = paymentIntent;
      const products = JSON.parse(metadata.products);
      const shippingInfo = JSON.parse(metadata.shippingInfo);

      // Create new order
      const newOrder = new Order({
        user: metadata.userId,
        products: products.map((product) => ({
          product: product.id,
          quantity: product.quantity,
          price: product.price,
        })),
        totalAmount: paymentIntent.amount / 100,
        stripePaymentIntentId: paymentIntentId,
        shippingInfo,
      });

      await newOrder.save();
      // console.log("New Order Created:", newOrder._id);

      // Deactivate coupon if used
      if (metadata.couponCode) {
        await Coupon.findOneAndUpdate(
          { code: metadata.couponCode, userId: metadata.userId },
          { isActive: false }
        );
      }

      return res.status(200).json({
        success: true,
        message:
          "Payment successful, order created, and coupon deactivated if used.",
        orderId: newOrder._id,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Payment not completed successfully",
      });
    }
  } catch (error) {
    console.error("Error processing successful payment intent:", error);
    return res.status(500).json({
      message: "Error processing successful payment intent",
      error: error.message,
    });
  }
};

// Helper function to create a Stripe coupon
async function createStripeCoupon(discountPercentage) {
  const coupon = await stripe.coupons.create({
    percent_off: discountPercentage,
    duration: "once",
  });

  return coupon.id;
}

async function createNewCoupon(userId) {
  await Coupon.findOneAndDelete({ userId });

  const newCoupon = new Coupon({
    code: "GIFT" + Math.random().toString(36).substring(2, 8).toUpperCase(),
    discountPercentage: 10,
    expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    userId: userId,
  });

  await newCoupon.save();

  return newCoupon;
}
