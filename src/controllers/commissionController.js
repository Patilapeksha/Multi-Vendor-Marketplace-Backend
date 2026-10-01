const db = require("../../db");

// Get current commission rate
const getCommissionRate = (req, res) => {
  const query = `
    SELECT
      id,
      commission_rate,
      updated_by,
      created_at,
      updated_at
    FROM commission_settings
    ORDER BY id DESC
    LIMIT 1
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Get commission rate error:", err);

      return res.status(500).json({
        success: false,
        message: "Failed to fetch commission rate"
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Commission setting not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Commission rate fetched successfully",
      commission: results[0]
    });
  });
};


// Update commission rate
const updateCommissionRate = (req, res) => {
  const { commission_rate } = req.body;

  const rate = Number(commission_rate);

  if (!Number.isFinite(rate)) {
    return res.status(400).json({
      success: false,
      message: "Commission rate must be a valid number"
    });
  }

  if (rate < 0 || rate > 100) {
    return res.status(400).json({
      success: false,
      message: "Commission rate must be between 0 and 100"
    });
  }

  const query = `
    UPDATE commission_settings
    SET
      commission_rate = ?,
      updated_by = ?
    WHERE id = (
      SELECT id
      FROM (
        SELECT id
        FROM commission_settings
        ORDER BY id DESC
        LIMIT 1
      ) AS latest
    )
  `;

  db.query(
    query,
    [rate, req.user.id],
    (err, result) => {
      if (err) {
        console.error(
          "Update commission rate error:",
          err
        );

        return res.status(500).json({
          success: false,
          message: "Failed to update commission rate"
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: "Commission setting not found"
        });
      }

      return res.status(200).json({
        success: true,
        message: "Commission rate updated successfully",
        commission_rate: rate
      });
    }
  );
};


module.exports = {
  getCommissionRate,
  updateCommissionRate
};