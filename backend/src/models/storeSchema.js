import mongoose from "mongoose";
import User from "./userSchema.js";
import Product from "./productSchema.js";
import Order from "./orderSchema.js";
import InventoryLedger from "./inventoryLedgerSchema.js";

const storeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    location: { type: String, required: true },
    admin: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    phone: { type: String },
    contact: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Cascading deletion logic: Delete associated Users, Products, and Orders when a Store is deleted
storeSchema.pre("findOneAndDelete", async function () {
  const storeId = this.getQuery()["_id"];
  if (storeId) {
    await User.deleteMany({ store: storeId });
    await Product.deleteMany({ store: storeId });
    await Order.deleteMany({ store: storeId });
    await InventoryLedger.deleteMany({ store: storeId });
  }
});

export default mongoose.model("Store", storeSchema);
