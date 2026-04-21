import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Product from '../src/models/productSchema.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Explicitly pointing to .env path
dotenv.config({ path: path.join(__dirname, '../.env') });

const dummyProducts = [
  { name: "Samsung Galaxy S23", sku: "SAM-S23", category: "Electronics", costPrice: 50000, basePrice: 70000, stock: 20 },
  { name: "Nike Air Max", sku: "NIKE-AM", category: "Footwear", costPrice: 4000, basePrice: 8000, stock: 15 },
  { name: "MacBook Air M2", sku: "MAC-M2", category: "Electronics", costPrice: 80000, basePrice: 110000, stock: 5 },
  { name: "Levi's 511 Jeans", sku: "LEV-511", category: "Apparel", costPrice: 1500, basePrice: 3500, stock: 30 },
  { name: "Sony WH-1000XM5", sku: "SONY-XM5", category: "Electronics", costPrice: 18000, basePrice: 25000, stock: 12 },
  { name: "Adidas Ultraboost", sku: "ADI-UB", category: "Footwear", costPrice: 5000, basePrice: 12000, stock: 10 },
  { name: "Coffee Beans 1kg", sku: "COF-1KG", category: "Grocery", costPrice: 500, basePrice: 1200, stock: 100 },
  { name: "Gaming Mouse G502", sku: "LOG-G502", category: "Electronics", costPrice: 2000, basePrice: 4500, stock: 25 },
  { name: "Organic Green Tea", sku: "TEA-ORG", category: "Grocery", costPrice: 200, basePrice: 600, stock: 50 },
  { name: "Summer Cotton T-Shirt", sku: "TSHIRT-COT", category: "Apparel", costPrice: 300, basePrice: 900, stock: 40 }
];

const seedDB = async () => {
  try {
    if (!process.env.MONGO_URL) {
      throw new Error("MONGO_URL is not defined in .env file");
    }
    await mongoose.connect(process.env.MONGO_URL);
    console.log("Connected to DB...");
    await Product.insertMany(dummyProducts);
    console.log("10 Dummy Products added successfully!");
    process.exit();
  } catch (error) {
    console.error("Error seeding DB:", error.message);
    process.exit(1);
  }
};

seedDB();
