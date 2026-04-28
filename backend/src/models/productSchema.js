import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    sku: { type: String, required: true, unique: true },
    category: { type: String, required: true },
    costPrice: { type: Number, required: true },
    basePrice: { type: Number, required: true },
    stock: { type: Number, default: 0 },
    lowStockThreshold: { type: Number, default: 10 },
    store: { type: mongoose.Schema.Types.ObjectId, ref: "Store", required: true },
    isActive: { type: Boolean, default: true },
    dynamicPricingRules: {
      promotions: [{
        promoPrice: Number,
        startDate: Date,
        endDate: Date
      }]
    }
  },
  { timestamps: true }
);

productSchema.index({ name: "text", category: "text", sku: "text" });

export default mongoose.model("Product", productSchema);
