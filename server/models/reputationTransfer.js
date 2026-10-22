import mongoose from "mongoose";

const reputationTransferSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },

    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 1,
      max: 50,
    },

    reason: {
      type: String,
      required: true,
      trim: true,
    },

    transferredAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model(
  "ReputationTransfer",
  reputationTransferSchema
);