import express from "express";

import {
  Askanswer,
  deleteanswer,
  voteanswer,
  adminDeleteAnswer,
} from "../controller/answer.js";

import auth from "../middleware/auth.js";
import adminOnly from "../middleware/adminOnly.js";

const router = express.Router();

router.post("/postanswer/:id", auth, Askanswer);

router.delete("/delete/:id", auth, deleteanswer);

router.delete(
  "/admin-delete/:id",
  auth,
  adminOnly,
  adminDeleteAnswer
);

router.patch("/vote/:id", voteanswer);

export default router;