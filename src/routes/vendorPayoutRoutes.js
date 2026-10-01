const express = require("express");

const router = express.Router();

const authMiddleware = require("../../middleware/authMiddleware");

const {
  getMyPayouts
} = require("../controllers/payoutController");

router.get(
  "/",
  authMiddleware,
  authMiddleware.requireVendor,
  getMyPayouts
);

module.exports = router;