import express from "express";
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

function computeShipping(subtotal) {
  return subtotal >= 50000 ? 0 : 4000;
}

router.use(requireAuth);

router.post("/", async (req, res) => {
  try {
    const { items, shippingAddress, couponCode } = req.body;

    if (req.user.role !== "customer") {
      return res.status(403).json({ message: "Only customers can place orders." });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Your cart is empty." });
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
        return res.status(400).json({ message: "One or more products are invalid." });
      }

      if (product.stock < qty) {
        return res.status(400).json({ message: `${product.title} does not have enough stock.` });
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

    const coupon = couponCode ? COUPONS[String(couponCode).toUpperCase()] : null;
    const discount =
      coupon && subtotal >= coupon.minSubtotal ? coupon.discount : 0;
    const shippingFee = computeShipping(subtotal);
    const total = Math.max(0, subtotal + shippingFee - discount);

    const order = await Order.create({
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
      couponCode: discount > 0 ? String(couponCode).toUpperCase() : "",
      paymentMethod: "COD",
      status: "Pending",
      shippingAddress
    });

    for (const item of normalizedItems) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: -item.qty }
      });
    }

    return res.status(201).json({ order });
  } catch (error) {
    return res.status(500).json({ message: "Unable to place order." });
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
