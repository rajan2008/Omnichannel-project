import { jest } from "@jest/globals";

// In ESM, we mock modules before importing the controllers that use them
jest.unstable_mockModule("../src/models/productSchema.js", () => ({
  default: {
    create: jest.fn(),
    find: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    index: jest.fn(),
  }
}));

jest.unstable_mockModule("../src/config/redis.js", () => ({
  default: {
    keys: jest.fn(),
    del: jest.fn(),
    get: jest.fn(),
    set: jest.fn(),
  }
}));

// Import controllers after mocks
const { addProduct, getProducts } = await import("../src/controllers/inventoryController.js");
const { default: Product } = await import("../src/models/productSchema.js");
const { default: redisClient } = await import("../src/config/redis.js");

describe("Product API Controllers (Inventory)", () => {
  let mockRes;
  
  beforeEach(() => {
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should create a new product and clear cache", async () => {
    const req = {
      body: { name: "Test Product", sku: "TEST-01", price: 20, category: "Test", stock: 100 },
    };

    const mockCreatedProduct = { ...req.body, _id: "prod123" };
    Product.create.mockResolvedValue(mockCreatedProduct);
    redisClient.keys.mockResolvedValue(["products:all:somekey"]);
    redisClient.del.mockResolvedValue();

    await addProduct(req, mockRes);

    expect(Product.create).toHaveBeenCalledWith(req.body);
    expect(mockRes.status).toHaveBeenCalledWith(201);
    expect(mockRes.json).toHaveBeenCalledWith({ message: "Product added", product: mockCreatedProduct });
  });

  it("should get products, using cache if available", async () => {
    const req = { query: { search: "", limit: 10 } };
    
    const cachedData = [{ name: "Test Product" }];
    redisClient.get.mockResolvedValue(JSON.stringify(cachedData));

    await getProducts(req, mockRes);

    expect(redisClient.get).toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith(cachedData);
  });
});
