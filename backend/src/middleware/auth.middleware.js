import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Verify JWT Token
export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Not authorized, no token" });
    }

    const token = authHeader.replace("Bearer ", "");

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtError) {
      console.error("❌ JWT Verification Failed:", jwtError.message);
      return res.status(401).json({ error: "Not authorized, invalid token" });
    }

    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      console.error("❌ User Not Found in DB for ID:", decoded.id);
      return res.status(401).json({ error: "User not found" });
    }
    req.user = user;
    next();
  } catch (error) {
    console.error("❌ Auth Middleware Unexpected Error:", error);
    res.status(500).json({ error: "Internal auth error" });
  }
};

export const optionalProtect = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next();
  }

  const token = authHeader.replace("Bearer ", "");
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      console.warn(
        "⚠️ Optional auth token valid but user not found:",
        decoded.id,
      );
      return next();
    }

    req.user = user;
    next();
  } catch (error) {
    console.warn("⚠️ Optional auth token invalid:", error.message);
    next();
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Access denied. Required roles: ${roles.join(", ")}`,
      });
    }
    next();
  };
};
