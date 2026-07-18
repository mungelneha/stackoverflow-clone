import mongoose from "mongoose";

const subscriptionSchema = mongoose.Schema(
  {
    planName: {
      type: String,
      required: true,
      enum: ["Free", "Bronze", "Silver", "Gold"],
    },

    price: {
      type: Number,
      required: true,
    },

    duration: {
      type: Number,
      default: 30,
    },

    questionLimit: {
      type: Number,
      required: true,
    },

    badge: {
      type: String,
      default: "",
    },

    features: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Subscription", subscriptionSchema);