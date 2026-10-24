import mongoose from "mongoose";
import user from "../models/auth.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import Notification from "../models/notification.js";
import { UAParser } from "ua-parser-js";
import Session from "../models/session.js";
import crypto from "crypto";
import DeviceVerification from "../models/deviceVerification.js";
import axios from "axios";
import Reputation from "../models/reputation.js";

dotenv.config();

const sendBrevoEmail = async ({
  to,
  subject,
  html,
  text,
}) => {
  const payload = {
    sender: {
      name: process.env.BREVO_SENDER_NAME,
      email: process.env.BREVO_SENDER_EMAIL,
    },
    to: [{ email: to }],
    subject,
  };

  if (html) payload.htmlContent = html;
  if (text) payload.textContent = text;

  const response = await axios.post(
    "https://api.brevo.com/v3/smtp/email",
    payload,
    {
      headers: {
        "api-key": process.env.BREVO_API_KEY,
        "Content-Type": "application/json",
        accept: "application/json",
      },
    }
  );

  return response.data;
};

/* ================================
   LOGIN LOCATION HELPER
================================ */

const getLoginLocation = async (ipAddress) => {
  try {
    if (
      !ipAddress ||
      ipAddress === "Unknown" ||
      ipAddress === "::1" ||
      ipAddress === "127.0.0.1" ||
      ipAddress === "localhost" ||
      ipAddress.startsWith("::ffff:127.") ||
      ipAddress.startsWith("192.168.") ||
      ipAddress.startsWith("10.") ||
      ipAddress.startsWith("172.16.") ||
      ipAddress.startsWith("172.17.") ||
      ipAddress.startsWith("172.18.") ||
      ipAddress.startsWith("172.19.") ||
      ipAddress.startsWith("172.20.") ||
      ipAddress.startsWith("172.21.") ||
      ipAddress.startsWith("172.22.") ||
      ipAddress.startsWith("172.23.") ||
      ipAddress.startsWith("172.24.") ||
      ipAddress.startsWith("172.25.") ||
      ipAddress.startsWith("172.26.") ||
      ipAddress.startsWith("172.27.") ||
      ipAddress.startsWith("172.28.") ||
      ipAddress.startsWith("172.29.") ||
      ipAddress.startsWith("172.30.") ||
      ipAddress.startsWith("172.31.")
    ) {
      return "Unknown";
    }

    const geoResponse = await axios.get(
      `https://ipapi.co/${ipAddress}/json/`,
      {
        timeout: 5000,
      }
    );

    const city = geoResponse.data?.city;
    const country = geoResponse.data?.country_name;

    if (city && country) {
      return `${city}, ${country}`;
    }

    if (country) {
      return country;
    }

    return "Unknown";
  } catch (error) {
    console.log("Location Error:", error.message);

    return "Unknown";
  }
};
/* ================================
   NEW DEVICE LOGIN NOTIFICATION
================================ */

