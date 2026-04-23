import mongoose from "mongoose";
import { jest } from "@jest/globals";

// In ESM, we use unstable_mockModule for mocking before importing the controller
jest.unstable_mockModule("../src/models/productSchema.js", () => ({
  default: {
    findById: jest.fn(),
  }
}));
jest.unstable_mockModule("../src/models/orderSchema.js", () => ({
  default: {
    create: jest.fn(),
  }
}));
jest.unstable_mockModule("../src/models/inventoryLedgerSchema.js", () => ({
  default: {
    insertMany: jest.fn(),
  }
}));

// Now we import the controller and models after the mock is registered
const { checkout } = await import("../src/controllers/orderController.js");
const { default: Product } = await import("../src/models/productSchema.js");

describe("Transactional Integrity Tests", () => {
  let mockSession;
  let mockRes;
  
  beforeEach(() => {
    mockSession = {
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      abortTransaction: jest.fn(),
      endSession: jest.fn(),
    };
    mongoose.startSession = jest.fn().mockResolvedValue(mockSession);
    
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should rollback transaction if stock is insufficient", async () => {
    const req = {
      user: { id: "user123" },
      body: {
        items: [{ productId: "prod123", quantity: 5 }],
        paymentMethod: "card",
      },
    };

    const mockProduct = {
      _id: "prod123",
      name: "Test Product",
      isActive: true,
      stock: 2,
      price: 100,
      discount: 0,
      save: jest.fn()
    };

    // Setting up the mock behavior
    Product.findById.mockReturnValue({
      session: jest.fn().mockResolvedValue(mockProduct)
    });

    await checkout(req, mockRes);

    expect(mockSession.startTransaction).toHaveBeenCalled();
    expect(mockSession.abortTransaction).toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({ message: "Insufficient stock: Test Product" });
  });
});
