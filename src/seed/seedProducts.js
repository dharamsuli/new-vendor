import { Product } from "../models/Product.js";
import { STATIC_PRODUCTS } from "../data/products.js";

export async function seedProducts() {
  const existingCount = await Product.countDocuments();

  if (existingCount > 0) {
    return;
  }

  await Product.insertMany(STATIC_PRODUCTS);
  console.log("Seeded static Nook and Native products");
}
