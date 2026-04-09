import express from "express";
import mongoose from "mongoose";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { Product } from "../models/Product.js";
import { Order } from "../models/Order.js";
import { User } from "../models/User.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.resolve(__dirname, "../../public/uploads/products");

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const extension = path.extname(file.originalname || "").toLowerCase();
    const baseName = path
      .basename(file.originalname || "product-image", extension)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "product-image";

    cb(null, `${Date.now()}-${baseName}${extension}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      cb(new Error("Only image uploads are allowed."));
      return;
    }

    cb(null, true);
  }
});

const router = express.Router();

function normalizeProductImages(images, image) {
  const normalized = [];

  for (const value of [...(Array.isArray(images) ? images : []), image]) {
    const next = String(value || "").trim();
    if (!next || normalized.includes(next)) {
      continue;
    }
    normalized.push(next);
  }

  return normalized;
}

router.use(requireAuth, requireRole("vendor", "admin"));

router.post("/images", (req, res) => {
  upload.fields([
    { name: "images", maxCount: 10 },
    { name: "image", maxCount: 1 }
  ])(req, res, (error) => {
    if (error) {
      const message = error.message || "Unable to upload image.";
      return res.status(400).json({ message });
    }

    const files = [
      ...((req.files && req.files.images) || []),
      ...((req.files && req.files.image) || [])
    ];

    if (!files.length) {
      return res.status(400).json({ message: "Please choose at least one image to upload." });
    }

    const images = files.map((file) => `/uploads/products/${file.filename}`);

    return res.status(201).json({
      image: images[0],
      images,
      fileNames: files.map((file) => file.filename)
    });
  });
});

router.get("/products", async (req, res) => {
  try {
    const query = req.user.role === "admin" ? {} : { vendorId: req.user.id };
    const products = await Product.find(query).sort({ createdAt: -1 });
    return res.json({ products });
  } catch (error) {
    return res.status(500).json({ message: "Unable to load vendor products." });
  }
});

router.post("/products", async (req, res) => {
  try {
    const { title, slug, category, unit, price, compareAtPrice, stock, image, images, shortDescription, description, badges, isPublished } = req.body;
    const normalizedImages = normalizeProductImages(images, image);

    if (!title || !slug || !category || !unit || !price || !normalizedImages.length) {
      return res.status(400).json({ message: "Missing required product fields." });
    }

    const product = await Product.create({
      sku: `VEN-${Date.now()}`,
      title: title.trim(),
      slug: slug.trim(),
      category: category.trim(),
      unit: unit.trim(),
      price: Number(price),
      compareAtPrice: compareAtPrice ? Number(compareAtPrice) : null,
      stock: Number(stock ?? 0),
      image: normalizedImages[0],
      images: normalizedImages,
      shortDescription: shortDescription?.trim() || "",
      description: description?.trim() || "",
      badges: Array.isArray(badges) ? badges : [],
      isPublished: Boolean(isPublished),
      vendorId: req.user.id,
      vendorName: req.user.storeName || req.user.name
    });

    return res.status(201).json({ product });
  } catch (error) {
    const message =
      error?.code === 11000 ? "Slug must be unique." : "Unable to create product.";
    return res.status(400).json({ message });
  }
});

router.patch("/products/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    const ownsProduct =
      req.user.role === "admin" ||
      String(product.vendorId || "") === String(req.user.id);

    if (!ownsProduct) {
      return res.status(403).json({ message: "You can only update your own products." });
    }

    const allowedFields = [
      "title",
      "slug",
      "category",
      "unit",
      "price",
      "compareAtPrice",
      "stock",
      "shortDescription",
      "description",
      "badges",
      "isPublished"
    ];

    for (const field of allowedFields) {
      if (field in req.body) {
        product[field] = req.body[field];
      }
    }

    if ("images" in req.body || "image" in req.body) {
      const normalizedImages = normalizeProductImages(req.body.images, req.body.image);
      if (!normalizedImages.length) {
        return res.status(400).json({ message: "At least one product image is required." });
      }
      product.images = normalizedImages;
      product.image = normalizedImages[0];
    } else if (!product.images?.length && product.image) {
      product.images = [product.image];
    }

    await product.save();
    return res.json({ product });
  } catch (error) {
    const message =
      error?.code === 11000 ? "Slug must be unique." : "Unable to update product.";
    return res.status(400).json({ message });
  }
});

router.get("/orders", async (req, res) => {
  try {
    const vendorObjectId = new mongoose.Types.ObjectId(req.user.id);
    const query =
      req.user.role === "admin"
        ? {}
        : { "items.vendorId": vendorObjectId };

    const orders = await Order.find(query).sort({ createdAt: -1 });
    return res.json({ orders });
  } catch (error) {
    return res.status(500).json({ message: "Unable to load vendor orders." });
  }
});

router.patch("/orders/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ message: "Status is required." });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    if (req.user.role !== "admin") {
      const vendorHasItems = order.items.some(
        (item) => String(item.vendorId || "") === String(req.user.id)
      );
      if (!vendorHasItems) {
        return res.status(403).json({ message: "You can only manage your own orders." });
      }
    }

    order.status = status;
    await order.save();
    return res.json({ order });
  } catch (error) {
    return res.status(400).json({ message: "Unable to update order status." });
  }
});

router.get("/users", async (_req, res) => {
  try {
    const users = await User.find({})
      .select("name email phone role storeName createdAt")
      .sort({ createdAt: -1 });

    return res.json({ users });
  } catch (error) {
    return res.status(500).json({ message: "Unable to load registered users." });
  }
});

export default router;
