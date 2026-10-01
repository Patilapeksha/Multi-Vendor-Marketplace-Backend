const express = require("express");

const router = express.Router();

const {
  getAllVendors,
  updateVendorStatus
} = require("../controllers/adminVendorController");

const authenticateToken = require("../../middleware/authMiddleware");

const {
  requireAdmin
} = require("../../middleware/authMiddleware");

// GET ALL VENDORS
router.get(
  "/",
  authenticateToken,
  requireAdmin,
  getAllVendors
);

// APPROVE / REJECT / SUSPEND / REACTIVATE
router.put(
  "/:id/status",
  authenticateToken,
  requireAdmin,
  updateVendorStatus
);

module.exports = router;