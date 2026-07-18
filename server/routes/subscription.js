import express from "express";

import {
  createDefaultPlans,
  getAllPlans,
} from "../controller/subscription.js";

const router = express.Router();

router.post("/create", createDefaultPlans);

router.get("/", getAllPlans);

export default router;