import mongoose from "mongoose";
import User from "../models/userSchema.js";
import dotenv from "dotenv";

dotenv.config({ path: "./.env" });

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    
    const adminExists = await User.findOne({ email: "admin@test.com" });
    if (adminExists) {
      console.log("✅ Admin user already exists.");
    } else {
      await User.create({
        name: "Admin User",
        email: "admin@test.com",
        password: "password123", // Ise aap baad me change kar sakte hain
        role: "admin",
        isActive: true
      });
      console.log("👤 Admin user created: admin@test.com / password123");
    }
    
    mongoose.connection.close();
  } catch (error) {
    console.error("❌ Seeding failed:", error.message);
    process.exit(1);
  }
};

seedAdmin();
