const db = require("../../db");
const { convertToCsv } = require("../utils/csv");

// ==========================================
// ADMIN SALES REPORT
// ==========================================

const getAdminSalesReport = (req, res) => {
  const { start_date, end_date } = req.query;

  let query = `
    SELECT
      COUNT(*) AS total_orders,
      COALESCE(SUM(total_amount), 0) AS total_sales,
      COALESCE(AVG(total_amount), 0) AS average_order_value
    FROM orders
    WHERE status != 'cancelled'
  `;

  const params = [];

  if (start_date) {
    query += ` AND DATE(created_at) >= ?`;
    params.push(start_date);
  }

  if (end_date) {
    query += ` AND DATE(created_at) <= ?`;
    params.push(end_date);
  }

  db.query(query, params, (err, results) => {
    if (err) {
      console.error("Admin sales report error:", err);

      return res.status(500).json({
        success: false,
        message: "Failed to generate sales report"
      });
    }

    const report = results[0];

    return res.status(200).json({
      success: true,
      message: "Admin sales report generated successfully",
      report: {
        total_orders: Number(report.total_orders),
        total_sales: Number(report.total_sales),
        average_order_value:
          Number(report.average_order_value)
      }
    });
  });
};


// ==========================================
// VENDOR SALES REPORT
// ==========================================

const getVendorSalesReport = (req, res) => {
  const vendorId = req.user.id;

  const { start_date, end_date } = req.query;

  let query = `
    SELECT
      COUNT(*) AS total_orders,
      COALESCE(SUM(subtotal), 0) AS total_sales,
      COALESCE(AVG(subtotal), 0) AS average_order_value
    FROM vendor_orders
    WHERE vendor_id = ?
      AND status != 'cancelled'
  `;

  const params = [vendorId];

  if (start_date) {
    query += ` AND DATE(created_at) >= ?`;
    params.push(start_date);
  }

  if (end_date) {
    query += ` AND DATE(created_at) <= ?`;
    params.push(end_date);
  }

  db.query(query, params, (err, results) => {
    if (err) {
      console.error("Vendor sales report error:", err);

      return res.status(500).json({
        success: false,
        message: "Failed to generate vendor sales report"
      });
    }

    const report = results[0];

    return res.status(200).json({
      success: true,
      message: "Vendor sales report generated successfully",
      report: {
        vendor_id: vendorId,
        total_orders: Number(report.total_orders),
        total_sales: Number(report.total_sales),
        average_order_value:
          Number(report.average_order_value)
      }
    });
  });
};


// ==========================================
// ADMIN ORDER REPORT
// ==========================================

