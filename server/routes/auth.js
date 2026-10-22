import express from "express";

import {
  getallusers,
  getAdminStats,
  Login,
  Signup,
  updateprofile,
  getUserById,
  forgotPassword,
  sendFrenchOtp,
  verifyFrenchOtp,
  sendMobileOtp,
  verifyMobileOtp,
  followUser,
  getFollowersFollowing,
  updateUserStatus,
  deleteUser,
  adminGetUserById,
  adminUpdateUser,
  toggleUserStatus,
  toggleSuspendUser,
  adminDeleteUser,
  getActiveSessions,
  revokeSession,
  Logout,
  verifyDeviceOTP,
  getAdminLoginActivity,
} from "../controller/auth.js";

import adminOnly from "../middleware/adminOnly.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.post("/signup", Signup);

router.post("/login", Login);

router.post("/verify-device-otp", verifyDeviceOTP);

router.post("/forgot-password", forgotPassword);

router.post("/send-french-otp", auth, sendFrenchOtp);

router.post("/verify-french-otp", auth, verifyFrenchOtp);

router.post("/send-mobile-otp", auth, sendMobileOtp);

router.post("/verify-mobile-otp", auth, verifyMobileOtp);

router.get("/getalluser", auth, getallusers);

router.get("/admin/stats", auth, adminOnly, getAdminStats);
router.get(
  "/admin/login-activity",auth, adminOnly, getAdminLoginActivity);

router.patch("/status/:id", auth, updateUserStatus);

router.delete("/delete/:id", auth, deleteUser);

router.get("/admin/:id", auth, adminOnly, adminGetUserById);

router.patch("/admin/:id", auth, adminOnly, adminUpdateUser);

router.patch(
  "/admin/:id/toggle-status",
  auth,
  adminOnly,
  toggleUserStatus
);

router.patch(
  "/admin/:id/toggle-suspend",
  auth,
  adminOnly,
  toggleSuspendUser
);

router.delete(
  "/admin/:id",
  auth,
  adminOnly,
  adminDeleteUser
);

// Active Sessions
router.get(
  "/sessions",
  auth,
  getActiveSessions
);

// Revoke Individual Session
router.patch(
  "/sessions/:sessionId/revoke",
  auth,
  revokeSession
);

router.patch(
  "/logout",
  Logout
);

router.patch(
  "/update/:id",
  auth,
  updateprofile
);

router.patch(
  "/follow",
  followUser
);

router.get(
  "/followers/:id",
  auth,
  getFollowersFollowing
);

// Dynamic user ID route - keep this near the bottom
router.get(
  "/:id",
  getUserById
);

export default router;