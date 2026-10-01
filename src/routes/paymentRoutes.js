const express = require("express");

const router = express.Router();

const {
  createPayment,
  paymentWebhook,
  getPaymentByOrder
} = require("../controllers/paymentController");

const authenticateToken = require("../../middleware/authMiddleware");

// Buyer creates a mock payment
router.post(
  "/",
  authenticateToken,
  createPayment
);

// Mock payment gateway webhook
router.post(
  "/webhook",
  paymentWebhook
);

// Buyer checks payment
router.get(
  "/order/:orderId",
  authenticateToken,
  getPaymentByOrder
);

module.exports = router;