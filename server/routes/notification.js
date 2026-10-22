import express from "express";

import {
  getNotifications,
  markAsRead,
} from "../controller/notification.js";

const router = express.Router();

// Get all notifications of a user
router.get("/:userId", getNotifications);

// Mark notification as read
router.put("/read/:id", markAsRead);

export default router;