import mongoose from "mongoose";

export async function connectToDatabase() {
  if (!process.env.MONGODB_URI) {
    throw new Error("Missing MONGODB_URI in environment.");
  }

  await mongoose.connect(process.env.MONGODB_URI);
  console.log("MongoDB connected");
}
