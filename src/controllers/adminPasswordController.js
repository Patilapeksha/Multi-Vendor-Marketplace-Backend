const bcrypt = require("bcryptjs");
const db = require("../../db");

// ==========================================
// ADMIN RESET USER PASSWORD
// ==========================================

const resetUserPassword = async (req, res) => {
  const userId = Number(req.params.id);
  const { new_password } = req.body;

  // Validate user ID
  if (!Number.isInteger(userId) || userId <= 0) {
    return res.status(400).json({
      success: false,
      message: "Invalid user ID"
    });
  }

  // Validate password
  if (
    typeof new_password !== "string" ||
    new_password.length < 6
  ) {
    return res.status(400).json({
      success: false,
      message:
        "New password must be at least 6 characters"
    });
  }

  // Prevent admin from resetting their own password
  // through this admin-user endpoint
  if (userId === req.user.id) {
    return res.status(400).json({
      success: false,
      message:
        "Use the profile password change endpoint for your own password"
    });
  }

  try {
    const hashedPassword = await bcrypt.hash(
      new_password,
      10
    );

    const query = `
      UPDATE users
      SET password = ?
      WHERE id = ?
    `;

    db.query(
      query,
      [hashedPassword, userId],
      (err, result) => {
        if (err) {
          console.error(
            "Reset password error:",
            err
          );

          return res.status(500).json({
            success: false,
            message:
              "Failed to reset user password"
          });
        }

        if (result.affectedRows === 0) {
          return res.status(404).json({
            success: false,
            message: "User not found"
          });
        }

        return res.status(200).json({
          success: true,
          message:
            "User password reset successfully",
          user_id: userId
        });
      }
    );
  } catch (error) {
    console.error(
      "Password hashing error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to process password reset"
    });
  }
};


module.exports = {
  resetUserPassword
};