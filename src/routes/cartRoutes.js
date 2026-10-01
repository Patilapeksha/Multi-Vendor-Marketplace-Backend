const express = require("express");

const router = express.Router();

const {
  addToCart,
  getCart,
  updateCart,
  removeFromCart
} = require("../controllers/cartController");

const authenticateToken = require("../../middleware/authMiddleware");

// Add product to cart
router.post("/", authenticateToken, addToCart);

// Get logged-in user's cart
router.get("/", authenticateToken, getCart);

// Update cart quantity
router.put("/:id", authenticateToken, updateCart);

// Remove product from cart
router.delete("/:id", authenticateToken, removeFromCart);

module.exports = router;