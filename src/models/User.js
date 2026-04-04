import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    passwordHash: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      trim: true,
      default: ""
    },
    role: {
      type: String,
      enum: ["customer", "vendor", "admin"],
      default: "customer"
    },
    storeName: {
      type: String,
      trim: true,
      default: ""
    }
  },
  {
    timestamps: true
  }
);

export const User = mongoose.model("User", userSchema);
