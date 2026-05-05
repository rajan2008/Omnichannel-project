import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('Connection error:', err);
    process.exit(1);
  }
};

const updateInventoryForGodown = async () => {
  await connectDB();
  
  // Use existing models if possible, otherwise define minimal ones
  const Store = mongoose.models.Store || mongoose.model('Store', new mongoose.Schema({ name: String, location: String, contact: String }));
  const Product = mongoose.models.Product || mongoose.model('Product', new mongoose.Schema({ 
    name: String, 
    sku: String, 
    stock: Number, 
    store: { type: mongoose.Schema.Types.ObjectId, ref: 'Store' } 
  }));

  let godown = await Store.findOne({ name: /Ventora Lite/i });
  
  if (!godown) {
    console.log('Godown "Ventora Lite" not found. Creating it...');
    godown = await Store.create({ 
      name: 'Ventora Lite', 
      location: 'Godown / Main Hub', 
      contact: '9999999999' 
    });
    console.log('Created Godown:', godown._id);
  } else {
    console.log('Found Godown:', godown._id);
  }

  const products = await Product.find({});
  console.log(`Found ${products.length} products to update.`);
  
  for (const product of products) {
    const fixedQty = 5000;
    product.store = godown._id;
    product.stock = fixedQty;
    await product.save();
    console.log(`Updated ${product.name} (SKU: ${product.sku}) with qty ${fixedQty} in Ventora Lite`);
  }

  console.log('Finished updating inventory.');
  mongoose.connection.close();
};

updateInventoryForGodown();
