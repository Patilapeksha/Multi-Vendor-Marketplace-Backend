const express = require("express");

const router = express.Router();

const authMiddleware = require("../../middleware/authMiddleware");

const {
  addProductImage,
  getProductImages,
  updateProductImage,
  deleteProductImage
} = require("../controllers/productImageController");

// Add image to a product
router.post(
  "/product/:productId",
  authMiddleware,
  authMiddleware.requireVendor,
  addProductImage
);

// Get all images for a product
router.get(
  "/product/:productId",
  getProductImages
);

// Update product image
router.put(
  "/:id",
  authMiddleware,
  authMiddleware.requireVendor,
  updateProductImage
);

// Delete product image
router.delete(
  "/:id",
  authMiddleware,
  authMiddleware.requireVendor,
  deleteProductImage
);

module.exports = router;