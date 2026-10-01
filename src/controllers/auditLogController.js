const db = require("../../db");

// ==========================================
// GET AUDIT LOGS
// ==========================================

const getAuditLogs = (req, res) => {
  const query = `
    SELECT
      audit_logs.id,
      audit_logs.user_id,
      users.name AS user_name,
      users.email AS user_email,
      audit_logs.action,
      audit_logs.entity_type,
      audit_logs.entity_id,
      audit_logs.description,
      audit_logs.ip_address,
      audit_logs.created_at
    FROM audit_logs
    LEFT JOIN users
      ON audit_logs.user_id = users.id
    ORDER BY audit_logs.created_at DESC
  `;

  db.query(query, (err, logs) => {
    if (err) {
      console.error(
        "Get audit logs error:",
        err
      );

      return res.status(500).json({
        success: false,
        message: "Failed to fetch audit logs"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Audit logs fetched successfully",
      logs
    });
  });
};


// ==========================================
// GET AUDIT LOG BY ID
// ==========================================

const getAuditLogById = (req, res) => {
  const logId = Number(req.params.id);

  if (!Number.isInteger(logId) || logId <= 0) {
    return res.status(400).json({
      success: false,
      message: "Invalid audit log ID"
    });
  }

  const query = `
    SELECT
      audit_logs.id,
      audit_logs.user_id,
      users.name AS user_name,
      users.email AS user_email,
      audit_logs.action,
      audit_logs.entity_type,
      audit_logs.entity_id,
      audit_logs.description,
      audit_logs.ip_address,
      audit_logs.created_at
    FROM audit_logs
    LEFT JOIN users
      ON audit_logs.user_id = users.id
    WHERE audit_logs.id = ?
  `;

  db.query(query, [logId], (err, logs) => {
    if (err) {
      console.error(
        "Get audit log error:",
        err
      );

      return res.status(500).json({
        success: false,
        message: "Failed to fetch audit log"
      });
    }

    if (logs.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Audit log not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Audit log fetched successfully",
      log: logs[0]
    });
  });
};


module.exports = {
  getAuditLogs,
  getAuditLogById
};