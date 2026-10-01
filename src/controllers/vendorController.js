const db = require("../../db");

// Get all vendors
const getAllVendors = (req, res) => {
  const query = `
    SELECT
      vendors.id,
      vendors.store_name,
      vendors.description,
      vendors.status,
      vendors.created_at,
      users.name,
      users.email
    FROM vendors
    JOIN users ON vendors.user_id = users.id
    ORDER BY vendors.id DESC
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        message: "Database error"
      });
    }

    res.json({
      message: "Vendors fetched successfully",
      vendors: results
    });
  });
};

// Update vendor status
const updateVendorStatus = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const allowedStatuses = [
    "approved",
    "rejected",
    "suspended",
    "pending"
  ];

  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({
      message: "Invalid vendor status"
    });
  }

  const query = `
    UPDATE vendors
    SET status = ?
    WHERE id = ?
  `;

  db.query(query, [status, id], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        message: "Database error"
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Vendor not found"
      });
    }

    res.json({
      message: `Vendor ${status} successfully`
    });
  });
};

module.exports = {
  getAllVendors,
  updateVendorStatus
};