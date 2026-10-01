const express = require("express");

const router = express.Router();

const authMiddleware = require("../../middleware/authMiddleware");

const {
  getCommissionRate,
  updateCommissionRate
} = require("../controllers/commissionController");

router.get(
  "/",
  authMiddleware,
  authMiddleware.requireAdmin,
  getCommissionRate
);

router.put(
  "/",
  authMiddleware,
  authMiddleware.requireAdmin,
  updateCommissionRate
);

module.exports = router;