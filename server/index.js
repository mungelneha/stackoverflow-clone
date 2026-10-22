import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import userroutes from "./routes/auth.js"
import questionroute from "./routes/question.js"
import answerroutes from "./routes/answer.js"
import subscriptionroutes from "./routes/subscription.js";
import paymentRoutes from "./routes/payment.js";
import postRoutes from "./routes/post.js";
import notificationRoutes from "./routes/notification.js";
import reportRoutes from "./routes/report.js";
import reputationRoutes from "./routes/reputation.js";
import reputationTransferRoutes from "./routes/reputationTransfer.js";
import reputationHistoryRoutes from "./routes/reputationHistory.js";
const app = express();
dotenv.config();
app.use(express.json({ limit: "30mb", extended: true }));
app.use(express.urlencoded({ limit: "30mb", extended: true }));
app.use(cors());
app.get("/", (req, res) => {
  res.send("Stackoverflow clone is running perfect");
});
app.use('/user',userroutes)
app.use('/question',questionroute)
app.use('/answer',answerroutes)
app.use("/subscription", subscriptionroutes);
app.use("/payment", paymentRoutes);
app.use("/post", postRoutes);
app.use("/notification", notificationRoutes);
app.use("/report", reportRoutes);
app.use("/api/reputation", reputationRoutes);
app.use("/api/reputation-transfer", reputationTransferRoutes);
app.use("/api/reputation-history", reputationHistoryRoutes);
const PORT = process.env.PORT || 5000;
const databaseurl = process.env.MONGODB_URL;

mongoose
  .connect(databaseurl, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("✅ Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
  });
