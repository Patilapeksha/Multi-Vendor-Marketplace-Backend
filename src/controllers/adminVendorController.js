const db = require("../../db");

// GET ALL VENDORS
const getAllVendors = (req, res) => {
  const query = `
    SELECT
      id,
      name,
      email,
      vendor_status,
      created_at
    FROM users
    WHERE role = 'vendor'
    ORDER BY created_at DESC
  `;

  db.query(query, (err, vendors) => {
    if (err) {
      console.error("Get vendors error:", err);

      return res.status(500).json({
        message: "Failed to fetch vendors"
      });
    }

    res.status(200).json({
      message: "Vendors fetched successfully",
      vendors
    });
  });
};


// UPDATE VENDOR STATUS
const updateVendorStatus = (req, res) => {
  const vendorId = req.params.id;
  const { status } = req.body;

  const allowedStatuses = [
    "pending",
    "approved",
    "rejected",
    "suspended"
  ];

  if (!status) {
    return res.status(400).json({
      message: "Vendor status is required"
    });
  }

  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({
      message: "Invalid vendor status",
      allowed_statuses: allowedStatuses
    });
  }

  // Make sure the user is actually a vendor
  const checkVendorQuery = `
    SELECT id
    FROM users
    WHERE id = ?
      AND role = 'vendor'
  `;

  db.query(
    checkVendorQuery,
    [vendorId],
    (err, vendors) => {
      if (err) {
        console.error(
          "Vendor lookup error:",
          err
        );

        return res.status(500).json({
          message: "Failed to verify vendor"
        });
      }

      if (vendors.length === 0) {
        return res.status(404).json({
          message: "Vendor not found"
        });
      }

      const updateQuery = `
        UPDATE users
        SET vendor_status = ?
        WHERE id = ?
          AND role = 'vendor'
      `;

      db.query(
        updateQuery,
        [status, vendorId],
        (err, result) => {
          if (err) {
            console.error(
              "Vendor status update error:",
              err
            );

            return res.status(500).json({
              message:
                "Failed to update vendor status"
            });
          }

          if (result.affectedRows === 0) {
            return res.status(404).json({
              message: "Vendor not found"
            });
          }

          res.status(200).json({
            message:
              "Vendor status updated successfully",
            vendor_id: Number(vendorId),
            vendor_status: status
          });
        }
      );
    }
  );
};


module.exports = {
  getAllVendors,
  updateVendorStatus
};