import express from "express";

import {
  getReputationHistory,
} from "../controller/reputationHistory.js";

const router = express.Router();

router.get("/:userId", getReputationHistory);

export default router;
