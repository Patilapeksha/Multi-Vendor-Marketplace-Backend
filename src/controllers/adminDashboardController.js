const db = require("../../db");

const getDashboardStats = (req, res) => {
  const query = `
    SELECT
      (SELECT COUNT(*)
       FROM users
       WHERE role = 'vendor') AS total_vendors,

      (SELECT COUNT(*)
       FROM products
       WHERE status != 'removed') AS total_products,

      (SELECT COUNT(*)
       FROM orders
       WHERE DATE(created_at) = CURDATE()) AS orders_today,

      (SELECT COALESCE(SUM(total_amount), 0)
       FROM orders
       WHERE status != 'cancelled') AS gmv
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error(
        "Admin dashboard error:",
        err
      );

      return res.status(500).json({
        success: false,
        message: "Failed to fetch dashboard statistics"
      });
    }

    const stats = results[0];

    res.status(200).json({
      success: true,
      message: "Dashboard statistics fetched successfully",
      dashboard: {
        total_vendors: Number(stats.total_vendors),
        total_products: Number(stats.total_products),
        orders_today: Number(stats.orders_today),
        gmv: Number(stats.gmv)
      }
    });
  });
};

module.exports = {
  getDashboardStats
};