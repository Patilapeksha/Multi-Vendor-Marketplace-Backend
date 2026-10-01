const express = require("express");

const router = express.Router();

const authMiddleware = require("../../middleware/authMiddleware");

const {
  getAllPayouts,
  getMyPayouts,
  getPayoutById,
  updatePayoutStatus
} = require("../controllers/payoutController");

const {
  generatePayoutsForOrder
} = require("../controllers/payoutGenerationController");

// ==========================================
// GET ALL PAYOUTS - ADMIN
// ==========================================

router.get(
  "/",
  authMiddleware,
  authMiddleware.requireAdmin,
  getAllPayouts
);

// ==========================================
// GET MY PAYOUTS - VENDOR
// ==========================================

router.get(
  "/vendor",
  authMiddleware,
  authMiddleware.requireVendor,
  getMyPayouts
);

// ==========================================
// GENERATE PAYOUTS FOR ORDER - ADMIN
// ==========================================

router.post(
  "/generate/:orderId",
  authMiddleware,
  authMiddleware.requireAdmin,
  (req, res) => {
    const orderId = Number(req.params.orderId);

    if (!Number.isInteger(orderId) || orderId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID"
      });
    }

    generatePayoutsForOrder(orderId, (err) => {
      if (err) {
        console.error(
          "Generate payouts error:",
          err
        );

        return res.status(500).json({
          success: false,
          message: "Failed to generate payouts"
        });
      }

      return res.status(201).json({
        success: true,
        message: "Payouts generated successfully"
      });
    });
  }
);

// ==========================================
// GET SINGLE PAYOUT - ADMIN
// ==========================================

router.get(
  "/:id",
  authMiddleware,
  authMiddleware.requireAdmin,
  getPayoutById
);

// ==========================================
// UPDATE PAYOUT STATUS - ADMIN
// ==========================================

router.put(
  "/:id/status",
  authMiddleware,
  authMiddleware.requireAdmin,
  updatePayoutStatus
);

module.exports = router;