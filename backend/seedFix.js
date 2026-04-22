import mongoose from "mongoose";
import "dotenv/config";
import User from "./src/models/userSchema.js"; 

async function seedAdmin() {
  try {
    // AAPKI .env FILE MEIN 'MONGO_URL' HAI (infotact DB), MONGO_URI nahi. Isliye pehle error aaya!
    await mongoose.connect(process.env.MONGO_URL || "mongodb://localhost:27017/infotact?replicaSet=rs0");
    
    // Naya Password jo kam se kam 8 digits ka ho
    await User.create({ 
      name: "Super Admin", 
      email: "admin2@infotact.com", 
      password: "password123", 
      role: "admin",
      phone: "1234567890" 
    });
    
    console.log("✅ Asli Encrypted Admin ban gaya hai SAAHI Database me!");
    process.exit(0);
  } catch (error) {
    if (error.code === 11000) {
      console.log("✅ Ye Admin already ban chuka hai is database mein.");
      process.exit(0);
    }
    console.error("Error:", error);
    process.exit(1);
  }
}

seedAdmin();
