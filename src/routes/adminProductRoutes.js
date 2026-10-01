const express = require("express");

const router = express.Router();

const authenticateToken = require("../../middleware/authMiddleware");
const { requireAdmin } = require("../../middleware/authMiddleware");

const {
  getAllProducts,
  getProductById,
  updateProductStatus
} = require("../controllers/adminProductController");


// Get all products
router.get(
  "/",
  authenticateToken,
  requireAdmin,
  getAllProducts
);


// Get single product
router.get(
  "/:id",
  authenticateToken,
  requireAdmin,
  getProductById
);


// Update product status
router.put(
  "/:id/status",
  authenticateToken,
  requireAdmin,
  updateProductStatus
);


module.exports = router;