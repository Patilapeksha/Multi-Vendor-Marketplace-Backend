const express = require("express");
const router = express.Router();

const authMiddleware = require("../../middleware/authMiddleware");

const {
  getProductStock,
  updateProductStock
} = require("../controllers/stockController");


// Get stock
router.get(
  "/:productId",
  authMiddleware,
  getProductStock
);


// Update stock
router.put(
  "/:productId",
  authMiddleware,
  updateProductStock
);


module.exports = router;