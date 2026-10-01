const express = require("express");

const router = express.Router();

const authMiddleware = require("../../middleware/authMiddleware");

const {
  getVendorReturns,
  getVendorReturnById,
  approveVendorReturn,
  rejectVendorReturn
} = require("../controllers/vendorReturnController");

// VENDOR - Get all returns
router.get(
  "/",
  authMiddleware,
  authMiddleware.requireVendor,
  getVendorReturns
);

// VENDOR - Get single return
router.get(
  "/:id",
  authMiddleware,
  authMiddleware.requireVendor,
  getVendorReturnById
);

// VENDOR - Approve return
router.put(
  "/:id/approve",
  authMiddleware,
  authMiddleware.requireVendor,
  approveVendorReturn
);

// VENDOR - Reject return
router.put(
  "/:id/reject",
  authMiddleware,
  authMiddleware.requireVendor,
  rejectVendorReturn
);

module.exports = router;