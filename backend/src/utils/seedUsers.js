import mongoose from "mongoose";
import User from "../models/userSchema.js";
import dotenv from "dotenv";

dotenv.config({ path: "./.env" });

const users = [
  { name: "Admin User", email: "admin@test.com", password: "password123", role: "admin" },
  { name: "Manager User", email: "manager@test.com", password: "password123", role: "manager" },
  { name: "Cashier User", email: "cashier@test.com", password: "password123", role: "cashier" }
];

const seedAll = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    
    for (const u of users) {
      const exists = await User.findOne({ email: u.email });
      if (!exists) {
        await User.create({ ...u, isActive: true });
        console.log(`👤 Created ${u.role}: ${u.email}`);
      } else {
        console.log(`✅ ${u.role} already exists.`);
      }
    }
    
    mongoose.connection.close();
  } catch (error) {
    console.error("❌ Seeding failed:", error.message);
    process.exit(1);
  }
};

seedAll();
