import crypto from "crypto";
import express from "express";
import Razorpay from "razorpay";
import { requireAuth } from "../middleware/auth.js";
import { Product } from "../models/Product.js";
import { Order } from "../models/Order.js";

const router = express.Router();

const COUPONS = {
  NOOKNATIVE50: {
    minSubtotal: 60000,
    discount: 5000
  },
  NOOKNATIVE120: {
    minSubtotal: 120000,
    discount: 12000
  }
};

function getMissingRazorpayEnvVars() {
  return ["RAZORPAY_KEY_ID", "RAZORPAY_KEY_SECRET"].filter((key) => !String(process.env[key] || "").trim());
}

function getRazorpayConfigErrorMessage() {
  const missingVars = getMissingRazorpayEnvVars();
  return `Razorpay is not configured on the server. Missing ${missingVars.join(", ")} in server/.env.`;
}

function getRazorpayClient() {
  if (getMissingRazorpayEnvVars().length > 0) {
    return null;
  }

  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
  });
}

function computeShipping(subtotal) {
  return subtotal >= 50000 ? 0 : 4000;
}

async function buildOrderPayload({ items, shippingAddress, couponCode }) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("Your cart is empty.");
  }

  const productIds = items.map((item) => item.productId);
  const products = await Product.find({ _id: { $in: productIds }, isPublished: true });
  const productMap = new Map(products.map((product) => [product._id.toString(), product]));

  const normalizedItems = [];
  let subtotal = 0;

  for (const item of items) {
    const product = productMap.get(String(item.productId));
    const qty = Number(item.qty || 0);

    if (!product || qty <= 0) {
      throw new Error("One or more products are invalid.");
    }

    if (product.stock < qty) {
      throw new Error(`${product.title} does not have enough stock.`);
    }

    subtotal += product.price * qty;
    normalizedItems.push({
      productId: product._id,
      vendorId: product.vendorId,
      title: product.title,
      image: product.image,
      qty,
      price: product.price,
      unit: product.unit
    });
  }

  const normalizedCouponCode = couponCode ? String(couponCode).toUpperCase() : "";
  const coupon = normalizedCouponCode ? COUPONS[normalizedCouponCode] : null;

  if (normalizedCouponCode && !coupon) {
    throw new Error("Invalid coupon code.");
  }

  if (coupon && subtotal < coupon.minSubtotal) {
    throw new Error(`${normalizedCouponCode} needs a subtotal of Rs.${coupon.minSubtotal / 100} or more.`);
  }

  const discount = coupon ? coupon.discount : 0;
  const shippingFee = computeShipping(subtotal);
  const total = Math.max(0, subtotal + shippingFee - discount);

  return {
    normalizedItems,
    subtotal,
    shippingFee,
    discount,
    total,
    normalizedCouponCode,
    shippingAddress
  };
}

async function decrementStock(items) {
  for (const item of items) {
    await Product.findByIdAndUpdate(item.productId, {
      $inc: { stock: -item.qty }
    });
  }
}

async function createLocalOrder({ req, orderPayload, paymentMethod, paymentStatus, razorpayOrderId = "", razorpayPaymentId = "", razorpaySignature = "" }) {
  const { normalizedItems, subtotal, shippingFee, discount, total, normalizedCouponCode, shippingAddress } = orderPayload;

  return Order.create({
    orderNumber: `NN${Date.now()}`,
    customerId: req.user.id,
    customerName: shippingAddress.fullName,
    customerEmail: req.user.email,
    customerPhone: shippingAddress.phone,
    items: normalizedItems,
    subtotal,
    shippingFee,
    discount,
    total,
    couponCode: discount > 0 ? normalizedCouponCode : "",
    paymentMethod,
    paymentStatus,
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
    status: "Pending",
    shippingAddress
  });
}

router.use(requireAuth);

