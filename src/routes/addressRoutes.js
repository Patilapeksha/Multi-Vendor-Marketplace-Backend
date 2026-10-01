const express = require("express");

const router = express.Router();

const authMiddleware = require("../../middleware/authMiddleware");

const {
  addAddress,
  getMyAddresses,
  updateAddress,
  deleteAddress
} = require("../controllers/addressController");

// Add address
router.post(
  "/",
  authMiddleware,
  addAddress
);

// Get logged-in user's addresses
router.get(
  "/my",
  authMiddleware,
  getMyAddresses
);

// Update address
router.put(
  "/:id",
  authMiddleware,
  updateAddress
);

// Delete address
router.delete(
  "/:id",
  authMiddleware,
  deleteAddress
);

module.exports = router;