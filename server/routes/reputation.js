import express from "express";
import {
  addReputation,
  deductReputation,
} from "../controller/reputationController.js";

const router = express.Router();

// Add reputation
router.post("/add", addReputation);

// Deduct reputation
router.post("/deduct", deductReputation);

export default router;


