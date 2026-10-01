const db = require("../../db");
const { createAuditLog } = require("../utils/auditLogger");

// ==========================================
// GET ALL USERS
// ==========================================

const getAllUsers = (req, res) => {
  const query = `
    SELECT
      id,
      name,
      email,
      role,
      vendor_status,
      is_active,
      created_at
    FROM users
    ORDER BY id DESC
  `;

  db.query(query, (err, users) => {
    if (err) {
      console.error("Get users error:", err);

      return res.status(500).json({
        success: false,
        message: "Failed to fetch users"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Users fetched successfully",
      users
    });
  });
};


// ==========================================
// GET USER BY ID
// ==========================================

const getUserById = (req, res) => {
  const userId = Number(req.params.id);

  if (!Number.isInteger(userId) || userId <= 0) {
    return res.status(400).json({
      success: false,
      message: "Invalid user ID"
    });
  }

  const query = `
    SELECT
      id,
      name,
      email,
      role,
      vendor_status,
      is_active,
      created_at
    FROM users
    WHERE id = ?
  `;

  db.query(query, [userId], (err, users) => {
    if (err) {
      console.error("Get user error:", err);

      return res.status(500).json({
        success: false,
        message: "Failed to fetch user"
      });
    }

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "User fetched successfully",
      user: users[0]
    });
  });
};


// ==========================================
// UPDATE USER ROLE
// ==========================================

const updateUserRole = (req, res) => {
  const userId = Number(req.params.id);
  const { role } = req.body;

  const allowedRoles = [
    "admin",
    "vendor",
    "buyer"
  ];

  if (!Number.isInteger(userId) || userId <= 0) {
    return res.status(400).json({
      success: false,
      message: "Invalid user ID"
    });
  }

  if (!allowedRoles.includes(role)) {
    return res.status(400).json({
      success: false,
      message: "Role must be admin, vendor, or buyer"
    });
  }

  if (userId === req.user.id) {
    return res.status(400).json({
      success: false,
      message: "Admin cannot change their own role"
    });
  }

  const query = `
    UPDATE users
    SET role = ?
    WHERE id = ?
  `;

  db.query(query, [role, userId], (err, result) => {
    if (err) {
      console.error("Update user role error:", err);

      return res.status(500).json({
        success: false,
        message: "Failed to update user role"
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // CREATE AUDIT LOG
    createAuditLog(
      req.user.id,
      "UPDATE_USER_ROLE",
      "user",
      userId,
      `Admin changed user ${userId} role to ${role}`,
      req.ip
    );

    return res.status(200).json({
      success: true,
      message: "User role updated successfully",
      user_id: userId,
      role
    });
  });
};


// ==========================================
// DEACTIVATE USER
// ==========================================

const deactivateUser = (req, res) => {
  const userId = Number(req.params.id);

  if (!Number.isInteger(userId) || userId <= 0) {
    return res.status(400).json({
      success: false,
      message: "Invalid user ID"
    });
  }

  if (userId === req.user.id) {
    return res.status(400).json({
      success: false,
      message: "Admin cannot deactivate their own account"
    });
  }

  const query = `
    UPDATE users
    SET is_active = 0
    WHERE id = ?
  `;

  db.query(query, [userId], (err, result) => {
    if (err) {
      console.error("Deactivate user error:", err);

      return res.status(500).json({
        success: false,
        message: "Failed to deactivate user"
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // CREATE AUDIT LOG
    createAuditLog(
      req.user.id,
      "DEACTIVATE_USER",
      "user",
      userId,
      `Admin deactivated user ${userId}`,
      req.ip
    );

    return res.status(200).json({
      success: true,
      message: "User deactivated successfully",
      user_id: userId
    });
  });
};


// ==========================================
// ACTIVATE USER
// ==========================================

const activateUser = (req, res) => {
  const userId = Number(req.params.id);

  if (!Number.isInteger(userId) || userId <= 0) {
    return res.status(400).json({
      success: false,
      message: "Invalid user ID"
    });
  }

  const query = `
    UPDATE users
    SET is_active = 1
    WHERE id = ?
  `;

  db.query(query, [userId], (err, result) => {
    if (err) {
      console.error("Activate user error:", err);

      return res.status(500).json({
        success: false,
        message: "Failed to activate user"
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // CREATE AUDIT LOG
    createAuditLog(
      req.user.id,
      "ACTIVATE_USER",
      "user",
      userId,
      `Admin activated user ${userId}`,
      req.ip
    );

    return res.status(200).json({
      success: true,
      message: "User activated successfully",
      user_id: userId
    });
  });
};


module.exports = {
  getAllUsers,
  getUserById,
  updateUserRole,
  deactivateUser,
  activateUser
};