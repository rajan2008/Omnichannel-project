const fs = require('fs');
const path = require('path');

const rootFilesToDelete = [
  'App.jsx',
  'API_Testing.postman_collection.json',
  'README_TESTING.md',
  'api_test_results.md'
];

const frontendTestingFilesToDelete = [
  'frontend/src/pages/auth/Login.jsx',
  'frontend/src/pages/auth/Register.jsx',
  'frontend/src/pages/Dashboard.jsx',
  'frontend/src/pages/Products.jsx',
  'frontend/src/pages/Orders.jsx',
  'frontend/src/pages/TestingGround.jsx',
  'frontend/src/components/Layout.jsx'
];

console.log("🧹 Cleaning up workspace...");

// Delete Root Files
rootFilesToDelete.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    console.log(`✅ Deleted root duplicate: ${file}`);
  }
});

// Delete Extra Dummy UI Files
frontendTestingFilesToDelete.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    console.log(`✅ Deleted extra dummy UI file: ${file}`);
  }
});

console.log("\n🚀 All cleanup done! Workspace is perfectly organized. Aap is 'cleanup.js' ko bhi ab delete kar sakte hain.");
