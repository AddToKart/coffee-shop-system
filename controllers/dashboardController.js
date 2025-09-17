import db from "../database.js";

export const dashboardController = {
  // Get dashboard statistics
  getDashboardStats: async (req, res) => {
    try {
      const today = new Date().toISOString().split("T")[0];

      // Get today's orders and revenue
      const todayOrders = await db.getAsync(
        "SELECT COUNT(*) as count, COALESCE(SUM(total_amount), 0) as revenue FROM orders WHERE DATE(created_at) = ?",
        [today]
      );

      // Get pending orders count
      const pendingOrders = await db.getAsync(
        "SELECT COUNT(*) as count FROM orders WHERE status = 'pending'"
      );

      // Get total available products
      const totalProducts = await db.getAsync(
        "SELECT COUNT(*) as count FROM products WHERE available = 1"
      );

      // Get recent orders
      const recentOrders = await db.allAsync(
        "SELECT * FROM orders ORDER BY created_at DESC LIMIT 5"
      );

      // Get this week's revenue trend
      const weeklyRevenue = await db.allAsync(`
        SELECT 
          DATE(created_at) as date,
          COUNT(*) as order_count,
          COALESCE(SUM(total_amount), 0) as revenue
        FROM orders 
        WHERE created_at >= date('now', '-7 days')
        GROUP BY DATE(created_at)
        ORDER BY DATE(created_at)
      `);

      // Get popular products
      const popularProducts = await db.allAsync(`
        SELECT 
          oi.product_name,
          SUM(oi.quantity) as total_sold,
          COUNT(DISTINCT oi.order_id) as order_count
        FROM order_items oi
        JOIN orders o ON oi.order_id = o.id
        WHERE o.created_at >= date('now', '-30 days')
        GROUP BY oi.product_id, oi.product_name
        ORDER BY total_sold DESC
        LIMIT 5
      `);

      res.json({
        todayOrders: todayOrders.count,
        todayRevenue: todayOrders.revenue,
        pendingOrders: pendingOrders.count,
        totalProducts: totalProducts.count,
        recentOrders,
        weeklyRevenue,
        popularProducts,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get order statistics by date range
  getOrderStats: async (req, res) => {
    try {
      const { startDate, endDate } = req.query;

      let dateFilter = "";
      let params = [];

      if (startDate && endDate) {
        dateFilter = "WHERE DATE(created_at) BETWEEN ? AND ?";
        params = [startDate, endDate];
      } else if (startDate) {
        dateFilter = "WHERE DATE(created_at) >= ?";
        params = [startDate];
      } else if (endDate) {
        dateFilter = "WHERE DATE(created_at) <= ?";
        params = [endDate];
      }

      const orderStats = await db.allAsync(
        `
        SELECT 
          DATE(created_at) as date,
          COUNT(*) as order_count,
          COALESCE(SUM(total_amount), 0) as revenue,
          AVG(total_amount) as avg_order_value
        FROM orders 
        ${dateFilter}
        GROUP BY DATE(created_at)
        ORDER BY DATE(created_at)
      `,
        params
      );

      res.json(orderStats);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get product performance
  getProductPerformance: async (req, res) => {
    try {
      const { limit = 10 } = req.query;

      const productPerformance = await db.allAsync(
        `
        SELECT 
          p.id,
          p.name,
          p.category,
          p.price,
          COALESCE(SUM(oi.quantity), 0) as total_sold,
          COALESCE(SUM(oi.total_price), 0) as total_revenue,
          COUNT(DISTINCT oi.order_id) as order_count
        FROM products p
        LEFT JOIN order_items oi ON p.id = oi.product_id
        LEFT JOIN orders o ON oi.order_id = o.id AND o.created_at >= date('now', '-30 days')
        WHERE p.available = 1
        GROUP BY p.id, p.name, p.category, p.price
        ORDER BY total_sold DESC
        LIMIT ?
      `,
        [parseInt(limit)]
      );

      res.json(productPerformance);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};
