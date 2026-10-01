const express = require("express");

const router = express.Router();

const authMiddleware = require("../../middleware/authMiddleware");

const {
  resetUserPassword
} = require("../controllers/adminPasswordController");


// ==========================================
// ADMIN RESET USER PASSWORD
// ==========================================

router.put(
  "/:id/reset-password",
  authMiddleware,
  authMiddleware.requireAdmin,
  resetUserPassword
);


module.exports = router;