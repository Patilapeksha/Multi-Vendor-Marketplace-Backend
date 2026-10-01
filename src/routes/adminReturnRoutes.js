const express = require("express");

const router = express.Router();

const authMiddleware = require("../../middleware/authMiddleware");

const {
  getAllReturns,
  getReturnByIdAdmin,
  approveReturn,
  rejectReturn,
  processRefund
} = require("../controllers/adminReturnController");

// ADMIN - Get all returns
router.get(
  "/",
  authMiddleware,
  authMiddleware.requireAdmin,
  getAllReturns
);

// ADMIN - Get single return
router.get(
  "/:id",
  authMiddleware,
  authMiddleware.requireAdmin,
  getReturnByIdAdmin
);

// ADMIN - Approve return
router.put(
  "/:id/approve",
  authMiddleware,
  authMiddleware.requireAdmin,
  approveReturn
);

// ADMIN - Reject return
router.put(
  "/:id/reject",
  authMiddleware,
  authMiddleware.requireAdmin,
  rejectReturn
);

// ADMIN - Process refund
router.put(
  "/:id/refund",
  authMiddleware,
  authMiddleware.requireAdmin,
  processRefund
);

module.exports = router;