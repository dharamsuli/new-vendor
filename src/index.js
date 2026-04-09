import dotenv from "dotenv";
import { createApp } from "./app.js";
import { connectToDatabase } from "./config/db.js";

dotenv.config();

const PORT = Number(process.env.PORT || 5000);
const missingRazorpayEnvVars = ["RAZORPAY_KEY_ID", "RAZORPAY_KEY_SECRET"].filter((key) => !process.env[key]);

async function start() {
  await connectToDatabase();

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

