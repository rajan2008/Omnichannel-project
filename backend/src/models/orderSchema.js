import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    cashier: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    store: { type: mongoose.Schema.Types.ObjectId, ref: "Store", required: true },
    items: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
        name: String,
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
      },
    ],
    subtotal: { type: Number, required: true },
    tax: { type: Number, default: 0 },
    total: { type: Number, required: true },
    paymentMethod: { type: String, enum: ["cash", "card", "digital_wallet"], default: "cash" },
    orderStatus: { type: String, enum: ["PENDING", "COMPLETED", "CANCELLED"], default: "COMPLETED" },
    channel: { type: String, default: "in-store" },
  },
  { timestamps: true }
);

orderSchema.index({ cashier: 1, store: 1, orderStatus: 1 });

export default mongoose.model("Order", orderSchema);
