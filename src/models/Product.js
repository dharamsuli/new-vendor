import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    sku: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    category: {
      type: String,
      required: true,
      trim: true
    },
    unit: {
      type: String,
      required: true,
      trim: true
    },
    price: {
      type: Number,
      required: true
    },
    compareAtPrice: {
      type: Number,
      default: null
    },
    stock: {
      type: Number,
      default: 0
    },
    image: {
      type: String,
      required: true
    },
    shortDescription: {
      type: String,
      trim: true,
      default: ""
    },
    description: {
      type: String,
      trim: true,
      default: ""
    },
    badges: {
      type: [String],
      default: []
    },
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },
    vendorName: {
      type: String,
      trim: true,
      default: "Nook and Native"
    },
    isPublished: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

export const Product = mongoose.model("Product", productSchema);
