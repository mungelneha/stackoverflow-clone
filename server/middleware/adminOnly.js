import user from "../models/auth.js";

const adminOnly = async (req, res, next) => {
  try {
    const foundUser = await user.findById(req.userid);

    if (!foundUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (foundUser.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin access required",
      });
    }

    next();
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

export default adminOnly;