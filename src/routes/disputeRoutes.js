const express = require("express");

const router = express.Router();

const authMiddleware = require("../../middleware/authMiddleware");

const {
  createDispute,
  getMyDisputes,
  getVendorDisputes,
  getAllDisputes,
  updateDispute
} = require("../controllers/disputeController");


// ==========================================
// BUYER - CREATE DISPUTE
// ==========================================

router.post(
  "/",
  authMiddleware,
  createDispute
);


// ==========================================
// BUYER - GET MY DISPUTES
// ==========================================

router.get(
  "/my",
  authMiddleware,
  getMyDisputes
);


// ==========================================
// VENDOR - GET MY DISPUTES
// ==========================================

router.get(
  "/vendor/my",
  authMiddleware,
  authMiddleware.requireVendor,
  getVendorDisputes
);


// ==========================================
// ADMIN - GET ALL DISPUTES
// ==========================================

router.get(
  "/admin",
  authMiddleware,
  authMiddleware.requireAdmin,
  getAllDisputes
);


// ==========================================
// ADMIN - UPDATE DISPUTE
// ==========================================

router.put(
  "/admin/:id",
  authMiddleware,
  authMiddleware.requireAdmin,
  updateDispute
);


module.exports = router;