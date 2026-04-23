import mongoose from "mongoose";
<<<<<<< HEAD
import User from "./userSchema.js";
import Product from "./productSchema.js";
import Order from "./orderSchema.js";
import InventoryLedger from "./inventoryLedgerSchema.js";
=======
>>>>>>> a53fbb84067364ab16d6e57b5d10a9fee8564646

const storeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    location: { type: String, required: true },
<<<<<<< HEAD
    contact: { type: String },
=======
    admin: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    phone: { type: String },
>>>>>>> a53fbb84067364ab16d6e57b5d10a9fee8564646
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

<<<<<<< HEAD
// Cascading deletion logic: Delete associated Users, Products, and Orders when a Store is deleted
storeSchema.pre("findOneAndDelete", async function (next) {
  const storeId = this.getQuery()["_id"];
  if (storeId) {
    await User.deleteMany({ store: storeId });
    await Product.deleteMany({ store: storeId });
    await Order.deleteMany({ store: storeId });
    await InventoryLedger.deleteMany({ store: storeId });
  }
  next();
});

=======
>>>>>>> a53fbb84067364ab16d6e57b5d10a9fee8564646
export default mongoose.model("Store", storeSchema);
