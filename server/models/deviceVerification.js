import mongoose from "mongoose";

const deviceVerificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },

    verificationId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    deviceId: {
      type: String,
      required: true,
    },

    otpHash: {
      type: String,
      required: true,
    },

    expiresAt: {
      type: Date,
      required: true,
    },

    attempts: {
      type: Number,
      default: 0,
    },

    browser: {
      type: String,
      default: "Unknown",
    },

    operatingSystem: {
      type: String,
      default: "Unknown",
    },

    deviceType: {
      type: String,
      default: "Unknown",
    },

    ipAddress: {
      type: String,
      default: "Unknown",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model(
  "DeviceVerification",
  deviceVerificationSchema
);