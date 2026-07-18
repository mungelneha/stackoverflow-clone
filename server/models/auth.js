import mongoose from "mongoose";

const userschema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },

  email: {
    type: String,
    required: true,
  },

  password: {
    type: String,
    required: true,
  },

  about: {
    type: String,
    default: "",
  },

  tags: {
    type: [String],
    default: [],
  },

  joinDate: {
    type: Date,
    default: Date.now,
  },

  // Subscription Details
  subscription: {
    plan: {
      type: String,
      default: "Free",
    },

    status: {
      type: String,
      enum: ["Active", "Expired", "Cancelled"],
      default: "Active",
    },

    badge: {
      type: String,
      default: "Free",
    },

    startDate: {
      type: Date,
      default: Date.now,
    },

    renewalDate: {
      type: Date,
      default: () => {
        const date = new Date();
        date.setDate(date.getDate() + 30);
        return date;
      },
    },
  },
});

export default mongoose.model("user", userschema);