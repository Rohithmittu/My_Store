import express from "express";
import { adminRoute, protectedRoute } from "../middleware/auth.middleware.js";
import { admindashboard } from "../controllers/analytics.controller.js";

const router = express.Router();

router.get("/", protectedRoute, adminRoute, admindashboard);

export default router;


