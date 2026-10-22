
import user from "../models/auth.js";
import Reputation from "../models/reputation.js";

// Add reputation
export const addReputation = async (req, res) => {
  try {
    const { userId, amount, reason, source, relatedUser, relatedContent } =
      req.body;

    if (!userId || !amount || !reason || !source) {
      return res.status(400).json({
        message: "userId, amount, reason and source are required",
      });
    }

    const existingUser = await user.findById(userId);

    if (!existingUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    existingUser.reputation += Number(amount);

    await existingUser.save();

    const reputationActivity = await Reputation.create({
      user: userId,
      amount: Number(amount),
      type: "earned",
      reason,
      source,
      relatedUser: relatedUser || null,
      relatedContent: relatedContent || null,
    });

    return res.status(200).json({
      message: "Reputation added successfully",
      reputation: existingUser.reputation,
      activity: reputationActivity,
    });
  } catch (error) {
    console.error("Add reputation error:", error);

    return res.status(500).json({
      message: "Failed to add reputation",
      error: error.message,
    });
  }
};

// Deduct reputation
export const deductReputation = async (req, res) => {
  try {
    const { userId, amount, reason, source, relatedUser, relatedContent } =
      req.body;

    if (!userId || !amount || !reason || !source) {
      return res.status(400).json({
        message: "userId, amount, reason and source are required",
      });
    }

    const existingUser = await user.findById(userId);

    if (!existingUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    existingUser.reputation = Math.max(
      0,
      existingUser.reputation - Number(amount)
    );

    await existingUser.save();

    const reputationActivity = await Reputation.create({
      user: userId,
      amount: Number(amount),
      type: "lost",
      reason,
      source,
      relatedUser: relatedUser || null,
      relatedContent: relatedContent || null,
    });

    return res.status(200).json({
      message: "Reputation deducted successfully",
      reputation: existingUser.reputation,
      activity: reputationActivity,
    });
  } catch (error) {
    console.error("Deduct reputation error:", error);

    return res.status(500).json({
      message: "Failed to deduct reputation",
      error: error.message,
    });
  }
};