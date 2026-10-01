const express = require("express");

const router = express.Router();

const authMiddleware = require("../../middleware/authMiddleware");

const {
  createVariant,
  getProductVariants,
  updateVariant,
  deleteVariant
} = require("../controllers/variantController");


// ==========================================
// CREATE VARIANT
// ==========================================

router.post(
  "/product/:productId",
  authMiddleware,
  authMiddleware.requireVendor,
  createVariant
);


// ==========================================
// GET PRODUCT VARIANTS
// ==========================================

router.get(
  "/product/:productId",
  getProductVariants
);


// ==========================================
// UPDATE VARIANT
// ==========================================

router.put(
  "/:id",
  authMiddleware,
  authMiddleware.requireVendor,
  updateVariant
);


// ==========================================
// DELETE VARIANT
// ==========================================

router.delete(
  "/:id",
  authMiddleware,
  authMiddleware.requireVendor,
  deleteVariant
);


module.exports = router;