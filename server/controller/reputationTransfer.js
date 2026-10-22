import mongoose from "mongoose";

import User from "../models/auth.js";
import Reputation from "../models/reputation.js";
import ReputationTransfer from "../models/reputationTransfer.js";

export const transferReputation = async (req, res) => {
  try {
    const { senderId, receiverId, amount, reason } = req.body;

    // Basic validation
    if (!senderId || !receiverId || !amount || !reason) {
      return res.status(400).json({
        success: false,
        message:
          "senderId, receiverId, amount and reason are required",
      });
    }

    // Validate ObjectIds
    if (
      !mongoose.Types.ObjectId.isValid(senderId) ||
      !mongoose.Types.ObjectId.isValid(receiverId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid sender or receiver ID",
      });
    }

    // Sender and receiver cannot be same
    if (String(senderId) === String(receiverId)) {
      return res.status(400).json({
        success: false,
        message: "Sender and receiver cannot be the same",
      });
    }

    const transferAmount = Number(amount);

    // Amount validation
    if (
      !Number.isInteger(transferAmount) ||
      transferAmount <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Transfer amount must be a positive number",
      });
    }

    // Maximum 50 per transaction
    if (transferAmount > 50) {
      return res.status(400).json({
        success: false,
        message: "You can transfer maximum 50 reputation per transaction",
      });
    }

    // Find users
    const sender = await User.findById(senderId);
    const receiver = await User.findById(receiverId);

    if (!sender) {
      return res.status(404).json({
        success: false,
        message: "Sender not found",
      });
    }

    if (!receiver) {
      return res.status(404).json({
        success: false,
        message: "Receiver not found",
      });
    }

    // Sender must have more than 50 reputation
    if (sender.reputation <= 50) {
      return res.status(403).json({
        success: false,
        message:
          "You need more than 50 reputation to transfer reputation",
        currentReputation: sender.reputation,
        requiredReputation: 51,
      });
    }

    // Sender must have enough reputation for transfer
    if (sender.reputation < transferAmount) {
      return res.status(400).json({
        success: false,
        message: "Insufficient reputation",
        currentReputation: sender.reputation,
        requestedAmount: transferAmount,
      });
    }

    // Calculate today's start and end
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    // Calculate today's total transferred reputation
    const todayTransfers = await ReputationTransfer.aggregate([
      {
        $match: {
          sender: sender._id,
          transferredAt: {
            $gte: startOfDay,
            $lte: endOfDay,
          },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
        },
      },
    ]);

    const transferredToday =
      todayTransfers.length > 0
        ? todayTransfers[0].total
        : 0;

    // Maximum 100 per day
    if (transferredToday + transferAmount > 100) {
      return res.status(400).json({
        success: false,
        message:
          "Daily reputation transfer limit of 100 has been exceeded",
        transferredToday,
        remainingToday: Math.max(0, 100 - transferredToday),
      });
    }

    // Deduct from sender
    sender.reputation -= transferAmount;
    await sender.save();

    // Add to receiver
    receiver.reputation += transferAmount;
    await receiver.save();

    // Save transfer history
    const transfer = await ReputationTransfer.create({
      sender: senderId,
      receiver: receiverId,
      amount: transferAmount,
      reason: reason.trim(),
    });

    // Sender reputation activity
    await Reputation.create({
      user: senderId,
      amount: transferAmount,
      type: "lost",
      reason: `Reputation transferred to another user: ${reason.trim()}`,
      source: "reputation_transfer_sent",
      relatedUser: receiverId,
    });

    // Receiver reputation activity
    await Reputation.create({
      user: receiverId,
      amount: transferAmount,
      type: "earned",
      reason: `Reputation received from another user: ${reason.trim()}`,
      source: "reputation_transfer_received",
      relatedUser: senderId,
    });

    res.status(200).json({
      success: true,
      message: "Reputation transferred successfully",
      transfer,
      senderReputation: sender.reputation,
      receiverReputation: receiver.reputation,
      transferredToday:
        transferredToday + transferAmount,
      remainingToday:
        100 - (transferredToday + transferAmount),
    });
  } catch (error) {
    console.log("Reputation transfer error:", error);

    res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};