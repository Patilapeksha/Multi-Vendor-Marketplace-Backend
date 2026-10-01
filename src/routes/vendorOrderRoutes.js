const express = require("express");

const router = express.Router();

const authMiddleware = require("../../middleware/authMiddleware");

const {
  getVendorOrders,
  updateVendorOrderStatus
} = require("../controllers/vendorOrderController");

// Get orders belonging to logged-in vendor
router.get(
  "/",
  authMiddleware,
  authMiddleware.requireVendor,
  getVendorOrders
);

// Update vendor order status + tracking
router.put(
  "/:id/status",
  authMiddleware,
  authMiddleware.requireVendor,
  updateVendorOrderStatus
);

module.exports = router;