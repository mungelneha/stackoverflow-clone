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
  phone: {
    type: String,
    required: true,
    unique: true,
    sparse: true,
  },

  password: {
    type: String,
    required: true,
  },

  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },

  status: {
    type: String,
    enum: ["Active", "Blocked","Suspended"],
    default: "Active",
  },

  language: {
    type: String,
    enum: ["en", "es", "hi", "pt", "zh", "fr"],
    default: "en",
  },
  reputation: {
    type: Number,
    default: 0,
    min: 0,
  },

  profileCompleted: {
    type: Boolean,
    default: false,
  },

  profileCompletionRewardGiven: {
    type: Boolean,
    default: false,
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
  followers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    }
  ],
  following: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    }
  ],
  lastForgotPasswordRequest: {
    type: Date,
    default: null,
  },
  frenchOtp: {
    type: String,
    default: null,
  },

  frenchOtpExpires: {
    type: Date,
    default: null,
  },
  mobileOtp: {
    type: String,
    default: null,
  },

  mobileOtpExpires: {
    type: Date,
    default: null,
  },
});


export default mongoose.model("user", userschema);