const express = require("express");

const router = express.Router();

const authenticateToken = require("../../middleware/authMiddleware");
const { requireAdmin } = require("../../middleware/authMiddleware");

const {
  getDashboardStats
} = require("../controllers/adminDashboardController");

router.get(
  "/stats",
  authenticateToken,
  requireAdmin,
  getDashboardStats
);

module.exports = router;