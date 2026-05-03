import { jest } from "@jest/globals";
import mongoose from "mongoose";

jest.unstable_mockModule("../src/models/productSchema.js", () => ({ default: { findById: jest.fn(), create: jest.fn(), find: jest.fn() } }));
jest.unstable_mockModule("../src/models/orderSchema.js", () => ({ default: { create: jest.fn(), findById: jest.fn() } }));
jest.unstable_mockModule("../src/models/inventoryLedgerSchema.js", () => ({ default: { insertMany: jest.fn() } }));
jest.unstable_mockModule("../src/config/redis.js", () => ({ 
  default: { del: jest.fn(), get: jest.fn(), set: jest.fn() },
  isRedisConnected: true 
}));

const mockSession = { startTransaction: jest.fn(), commitTransaction: jest.fn(), abortTransaction: jest.fn(), endSession: jest.fn() };
mongoose.startSession = jest.fn().mockResolvedValue(mockSession);

const { checkout } = await import("../src/controllers/orderController.js");
const { default: Product } = await import("../src/models/productSchema.js");


describe("Advanced Logic Tests", () => {
  it("should rollback transaction on stock error", async () => {
    Product.findById.mockReturnValue({ session: jest.fn().mockResolvedValue(null) });
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    await checkout({ body: { items: [{ productId: "1", quantity: 1 }] }, user: { id: "1", role: "admin" } }, res);
    expect(mockSession.abortTransaction).toHaveBeenCalled();
  });
});