router.post("/", async (req, res) => {
  try {
    const { items, shippingAddress, couponCode } = req.body;

    if (req.user.role !== "customer") {
      return res.status(403).json({ message: "Only customers can place orders." });
    }

    const orderPayload = await buildOrderPayload({ items, shippingAddress, couponCode });
    const order = await createLocalOrder({
      req,
      orderPayload,
      paymentMethod: "COD",
      paymentStatus: "Pending"
    });

    await decrementStock(orderPayload.normalizedItems);

    return res.status(201).json({ order });
  } catch (error) {
    const status = ["Your cart is empty.", "One or more products are invalid.", "Invalid coupon code."].includes(error.message) || error.message?.includes("does not have enough stock") || error.message?.includes("needs a subtotal")
      ? 400
      : 500;

    return res.status(status).json({ message: error.message || "Unable to place order." });
  }
});

router.post("/create-razorpay-order", async (req, res) => {
  try {
    const { items, shippingAddress, couponCode } = req.body;

    if (req.user.role !== "customer") {
      return res.status(403).json({ message: "Only customers can place orders." });
    }

    const razorpay = getRazorpayClient();
    if (!razorpay) {
      return res.status(503).json({ message: getRazorpayConfigErrorMessage() });
    }

    const orderPayload = await buildOrderPayload({ items, shippingAddress, couponCode });
    const razorpayOrder = await razorpay.orders.create({
      amount: orderPayload.total,
      currency: "INR",
      receipt: `nn_${Date.now()}`,
      notes: {
        customerId: String(req.user.id),
        couponCode: orderPayload.normalizedCouponCode || "none"
      }
    });

    return res.json({
      razorpayOrder,
      amount: orderPayload.total,
      currency: "INR"
    });
  } catch (error) {
    const status = ["Your cart is empty.", "One or more products are invalid.", "Invalid coupon code."].includes(error.message) || error.message?.includes("does not have enough stock") || error.message?.includes("needs a subtotal")
      ? 400
      : 500;

    return res.status(status).json({ message: error.message || "Unable to initialize Razorpay payment." });
  }
});

router.post("/verify-razorpay-payment", async (req, res) => {
  try {
    const {
      items,
      shippingAddress,
      couponCode,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    } = req.body;

    if (req.user.role !== "customer") {
      return res.status(403).json({ message: "Only customers can place orders." });
    }

    const razorpay = getRazorpayClient();
    if (!razorpay) {
      return res.status(503).json({ message: getRazorpayConfigErrorMessage() });
    }

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return res.status(400).json({ message: "Missing Razorpay payment details." });
    }

    const existingOrder = await Order.findOne({ razorpayPaymentId });
    if (existingOrder) {
      return res.json({ order: existingOrder });
    }

    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest("hex");

    if (generatedSignature !== razorpaySignature) {
      return res.status(400).json({ message: "Razorpay signature verification failed." });
    }

    const [orderPayload, razorpayOrder, razorpayPayment] = await Promise.all([
      buildOrderPayload({ items, shippingAddress, couponCode }),
      razorpay.orders.fetch(razorpayOrderId),
      razorpay.payments.fetch(razorpayPaymentId)
    ]);

    if (Number(razorpayOrder.amount) !== Number(orderPayload.total) || razorpayOrder.currency !== "INR") {
      return res.status(400).json({ message: "Razorpay order amount verification failed." });
    }

    if (String(razorpayPayment.order_id) !== String(razorpayOrderId)) {
      return res.status(400).json({ message: "Razorpay payment does not match the order." });
    }

    if (!["authorized", "captured"].includes(String(razorpayPayment.status))) {
      return res.status(400).json({ message: "Razorpay payment is not completed yet." });
    }

    const order = await createLocalOrder({
      req,
      orderPayload,
      paymentMethod: "RAZORPAY",
      paymentStatus: "Paid",
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    });

    await decrementStock(orderPayload.normalizedItems);

    return res.status(201).json({ order });
  } catch (error) {
    const status = ["Your cart is empty.", "One or more products are invalid.", "Invalid coupon code."].includes(error.message) || error.message?.includes("does not have enough stock") || error.message?.includes("needs a subtotal")
      ? 400
      : 500;

    return res.status(status).json({ message: error.message || "Unable to verify Razorpay payment." });
  }
});

router.get("/my", async (req, res) => {
  try {
    const orders = await Order.find({ customerId: req.user.id }).sort({ createdAt: -1 });
    return res.json({ orders });
  } catch (error) {
    return res.status(500).json({ message: "Unable to load your orders." });
  }
});

export default router;





