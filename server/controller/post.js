import Post from "../models/post.js";
import Notification from "../models/notification.js";
// Create Post
export const createPost = async (req, res) => {
  try {
    const { userId, userName, content, codeSnippet, hashtags } = req.body;
    const parsedHashtags = hashtags ? JSON.parse(hashtags) : [];
    let imageUrl = "";
    if (req.file) {
      imageUrl = req.file.path;
    }
    const image = req.file ? req.file.path : "";
    const newPost = await Post.create({
      userId,
      userName,
      content,
      image: imageUrl,
      codeSnippet,
      hashtags: parsedHashtags,
    });
    res.status(201).json({
      success: true,
      data: newPost,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

// Get All Posts with Pagination
export const getPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const totalPosts = await Post.countDocuments();
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    const totalPages = Math.ceil(totalPosts / limit);
    res.status(200).json({
      success: true,
      data: posts,
      pagination: {
        currentPage: page,
        limit,
        totalPosts,
        totalPages,
        hasMore: page < totalPages,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};
// Like / Unlike Post
export const likePost = async (req, res) => {
  try {
    const { postId, userId } = req.body;
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }
    const alreadyLiked = post.likes.includes(userId);
    if (alreadyLiked) {
      post.likes = post.likes.filter(
        (id) => id.toString() !== userId
      );
    } else {
      post.likes.push(userId);
      // Create Notification
      if (post.userId.toString() !== userId) {
        await Notification.create({
          receiver: post.userId,
          sender: userId,
          type: "like",
          postId: post._id,
        });
      }
    }
    await post.save();
    res.status(200).json({
      success: true,
      data: post,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};
export const addComment = async (req, res) => {
  try {
    const { postId, userId, userName, comment } = req.body;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    const newComment = {
      userId,
      userName,
      comment,
    };

    post.comments.push(newComment);

    await post.save();

    const latestComment = post.comments[post.comments.length - 1];
    
    // Create Notification
    if (post.userId.toString() !== userId) {
      await Notification.create({
        receiver: post.userId,
        sender: userId,
        type: "comment",
        postId: post._id,
        commentId: latestComment._id,
        comment: latestComment.comment,
      });
    }

    res.status(200).json({
      success: true,
      message: "Comment added successfully",
      data: post,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};
// Reply to Comment
export const addReply = async (req, res) => {
  try {
    const {
      postId,
      commentId,
      userId,
      userName,
      reply,
    } = req.body;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    const comment = post.comments.id(commentId);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    comment.replies.push({
      userId,
      userName,
      reply,
    });
    const latestReply = comment.replies[comment.replies.length - 1];

    // Create Reply Notification
    if (comment.userId.toString() !== userId) {
      await Notification.create({
        receiver: comment.userId,
        sender: userId,
        type: "reply",
        postId: post._id,
        commentId: comment._id,
        comment: latestReply.reply,
      });
    }
    await post.save();

    res.status(200).json({
      success: true,
      message: "Reply added successfully",
      data: post,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};
// Edit Reply
export const editReply = async (req, res) => {
  try {
    const {
      postId,
      commentId,
      replyId,
      userId,
      reply,
    } = req.body;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    const comment = post.comments.id(commentId);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    const selectedReply = comment.replies.id(replyId);

    if (!selectedReply) {
      return res.status(404).json({
        success: false,
        message: "Reply not found",
      });
    }

    if (selectedReply.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    selectedReply.reply = reply;
    selectedReply.updatedAt = new Date();

    await post.save();

    res.status(200).json({
      success: true,
      message: "Reply updated successfully",
      data: post,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};
// Delete Reply
export const deleteReply = async (req, res) => {
  try {
    const { postId, commentId, replyId, userId } = req.body;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    const comment = post.comments.id(commentId);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    const reply = comment.replies.id(replyId);

    if (!reply) {
      return res.status(404).json({
        success: false,
        message: "Reply not found",
      });
    }

    if (reply.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can delete only your own reply",
      });
    }

    reply.deleteOne();

    await post.save();

    res.status(200).json({
      success: true,
      message: "Reply deleted successfully",
      data: post,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};
export const editComment = async (req, res) => {
  try {
    const { postId, commentId, userId, comment } = req.body;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    const selectedComment = post.comments.id(commentId);

    if (!selectedComment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    if (selectedComment.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    selectedComment.comment = comment;
    selectedComment.updatedAt = new Date();

    await post.save();

    res.status(200).json({
      success: true,
      message: "Comment updated successfully",
      data: post,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};
export const deleteComment = async (req, res) => {
  try {
    const { postId, commentId, userId } = req.body;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    const comment = post.comments.id(commentId);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    if (comment.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    comment.deleteOne();

    await post.save();

    res.status(200).json({
      success: true,
      message: "Comment deleted successfully",
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};
export const bookmarkPost = async (req, res) => {
  try {
    const { postId, userId } = req.body;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    const alreadyBookmarked = post.bookmarks.includes(userId);

    if (alreadyBookmarked) {
      post.bookmarks = post.bookmarks.filter(
        (id) => id.toString() !== userId
      );
    } else {
      post.bookmarks.push(userId);
    }

    await post.save();

    res.status(200).json({
      success: true,
      data: post,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};
// Delete Post
export const deletePost = async (req, res) => {
  try {
    const { postId, userId } = req.body;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    // Only post owner can delete
    if (post.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "You can delete only your own posts",
      });
    }

    await Post.findByIdAndDelete(postId);

    res.status(200).json({
      success: true,
      message: "Post deleted successfully",
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};
// Edit Post
export const editPost = async (req, res) => {
  try {
    const {
      postId,
      userId,
      content,
      codeSnippet,
      hashtags,
    } = req.body;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    if (post.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    post.content = content;
    post.codeSnippet = codeSnippet;
    post.hashtags = hashtags;

    await post.save();

    res.status(200).json({
      success: true,
      message: "Post updated successfully",
      data: post,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};
// Get Saved Posts
export const getSavedPosts = async (req, res) => {
  try {
    const { userId } = req.params;

    const posts = await Post.find({
      bookmarks: userId,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: posts,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};
// Share Post
export const sharePost = async (req, res) => {
  try {
    const { postId, userId } = req.body;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    if (!post.shares.includes(userId)) {
      post.shares.push(userId);

      if (post.userId.toString() !== userId) {
        await Notification.create({
          receiver: post.userId,
          sender: userId,
          type: "share",
          postId: post._id,
        });
      }

      await post.save();
    }

    res.status(200).json({
      success: true,
      data: post,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};
// Get Trending Posts
export const getTrendingPosts = async (req, res) => {
  try {
    const posts = await Post.aggregate([
      {
        $addFields: {
          likeCount: { $size: { $ifNull: ["$likes", []] } },
          commentCount: { $size: { $ifNull: ["$comments", []] } },
          shareCount: { $size: { $ifNull: ["$shares", []] } },
        },
      },
      {
        $sort: {
          likeCount: -1,
          commentCount: -1,
          shareCount: -1,
          createdAt: -1,
        },
      },
      {
        $limit: 10,
      },
    ]);

    res.status(200).json({
      success: true,
      data: posts,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};