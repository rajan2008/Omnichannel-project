import dotenv from "dotenv";
dotenv.config();


import express from "express";
import cors from "cors";
import connect from "./src/config/connectdb.js";
import authRoutes from "./src/routes/authRoutes.js";
import inventoryRoutes from "./src/routes/inventoryRoutes.js";
import orderRoutes from "./src/routes/orderRoutes.js";
import storeRoutes from "./src/routes/storeRoutes.js";
import dashboardRoutes from "./src/routes/dashboardRoutes.js";
import adminRoutes from "./src/routes/adminRoutes.js";
import managerRoutes from "./src/routes/managerRoutes.js";
import cashierRoutes from "./src/routes/cashierRoutes.js";
import { notFound, errorHandler } from "./src/middleware/errorMiddleware.js";
import { setupSwagger } from "./src/config/swagger.js";

const app = express();
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// Public/Common Routes
app.use("/api/auth", authRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/stores", storeRoutes);
app.use("/api/dashboard", dashboardRoutes);

// Role-Specific Routes (Clean for Frontend)
app.use("/api/admin", adminRoutes);
app.use("/api/manager", managerRoutes);
app.use("/api/cashier", cashierRoutes);

app.get("/api", (req, res) => res.send("API is running"));

// Swagger API Documentation
setupSwagger(app);

app.use(notFound);
app.use(errorHandler);

const startServr = async () => {
  try {
    await connect();
    app.listen(process.env.PORT, () => {
      console.log("Server is running on port " + process.env.PORT);
    });
  } catch (_error) {
    console.log("Server failed to start");
    process.exit(1);
  }
};

if (process.env.NODE_ENV !== "test") {
  startServr();
}

export { app };
