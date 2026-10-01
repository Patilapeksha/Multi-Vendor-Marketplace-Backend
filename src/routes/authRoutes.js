const express = require("express");

const router = express.Router();

const {
  login,
  register
} = require("../controllers/authController");
const authenticateToken = require("../../middleware/authMiddleware");
const authorizeRoles = require("../../middleware/roleMiddleware");

router.post("/login", login);
router.post("/register", register);

// Any logged-in user
router.get("/me", authenticateToken, (req, res) => {
  res.json({
    message: "You are authenticated",
    user: req.user
  });
});


router.get(
  "/admin-test",
  authenticateToken,
  authorizeRoles("admin"),
  (req, res) => {
    res.json({
      message: "Admin access successful",
      user: req.user
    });
  }
);

module.exports = router;