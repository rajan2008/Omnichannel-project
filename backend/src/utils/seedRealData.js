import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/userSchema.js";
import Store from "../models/storeSchema.js";
import Product from "../models/productSchema.js";
import Order from "../models/orderSchema.js";

dotenv.config({ path: "./.env" });

const seedRealData = async () => {
  try {
    console.log("🚀 Starting Seeding Process...");
    await mongoose.connect(process.env.MONGO_URL);
    console.log("Connected to MongoDB: " + process.env.MONGO_URL);

    // 1. Clear Existing Data
    await User.deleteMany({});
    await Store.deleteMany({});
    await Product.deleteMany({});
    await Order.deleteMany({});
    console.log("✅ Cleared old data.");

    // 2. Create Admin User First (needed for Store creation)
    const admin = await User.create({
      name: "Rajan Admin",
      email: "rajanprajapati41190@gmail.com",
      password: "password123",
      role: "admin",
      isEmailVerified: true,
      isActive: true
    });
    console.log("👤 Admin Created: " + admin.email);

    // 3. Create Stores
    const store1 = await Store.create({
      name: "Downtown Superstore",
      location: "Mumbai, Maharashtra",
      admin: admin._id,
      phone: "9876543210",
      contact: "Main Branch"
    });

    const store2 = await Store.create({
      name: "Suburban Outlet",
      location: "Pune, Maharashtra",
      admin: admin._id,
      phone: "9123456789",
      contact: "Secondary Branch"
    });
    console.log("🏪 Stores Created: Downtown & Suburban");

    // 4. Create Manager & Cashier for Store 1
    const manager = await User.create({
      name: "Rajan Manager",
      email: "rajanprajapati41191@gmail.com",
      password: "password123",
      role: "manager",
      store: store1._id,
      isEmailVerified: true,
      isActive: true
    });

    const cashier = await User.create({
      name: "Shipique Cashier",
      email: "shipique@gmail.com",
      password: "password123",
      role: "cashier",
      store: store1._id,
      isEmailVerified: true,
      isActive: true
    });
    console.log("👥 Manager & Cashier assigned to Downtown Superstore.");

    // 5. Create Real Products for both stores
    const products = [
      { name: "Premium Basmati Rice", sku: "RICE-001", category: "Grocery", costPrice: 80, basePrice: 120, stock: 100, store: store1._id },
      { name: "Organic Sunflower Oil", sku: "OIL-002", category: "Grocery", costPrice: 150, basePrice: 210, stock: 50, store: store1._id },
      { name: "Whole Wheat Flour 5kg", sku: "FLR-003", category: "Grocery", costPrice: 200, basePrice: 280, stock: 30, store: store1._id },
      { name: "Dairy Fresh Milk 1L", sku: "MLK-004", category: "Dairy", costPrice: 40, basePrice: 65, stock: 200, store: store2._id },
      { name: "Cheddar Cheese Block", sku: "CHS-005", category: "Dairy", costPrice: 120, basePrice: 190, stock: 25, store: store2._id }
    ];

    await Product.insertMany(products);
    console.log("📦 Products seeded for both stores.");

    // 6. Create a Sample Order for Store 1
    const rice = await Product.findOne({ sku: "RICE-001" });
    const orderItems = [{
      product: rice._id,
      name: rice.name,
      quantity: 2,
      price: rice.basePrice
    }];

    await Order.create({
      cashier: cashier._id,
      store: store1._id,
      items: orderItems,
      subtotal: rice.basePrice * 2,
      tax: (rice.basePrice * 2) * 0.05, // 5% tax
      total: (rice.basePrice * 2) * 1.05,
      paymentMethod: "cash",
      orderStatus: "COMPLETED"
    });
    console.log("🧾 Sample Order created for Downtown Superstore.");

    console.log("\n✨ SEEDING COMPLETED SUCCESSFULLY! ✨");
    console.log("Admin: " + admin.email);
    console.log("Manager: " + manager.email);
    console.log("Cashier: " + cashier.email);
    
    mongoose.connection.close();
  } catch (error) {
    console.error("❌ Seeding failed:", error.message);
    process.exit(1);
  }
};

seedRealData();
