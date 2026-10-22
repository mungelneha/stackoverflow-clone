import express from "express";

import { transferReputation } from "../controller/reputationTransfer.js";

import auth from "../middleware/auth.js";

const router = express.Router();

router.post(
  "/transfer",
  auth,
  transferReputation
);

export default router;