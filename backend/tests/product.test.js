import { jest } from "@jest/globals";

jest.unstable_mockModule("../src/models/productSchema.js", () => ({
  default: {
    find: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    updateMany: jest.fn(),
    countDocuments: jest.fn(),
  }
}));

jest.unstable_mockModule("../src/models/activityLogSchema.js", () => ({
  default: {
    create: jest.fn().mockResolvedValue(true),
  }
}));

jest.unstable_mockModule("../src/config/redis.js", () => ({
  default: {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
  },
  isRedisConnected: true
}));

const validId = "60d5f1f2e6b0f123456789ab";
const validUserId = "60d5f1f2e6b0f123456789ac";


const { getProducts, addProduct } = await import("../src/controllers/inventoryController.js");
const { default: Product } = await import("../src/models/productSchema.js");
const { default: redisClient } = await import("../src/config/redis.js");

describe("Product API Controllers (Inventory)", () => {
  let mockReq, mockRes;

  beforeEach(() => {
    mockReq = {
      query: {},
      body: {},
      user: { id: validUserId, role: "manager", store: validId }
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should create a new product and clear cache", async () => {
    const mockProductData = {
      name: "New Product",
      sku: "PROD-001",
      category: "Electronics",
      costPrice: 50,
      basePrice: 100,
      stock: 20,
      store: "60d5f1f2e6b0f123456789ab"
    };
    mockReq.body = mockProductData;
    Product.create.mockResolvedValue(mockProductData);

    await addProduct(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(201);
    expect(redisClient.del).toHaveBeenCalled();
  });

  it("should return products with pagination", async () => {
    const mockProducts = [{ name: "P1" }, { name: "P2" }];
    Product.find.mockReturnValue({
      populate: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      skip: jest.fn().mockResolvedValue(mockProducts),
    });
    Product.countDocuments.mockResolvedValue(2);

    await getProducts(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ products: mockProducts }));
  });
});
