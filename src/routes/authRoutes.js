import express from "express";
import bcrypt from "bcryptjs";
import { User } from "../models/User.js";
import { signToken, sanitizeUser } from "../utils/auth.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const { name, email, password, phone, role, storeName } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required." });
    }

    if (!["customer", "vendor"].includes(role)) {
      return res.status(400).json({ message: "Role must be customer or vendor." });
    }

    if (role === "vendor" && !storeName?.trim()) {
      return res.status(400).json({ message: "Vendor store name is required." });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(409).json({ message: "An account with this email already exists." });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone?.trim() || "",
      role,
      storeName: role === "vendor" ? storeName.trim() : "",
      passwordHash
    });

    const token = signToken(user);

    return res.status(201).json({
      token,
      user: sanitizeUser(user)
    });
  } catch (error) {
    return res.status(500).json({ message: "Unable to create account." });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const token = signToken(user);

    return res.json({
      token,
      user: sanitizeUser(user)
    });
  } catch (error) {
    return res.status(500).json({ message: "Unable to log in." });
  }
});

router.get("/me", requireAuth, async (req, res) => {
  return res.json({ user: req.user });
});

export default router;
