import Order from "../models/orderSchema.js";
import Product from "../models/productSchema.js";

export const getDashboardStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const matchQuery = { orderStatus: "COMPLETED" };
    const productQuery = { $expr: { $lte: ["$stock", "$lowStockThreshold"] }, isActive: true };

    if (req.user.role !== "admin") {
      if (!req.user.store) {
        return res.status(403).json({ message: "No store assigned to this user" });
      }
      matchQuery.store = req.user.store;
      productQuery.store = req.user.store;
    } else if (req.query.storeId && req.query.storeId !== "all") {
      matchQuery.store = new mongoose.Types.ObjectId(req.query.storeId);
      productQuery.store = new mongoose.Types.ObjectId(req.query.storeId);
    }

    const stats = await Order.aggregate([
      {
        $facet: {
          todayStats: [
            { $match: { ...matchQuery, createdAt: { $gte: today } } },
            {
              $group: {
                _id: null,
                revenue: { $sum: "$total" },
                count: { $sum: 1 },
              },
            },
          ],
          totalStats: [
            { $match: matchQuery },
            {
              $group: {
                _id: null,
                revenue: { $sum: "$total" },
                count: { $sum: 1 },
              },
            },
          ],
        },
      },
    ]);

    const lowStockCount = await Product.countDocuments(productQuery);

    const todayStats = stats[0].todayStats[0] || { revenue: 0, count: 0 };
    const totalStats = stats[0].totalStats[0] || { revenue: 0, count: 0 };

    const productPerformance = await Order.aggregate([
      { $match: matchQuery },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.product",
          name: { $first: "$items.name" },
          totalQty: { $sum: "$items.quantity" },
          totalSales: { $sum: { $multiply: ["$items.quantity", "$items.price"] } }
        }
      },
      { $sort: { totalQty: -1 } }
    ]);

    res.status(200).json({
      today: {
        revenue: todayStats.revenue,
        count: todayStats.count,
      },
      total: {
        revenue: totalStats.revenue,
        count: totalStats.count,
      },
      lowStockCount,
      topProducts: productPerformance.slice(0, 5),
      slowProducts: productPerformance.slice(-5).reverse(),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
