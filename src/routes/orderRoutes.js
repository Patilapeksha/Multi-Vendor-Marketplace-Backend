const express = require("express");

const router = express.Router();

const authMiddleware = require("../../middleware/authMiddleware");

const {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  getVendorOrders,
  updateVendorOrderStatus
} = require("../controllers/orderController");


// ==========================================
// BUYER ORDER ROUTES
// ==========================================

// Create order from cart
router.post(
  "/",
  authMiddleware,
  createOrder
);

// Get logged-in buyer's orders
router.get(
  "/my",
  authMiddleware,
  getMyOrders
);


// ==========================================
// VENDOR ORDER ROUTES
// ==========================================

// Get logged-in vendor's orders
// IMPORTANT: This must come BEFORE /:id
router.get(
  "/vendor",
  authMiddleware,
  authMiddleware.requireVendor,
  getVendorOrders
);

// Vendor update sub-order status + tracking
router.put(
  "/vendor/:id/status",
  authMiddleware,
  authMiddleware.requireVendor,
  updateVendorOrderStatus
);


// ==========================================
// ADMIN ORDER ROUTES
// ==========================================

// Admin update main order status
router.put(
  "/:id/status",
  authMiddleware,
  authMiddleware.requireAdmin,
  updateOrderStatus
);


// ==========================================
// SINGLE ORDER ROUTE
// ==========================================

// Get single buyer order
// IMPORTANT: Keep this AFTER /vendor

// ADMIN - GET ALL ORDERS
router.get(
  "/admin/all",
  authMiddleware,
  authMiddleware.requireAdmin,
  getAllOrders
);


router.get(
  "/:id",
  authMiddleware,
  getOrderById
);


module.exports = router;