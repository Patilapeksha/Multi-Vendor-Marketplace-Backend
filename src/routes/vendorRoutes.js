const express = require("express");

const router = express.Router();

const {
  getAllVendors,
  updateVendorStatus
} = require("../controllers/vendorController");

const authenticateToken = require("../../middleware/authMiddleware");
const authorizeRoles = require("../../middleware/roleMiddleware");

// Admin can view all vendors
router.get(
  "/",
  authenticateToken,
  authorizeRoles("admin"),
  getAllVendors
);

// Admin can change vendor status
router.put(
  "/:id/status",
  authenticateToken,
  authorizeRoles("admin"),
  updateVendorStatus
);

module.exports = router;