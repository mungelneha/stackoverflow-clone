import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },

    planName: {
      type: String,
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    stripeSessionId: {
      type: String,
      required: true,
    },

    paymentStatus: {
      type: String,
      default: "Paid",
    },

    paymentDate: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Payment", paymentSchema);