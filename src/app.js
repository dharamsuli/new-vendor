import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import vendorRoutes from "./routes/vendorRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.resolve(__dirname, "../public");

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: process.env.CLIENT_URL?.split(",").map((value) => value.trim()) || "*"
    })
  );
  app.use("/uploads", express.static(path.join(publicDir, "uploads")));
  app.use(express.json());

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true, name: "Nook and Native API" });
  });

  app.use("/api/auth", authRoutes);
  app.use("/api/products", productRoutes);
  app.use("/api/orders", orderRoutes);
  app.use("/api/vendor", vendorRoutes);

  return app;
}
