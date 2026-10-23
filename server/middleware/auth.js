import jwt from "jsonwebtoken";
import Session from "../models/session.js";

const auth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Authentication failed",
      });
    }

    const token = authHeader.split(" ")[1];

    const decodedata = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    console.log("Decoded Token:", decodedata);

    const inactivityMinutes =
      Number(process.env.SESSION_INACTIVITY_MINUTES) || 30;

    const inactivityLimit = new Date(
      Date.now() - inactivityMinutes * 60 * 1000
    );

    const isLogoutRequest =
      req.method === "PATCH" &&
      req.originalUrl.includes("/logout");

    const sessionQuery = {
      sessionId: decodedata?.sessionId,
      userId: decodedata?.id,
      isRevoked: false,
      expiresAt: { $gt: new Date() },
    };

    if (!isLogoutRequest) {
      sessionQuery.lastActivity = {
        $gt: inactivityLimit,
      };
    }

    console.log("Checking Session:", sessionQuery);

    const session = await Session.findOne(sessionQuery);

    console.log("Found Session:", session);

    if (!session) {
      return res.status(401).json({
        message: isLogoutRequest
          ? "Session expired or revoked"
          : "Session expired due to inactivity or was revoked",
      });
    }

    if (!isLogoutRequest) {
      session.lastActivity = new Date();
      await session.save();
    }

    req.userid = decodedata?.id;
    req.sessionId = decodedata?.sessionId;

    next();
  } catch (error) {
  console.log("AUTH MIDDLEWARE ERROR:", error.name);
  console.log("AUTH MIDDLEWARE MESSAGE:", error.message);

    return res.status(401).json({
      message: "Authentication failed",
    });
  }
};

export default auth;