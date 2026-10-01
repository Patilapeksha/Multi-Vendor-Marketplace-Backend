const express = require("express");

const router = express.Router();

const authMiddleware = require("../../middleware/authMiddleware");

const {
  createReturn,
  getMyReturns,
  getReturnById,
  cancelReturn
} = require("../controllers/returnController");

// BUYER - Create return request
router.post(
  "/",
  authMiddleware,
  createReturn
);

// BUYER - Get my returns
router.get(
  "/my",
  authMiddleware,
  getMyReturns
);

// BUYER - Get single return
router.get(
  "/:id",
  authMiddleware,
  getReturnById
);

// BUYER - Cancel return
router.put(
  "/:id/cancel",
  authMiddleware,
  cancelReturn
);

module.exports = router;