import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';

const API_URL = 'http://localhost:5000/api';

// Create a small dummy image for testing
const dummyImagePath = path.join(process.cwd(), 'scratch', 'test_image.png');
const dummyImageBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');
fs.writeFileSync(dummyImagePath, dummyImageBuffer);

async function testFullFlow() {
  try {
    console.log("🚀 Starting Image Upload Test...");

    // 1. Login
    console.log("🔑 Logging in...");
    const loginRes = await axios.post(`${API_URL}/auth/login`, {
      email: 'admin@test.com',
      password: 'password123'
    });
    const token = loginRes.data.token;
    const config = { headers: { Authorization: `Bearer ${token}` } };

    // 2. Get or Create a Store
    console.log("🏪 Getting Store...");
    const storeRes = await axios.get(`${API_URL}/stores`, config);
    // Check multiple possible response formats
    let storeId = storeRes.data?.stores?.[0]?._id || storeRes.data?.[0]?._id;

    if (!storeId) {
      console.log("➕ Creating a new store...");
      const newStore = await axios.post(`${API_URL}/admin/stores`, {
        name: "Test Store",
        location: "Delhi",
        admin: loginRes.data.user.id
      }, config);
      
      // Some APIs return { store: { _id } } or just { _id }
      storeId = newStore.data?._id || newStore.data?.store?._id;
    }

    if (!storeId) {
      throw new Error("Could not determine Store ID. Please create a store manually.");
    }
    console.log(`📍 Using Store ID: ${storeId}`);

    // 3. Upload Product with Real Image
    console.log("📸 Uploading Product with Image...");
    const form = new FormData();
    form.append('name', 'Cloudinary Test Product');
    form.append('sku', `TEST-${Date.now()}`);
    form.append('category', 'Test');
    form.append('costPrice', '100');
    form.append('basePrice', '200');
    form.append('store', storeId);
    
    // Using the real dummy image we created
    form.append('image', fs.createReadStream(dummyImagePath)); 

    const uploadRes = await axios.post(`${API_URL}/manager/inventory/add`, form, {
      headers: {
        ...config.headers,
        ...form.getHeaders()
      }
    });

    console.log("✅ Success! Product Created with Image.");
    console.log("🔗 Image URL:", uploadRes.data.image);

  } catch (error) {
    console.error("❌ Test Failed:", error.response?.data || error.message);
  }
}

testFullFlow();
