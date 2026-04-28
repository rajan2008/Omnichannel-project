import Product from "../models/productSchema.js";
import { logActivity } from "../utils/activityLogger.js";

export const healInventory = async (req, res) => {
  try {
    const products = await Product.find({ stock: { $lt: 0 } });
    for (const p of products) {
      const old = p.stock;
      p.stock = 0;
      await p.save();
      await logActivity(req.user.id, "SELF_HEAL", `Reset negative stock for ${p.name} (${old} to 0)`, p._id);
    }
    res.status(200).json({ message: "Self-healing complete", fixed: products.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
