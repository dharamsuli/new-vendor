import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true
    },
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },
    title: {
      type: String,
      required: true
    },
    image: {
      type: String,
      default: ""
    },
    qty: {
      type: Number,
      required: true
    },
    price: {
      type: Number,
      required: true
    },
    unit: {
      type: String,
      default: ""
    }
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    customerName: {
      type: String,
      required: true
    },
    customerEmail: {
      type: String,
      required: true
    },
    customerPhone: {
      type: String,
      required: true
    },
    items: {
      type: [orderItemSchema],
      required: true
    },
    subtotal: {
      type: Number,
      required: true
    },
    shippingFee: {
      type: Number,
      required: true
    },
    discount: {
      type: Number,
      required: true
    },
    total: {
      type: Number,
      required: true
    },
    couponCode: {
      type: String,
      default: ""
    },
    paymentMethod: {
      type: String,
      enum: ["COD"],
      default: "COD"
    },
    status: {
      type: String,
      enum: ["Pending", "Confirmed", "Packed", "Out for Delivery", "Delivered", "Cancelled"],
      default: "Pending"
    },
    shippingAddress: {
      fullName: String,
      phone: String,
      addressLine1: String,
      addressLine2: String,
      city: String,
      state: String,
      postalCode: String
    }
  },
  {
    timestamps: true
  }
);

export const Order = mongoose.model("Order", orderSchema);
