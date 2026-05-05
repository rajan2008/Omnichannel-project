import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });

const mergeGodownStores = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log('Connected to MongoDB');

    const Store = mongoose.model('Store', new mongoose.Schema({ name: String }));
    const Product = mongoose.model('Product', new mongoose.Schema({ 
      name: String, 
      sku: String, 
      stock: Number, 
      store: mongoose.Schema.Types.ObjectId 
    }));

    // Find both stores
    const vendora = await Store.findOne({ name: 'Vendora Lite' });
    const ventora = await Store.findOne({ name: 'Ventora Lite' });

    if (!vendora) {
      console.log('Target "Vendora Lite" not found.');
      return;
    }

    console.log(`Targeting "Vendora Lite" (${vendora._id})`);

    // Move all products to Vendora Lite
    const updateResult = await Product.updateMany({}, { 
      store: vendora._id,
      stock: 5000 
    });

    console.log(`Updated ${updateResult.modifiedCount} products to Vendora Lite with 5000 qty.`);

    // Delete the duplicate Ventora Lite if it exists
    if (ventora) {
      await Store.deleteOne({ _id: ventora._id });
      console.log('Deleted duplicate "Ventora Lite" store.');
    }

    console.log('Finished cleanup.');
    mongoose.connection.close();
  } catch (err) {
    console.error(err);
  }
};

mergeGodownStores();
