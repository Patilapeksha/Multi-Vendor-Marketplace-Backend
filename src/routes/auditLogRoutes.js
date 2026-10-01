const express = require("express");

const router = express.Router();

const authMiddleware = require("../../middleware/authMiddleware");

const {
  getAuditLogs,
  getAuditLogById
} = require("../controllers/auditLogController");


// ==========================================
// GET ALL AUDIT LOGS
// ==========================================

router.get(
  "/",
  authMiddleware,
  authMiddleware.requireAdmin,
  getAuditLogs
);


// ==========================================
// GET AUDIT LOG BY ID
// ==========================================

router.get(
  "/:id",
  authMiddleware,
  authMiddleware.requireAdmin,
  getAuditLogById
);


module.exports = router;