const sendNewDeviceLoginNotification = async ({
  email,
  name,
  browser,
  operatingSystem,
  deviceType,
  ipAddress,
  location,
  loginTime,
}) => {
  try {
    await sendBrevoEmail({
      to: email,
      subject: "New Device Login Alert",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          
          <h2 style="color: #2563eb;">
            New Device Login Successful
          </h2>

          <p>
            Hello ${name || "User"},
          </p>

          <p>
            Your account was successfully logged in from a new device.
          </p>

          <p>
            <b>Browser:</b> ${browser}
          </p>

          <p>
            <b>Operating System:</b> ${operatingSystem}
          </p>

          <p>
            <b>Device:</b> ${deviceType}
          </p>

          <p>
            <b>IP Address:</b> ${ipAddress}
          </p>

          <p>
            <b>Location:</b> ${location}
          </p>

          <p>
            <b>Login Time:</b> ${loginTime.toLocaleString()}
          </p>

          <hr />

          <p style="color: #555;">
            If you do not recognize this login, please secure your account
            and revoke the session from your Active Sessions.
          </p>

        </div>
      `,
    });

    console.log(
      "New device login notification email sent successfully"
    );
  } catch (error) {
    console.log(
      "New device notification email error:",
      error.message
    );
  }
};

/* ================================
   GENERATE PASSWORD
================================ */

const generatePassword = () => {
  const letters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

  let password = "";

  for (let i = 0; i < 8; i++) {
    password += letters.charAt(
      Math.floor(Math.random() * letters.length)
    );
  }

  return password;
};

/* ================================
   SIGNUP
================================ */

export const Signup = async (req, res) => {
  const { name, email, phone, password } = req.body;

  try {
    const exisitinguser = await user.findOne({
      $or: [{ email }, { phone }],
    });

    console.log(req.body);
    console.log(exisitinguser);

    if (exisitinguser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const hashpassword = await bcrypt.hash(password, 12);

    const newuser = await user.create({
      name,
      email,
      phone,
      password: hashpassword,
    });

    const sessionId = crypto.randomUUID();

    const deviceId = crypto.randomUUID();

    const ipAddress =
      req.headers["x-forwarded-for"]?.split(",")[0] ||
      req.socket.remoteAddress ||
      "Unknown";

    const location = await getLoginLocation(ipAddress);

    const token = jwt.sign(
      {
        email: newuser.email,
        id: newuser._id,
        sessionId,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );

    await Session.create({
      userId: newuser._id,
      sessionId,
      deviceId,
      browser: "Unknown",
      operatingSystem: "Unknown",
      deviceType: "Unknown",
      ipAddress,
      location,
      isTrusted: true,
      trustedDeviceId: deviceId,
      loginTime: new Date(),
      lastActivity: new Date(),
      expiresAt: new Date(
        Date.now() + 60 * 60 * 1000
      ),
    });

    res.status(200).json({
      data: newuser,
      token,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Something went wrong",
    });
  }
};

/* ================================
   LOGIN
================================ */

export const Login = async (req, res) => {
  const { email, password, deviceId } = req.body;

  try {
    const exisitinguser = await user.findOne({ email });

    if (!exisitinguser) {
      return res.status(404).json({
        success: false,
        message: "User does not exist",
      });
    }

    const ispasswordcrct = await bcrypt.compare(
      password,
      exisitinguser.password
    );

    if (!ispasswordcrct) {
      return res.status(400).json({
        success: false,
        message: "Invalid password",
      });
    }

    if (!deviceId) {
      return res.status(400).json({
        success: false,
        message: "Device ID is required",
      });
    }

    const parser = new UAParser(
      req.headers["user-agent"]
    );

    const deviceInfo = parser.getResult();

    const browser =
      deviceInfo.browser.name || "Unknown";

    const operatingSystem =
      deviceInfo.os.name || "Unknown";

    let deviceType = "Unknown";

    if (deviceInfo.device.type === "mobile") {
      deviceType = "Mobile";
    } else if (deviceInfo.device.type === "tablet") {
      deviceType = "Tablet";
    } else if (
      deviceInfo.device.type === undefined
    ) {
      deviceType = "Desktop";
    }

    const ipAddress =
      req.headers["x-forwarded-for"]?.split(",")[0] ||
      req.socket.remoteAddress ||
      "Unknown";

    const location = await getLoginLocation(ipAddress);

    const trustedDevice = await Session.findOne({
      userId: exisitinguser._id,
      deviceId,
      isTrusted: true,
    });

    const isNewDevice = !trustedDevice;

    console.log("--------------------------------");
    console.log("Device ID:", deviceId);
    console.log("Browser:", browser);
    console.log("Operating System:", operatingSystem);
    console.log("Device Type:", deviceType);
    console.log("IP Address:", ipAddress);
    console.log("Location:", location);
    console.log("Is New Device:", isNewDevice);
    console.log("--------------------------------");

    /* ================================
       NEW DEVICE OTP
    ================================= */

    if (isNewDevice) {
      const otp = Math.floor(
        100000 + Math.random() * 900000
      ).toString();

      const otpHash = crypto
        .createHash("sha256")
        .update(otp)
        .digest("hex");

      const verificationId = crypto.randomUUID();

      await DeviceVerification.deleteMany({
        userId: exisitinguser._id,
        deviceId,
      });

      await DeviceVerification.create({
        userId: exisitinguser._id,
        verificationId,
        deviceId,
        otpHash,
        expiresAt: new Date(
          Date.now() + 10 * 60 * 1000
        ),
        browser,
        operatingSystem,
        deviceType,
        ipAddress,
        attempts: 0,
      });

      await sendBrevoEmail({
        to: exisitinguser.email,
        subject: "New Device Login Verification",
        html: `
          <div style="font-family: Arial, sans-serif;">
            <h2>New Device Login</h2>

            <p>
              Hello ${exisitinguser.name || "User"},
            </p>

            <p>
              We detected a login attempt from a new device.
            </p>

            <p>
              <b>Browser:</b> ${browser}
            </p>

            <p>
              <b>Operating System:</b> ${operatingSystem}
            </p>

            <p>
              <b>Device:</b> ${deviceType}
            </p>

            <p>
              <b>IP Address:</b> ${ipAddress}
            </p>

            <p>
              Your verification OTP is:
            </p>

            <h1
              style="
                letter-spacing: 5px;
                color: #2563eb;
              "
            >
              ${otp}
            </h1>

            <p>
              This OTP will expire in 10 minutes.
            </p>

            <p>
              If you did not try to login,
              please secure your account immediately.
            </p>
          </div>
        `,
      });

      return res.status(200).json({
        success: true,
        requiresDeviceVerification: true,
        verificationId,
        message:
          "New device detected. OTP sent to your email.",
      });
    }

    /* ================================
       CREATE NORMAL SESSION
    ================================= */

    const sessionId = crypto.randomUUID();

    const token = jwt.sign(
      {
        email: exisitinguser.email,
        id: exisitinguser._id,
        sessionId,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );

    await Session.create({
      userId: exisitinguser._id,
      sessionId,
      deviceId,
      browser,
      operatingSystem,
      deviceType,
      ipAddress,
      location,
      isTrusted: true,
      trustedDeviceId: deviceId,
      loginTime: new Date(),
      lastActivity: new Date(),
      expiresAt: new Date(
        Date.now() + 60 * 60 * 1000
      ),
    });

    return res.status(200).json({
      success: true,
      data: exisitinguser,
      token,
      isNewDevice: false,
    });
  } catch (error) {
    console.log("Login Error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong during login",
    });
  }
};

/* ================================
   GET ALL USERS
================================ */

export const getallusers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const skip = (page - 1) * limit;

    const totalUsers = await user.countDocuments();

    const allusers = await user
      .find()
      .select("-password")
      .skip(skip)
      .limit(limit);

    const totalPages = Math.ceil(totalUsers / limit);

    res.status(200).json({
      success: true,
      data: allusers,
      pagination: {
        currentPage: page,
        totalPages,
        totalUsers,
        limit,
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

/* ================================
   ADMIN STATS
================================ */

export const getAdminStats = async (req, res) => {
  try {
    const totalUsers = await user.countDocuments({
      role: "user",
    });

    const activeUsers = await user.countDocuments({
      role: "user",
      status: "Active",
    });

    const blockedUsers = await user.countDocuments({
      role: "user",
      status: "Blocked",
    });

    const premiumUsers = await user.countDocuments({
      role: "user",
      "subscription.plan": {
        $in: ["Bronze", "Silver", "Gold"],
      },
    });

    const totalAdmins = await user.countDocuments({
      role: "admin",
    });

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        activeUsers,
        blockedUsers,
        premiumUsers,
        totalAdmins,
      },
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch admin statistics",
    });
  }
};

/* ================================
   UPDATE PROFILE
================================ */

export const updateprofile = async (req, res) => {
  const { id: _id } = req.params;
  const { name, about, tags, language } = req.body.editForm || {};

  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(400).json({
      message: "User unavailable",
    });
  }

  try {
    const existingUser = await user.findById(_id);

    if (!existingUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (name !== undefined) {
      existingUser.name = name;
    }

    if (about !== undefined) {
      existingUser.about = about;
    }

    if (tags !== undefined) {
      existingUser.tags = tags;
    }

    if (language !== undefined) {
      existingUser.language = language;
    }

    // Check mandatory profile details
    const isProfileComplete =
      typeof existingUser.name === "string" &&
      existingUser.name.trim() !== "" &&
      typeof existingUser.about === "string" &&
      existingUser.about.trim() !== "" &&
      Array.isArray(existingUser.tags) &&
      existingUser.tags.length > 0 &&
      typeof existingUser.language === "string" &&
      existingUser.language.trim() !== "";
    if (isProfileComplete) {
      existingUser.profileCompleted = true;
    }

    // Give +10 reputation only once
    if (
      isProfileComplete &&
      existingUser.profileCompletionRewardGiven === false
    ) {
      existingUser.reputation += 10;
      existingUser.profileCompletionRewardGiven = true;

      await Reputation.create({
        user: existingUser._id,
        amount: 10,
        type: "earned",
        reason: "Mandatory profile details completed",
        source: "profile_completed",
      });
    }

    await existingUser.save();

    res.status(200).json({
      message: isProfileComplete
        ? "Profile updated successfully"
        : "Profile updated successfully. Complete all mandatory details to earn 10 reputation.",
      data: existingUser,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Something went wrong",
    });
  }
};

/* ================================
   FORGOT PASSWORD
================================ */

export const forgotPassword = async (req, res) => {
  try {
    const { email, phone } = req.body;

    let existingUser;

    if (email) {
      existingUser = await user.findOne({ email });
    } else if (phone) {
      existingUser = await user.findOne({ phone });
    }

    if (!existingUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const today = new Date();

    if (
      existingUser.lastForgotPasswordRequest &&
      today.toDateString() ===
        new Date(
          existingUser.lastForgotPasswordRequest
        ).toDateString()
    ) {
      return res.status(400).json({
        message:
          "You can use this option only one time per day.",
      });
    }

    const newPassword = generatePassword();

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    existingUser.password = hashedPassword;
    existingUser.lastForgotPasswordRequest = today;

    await existingUser.save();

    const savedUser = await user.findById(existingUser._id);

    const passwordMatches = await bcrypt.compare(
      newPassword,
      savedUser.password
    );

    console.log("Password reset saved correctly:", passwordMatches);

    await sendBrevoEmail({
      to: existingUser.email,
      subject: "Password Reset",
      text: `Your new password is: ${newPassword}`,
    });

    return res.status(200).json({
      message: "New password sent to your phone or email.",
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Something went wrong",
    });
  }
};

/* ================================
   GET USER BY ID
================================ */

export const getUserById = async (req, res) => {
  try {
    const foundUser = await user.findById(
      req.params.id
    );

    if (!foundUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      data: foundUser,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

/* ================================
   FOLLOW USER
================================ */

export const followUser = async (req, res) => {
  try {
    const { currentUserId, targetUserId } =
      req.body;

    if (currentUserId === targetUserId) {
      return res.status(400).json({
        success: false,
        message: "You cannot follow yourself",
      });
    }

    const currentUser = await user.findById(
      currentUserId
    );

    const targetUser = await user.findById(
      targetUserId
    );

    if (!currentUser || !targetUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const isFollowing =
      currentUser.following.includes(targetUserId);

    if (isFollowing) {
      currentUser.following =
        currentUser.following.filter(
          (id) =>
            id.toString() !== targetUserId
        );

      targetUser.followers =
        targetUser.followers.filter(
          (id) =>
            id.toString() !== currentUserId
        );
    } else {
      currentUser.following.push(targetUserId);

      targetUser.followers.push(currentUserId);

      await Notification.create({
        receiver: targetUserId,
        sender: currentUserId,
        type: "follow",
      });
    }

    console.log(
      "Current Phone:",
      currentUser.phone
    );

    console.log(
      "Target Phone:",
      targetUser.phone
    );

    console.log(
      "Current User ID:",
      currentUser._id
    );

    console.log(
      "Target User ID:",
      targetUser._id
    );

    await currentUser.save();
    await targetUser.save();

    res.status(200).json({
      success: true,
      message: isFollowing
        ? "Unfollowed"
        : "Followed",
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

/* ================================
   GET FOLLOWERS / FOLLOWING
================================ */

export const getFollowersFollowing = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    const foundUser = await user
      .findById(id)
      .populate("followers", "name email")
      .populate("following", "name email");

    if (!foundUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      followers: foundUser.followers,
      following: foundUser.following,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

/* ================================
   UPDATE USER STATUS
================================ */

export const updateUserStatus = async (
  req,
  res
) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    if (
      !["Active", "Inactive"].includes(status)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    const updatedUser =
      await user.findByIdAndUpdate(
        id,
        { $set: { status } },
        { new: true }
      );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: `User ${status.toLowerCase()} successfully`,
      data: updatedUser,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

/* ================================
   DELETE USER
================================ */

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    const deletedUser =
      await user.findByIdAndDelete(id);

    if (!deletedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User deleted successfully",
      data: deletedUser,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

/* ================================
   ADMIN GET USER BY ID
================================ */

export const adminGetUserById = async (
  req,
  res
) => {
  try {
    const foundUser = await user
      .findById(req.params.id)
      .select("-password");

    if (!foundUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      data: foundUser,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

/* ================================
   ADMIN UPDATE USER
================================ */


/* ================================
   ADMIN UPDATE USER
================================ */

export const adminUpdateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, role, status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    const foundUser = await user.findById(id);

    if (!foundUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Validate role
    if (
      role !== undefined &&
      !["user", "admin"].includes(role)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid role",
      });
    }

    // Prevent changing your own role
    const currentUserId = req.userid?.toString();
    const targetUserId = foundUser._id.toString();

    if (
      role !== undefined &&
      currentUserId &&
      currentUserId === targetUserId
    ) {
      return res.status(403).json({
        success: false,
        message: "You cannot change your own role",
      });
    }

    // Prevent removing the last admin
    if (role === "user" && foundUser.role === "admin") {
      const adminCount = await user.countDocuments({
        role: "admin",
      });

      if (adminCount <= 1) {
        return res.status(400).json({
          success: false,
          message: "Cannot remove the last admin",
        });
      }
    }

    // Update user details
    foundUser.name = name ?? foundUser.name;
    foundUser.email = email ?? foundUser.email;
    foundUser.phone = phone ?? foundUser.phone;
    foundUser.role = role ?? foundUser.role;
    foundUser.status = status ?? foundUser.status;

    const updatedUser = await foundUser.save();

    return res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    console.error("Admin Update User Error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};


/* ================================
   BLOCK / ACTIVATE USER
================================ */

export const toggleUserStatus = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    const foundUser = await user.findById(id);

    if (!foundUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    foundUser.status =
      foundUser.status === "Active"
        ? "Blocked"
        : "Active";

    await foundUser.save();

    res.status(200).json({
      success: true,
      message:
        foundUser.status === "Active"
          ? "User activated successfully"
          : "User blocked successfully",
      data: foundUser,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

/* ================================
   SUSPEND / UNSUSPEND USER
================================ */

export const toggleSuspendUser = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    const foundUser = await user.findById(id);

    if (!foundUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (foundUser.role === "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin user cannot be suspended",
      });
    }

    foundUser.status =
      foundUser.status === "Suspended"
        ? "Active"
        : "Suspended";

    await foundUser.save();

    res.status(200).json({
      success: true,
      message:
        foundUser.status === "Suspended"
          ? "User suspended successfully"
          : "User unsuspended successfully",
      data: foundUser,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

/* ================================
   ADMIN DELETE USER
================================ */

export const adminDeleteUser = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    const foundUser = await user.findById(id);

    if (!foundUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (foundUser.role === "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin user cannot be deleted",
      });
    }

    await user.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

/* ================================
   SEND FRENCH OTP
================================ */

export const sendFrenchOtp = async (
  req,
  res
) => {
  try {
    const userId = req.userid;

    const existingUser =
      await user.findById(userId);

    if (!existingUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const otp = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    existingUser.frenchOtp = otp;

    existingUser.frenchOtpExpires =
      new Date(
        Date.now() + 5 * 60 * 1000
      );

    await existingUser.save();

    await sendBrevoEmail({
      to: existingUser.email,
      subject:
        "French Language Verification OTP",
      text: `Your OTP for selecting French language is: ${otp}. This OTP is valid for 5 minutes.`,
    });

    return res.status(200).json({
      success: true,
      message:
        "OTP sent to your registered email.",
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Failed to send OTP",
    });
  }
};

/* ================================
   VERIFY FRENCH OTP
================================ */

export const verifyFrenchOtp = async (
  req,
  res
) => {
  try {
    const userId = req.userid;
    const { otp } = req.body;

    const existingUser =
      await user.findById(userId);

    if (!existingUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (
      !existingUser.frenchOtp ||
      !existingUser.frenchOtpExpires
    ) {
      return res.status(400).json({
        message:
          "OTP not found. Please request a new OTP.",
      });
    }

    if (
      new Date() >
      existingUser.frenchOtpExpires
    ) {
      return res.status(400).json({
        message:
          "OTP expired. Please request a new OTP.",
      });
    }

    if (existingUser.frenchOtp !== otp) {
      return res.status(400).json({
        message: "Invalid OTP",
      });
    }

    existingUser.language = "fr";
    existingUser.frenchOtp = null;
    existingUser.frenchOtpExpires = null;

    await existingUser.save();

    return res.status(200).json({
      success: true,
      message:
        "French language verified successfully.",
      data: existingUser,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

/* ================================
   SEND MOBILE OTP
================================ */

export const sendMobileOtp = async (
  req,
  res
) => {
  try {
    const userId = req.userid;
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: "Mobile number is required",
      });
    }

    const existingUser =
      await user.findById(userId);

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const otp = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    existingUser.mobileOtp = otp;

    existingUser.mobileOtpExpires =
      new Date(
        Date.now() + 5 * 60 * 1000
      );

    await existingUser.save();

    console.log(
      "================================="
    );

    console.log("📱 DEMO MOBILE OTP");
    console.log("Phone:", phone);
    console.log("OTP:", otp);

    console.log(
      "================================="
    );

    return res.status(200).json({
      success: true,
      message:
        "Demo OTP generated successfully",
      demoOtp: otp,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message:
        "Failed to generate OTP",
    });
  }
};

/* ================================
   VERIFY MOBILE OTP
================================ */

export const verifyMobileOtp = async (
  req,
  res
) => {
  try {
    const userId = req.userid;
    const { otp } = req.body;

    const existingUser =
      await user.findById(userId);

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (
      !existingUser.mobileOtp ||
      !existingUser.mobileOtpExpires
    ) {
      return res.status(400).json({
        success: false,
        message:
          "OTP not found. Please request a new OTP.",
      });
    }

    if (
      new Date() >
      existingUser.mobileOtpExpires
    ) {
      return res.status(400).json({
        success: false,
        message:
          "OTP expired. Please request a new OTP.",
      });
    }

    if (existingUser.mobileOtp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    existingUser.mobileOtp = null;
    existingUser.mobileOtpExpires = null;

    await existingUser.save();

    return res.status(200).json({
      success: true,
      message:
        "Mobile OTP verified successfully",
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

/* ================================
   ACTIVE SESSIONS
================================ */

export const getActiveSessions = async (
  req,
  res
) => {
  try {
    const sessions = await Session.find({
      userId: req.userid,
      isRevoked: false,
      expiresAt: { $gt: new Date() },
    }).sort({ lastActivity: -1 });

    return res.status(200).json({
      success: true,
      data: sessions,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch active sessions",
    });
  }
};

/* ================================
   REVOKE SESSION
================================ */

export const revokeSession = async (
  req,
  res
) => {
  try {
    const { sessionId } = req.params;

    const session = await Session.findOne({
      sessionId,
      userId: req.userid,
      isRevoked: false,
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found",
      });
    }

    session.isRevoked = true;
    session.revokedAt = new Date();

    await session.save();

    return res.status(200).json({
      success: true,
      message:
        "Session revoked successfully",
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message:
        "Failed to revoke session",
    });
  }
};

/* ================================
   LOGOUT
================================ */

export const Logout = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(200).json({
        success: true,
        message: "Logged out successfully",
      });
    }

    const token = authHeader.split(" ")[1];

    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET
      );

      const session = await Session.findOne({
        sessionId: decoded.sessionId,
        userId: decoded.id,
        isRevoked: false,
      });

      if (session) {
        session.isRevoked = true;
        session.revokedAt = new Date();
        await session.save();
      }
    } catch (tokenError) {
      console.log("Logout token expired/invalid");
    }

    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });

  } catch (error) {
    console.log("Logout Error:", error);

    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  }
};

/* ================================
   VERIFY DEVICE OTP
================================ */

export const verifyDeviceOTP = async (
  req,
  res
) => {
  try {
    console.log(
      "================================"
    );

    console.log(
      "VERIFY DEVICE OTP API CALLED"
    );

    console.log("BODY:", req.body);

    console.log(
      "================================"
    );

    const { verificationId, otp } = req.body;

    if (!verificationId || !otp) {
      return res.status(400).json({
        success: false,
        message:
          "Verification ID and OTP are required",
      });
    }

    const verification =
      await DeviceVerification.findOne({
        verificationId,
      });

    console.log(
      "Verification Record:",
      verification
    );

    if (!verification) {
      return res.status(404).json({
        success: false,
        message:
          "Verification request not found",
      });
    }

    if (
      verification.expiresAt < new Date()
    ) {
      await DeviceVerification.deleteOne({
        verificationId,
      });

      return res.status(400).json({
        success: false,
        message: "OTP has expired",
      });
    }

    if (verification.attempts >= 5) {
      return res.status(400).json({
        success: false,
        message:
          "Too many OTP attempts",
      });
    }

    const otpHash = crypto
      .createHash("sha256")
      .update(otp.toString())
      .digest("hex");

    console.log("Entered OTP:", otp);
    console.log(
      "Generated Hash:",
      otpHash
    );
    console.log(
      "Stored Hash:",
      verification.otpHash
    );

    if (
      otpHash !== verification.otpHash
    ) {
      verification.attempts += 1;

      await verification.save();

      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    console.log("OTP MATCHED");

    const existingUser =
      await user.findById(
        verification.userId
      );

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const location =
      await getLoginLocation(
        verification.ipAddress
      );

    const sessionId = crypto.randomUUID();
    const loginTime = new Date();

    await Session.create({
      userId: verification.userId,
      sessionId,
      deviceId: verification.deviceId,
      browser: verification.browser,
      operatingSystem:
        verification.operatingSystem,
      deviceType:
        verification.deviceType,
      ipAddress:
        verification.ipAddress,
      location,
      isTrusted: true,
      trustedDeviceId:
        verification.deviceId,
      loginTime,
      lastActivity: loginTime,
      expiresAt: new Date(
        Date.now() + 60 * 60 * 1000
      ),
    });

    await sendNewDeviceLoginNotification({
      email: existingUser.email,
      name: existingUser.name,
      browser: verification.browser,
      operatingSystem: verification.operatingSystem,
      deviceType: verification.deviceType,
      ipAddress: verification.ipAddress,
      location,
      loginTime,
    });

    const token = jwt.sign(
      {
        email: existingUser.email,
        id: existingUser._id,
        sessionId,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );

    await DeviceVerification.deleteOne({
      verificationId,
    });

    console.log(
      "SESSION CREATED:",
      sessionId
    );

    console.log(
      "DEVICE VERIFIED SUCCESSFULLY"
    );

    return res.status(200).json({
      success: true,
      message:
        "Device verified successfully",
      data: existingUser,
      token,
    });
  } catch (error) {
    console.error(
      "VERIFY DEVICE OTP ERROR:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "OTP verification failed",
    });
  }
};
export const getAdminLoginActivity = async (req, res) => {
  try {
    const sessions = await Session.find({})
      .populate("userId", "name email")
      .sort({ loginTime: -1 });

    return res.status(200).json({
      success: true,
      data: sessions,
    });
  } catch (error) {
    console.log("Admin Login Activity Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch login activity",
    });
  }
};