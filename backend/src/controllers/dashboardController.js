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
        // New user without store — return empty stats instead of blocking
        return res.status(200).json({
          today: { revenue: 0, count: 0 },
          total: { revenue: 0, count: 0 },
          lowStockCount: 0,
        });
      }
      matchQuery.store = req.user.store;
      productQuery.store = req.user.store;
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
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
