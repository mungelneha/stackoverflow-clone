import express from "express";

import {
  reportPost,
  getReports,
} from "../controller/report.js";

import auth from "../middleware/auth.js";
import reputationPrivilege from "../middleware/reputationPrivilege.js";

const router = express.Router();

router.post(
  "/post",
  auth,
  reputationPrivilege(500),
  reportPost
);

router.get("/all", getReports);

export default router;