import mongoose from "mongoose";

const reputationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    type: {
      type: String,
      enum: ["earned", "lost"],
      required: true,
    },

    reason: {
      type: String,
      required: true,
    },

    source: {
      type: String,
      enum: [
        "answer_posted",
        "answer_accepted",
        "answer_5_upvotes",
        "question_10_upvotes",
        "profile_completed",
        "downvote",
        "answer_deleted",
        "admin_removed",
        "reputation_transfer_sent",
        "reputation_transfer_received",
      ],
      required: true,
    },

    relatedUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      default: null,
    },

    relatedContent: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("reputation", reputationSchema);