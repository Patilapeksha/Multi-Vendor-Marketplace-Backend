const express = require("express");

const router = express.Router();

const authMiddleware = require("../../middleware/authMiddleware");

const {
  getAdminSalesReport,
  getVendorSalesReport,
  getAdminOrderReport,
  getVendorOrderReport,
  exportAdminOrdersCsv,
  exportVendorOrdersCsv
} = require("../controllers/reportController");


// ==========================================
// ADMIN SALES REPORT
// ==========================================

router.get(
  "/admin/sales",
  authMiddleware,
  authMiddleware.requireAdmin,
  getAdminSalesReport
);


// ==========================================
// VENDOR SALES REPORT
// ==========================================

router.get(
  "/vendor/sales",
  authMiddleware,
  authMiddleware.requireVendor,
  getVendorSalesReport
);


// ==========================================
// ADMIN ORDER REPORT
// ==========================================

router.get(
  "/admin/orders",
  authMiddleware,
  authMiddleware.requireAdmin,
  getAdminOrderReport
);


// ==========================================
// VENDOR ORDER REPORT
// ==========================================

router.get(
  "/vendor/orders",
  authMiddleware,
  authMiddleware.requireVendor,
  getVendorOrderReport
);


// ==========================================
// ADMIN ORDERS CSV
// ==========================================

router.get(
  "/admin/orders/csv",
  authMiddleware,
  authMiddleware.requireAdmin,
  exportAdminOrdersCsv
);


// ==========================================
// VENDOR ORDERS CSV
// ==========================================

router.get(
  "/vendor/orders/csv",
  authMiddleware,
  authMiddleware.requireVendor,
  exportVendorOrdersCsv
);


module.exports = router;