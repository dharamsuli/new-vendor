import dotenv from "dotenv";
import { createApp } from "./app.js";
import { connectToDatabase } from "./config/db.js";
import { seedProducts } from "./seed/seedProducts.js";

dotenv.config();

const PORT = Number(process.env.PORT || 5000);

async function start() {
  await connectToDatabase();
  await seedProducts();

  const app = createApp();
  app.listen(PORT, () => {
    console.log(`Nook and Native server running on port ${PORT}`);
  });
}

start().catch((error) => {
  console.error("Server failed to start", error);
  process.exit(1);
});
