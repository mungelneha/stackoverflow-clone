import express from "express";
import {
  Askquestion,
  deletequestion,
  getallquestion,
  votequestion,
  acceptanswer,
  voteToClose,
} from "../controller/question.js";
import adminOnly from "../middleware/adminOnly.js";
import reputationPrivilege from "../middleware/reputationPrivilege.js";

const router = express.Router();
import auth from "../middleware/auth.js";
router.post("/ask", auth, Askquestion);
router.get("/getallquestion", getallquestion);
router.delete("/delete/:id",auth,adminOnly,deletequestion);
router.patch("/vote/:id", auth, votequestion);
router.patch(
  "/vote-to-close/:id",
  auth,
  reputationPrivilege(250),
  voteToClose
);
router.patch("/acceptanswer/:id", acceptanswer);

export default router;
