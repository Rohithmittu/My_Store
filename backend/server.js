import express from "express";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4001;

app.listen(PORT, () => {
  console.log(`server is running on http://localhost:` + PORT);
});
