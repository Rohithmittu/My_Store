import express from "express";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.route.js";
import productRoutes from "./routes/product.route.js"
import { connectDB } from "./lib/db.js";
import cookieParser from "cookie-parser";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4001;

app.use(express.json()); // allow us to parse the req.body request
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/products",productRoutes)

app.listen(PORT, () => {
  console.log(`server is running on http://localhost:` + PORT);
  connectDB();
});
