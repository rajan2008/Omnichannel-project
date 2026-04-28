import mongoose from "mongoose";

const inventoryLedgerSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    store: { type: mongoose.Schema.Types.ObjectId, ref: "Store" },
    type: { type: String, enum: ["IN", "OUT", "ADJUSTMENT"], required: true },
    quantity: { type: Number, required: true }, // positive or negative depending on transaction
    referenceDocument: { type: String, required: true }, // e.g., "Order_ID" or "Restock_ID"
    referenceId: { type: mongoose.Schema.Types.ObjectId, required: true }, // The actual Order ID or Restock ID
    performedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // User who performed the action
    previousStock: { type: Number, required: true },
    newStock: { type: Number, required: true },
    notes: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("InventoryLedger", inventoryLedgerSchema);
