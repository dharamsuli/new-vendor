import express from "express";
import { Product } from "../models/Product.js";

const router = express.Router();

function toCategorySlug(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

router.get("/", async (req, res) => {
  try {
    const { category } = req.query;
    let products = await Product.find({ isPublished: true }).sort({ createdAt: -1 });

    if (category && category !== "all") {
      const requestedCategory = toCategorySlug(category);
      products = products.filter((product) => toCategorySlug(product.category) === requestedCategory);
    }

    return res.json({ products });
  } catch (error) {
    return res.status(500).json({ message: "Unable to load products." });
  }
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
