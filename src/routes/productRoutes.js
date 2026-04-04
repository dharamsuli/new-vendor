import express from "express";
import { Product } from "../models/Product.js";
import { STATIC_IMAGE_OPTIONS } from "../data/products.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { category } = req.query;
    const query = { isPublished: true };

    if (category && category !== "all") {
      query.category = category;
    }

    const products = await Product.find(query).sort({ createdAt: -1 });
    return res.json({ products });
  } catch (error) {
    return res.status(500).json({ message: "Unable to load products." });
  }
});

router.get("/static-images", async (_req, res) => {
  return res.json({ images: STATIC_IMAGE_OPTIONS });
});

router.get("/:slug", async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug, isPublished: true });
    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    return res.json({ product });
  } catch (error) {
    return res.status(500).json({ message: "Unable to load product." });
  }
});

export default router;
