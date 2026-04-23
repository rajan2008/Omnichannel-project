import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    sku: { type: String, required: true, unique: true, trim: true },
    barcode: { type: String, trim: true },
    category: { type: String, trim: true },
    price: { type: Number, required: true, min: 0 },
    discount: { type: Number, default: 0, min: 0, max: 100 },
    variants: [
      {
        size: String,
        color: String,
        sku: String,
        price: Number,
      },
    ],
    stock: { type: Number, default: 0, min: 0 },
    lowStockThreshold: { type: Number, default: 10 },
    isActive: { type: Boolean, default: true },
    store: { type: mongoose.Schema.Types.ObjectId, ref: "Store" },
  },
  { timestamps: true }
);

// Indexing strategies for high-frequency search queries
productSchema.index({ name: "text", category: "text" });
productSchema.index({ sku: 1 });
productSchema.index({ store: 1, isActive: 1 });

export default mongoose.model("Product", productSchema);
