import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../backend/.env') });

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('Connection error:', err);
    process.exit(1);
  }
};

const updateInventoryForGodown = async () => {
  await connectDB();
  
  const Store = mongoose.model('Store', new mongoose.Schema({ name: String }));
  const Product = mongoose.model('Product', new mongoose.Schema({ 
    name: String, 
    sku: String, 
    stock: Number, 
    store: { type: mongoose.Schema.Types.ObjectId, ref: 'Store' } 
  }));

  const godown = await Store.findOne({ name: /Ventora Lite/i });
  
  if (!godown) {
    console.log('Godown "Ventora Lite" not found. Creating it...');
    const newGodown = await Store.create({ name: 'Ventora Lite', location: 'Main Hub', contact: '000-000-0000' });
    console.log('Created Godown:', newGodown._id);
    await applyToStore(newGodown._id, Product);
  } else {
    console.log('Found Godown:', godown._id);
    await applyToStore(godown._id, Product);
  }

  mongoose.connection.close();
};

const applyToStore = async (storeId, Product) => {
  const products = await Product.find({});
  console.log(`Found ${products.length} products to update.`);
  
  for (const product of products) {
    const randomQty = Math.floor(Math.random() * (5000 - 2000 + 1)) + 2000;
    product.store = storeId;
    product.stock = randomQty;
    await product.save();
    console.log(`Updated ${product.name} with qty ${randomQty}`);
  }
  console.log('Finished updating inventory.');
};

updateInventoryForGodown();
