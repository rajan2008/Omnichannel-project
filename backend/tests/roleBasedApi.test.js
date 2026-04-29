import request from "supertest";
import mongoose from "mongoose";
import { app } from "../server.js"; // Make sure to export app in server.js
import User from "../src/models/userSchema.js";
import Product from "../src/models/productSchema.js";
import jwt from "jsonwebtoken";

// Mocking the server since we need it for testing
const generateTestToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || "testsecret");
};

describe("Role-Based API Tests", () => {
  let adminToken, managerToken, cashierToken;

  beforeAll(async () => {
    // Connect to a test DB or use existing
    await mongoose.connect(process.env.MONGO_URL);
    
    // Create Test Users
    const admin = await User.findOneAndUpdate(
      { email: "admin@test.com" },
      { name: "Admin", password: "password123", role: "admin" },
      { upsert: true, new: true }
    );
    const manager = await User.findOneAndUpdate(
      { email: "manager@test.com" },
      { name: "Manager", password: "password123", role: "manager" },
      { upsert: true, new: true }
    );
    const cashier = await User.findOneAndUpdate(
      { email: "cashier@test.com" },
      { name: "Cashier", password: "password123", role: "cashier" },
      { upsert: true, new: true }
    );

    adminToken = generateTestToken(admin);
    managerToken = generateTestToken(manager);
    cashierToken = generateTestToken(cashier);
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  test("Admin can access Admin Inventory Bulk Upload", async () => {
    const res = await request(app)
      .post("/api/admin/inventory/bulk-upload")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ products: [] });
    expect(res.statusCode).not.toBe(403);
  });

  test("Cashier CANNOT access Admin APIs", async () => {
    const res = await request(app)
      .post("/api/admin/inventory/bulk-upload")
      .set("Authorization", `Bearer ${cashierToken}`)
      .send({ products: [] });
    expect(res.statusCode).toBe(403); // Forbidden
  });

  test("Manager can access Manager Add Product", async () => {
    const res = await request(app)
      .post("/api/manager/inventory/add")
      .set("Authorization", `Bearer ${managerToken}`)
      .send({ name: "Test", sku: "T1", category: "C1", costPrice: 10, basePrice: 20, store: new mongoose.Types.ObjectId() });
    expect(res.statusCode).not.toBe(403);
  });
});
