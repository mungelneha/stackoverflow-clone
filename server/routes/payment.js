import express from "express";
import {
  createCheckoutSession,
  verifyPayment,
  getPaymentHistory,
  downloadInvoice,
  getInvoices,
} from "../controller/payment.js";

const router = express.Router();

router.post("/create-checkout-session", createCheckoutSession);
router.post("/verify-payment", verifyPayment);

// Payment History
router.get("/history/:userId", getPaymentHistory);
router.get("/invoices/:userId", getInvoices);
router.get("/invoice/:paymentId", downloadInvoice);
export default router;