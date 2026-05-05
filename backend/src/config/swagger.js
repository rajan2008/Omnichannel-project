import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Vendora POS & Inventory Management API",
      version: "1.0.0",
      description:
        "Omnichannel Retail Point of Sale and Inventory Management System - RESTful API documentation. " +
        "This system unifies physical and digital retail operations with real-time inventory sync, " +
        "atomic transactions, Redis caching, and offline-to-online order synchronization.",
      contact: {
        name: "Team Vendora",
      },
    },
    servers: [
      {
        url: "http://localhost:5000",
        description: "Local Development Server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Enter your JWT token obtained from /api/auth/login",
        },
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            _id: { type: "string", example: "665a1b2c3d4e5f6a7b8c9d0e" },
            name: { type: "string", example: "Rajan Kumar" },
            email: { type: "string", example: "rajan@vendora.com" },
            role: { type: "string", enum: ["admin", "manager", "cashier"], example: "cashier" },
            phone: { type: "string", example: "9876543210" },
            isActive: { type: "boolean", example: true },
            store: { type: "string", description: "Store ObjectId reference" },
            isEmailVerified: { type: "boolean", example: true },
          },
        },
        Product: {
          type: "object",
          properties: {
            _id: { type: "string" },
            name: { type: "string", example: "Samsung Galaxy S24" },
            sku: { type: "string", example: "SKU-SAM-001" },
            category: { type: "string", example: "Electronics" },
            costPrice: { type: "number", example: 45000 },
            basePrice: { type: "number", example: 59999 },
            stock: { type: "integer", example: 150 },
            lowStockThreshold: { type: "integer", example: 10 },
            store: { type: "string", description: "Store ObjectId" },
            image: { type: "string" },
            isActive: { type: "boolean", example: true },
            dynamicPricingRules: {
              type: "object",
              properties: {
                promotions: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      promoPrice: { type: "number" },
                      startDate: { type: "string", format: "date" },
                      endDate: { type: "string", format: "date" },
                    },
                  },
                },
              },
            },
          },
        },
        Order: {
          type: "object",
          properties: {
            _id: { type: "string" },
            cashier: { type: "string", description: "User ObjectId" },
            store: { type: "string", description: "Store ObjectId" },
            items: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  product: { type: "string" },
                  name: { type: "string" },
                  quantity: { type: "integer" },
                  price: { type: "number" },
                },
              },
            },
            subtotal: { type: "number" },
            tax: { type: "number" },
            total: { type: "number" },
            paymentMethod: { type: "string", enum: ["cash", "card", "digital_wallet"] },
            orderStatus: { type: "string", enum: ["PENDING", "COMPLETED", "CANCELLED"] },
            channel: { type: "string", example: "in-store" },
          },
        },
        Store: {
          type: "object",
          properties: {
            _id: { type: "string" },
            name: { type: "string", example: "Vendora MG Road" },
            location: { type: "string", example: "Bengaluru, Karnataka" },
            admin: { type: "string", description: "Admin User ObjectId" },
            phone: { type: "string" },
            contact: { type: "string" },
            isActive: { type: "boolean" },
          },
        },
        Error: {
          type: "object",
          properties: {
            message: { type: "string", example: "Error description" },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ["./src/routes/*.js"],
};

const swaggerSpec = swaggerJsdoc(options);

export const setupSwagger = (app) => {
  app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      customCss: ".swagger-ui .topbar { display: none }",
      customSiteTitle: "Vendora API Documentation",
    })
  );

  // Serve raw JSON spec
  app.get("/api-docs.json", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerSpec);
  });
};
