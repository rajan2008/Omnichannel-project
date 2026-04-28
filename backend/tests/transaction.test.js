import { jest } from "@jest/globals";
import mongoose from "mongoose";

jest.unstable_mockModule("../src/models/productSchema.js", () => ({
  default: { findById: jest.fn() }
}));
jest.unstable_mockModule("../src/models/orderSchema.js", () => ({
  default: { create: jest.fn() }
}));
jest.unstable_mockModule("../src/config/redis.js", () => ({
  default: { del: jest.fn() }
}));

const mockSession = {
  startTransaction: jest.fn(),
  commitTransaction: jest.fn(),
  abortTransaction: jest.fn(),
  endSession: jest.fn(),
};
mongoose.startSession = jest.fn().mockResolvedValue(mockSession);

const { checkout } = await import("../src/controllers/orderController.js");
const { default: Product } = await import("../src/models/productSchema.js");
const { default: Order } = await import("../src/models/orderSchema.js");

describe("Order Transaction Logic", () => {
  let mockReq, mockRes;

  beforeEach(() => {
    mockReq = {
      body: {
        items: [{ productId: "p1", quantity: 2 }],
        paymentMethod: "cash",
        storeId: "s1"
      },
      user: { id: "u1" }
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  it("should complete checkout successfully and commit transaction", async () => {
    const mockProduct = {
      _id: "p1",
      name: "Product 1",
      basePrice: 100,
      stock: 10,
      save: jest.fn().mockResolvedValue(true)
    };
    Product.findById.mockReturnValue({ session: jest.fn().mockResolvedValue(mockProduct) });
    Order.create.mockResolvedValue([{ _id: "o1", total: 200 }]);

    await checkout(mockReq, mockRes);

    expect(mockSession.commitTransaction).toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(201);
  });

  it("should rollback transaction if stock is insufficient", async () => {
    const mockProduct = {
      _id: "p1",
      name: "Product 1",
      stock: 1 // Less than 2
    };
    Product.findById.mockReturnValue({ session: jest.fn().mockResolvedValue(mockProduct) });

    await checkout(mockReq, mockRes);

    expect(mockSession.abortTransaction).toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(400);
  });
});
