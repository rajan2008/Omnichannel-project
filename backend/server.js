import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import connect from "./src/config/connectdb.js";
import authRoutes from "./src/routes/authRoutes.js";
import inventoryRoutes from "./src/routes/inventoryRoutes.js";
import orderRoutes from "./src/routes/orderRoutes.js";
import storeRoutes from "./src/routes/storeRoutes.js";
import { notFound, errorHandler } from "./src/middleware/errorMiddleware.js";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/stores", storeRoutes);

app.get("/api", (req, res) => res.send("API is running"));

app.use(notFound);
app.use(errorHandler);

const startServr = async () => {
  try {
    await connect();
    app.listen(process.env.PORT, () => {
      console.log("Server is running on port " + process.env.PORT);
    });
  } catch (error) {
    console.log("Server failed to start");
    process.exit(1);
  }
};

startServr();
