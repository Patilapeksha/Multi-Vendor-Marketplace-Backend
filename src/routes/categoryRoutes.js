const express = require("express");

const router = express.Router();

const {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory
} = require("../controllers/categoryController");

const authenticateToken = require("../../middleware/authMiddleware");

const {
  requireAdmin
} = require("../../middleware/authMiddleware");

// Public - get categories
router.get("/", getCategories);

// Admin only - category management
router.post(
  "/",
  authenticateToken,
  requireAdmin,
  createCategory
);

router.put(
  "/:id",
  authenticateToken,
  requireAdmin,
  updateCategory
);

router.delete(
  "/:id",
  authenticateToken,
  requireAdmin,
  deleteCategory
);

module.exports = router;