const getAdminOrderReport = (req, res) => {
  const { start_date, end_date } = req.query;

  let query = `
    SELECT
      orders.id AS order_id,
      orders.user_id AS buyer_id,
      users.name AS buyer_name,
      users.email AS buyer_email,
      orders.total_amount,
      orders.status,
      orders.created_at
    FROM orders
    JOIN users
      ON orders.user_id = users.id
    WHERE orders.status != 'cancelled'
  `;

  const params = [];

  if (start_date) {
    query += ` AND DATE(orders.created_at) >= ?`;
    params.push(start_date);
  }

  if (end_date) {
    query += ` AND DATE(orders.created_at) <= ?`;
    params.push(end_date);
  }

  query += ` ORDER BY orders.created_at DESC`;

  db.query(query, params, (err, orders) => {
    if (err) {
      console.error("Admin order report error:", err);

      return res.status(500).json({
        success: false,
        message: "Failed to generate order report"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Admin order report generated successfully",
      orders
    });
  });
};


// ==========================================
// VENDOR ORDER REPORT
// ==========================================

const getVendorOrderReport = (req, res) => {
  const vendorId = req.user.id;

  const { start_date, end_date } = req.query;

  let query = `
    SELECT
      vendor_orders.id AS vendor_order_id,
      vendor_orders.order_id,
      vendor_orders.vendor_id,
      vendor_orders.subtotal,
      vendor_orders.status,
      vendor_orders.tracking_number,
      vendor_orders.created_at
    FROM vendor_orders
    WHERE vendor_orders.vendor_id = ?
      AND vendor_orders.status != 'cancelled'
  `;

  const params = [vendorId];

  if (start_date) {
    query += ` AND DATE(vendor_orders.created_at) >= ?`;
    params.push(start_date);
  }

  if (end_date) {
    query += ` AND DATE(vendor_orders.created_at) <= ?`;
    params.push(end_date);
  }

  query += ` ORDER BY vendor_orders.created_at DESC`;

  db.query(query, params, (err, orders) => {
    if (err) {
      console.error("Vendor order report error:", err);

      return res.status(500).json({
        success: false,
        message: "Failed to generate vendor order report"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Vendor order report generated successfully",
      orders
    });
  });
};


// ==========================================
// EXPORT ADMIN ORDERS AS CSV
// ==========================================

const exportAdminOrdersCsv = (req, res) => {
  const { start_date, end_date } = req.query;

  let query = `
    SELECT
      orders.id AS order_id,
      users.name AS buyer_name,
      users.email AS buyer_email,
      orders.total_amount,
      orders.status,
      orders.created_at
    FROM orders
    JOIN users
      ON orders.user_id = users.id
    WHERE orders.status != 'cancelled'
  `;

  const params = [];

  if (start_date) {
    query += ` AND DATE(orders.created_at) >= ?`;
    params.push(start_date);
  }

  if (end_date) {
    query += ` AND DATE(orders.created_at) <= ?`;
    params.push(end_date);
  }

  query += ` ORDER BY orders.created_at DESC`;

  db.query(query, params, (err, orders) => {
    if (err) {
      console.error("Admin CSV export error:", err);

      return res.status(500).json({
        success: false,
        message: "Failed to export orders CSV"
      });
    }

    const columns = [
      {
        key: "order_id",
        label: "Order ID"
      },
      {
        key: "buyer_name",
        label: "Buyer Name"
      },
      {
        key: "buyer_email",
        label: "Buyer Email"
      },
      {
        key: "total_amount",
        label: "Total Amount"
      },
      {
        key: "status",
        label: "Status"
      },
      {
        key: "created_at",
        label: "Created At"
      }
    ];

    const csv = convertToCsv(
      orders,
      columns
    );

    res.setHeader(
      "Content-Type",
      "text/csv"
    );

    res.setHeader(
      "Content-Disposition",
      'attachment; filename="admin-orders.csv"'
    );

    return res.status(200).send(csv);
  });
};


// ==========================================
// EXPORT VENDOR ORDERS AS CSV
// ==========================================

const exportVendorOrdersCsv = (req, res) => {
  const vendorId = req.user.id;

  const { start_date, end_date } = req.query;

  let query = `
    SELECT
      vendor_orders.id AS vendor_order_id,
      vendor_orders.order_id,
      vendor_orders.subtotal,
      vendor_orders.status,
      vendor_orders.tracking_number,
      vendor_orders.created_at
    FROM vendor_orders
    WHERE vendor_orders.vendor_id = ?
      AND vendor_orders.status != 'cancelled'
  `;

  const params = [vendorId];

  if (start_date) {
    query += ` AND DATE(vendor_orders.created_at) >= ?`;
    params.push(start_date);
  }

  if (end_date) {
    query += ` AND DATE(vendor_orders.created_at) <= ?`;
    params.push(end_date);
  }

  query += ` ORDER BY vendor_orders.created_at DESC`;

  db.query(query, params, (err, orders) => {
    if (err) {
      console.error("Vendor CSV export error:", err);

      return res.status(500).json({
        success: false,
        message: "Failed to export vendor orders CSV"
      });
    }

    const columns = [
      {
        key: "vendor_order_id",
        label: "Vendor Order ID"
      },
      {
        key: "order_id",
        label: "Order ID"
      },
      {
        key: "subtotal",
        label: "Subtotal"
      },
      {
        key: "status",
        label: "Status"
      },
      {
        key: "tracking_number",
        label: "Tracking Number"
      },
      {
        key: "created_at",
        label: "Created At"
      }
    ];

    const csv = convertToCsv(
      orders,
      columns
    );

    res.setHeader(
      "Content-Type",
      "text/csv"
    );

    res.setHeader(
      "Content-Disposition",
      'attachment; filename="vendor-orders.csv"'
    );

    return res.status(200).send(csv);
  });
};


// ==========================================
// EXPORT CONTROLLERS
// ==========================================

module.exports = {
  getAdminSalesReport,
  getVendorSalesReport,
  getAdminOrderReport,
  getVendorOrderReport,
  exportAdminOrdersCsv,
  exportVendorOrdersCsv
};