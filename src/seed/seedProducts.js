import { Product } from "../models/Product.js";
import { LEGACY_IMAGE_MIGRATIONS, STATIC_PRODUCTS } from "../data/products.js";

export async function seedProducts() {
  await Product.bulkWrite(
    STATIC_PRODUCTS.map((product) => ({
      updateOne: {
        filter: { sku: product.sku },
        update: {
          $set: {
            ...product,
            vendorId: null,
            vendorName: "Nook and Native",
            isPublished: true
          }
        },
        upsert: true
      }
    }))
  );

  await Promise.all(
    Object.entries(LEGACY_IMAGE_MIGRATIONS).map(([from, to]) =>
      Product.updateMany({ image: from }, { $set: { image: to } })
    )
  );

  console.log("Seeded static Nook and Native products");
}
