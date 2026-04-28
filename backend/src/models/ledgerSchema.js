import mongoose from "mongoose";

const ledgerSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    changeAmount: { type: Number, required: true }, // Negative for sales, Positive for restock
    type: { 
      type: String, 
      enum: ["sale", "restock", "adjustment", "return"], 
      required: true 
    },
    previousStock: { type: Number, required: true },
    newStock: { type: Number, required: true },
    cashier: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    order: { type: mongoose.Schema.Types.ObjectId, ref: "Order" }, // Optional
    notes: { type: String },
  },
  { timestamps: true }
);

// High-frequency search indexing as per Week 1 PRD
ledgerSchema.index({ product: 1, createdAt: -1 });
ledgerSchema.index({ type: 1 });

export default mongoose.model("InventoryLedger", ledgerSchema);
