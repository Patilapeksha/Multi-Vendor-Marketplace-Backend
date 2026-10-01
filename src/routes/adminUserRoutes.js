const express = require("express");

const router = express.Router();

const authMiddleware = require("../../middleware/authMiddleware");

const {
  getAllUsers,
  getUserById,
  updateUserRole,
  deactivateUser,
  activateUser
} = require("../controllers/adminUserController");


// ==========================================
// GET ALL USERS
// ==========================================

router.get(
  "/",
  authMiddleware,
  authMiddleware.requireAdmin,
  getAllUsers
);


// ==========================================
// GET USER BY ID
// ==========================================

router.get(
  "/:id",
  authMiddleware,
  authMiddleware.requireAdmin,
  getUserById
);


// ==========================================
// UPDATE USER ROLE
// ==========================================

router.put(
  "/:id/role",
  authMiddleware,
  authMiddleware.requireAdmin,
  updateUserRole
);


// ==========================================
// DEACTIVATE USER
// ==========================================

router.put(
  "/:id/deactivate",
  authMiddleware,
  authMiddleware.requireAdmin,
  deactivateUser
);


// ==========================================
// ACTIVATE USER
// ==========================================

router.put(
  "/:id/activate",
  authMiddleware,
  authMiddleware.requireAdmin,
  activateUser
);


module.exports = router;