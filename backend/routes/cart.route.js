import express from "express";
import {
  addTocart,
  getCartProducts,
  removeAllFromCart,
  updateQuantity,
} from "../controllers/cart.controller.js";
import { protectedRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", protectedRoute, getCartProducts);
router.post("/", protectedRoute, addTocart);
router.delete("/", protectedRoute, removeAllFromCart);
router.put("/:id", protectedRoute, updateQuantity);

export default router;
