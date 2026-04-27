import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: [true, "Product name is required"], 
      trim: true,
      index: true
    },
    description: { 
      type: String, 
      trim: true 
    },
    sku: { 
      type: String, 
      required: [true, "SKU is required"], 
      unique: true, 
      trim: true,
      index: true
    },
    barcode: { 
      type: String, 
      trim: true,
      index: true
    },
    category: { 
      type: String, 
      required: [true, "Category is required"], 
      trim: true 
    },
    categoryPath: {
      type: String, // Hierarchical path for categorization
      trim: true
    },
    brand: { 
      type: String, 
      trim: true 
    },
    costPrice: { 
      type: Number, 
      required: [true, "Cost price is required"],
      min: 0 
    },
    basePrice: { 
      type: Number, 
      required: [true, "Base selling price is required"],
      min: 0 
    },
    discount: { 
      type: Number, 
      default: 0, 
      min: 0, 
      max: 100 
    },
    unit: { 
      type: String, 
      default: "pcs" 
    },
    stock: {
      type: Number,
      required: [true, "Product stock is required"],
      default: 0,
      min: 0
    },
    images: [{ 
      type: String 
    }],
    variants: [
      {
        variantName: String,
        size: String,
        color: String,
        sku: { type: String, unique: true, sparse: true },
        price: Number,
        stock: { type: Number, default: 0 }
      },
    ],
    dynamicPricingRules: {
      type: mongoose.Schema.Types.Mixed, // For scheduled promotional overrides
      default: {}
    },
    isActive: { 
      type: Boolean, 
      default: true 
    },
    store: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Store" 
    },
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual field for profit calculation
productSchema.virtual("profit").get(function () {
  return this.basePrice - this.costPrice;
});

// Indexing strategies for high-frequency search queries
productSchema.index({ name: "text", category: "text", description: "text" });
productSchema.index({ store: 1, isActive: 1 });

export default mongoose.model("Product", productSchema);
