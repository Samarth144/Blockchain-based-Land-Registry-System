import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import landRoutes from "./routes/landRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import mongoose from "mongoose";

dotenv.config();

mongoose.connect(process.env.MongoDBUri, {
  dbName: "LandInfo",
})
  .then(() => console.log("MongoDB connected — database: OpenAcres"))
  .catch(err => console.error("MongoDB connection error:", err));

console.log("MongoDB URI is:", process.env.MongoDBUri);

const app = express();

app.use(cors());
app.use(express.json());  // ✅ Must come before routes

app.use("/api/land", landRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/ai", aiRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`🚀 Backend running on port ${PORT}`));
