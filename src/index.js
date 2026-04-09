import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import { createApp } from "./app.js";
import { connectToDatabase } from "./config/db.js";
import { User } from "./models/User.js";

dotenv.config();

const PORT = Number(process.env.PORT || 5000);
const missingRazorpayEnvVars = ["RAZORPAY_KEY_ID", "RAZORPAY_KEY_SECRET"].filter((key) => !process.env[key]);
const defaultAdminEmail = (process.env.DEFAULT_ADMIN_EMAIL || "support@nookandnative.local").toLowerCase().trim();
const defaultAdminPassword = process.env.DEFAULT_ADMIN_PASSWORD || "vardaan@123";
const defaultAdminName = process.env.DEFAULT_ADMIN_NAME || "Nook and Native Admin";

async function ensureDefaultAdminUser() {
  if (!defaultAdminEmail || !defaultAdminPassword) {
    return;
  }

  const passwordHash = await bcrypt.hash(defaultAdminPassword, 10);
  const existingUser = await User.findOne({ email: defaultAdminEmail });

  if (!existingUser) {
    await User.create({
      name: defaultAdminName,
      email: defaultAdminEmail,
      phone: "",
      role: "admin",
      storeName: "",
      passwordHash
    });
    console.log(`Default admin created: ${defaultAdminEmail}`);
    return;
  }

  let changed = false;

  if (existingUser.role !== "admin") {
    existingUser.role = "admin";
    changed = true;
  }

  const passwordMatches = await bcrypt.compare(defaultAdminPassword, existingUser.passwordHash);
  if (!passwordMatches) {
    existingUser.passwordHash = passwordHash;
    changed = true;
  }

  if (!existingUser.name?.trim()) {
    existingUser.name = defaultAdminName;
    changed = true;
  }

  if (changed) {
    await existingUser.save();
    console.log(`Default admin updated: ${defaultAdminEmail}`);
  }
}

async function start() {
  await connectToDatabase();
  await ensureDefaultAdminUser();

  if (missingRazorpayEnvVars.length > 0) {
    console.warn(`Razorpay disabled. Missing ${missingRazorpayEnvVars.join(", ")} in server/.env.`);
  }

  const app = createApp();
  app.listen(PORT, () => {
    console.log(`Nook and Native server running on port ${PORT}`);
  });
}

start().catch((error) => {
  console.error("Server failed to start", error);
  process.exit(1);
});
