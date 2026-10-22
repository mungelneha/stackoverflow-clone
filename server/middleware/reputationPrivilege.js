import user from "../models/auth.js";

const reputationPrivilege = (requiredReputation) => {
  return async (req, res, next) => {
    try {
      const foundUser = await user.findById(req.userid);

      if (!foundUser) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      if (foundUser.reputation < requiredReputation) {
        return res.status(403).json({
          success: false,
          message: `You need at least ${requiredReputation} reputation to perform this action`,
          currentReputation: foundUser.reputation,
          requiredReputation,
        });
      }

      next();
    } catch (error) {
      console.log("Reputation privilege error:", error);

      return res.status(500).json({
        success: false,
        message: "Something went wrong",
      });
    }
  };
};

export default reputationPrivilege;