import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });

const checkStores = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    const Store = mongoose.model('Store', new mongoose.Schema({ name: String }));
    const Product = mongoose.model('Product', new mongoose.Schema({ name: String, store: mongoose.Schema.Types.ObjectId }));

    const stores = await Store.find({});
    console.log('--- STORES ---');
    stores.forEach(s => console.log(`${s.name}: ${s._id}`));

    const products = await Product.find({});
    console.log('\n--- PRODUCTS ---');
    const storeCounts = {};
    products.forEach(p => {
      const sId = p.store?.toString();
      if (sId) storeCounts[sId] = (storeCounts[sId] || 0) + 1;
    });

    Object.keys(storeCounts).forEach(sId => {
      const storeName = stores.find(s => s._id.toString() === sId)?.name || 'Unknown';
      console.log(`${storeName} (${sId}): ${storeCounts[sId]} products`);
    });

    mongoose.connection.close();
  } catch (err) {
    console.error(err);
  }
};

checkStores();
