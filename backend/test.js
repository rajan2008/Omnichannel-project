import mongoose from 'mongoose';
import User from './src/models/userSchema.js';
import { createUserByAdmin } from './src/controllers/authController.js';
import dotenv from 'dotenv';
dotenv.config();

const runTest = async () => {
    try {
        // Connect to MongoDB
        console.log("Connecting to Database...");
        await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/infotact");
        console.log("Connected Successfully.");

        // We create a mock Req and Res object to test the controller manually
        // We will pass all required fields. Notice the plain string 'password1234'
        const req = {
            body: {
                name: "New Cashier",
                email: "cashier_test@example.com",
                password: "password1234",
                role: "cashier",
                phone: "1234567890"
            }
        };

        const res = {
            status: function(code) {
                console.log(`\n[Response Status]: ${code}`);
                return this;
            },
            json: function(data) {
                console.log("[Response Data]:", data);
                if (data.message && data.message.includes("User validation failed") || data.message.includes("data MUST be a string")) {
                    console.log("\n❌ TEST FAILED: Mongoose threw a validation or hash error.");
                } else if (data.message && data.message.includes("OTP sent")) {
                    console.log("\n✅ TEST PASSED: Admin created the user successfully!");
                }
            }
        };

        console.log("\n--- Running createUserByAdmin() ---");
        await createUserByAdmin(req, res);

        // Fetch user from DB to verify password was hashed correctly (should not be 'password1234')
        const createdUser = await User.findOne({ email: req.body.email });
        if (createdUser) {
            console.log("\n[DB Check]: User found in database.");
            console.log("Original plain password:", req.body.password);
            console.log("Hashed password stored in DB:", createdUser.password);
            if (createdUser.password !== req.body.password && createdUser.password.startsWith('$2')) {
                 console.log("✅ Password hashing works perfectly!");
            }
        }

    } catch (error) {
        console.error("\n❌ TEST FAILED WITH EXCEPTION:", error);
    } finally {
        // Cleanup after test 
        await User.deleteOne({ email: "cashier_test@example.com" });
        await mongoose.disconnect();
        process.exit(0);
    }
};

runTest();
