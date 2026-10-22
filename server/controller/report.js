import Report from "../models/report.js";
import Post from "../models/post.js";

// Report Post
export const reportPost = async (req, res) => {
  try {
    const { postId, reporterId, reason } = req.body;

    if (!postId || !reporterId || !reason) {
      return res.status(400).json({
        success: false,
        message: "Post, user and reason are required",
      });
    }

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    // Check if user already reported this post
    const existingReport = await Report.findOne({
      postId,
      reporterId,
    });

    if (existingReport) {
      return res.status(400).json({
        success: false,
        message: "You have already reported this post",
      });
    }

    const report = await Report.create({
      postId,
      reporterId,
      reason,
    });

    res.status(201).json({
      success: true,
      message: "Post reported successfully",
      data: report,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

// Get All Reported Posts
export const getReports = async (req, res) => {
  try {
    const reports = await Report.find()
      .populate("postId")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: reports,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};