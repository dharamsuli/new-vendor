import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import { sanitizeUser } from "../utils/auth.js";

export async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";

  if (!token) {
    return res.status(401).json({ message: "Authentication required." });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.sub);

    if (!user) {
      return res.status(401).json({ message: "User not found." });
    }

    req.user = sanitizeUser(user);
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "You do not have access to this resource." });
    }
    next();
  };
}
