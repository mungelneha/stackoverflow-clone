import Reputation from "../models/reputation.js";

export const getReputationHistory = async (req, res) => {
  try {
    const { userId } = req.params;

    const history = await Reputation.find({
      user: userId,
    })
      .populate("relatedUser", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: history.length,
      history,
    });
  } catch (error) {
    console.log("Reputation history error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch reputation history",
      error: error.message,
    });
  }
};