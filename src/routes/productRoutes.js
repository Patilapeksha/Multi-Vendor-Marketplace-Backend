const express = require("express");

const router = express.Router();

const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getMyProducts
} = require("../controllers/productController");

const authenticateToken = require("../../middleware/authMiddleware");
const upload = require("../../middleware/uploadMiddleware");

// Get all products
router.get("/", getProducts);

// Get logged-in vendor's products
router.get(
  "/my-products",
  authenticateToken,
  getMyProducts
);

// Create product with image upload
router.post(
  "/",
  authenticateToken,
  upload.single("image"),
  createProduct
);

// Update product with image upload
router.put(
  "/:id",
  authenticateToken,
  upload.single("image"),
  updateProduct
);

// Delete product
router.delete(
  "/:id",
  authenticateToken,
  deleteProduct
);

// Get single product
router.get(
  "/:id",
  getProductById
);

module.exports = router;