import express from "express";
import { protectedRoute } from "../middleware/auth.middleware.js";
import {
  checkoutSuccess,
  createCheckoutSession,
} from "../controllers/payment.controller.js";

const router = express.Router();

router.get("/create-checkout-session", protectedRoute, createCheckoutSession);
router.get("/checkout-success", protectedRoute, checkoutSuccess);

export default router;
