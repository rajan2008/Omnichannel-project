import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "./src/models/productSchema.js";
import Store from "./src/models/storeSchema.js";

dotenv.config();

const categories = [
  {
    name: "Electronics",
    images: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop", // Headphones
      "https://images.unsplash.com/photo-1526406915894-7bcd65f60845?w=500&auto=format&fit=crop", // Controller
      "https://images.unsplash.com/photo-1542204165-65bf26472b9b?w=500&auto=format&fit=crop", // Camera
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&auto=format&fit=crop", // Phone
      "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&auto=format&fit=crop"  // Laptop
    ],
    items: ["Sony WH-1000XM4 Headphones", "DualSense Controller", "Canon EOS M50 Camera", "iPhone 13 Pro", "Dell XPS 13 Laptop"]
  },
  {
    name: "Clothing",
    images: [
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&auto=format&fit=crop", // T-shirt
      "https://images.unsplash.com/photo-1582552938357-32b906df40cb?w=500&auto=format&fit=crop", // Jeans
      "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500&auto=format&fit=crop", // Jacket
      "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=500&auto=format&fit=crop", // Shoes
      "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=500&auto=format&fit=crop"  // Dress
    ],
    items: ["Cotton Basic T-Shirt", "Levi's 501 Jeans", "Vintage Leather Jacket", "Nike Air Max 270", "Floral Summer Dress"]
  },
  {
    name: "Groceries",
    images: [
      "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=500&auto=format&fit=crop", // Bananas
      "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500&auto=format&fit=crop", // Milk
      "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&fit=crop", // Bread
      "https://images.unsplash.com/photo-1587049352847-81a56d773c1c?w=500&auto=format&fit=crop", // Apples
      "https://images.unsplash.com/photo-1606923829579-0cb981a83e2e?w=500&auto=format&fit=crop"  // Coffee
    ],
    items: ["Organic Bananas Bunch", "Fresh Dairy Milk 1L", "Whole Wheat Bread", "Red Fuji Apples", "Arabica Coffee Beans"]
  },
  {
    name: "Home & Furniture",
    images: [
      "https://images.unsplash.com/photo-1505693314120-0d443867891c?w=500&auto=format&fit=crop", // Sofa
      "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=500&auto=format&fit=crop", // Chair
      "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=500&auto=format&fit=crop", // Table
      "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=500&auto=format&fit=crop", // Lamp
      "https://images.unsplash.com/photo-1522771730849-fbde17316ba1?w=500&auto=format&fit=crop"  // Plant
    ],
    items: ["Velvet Lounge Sofa", "Ergonomic Office Chair", "Oak Dining Table", "Minimalist Floor Lamp", "Monstera Indoor Plant"]
  }
];

const seedProducts = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("Connected to DB...");

    const stores = await Store.find();
    if (stores.length === 0) {
      console.log("No stores found. Please create a store first.");
      process.exit(1);
    }

    const defaultStore = stores[0]._id;

    // Delete existing products
    await Product.deleteMany({});
    console.log("Cleared old products...");

    let newProducts = [];

    categories.forEach(cat => {
      cat.items.forEach((item, index) => {
        const basePrice = Math.floor(Math.random() * 5000) + 100;
        
        newProducts.push({
          name: item,
          sku: `${cat.name.substring(0,3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
          category: cat.name,
          costPrice: Math.floor(basePrice * 0.7),
          basePrice: basePrice,
          image: cat.images[index],
          stock: Math.floor(Math.random() * 50) + 20,
          lowStockThreshold: 10,
          store: defaultStore,
          isActive: true
        });
      });
    });

    // Shuffle the array so the first paginated page has mixed categories
    for (let i = newProducts.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newProducts[i], newProducts[j]] = [newProducts[j], newProducts[i]];
    }

    await Product.insertMany(newProducts);
    console.log(`Seeded ${newProducts.length} new products successfully!`);

    process.exit(0);
  } catch (error) {
    console.error("Error seeding products:", error);
    process.exit(1);
  }
};

seedProducts();
