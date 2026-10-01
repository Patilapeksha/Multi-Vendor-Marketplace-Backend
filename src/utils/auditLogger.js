const db = require("../../db");

const createAuditLog = (
  userId,
  action,
  entityType = null,
  entityId = null,
  description = null,
  ipAddress = null
) => {
  const query = `
    INSERT INTO audit_logs
    (
      user_id,
      action,
      entity_type,
      entity_id,
      description,
      ip_address
    )
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.query(
    query,
    [
      userId,
      action,
      entityType,
      entityId,
      description,
      ipAddress
    ],
    (err) => {
      if (err) {
        console.error(
          "Audit log error:",
          err
        );
      }
    }
  );
};

module.exports = {
  createAuditLog
};