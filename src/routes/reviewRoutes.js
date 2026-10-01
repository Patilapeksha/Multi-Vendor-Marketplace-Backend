const express = require("express");

const router = express.Router();

const authMiddleware = require("../../middleware/authMiddleware");

const {
  createReview,
  getProductReviews,
  deleteReview
} = require("../controllers/reviewController");

// ==========================================
// GET PRODUCT REVIEWS - PUBLIC
// ==========================================

router.get(
  "/product/:productId",
  getProductReviews
);

// ==========================================
// CREATE REVIEW - BUYER
// ==========================================

router.post(
  "/",
  authMiddleware,
  createReview
);

// ==========================================
// DELETE REVIEW - BUYER
// ==========================================

router.delete(
  "/:id",
  authMiddleware,
  deleteReview
);

module.exports = router;