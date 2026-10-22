import express from "express";
import { createPost, getPosts,likePost,addComment,addReply,editComment,editReply,deleteReply,deleteComment,bookmarkPost,sharePost,deletePost,editPost,getSavedPosts,getTrendingPosts} from "../controller/post.js";
import upload from "../middleware/upload.js";
import auth from "../middleware/auth.js";
import reputationPrivilege from "../middleware/reputationPrivilege.js";
const router = express.Router();

// Create Post
router.post("/create", upload.single("image"), createPost);
// Get All Posts
router.get("/all", getPosts);

router.post("/like", likePost);
router.post(
  "/comment",
  auth,
  reputationPrivilege(50),
  addComment
);
router.post(
  "/reply",
  auth,
  reputationPrivilege(50),
  addReply
);
router.put("/comment/edit", editComment);
router.put("/reply/edit", editReply);
router.delete("/reply/delete", deleteReply);
router.delete("/comment/delete", deleteComment);
router.post("/bookmark", bookmarkPost);
router.post("/share", sharePost);
router.delete("/delete", deletePost);
router.put("/edit", auth, reputationPrivilege(100), editPost);
router.get("/saved/:userId", getSavedPosts);
router.get("/trending", getTrendingPosts);
export default router;